from smolagents import CodeAgent, LiteLLMModel
import os
from dotenv import load_dotenv
from smol_tools import retrieve_js_content, output_content
from prompt import SMOL_PARSER_PROMPT
from smolagents.prompts import CODE_SYSTEM_PROMPT

modified_system_prompt = CODE_SYSTEM_PROMPT + f"\n{SMOL_PARSER_PROMPT}"

load_dotenv()
api_key = os.getenv('GEMINI_API_KEY')

tools = [retrieve_js_content, output_content]
model = LiteLLMModel(model_id="gemini/gemini-2.0-flash-exp", api_key=api_key)
agent = CodeAgent(system_prompt=modified_system_prompt, model=model, tools=tools, additional_authorized_imports=['json'])
agent.run("https://bibleread.online/life-study-of-the-bible/life-study-of-matthew/1/#cont1")