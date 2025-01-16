from fastapi import FastAPI, HTTPException, Request
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

load_dotenv()
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


if __name__ == "__main__":
    uvicorn.run("main:app", port=5000, log_level="info", reload=True)    