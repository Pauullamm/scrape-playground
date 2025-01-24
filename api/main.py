from fastapi import FastAPI, HTTPException, Request, WebSocket, WebSocketDisconnect, WebSocketException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import uvicorn
from Agents import OpenAIAgent, DeepSeekAgent
from prompt import agent_prompt, CODE_SYSTEM_PROMPT
from Tools import *
from load_dotenv import load_dotenv
import os
import logging
from langchain_openai import ChatOpenAI
from browser_use import Agent
from modAgent import modAgent
from modController import modController

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

@app.post("/background_capture")
async def background_capture(request: Request, message_body: MessageBody):
    try:
        if request.method == "OPTIONS":
            return JSONResponse(
                content={"message": "OK"},
                headers={
                    "Access-Control-Allow-Origin": ",".join(origins),
                    "Access-Control-Allow-Methods": "POST, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type",
                },
            )
        data = scrape_background_requests(message_body.message)
        return JSONResponse(
            content=jsonable_encoder(data),
            headers={"Access-Control-Allow-Origin": ",".join(origins)}
        )    
    except Exception as e:
        return JSONResponse(
            content={"error": str(e)},
            status_code=500,
            headers={"Access-Control-Allow-Origin": ",".join(origins)}
        )

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    llm = ChatOpenAI(model="gpt-4o", api_key=os.getenv('OPENAI_API_KEY'))
    await websocket.accept()
    try:
        
        while True:
            data = await websocket.receive_text()
            await websocket.send_json({
                "type": "status",
                "data": f"Received command: {data}"
            })
            agent = Agent(
                task=data,
                llm=llm
                
            )
            result = await agent.run()
            print(agent.history)
            serialized_history = {
                    "history": result.model_dump()["history"],  # Use Pydantic's model_dump
                    "metadata": {
                        "success": result.history.is_done(),
                        "errors": result.history.errors(),
                        "steps": len(result.history.history),
                        "final_result": result.history.final_result()
                    }
                }
            await websocket.send_json({
                "type": "result",
                "data": serialized_history
            })
    except WebSocketDisconnect:
        logger.info("Connection closed")
    except Exception as e:
        logger.error(e)
        await websocket.send_text(f"An error occurred: {e}")
        await websocket.close()

@app.websocket("/mod_ws")
async def mod_websocket_endpoint(websocket: WebSocket):
    if not server_active:
        await websocket.close(code=status.WS_1013_TRY_AGAIN_LATER)
        return
    llm = ChatOpenAI(model="gpt-4o", api_key=os.getenv('OPENAI_API_KEY'))
    await websocket.accept()
    try:
        
        while True:
            data = await websocket.receive_text()
            await websocket.send_json({
                "type": "status",
                "data": f"Received command: {data}"
            })
            agent = modAgent(
                task=data,
                llm=llm,
                websocket=websocket,
                controller=modController(websocket=websocket)
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