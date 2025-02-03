from smolagents import CodeAgent, LiteLLMModel
import os
from dotenv import load_dotenv
from tools.smol_tools import retrieve_js_content, output_content
from prompt import SMOL_PARSER_SYSTEM_PROMPT

load_dotenv()
api_key = os.getenv('GEMINI_API_KEY')

tools = [retrieve_js_content, output_content]
model = LiteLLMModel(model_id="gemini/gemini-2.0-flash-exp", api_key=api_key)
# Uncomment for local model testing
# ollama_model = LiteLLMModel(
#     model_id="ollama_chat/qwen2.5:7b",
#     api_base="http://localhost:11434",    
# )
agent = CodeAgent(system_prompt=SMOL_PARSER_SYSTEM_PROMPT, model=model, tools=tools, additional_authorized_imports=['json, bs4'], max_steps=10, add_base_tools=True)
agent.run("https://www.jdsports.co.uk/men/mens-footwear/")

