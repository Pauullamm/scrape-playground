from fastapi import FastAPI, HTTPException, Request, WebSocket, WebSocketDisconnect, WebSocketException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import uvicorn
from dom_tools.Terrier_Agents import DeepSeekAgent
from dom_tools.prompt import agent_prompt, CODE_SYSTEM_PROMPT
from dom_tools.Tools import regex_parse, get_resource, scrape_background_requests, actions
from load_dotenv import load_dotenv
import os
import logging
from langchain_openai import ChatOpenAI
from langchain_ollama import ChatOllama
from dom_tools.modAgent import modAgent
from dom_tools.modController import modController
from browser_use import ActionResult
import re
import json5
from dom_tools.Test import HTMLParser

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
        agent = DeepSeekAgent(prompt=agent_prompt, tools=actions, api_key=os.getenv('DEEPSEEK_API_KEY'))

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
    '''
    This endpoint allows the user to parse html to look for json-like content embedded in the frontend DOM
    it receives a url and the html content is requested to be parsed
    '''
    try:
        front_parser = HTMLParser(message_body.message)
        front_data = front_parser.extract_json()
        return JSONResponse(
            content=jsonable_encoder(front_data)
        )
    except Exception as e:
        logger.info(f'Error parsing frontend HTML: {str(e)}')
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
    uvicorn.run("main:app", port=5000, log_level="info", reload=True)    