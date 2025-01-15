import re, traceback
from prompt import agent_prompt
from openai import OpenAI, RateLimitError
from Tools import *
import os
from load_dotenv import load_dotenv
from ollama import chat, ChatResponse
import json

load_dotenv()

# known_actions = {
#     "basic_scrape": scrape,
#     "scrape_background_requests": scrape_background_requests,
#     "take_screenshot": take_screenshot,
#     "search_google": search_google
# }

class OpenAIAgent:
    def __init__(self, 
                 system : str = "", 
                 prompt: str = "",
                 tools: dict = {},
                 api_key: str = ""):
        self.system = system
        self.prompt = prompt
        self.messages = []
        self.tools = tools
        self.api_key = api_key
        if self.system:
            self.messages.append({
                "role": "system",
                "content": system
            })
        self.context = {}
        self.__call__(self.prompt)
        self.status = True if self.prompt and self.tools and self.api_key else False

    def __call__(self, message):
        self.messages.append({
            "role": "user",
            "content": message
        })
        result = self.execute()
        self.messages.append({
            "role": "assistant",
            "content": result
        })
        return result
    
    def execute(self):
        client = OpenAI(api_key=self.api_key)
        #try to shorten messages length
        try:
            completion = client.chat.completions.create(
                model="gpt-4o",
                messages=self.messages
            )
            if not completion.choices:
                raise Exception("No choices returned from OpenAI API.")
            
            response_content = completion.choices[0].message.content.strip()
            print(response_content + '\n\n')
            return response_content
        except RateLimitError as e:
            try:
                self.messages.pop(0)
                completion = client.chat.completions.create(
                model="gpt-4o",
                messages=self.messages
                )
                if not completion.choices:
                    raise Exception("No choices returned from OpenAI API.")
                
                response_content = completion.choices[0].message.content.strip()
                print(response_content + '\n\n')
                return response_content
            except Exception as e:
                print(str(e))
        except Exception as e:
            print(f"Error during API call: {str(e)}")
            return ""
    
    def run_code(self, code: str):
        try:
            exec(code, self.context)
            return {"code_execution_status": "success", "output": None}
        except Exception as e:
            return {"status": "error", "error": str(e), "traceback": traceback.format_exc()}
    def reset_session(self):
        """ Clears the session state (messages, context, etc.). """
        self.messages = []
        self.context = {}  # Resetting context (optional depending on your use case)

    def get_variable(self, var_name: str):
        return self.context.get(var_name, None)
    
    def query(self, question, max_turns=5, tools=None):
        action_re = re.compile(r'^Action:\s*(\w+):\s*(.*)')
        tools = self.tools or actions  # Default to known_actions if no tools are provided
        i = 0
        next_prompt = question
        while i < max_turns:
            i += 1
            # self.__call__(self.prompt)
            result = self.__call__(next_prompt)  # Call the model to get the response
            print(f"Model output: {result}")
            actions = [action_re.match(a) for a in result.split('\n') if action_re.match(a)]
            
            if actions:
                action, action_input = actions[0].groups()
                if action not in tools:
                    raise Exception(f"Unknown action: {action}: {action_input} \n\n")
                print(f" ---- running {action} {action_input} ---- \n\n")
                observation = tools[action](action_input)
                next_prompt = f"Observation: {observation}"
            else:
                return result

# EXPERIMENTAL:
class OllamaAgent:
    def __init__(self, 
                system : str = "", 
                prompt: str = "",
                tools: dict = {},
                model_name: str = "gemma"):
        self.system = system
        self.prompt = prompt
        self.messages = []
        self.tools = tools
        self.model_name = model_name
        if self.system:
            self.messages.append({
                "role": "system",
                "content": system
            })
        self.context = {}
        self.__call__(self.prompt) 

    
    def reset_session(self):
        """ Clears the session state (messages, context, etc.). """
        self.messages = []
        self.context = {}  # Resetting context (optional depending on your use case)

    def __call__(self, message):
        self.messages.append({
            "role": "user",
            "content": message
        })
        result = self.execute()
        self.messages.append({
            "role": "assistant",
            "content": result
        })
        return result
    
    def execute(self):
        response: ChatResponse = chat(model=self.model_name, messages=self.messages)
        response_text = response['message']['content']
        return response_text
    
    def run_code(self, code: str):
        try:
            exec(code, self.context)
            return {"code_execution_status": "success", "output": None}
        except Exception as e:
            return {"status": "error", "error": str(e), "traceback": traceback.format_exc()}
    def get_variable(self, var_name: str):
        return self.context.get(var_name, None)
    
    def query(self, question, max_turns=5, tools=None):
        """ Runs the model and handles action execution for up to `max_turns`. """
        action_re = re.compile(r'^Action:\s*(\w+):\s*(.*)')
        tools = self.tools or actions  # Default to known_actions if no tools are provided
        
        i = 0
        next_prompt = question
        
        while i < max_turns:
            i += 1
            print(f"Turn {i}: Asking question: {next_prompt}")
            
            # Get the model's response after the user prompt
            result = self.__call__(next_prompt)  # Call the model to get the response
            print(f"Model output: {result}")
            result = result.replace('*', '')
            
            # Look for an action in the model's response
            actions = [action_re.match(a) for a in result.split('\n') if action_re.match(a)]
            if actions:
                # If an action is identified, execute it
                action, action_input = actions[0].groups()
                
                if action not in tools:
                    raise Exception(f"Unknown action: {action}: {action_input}")
                
                print(f" ---- running {action} {action_input} ----")
                observation = tools[action](action_input)  # Execute the tool
                next_prompt = f"Observation: {observation}"  # Update the prompt with the result of the action
            else:
                # If no action, return the final result
                return result

        # If we exit the loop without returning, it means max_turns was reached
        raise Exception("Maximum number of turns reached without a result.")

class ScraperAgent:
    def __init__(self, 
                system : str = "", 
                prompt: str = "",
                tools: dict = {},
                api_key: str = ""):
        self.system = system
        self.prompt = prompt
        self.messages = []
        self.tools = tools
        self.api_key = api_key
        if self.system:
            self.messages.append({
                "role": "system",
                "content": system
            })
        self.context = {}
    
    

# print(query("Does this page have any captchas? - https://www.google.co.uk/"))
# print(query("Identify any resource links on this site: https://products.mhra.gov.uk/"))
# agent = OpenAIAgent(prompt=agent_prompt, tools=known_actions, api_key=os.getenv('OPENAI_API_KEY'))
# # agent = OllamaAgent(prompt=prompt, tools=known_actions)

# agent.query("Identify any background resource links on this site: https://products.mhra.gov.uk/substance/?substance=ABACAVIR")
# with open("messages.json", 'w') as f:
#     json.dump(agent.messages, f, indent=4)

# agent.reset_session()

