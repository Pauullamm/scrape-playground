from dotenv import load_dotenv
import os
from ..tools.Terrier_Agents import GeminiAgent, ParserAgent
from ..tools.Agent_Tools import actions
from ..tools.prompt import PARSER_AGENT_PROMPT

load_dotenv()

api_key = os.getenv('GEMINI_API_KEY')
# agent = GeminiAgent(prompt=prompt.GENERAL_AGENT_PROMPT, tools=Tools.actions, api_key=api_key)

# agent.query(question="can you tell me what background resources does the site https://quotes.toscrape.com retrieve?", tools=Tools.actions)
# print(agent.messages)

parser_agent = ParserAgent(url='https://www.jdsports.co.uk/', prompt=PARSER_AGENT_PROMPT, api_key=api_key)
parser_agent.query(question='https://www.jdsports.co.uk/')
print(parser_agent.messages)
parser_agent.reset_session()