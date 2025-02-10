from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from load_dotenv import load_dotenv
from datetime import datetime, timezone
from .tools.agent_tools import scrape_background_requests
from .tools.v2.JSReader import reader_flow
from .tools.v2.JSCaller import caller_flow
from .tools.v2.extractor import extract
import uvicorn
import os
import sys
import logging

sys.path.append(os.path.abspath(os.path.dirname(__file__)))  # Add current directory to sys.path

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

logger = logging.getLogger(__name__)
server_active = True
load_dotenv()

#
origins = [
    "http://127.0.0.1:56084",
    "http://127.0.0.1:5173",
    "http://localhost:5173",
    "https://terrier-hunt.netlify.app"
]
# Initialize the FastAPI app
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)
# Define the request body model
class MessageBody(BaseModel):
    message: str

class ResponseBody(BaseModel):
    response: str

@app.get("/health")
async def health_check():
    """
    Health check endpoint that returns a JSON response with a status message and a UTC timestamp.
    """
    return JSONResponse(
        status_code=200,
        content={"status": "ok", "timestamp": datetime.now(timezone.utc).isoformat()}
    )

        
@app.post("/foreground_parse")
def foreground_parse(request: Request, message_body: MessageBody):
    """
    This endpoint allows the user to parse HTML to look for JSON-like content embedded in the frontend DOM.
    It receives a URL and the HTML content is requested to be parsed.
    """
    try:
        auth_header = request.headers.get("Authorization")
        token = auth_header.split(" ")[1] if auth_header.startswith("Bearer ") else None

        if not token:
            raise HTTPException(status_code=404, detail="api_key not found")
        # Initialize memory dictionaries
        reader_memory = {
            "url": message_body.message,
            "variables": [],
            "llm_output": "",
            "api_key": token
        }
        
        caller_memory = {
            "url": message_body.message,
            "variables": [],
            "llm_output": "",
            "api_key": token
        }

        # Run the reader flow
        reader_flow.run(shared=reader_memory)
        reader_output = {
            "url": reader_memory["url"],
            "llm_output": reader_memory["llm_output"].strip('```json')
        }

        # Run the caller flow
        caller_flow.run(shared=caller_memory)
        caller_output = {
            "url": caller_memory["url"],
            "caller_output": caller_memory["output"]
        }

        # Return the response with the parsed outputs
        return JSONResponse(
            content=[jsonable_encoder(reader_output), jsonable_encoder(caller_output)]
        )
    
    except Exception as e:
        # Log and handle exceptions
        logger.error(f"Error parsing frontend HTML: {str(e)}")
        return JSONResponse(
            content={"error": str(e)},
            status_code=500,
            headers={"Access-Control-Allow-Origin": ",".join(origins)}
        )
   
@app.post("/background_capture")
def background_capture(message_body: MessageBody):
    '''
    This endpoint allows the user to listen in to background requests that are called by their target site when loading
    Information on the background requests and the returning response data is forwarded to the user
    '''
    try:

        back_data = scrape_background_requests(message_body.message)
        # logger.info(data)
        return JSONResponse(
            content=jsonable_encoder(back_data)
        )
    except Exception as e:
        logger.info(str(e))
        return JSONResponse(
            content={"error": str(e)},
            status_code=500,
            headers={"Access-Control-Allow-Origin": ",".join(origins)}
        )

 
@app.post("/admin/shutdown")
async def shutdown_server():
    global server_active
    server_active = False
    return {"message": "Server shutting down"}

if __name__ == "__main__":
    import sys
    if "uvicorn" not in sys.argv[0]:
        uvicorn.run("main:app", host="127.0.0.1", port=5000, log_level="info", reload=True)
   