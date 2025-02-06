from fastapi import FastAPI, HTTPException, Request, WebSocket, WebSocketDisconnect, WebSocketException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import uvicorn
from tools.Terrier_Agents import DeepSeekAgent
from tools.prompt import GENERAL_AGENT_PROMPT
from tools.Agent_Tools import scrape_background_requests, actions
from load_dotenv import load_dotenv
import os
import logging
from langchain_ollama import ChatOllama
from tools.modAgent import modAgent
from tools.modController import modController
from tools.utils import HTMLParser
from tools.experiment.JSReader import reader_flow
from tools.experiment.JSCaller import caller_flow
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

logger = logging.getLogger(__name__)
server_active = True
load_dotenv()

#
origins = [
    "http://127.0.0.1:56084",
    "http://127.0.0.1:5173",
    "http://localhost:5173",
]
# Initialize the FastAPI app
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)
# Define the request body model
class MessageBody(BaseModel):
    message: str

class ResponseBody(BaseModel):
    response: str



async def validate_api_key(websocket: WebSocket):
    api_key = websocket.headers.get("x-api-key") or websocket.query_params.get("api_key")
    if not api_key or api_key != os.getenv("API_KEY"):
        await websocket.send_json({
            "type": "error",
            "data": "Invalid API key"
        })
        await websocket.close()
        raise WebSocketException(
            code=status.WS_1008_POLICY_VIOLATION,
            detail="Invalid API key"
        )
# Define the endpoint
@app.post("/generate")
async def generate_response(request: Request, message_body: MessageBody):

    try:
        auth_header = request.headers.get("Authorization")
        token = auth_header.split(" ")[1] if auth_header.startswith("Bearer ") else None
        # agent = OpenAIAgent(prompt=agent_prompt, tools=actions, api_key=token)
        agent = DeepSeekAgent(prompt=GENERAL_AGENT_PROMPT, tools=actions, api_key=os.getenv('DEEPSEEK_API_KEY'))

        query = message_body.message

        agent.query(query)
        agent_messages = jsonable_encoder(agent.messages[1:]) # list of messages generated from query
        agent.reset_session()

        # Return the response in the correct format
        return JSONResponse(content=agent_messages)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
@app.post("/foreground_parse")
def foreground_parse(message_body: MessageBody):
    """
    This endpoint allows the user to parse HTML to look for JSON-like content embedded in the frontend DOM.
    It receives a URL and the HTML content is requested to be parsed.
    """
    try:
        # Initialize memory dictionaries
        reader_mem = {
            "url": message_body.message,
            "variables": [],
            "llm_output": ""
        }
        
        caller_mem = {
            "url": message_body.message,
            "variables": [],
            "llm_output": ""
        }

        # Run the reader flow
        reader_flow.run(shared=reader_mem)
        reader_output = {
            "url": reader_mem["url"],
            "llm_output": reader_mem["llm_output"].strip('```json')
        }

        # Run the caller flow
        caller_flow.run(shared=caller_mem)
        caller_output = {
            "url": caller_mem["url"],
            "caller_output": caller_mem["output"]
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

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    if not server_active:
        await websocket.close(code=status.WS_1013_TRY_AGAIN_LATER)
        return
    # llm = ChatOpenAI(model="gpt-4o", api_key=os.getenv('OPENAI_API_KEY'))
    # I don't think deepseek has vision capabilities yet
    #llm = ChatOpenAI(base_url="https://api.deepseek.com/v1", model="deepseek-chat", api_key=os.getenv('DEEPSEEK_API_KEY'))
    llm = ChatOllama(
        model='qwen2.5:7b',
        base_url="http://localhost:11434"
    )
    await websocket.accept()
    try:
        
        while True:
            data = await websocket.receive_text()
            await websocket.send_json({
                "type": "status",
                "data": f"Received command: {data}"
            })
            # introduce new action to controller - TESTING
            # @modController.action("capture background requests from browser")
            # def controller_scrape_background_requests(url_query: str):
            #     background_data = scrape_background_requests(url_query)
            #     json_background_data = jsonable_encoder(background_data)
            #     return ActionResult(extracted_content=json_background_data)

            agent = modAgent(
                task=data,
                llm=llm,
                websocket=websocket,
                controller=modController(websocket=websocket),
                max_actions_per_step=1
            )
            await agent.run()
    except WebSocketDisconnect:
        logger.info("Connection closed")
    except Exception as e:
        logger.error(e)
        await websocket.send_text(f"An error occurred: {e}")
        await websocket.close()

@app.post("/admin/shutdown")
async def shutdown_server():
    global server_active
    server_active = False
    return {"message": "Server shutting down"}

if __name__ == "__main__":
    import sys
    if "uvicorn" not in sys.argv[0]:
        uvicorn.run("main:app", host="127.0.0.1", port=5000, log_level="info", reload=True)
   