import re, traceback
from bs4 import BeautifulSoup
import requests
from openai import OpenAI, RateLimitError
from ollama import chat, ChatResponse
import google.generativeai as ggenai
from google.generativeai.types import content_types
from collections.abc import Iterable
import logging
from tools.cookiegetter import cookiegetter

logger = logging.getLogger(__name__)


class BaseAgent:
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
                model="o1-preview",
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
                model="gpt-3.5-turbo",
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
            print(f"Model output: \n\n {result}")
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
  
class DeepSeekAgent(BaseAgent):
    def __init__(self, system: str = "", prompt: str = "", tools: dict = {}, api_key: str = ""):
        super().__init__(system, prompt, tools, api_key)
    
    def execute(self):
        client = OpenAI(api_key=self.api_key, base_url="https://api.deepseek.com")
        #try to shorten messages length
        try:
            completion = client.chat.completions.create(
                model="deepseek-chat",
                messages=self.messages,
                stream=False
            )
            if not completion.choices:
                raise Exception("No choices returned from OpenAI API.")
            
            response_content = completion.choices[0].message.content.strip()
            print(response_content + '\n\n')
            return response_content
        except Exception as e:
            print(f"Error during API call: {str(e)}")
            return ""

class GeminiAgent(BaseAgent):
    def __init__(self, prompt: str = "", tools: dict = {}, api_key: str = "", model_name: str = "models/gemini-2.0-flash-exp"):
        self.prompt = prompt
        self.messages = []
        self.tools = [tool for tool in tools.values()]
        self.available_tools = [tool_name for tool_name in tools.keys()]
        self.api_key = api_key

        self.model_name = model_name
        ggenai.configure(api_key=self.api_key)
        self.model = ggenai.GenerativeModel(model_name=self.model_name,
                                            tools=self.tools,
                                            system_instruction=self.prompt,
                                            )
        
        self.tool_config = self._tool_config_from_mode(mode="any", fns=self.available_tools)

        self.chat = self.model.start_chat(enable_automatic_function_calling=True)

    def _tool_config_from_mode(self, mode: str, fns: Iterable[str] = ()):
        return content_types.to_tool_config(
            {"function_calling_config": {"mode": mode, "allowed_function_names": fns}}
        )
    def execute(self, message:str) -> str:
        try:
            self.messages.append(message)
            response = self.chat.send_message(message, tool_config=self.tool_config)
            # print(response.text + '\n\n')
            return response.text
        except Exception as e:
            print(f'Error sending messages to GeminiAgent: {str(e)}')
            return ""
        
    def query(self, question, max_turns=5, tools=None):
        # Adding chain of thought reasoning, similar to BaseAgent.query()
        action_re = re.compile(r'^Action:\s*(\w+):\s*(.*)')  # Regex to extract actions
        tools = self.tools or actions  # Default to known tools if none provided
        i = 0
        next_prompt = question
        
        # Iterate through the reasoning steps
        while i < max_turns:
            i += 1
            print(f"Turn {i}: Question: {next_prompt}")
            # Send message to model (start chain of thought)
            result = self.execute(next_prompt)
            print(f"Model output: \n\n {result}")

            # Extract actions from the result if any
            actions = [action_re.match(a) for a in result.split('\n') if action_re.match(a)]
            
            if actions:
                action, action_input = actions[0].groups()
                
                # If the action isn't in the tools, raise an exception
                if action not in tools:
                    raise Exception(f"Unknown action: {action}: {action_input} \n\n")
                
                print(f"---- Running {action} with input: {action_input} ----")
                observation = tools[action](action_input)  # Execute tool and get observation
                next_prompt = f"Observation: {observation}"  # Update next prompt with observation
            else:
                # If no actions, return the result
                return result

        return "Max turns reached without completing the task."

class ParserAgent(GeminiAgent):
    def __init__(self, url:str = "", prompt:str = "", tools:dict = {}, api_key:str = "", model_name:str = "models/gemini-2.0-flash-exp", max_chunk_tokens:int = 800000):
        super().__init__(prompt, tools, api_key, model_name)
        self.max_chunk_tokens = max_chunk_tokens  # Conservative buffer for prompt+response
        self.avg_chars_per_token = 4  # one token is about 4 characters
        self.url = url
        
        self._tools = {
            "parse_dom_scripts": self.parse_dom_scripts,
            "split_js_content": self.split_js_content,
            "count_tokens": self.count_tokens,
            "track_chunk_count": self.track_chunk_count,
            "retrieve_next_chunk": self.retrieve_next_chunk,
            "output_data": self.output_data
        }
        self.tools = [tool for tool in self._tools.values()]
        self.available_tools = [tool_name for tool_name in self._tools.keys()]
        self.model_name = model_name
        ggenai.configure(api_key=self.api_key)
        self.model = ggenai.GenerativeModel(model_name=self.model_name,
                                            tools=self.tools,
                                            system_instruction=self.prompt,
                                            )
        
        self.tool_config = self._tool_config_from_mode(mode="any", fns=self.available_tools)

        self.chat = self.model.start_chat(enable_automatic_function_calling=True)

        self.chunk_count = 0
        self.chunks: list[str] = []
        self.cookie_list = []
        self.output = []
        
    def count_tokens(self) -> int:
        script_text = self.parse_dom_scripts(self.url)
        return self.model.count_tokens(script_text).total_tokens
    
    def track_chunk_count(self) -> int:
        return self.chunk_count
    
    def retrieve_next_chunk(self) -> str:
        if len(self.chunks) > 0:
            return self.chunks.pop(0) # retrieve the first chunk in the list
        else:
            return ""
    
    def output_data(self, input:str) -> None:
        self.output.append(input)
        return
        
    def split_js_content(self, js_content: str) -> list[str]:
        """Split JavaScript content into semantically meaningful chunks.
        
        Args:
            js_content: Raw JavaScript code string to split
            
        Returns:
            List of chunks that preserve code structure where possible
        """
        chunks = []
        current_chunk = []
        current_length = 0
        
        # First pass: Split at natural boundaries (;)
        statements = js_content.split(';')
        max_chunk_size = self.max_chunk_tokens * self.avg_chars_per_token
        
        for stmt in statements:
            # Add back the semicolon we removed in split
            full_stmt = f"{stmt.strip()};"
            stmt_len = len(full_stmt)
            
            if stmt_len > max_chunk_size:
                # Handle giant statements (e.g., minified code)
                if current_chunk:
                    chunks.append("".join(current_chunk))
                    current_chunk = []
                    current_length = 0
                chunks.extend(self._split_fallback(full_stmt, max_chunk_size))
                continue
                
            if current_length + stmt_len > max_chunk_size:
                chunks.append("".join(current_chunk))
                current_chunk = [full_stmt]
                current_length = stmt_len
            else:
                current_chunk.append(full_stmt)
                current_length += stmt_len
                
        # Add remaining content
        if current_chunk:
            chunks.append("".join(current_chunk))
        self.chunk_count = len(chunks)
        self.chunks = chunks
        # return chunks
    
    def _split_fallback(self, large_stmt: str, max_size: int) -> list[str]:
        """Fallback splitter for oversized statements"""
        return [large_stmt[i:i+max_size] 
                for i in range(0, len(large_stmt), max_size)]
        
    def _get_resource(self, link:str):
        '''
        Retrieves the resource at the specified link
        '''
        # url_pattern = r'^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$'

        # if re.match(url_pattern, link):
        self.cookie_list = cookiegetter(link)
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Encoding": "gzip, deflate, br",  # Allow the response to be compressed (common in HTTP requests)
            "Accept-Language": "en-US,en;q=0.5",  # Language preference
            "Connection": "keep-alive",  # Keep the connection open for multiple requests (like a real browser)
            "Upgrade-Insecure-Requests": "1",  # Tells the server to upgrade any HTTP requests to HTTPS if possible
            "TE": "Trailers",  # Common header for some browsers
            "Referer": "http://www.google.com"
        }
        cookies = {cookie['name']: cookie['value'] for cookie in self.cookie_list}

        res = requests.get(url=link, headers=headers, cookies=cookies)
        # if re.match(json_regex, link):
        #     return res.json()
        # else:
        #     return res.text.strip()
        return res.text.strip()

    def parse_dom_scripts(self, url:str) -> str:
        '''
        Retrieves the script tags from the dom and formats it into a string
        '''
        response_text = self._get_resource(link=url)
        soup = BeautifulSoup(response_text, 'html.parser')
        
        # Find all script tags
        try:
            scripts = soup.find_all('script')
            extracted_data = []
            
            # Loop through script tags
            for script in scripts:
                script_content = script.string
                if script_content:
                    extracted_data.append(script_content)

            return str(extracted_data)
        except Exception as e:
            print(f'Error parsing scripts: {str(e)}')
            return ""

class LoopParserAgent(GeminiAgent):
    def __init__(self, prompt:str = "", url:str = "", tools:dict = {}, api_key:str = "", model_name:str = "models/gemini-2.0-flash-exp", max_chunk_tokens:int = 800000):
        super().__init__(prompt, tools, api_key, model_name)
        self.max_chunk_tokens = max_chunk_tokens  # Conservative buffer for prompt+response
        self.avg_chars_per_token = 4  # one token is about 4 characters
        self.url = url
        self.content_to_parse: list[str] = self.pre_process(self.url)
        self.turns: int = len(self.content_to_parse)
        self.output = []
        self._tools = {
            "parse_dom_scripts": self.parse_dom_scripts,
            "output_data": self.output_data
        }

    def _get_resource(self, link:str) -> str:
        '''
        Retrieves the resource at the specified link
        '''
        # url_pattern = r'^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$'

        # if re.match(url_pattern, link):
        self.cookie_list = cookiegetter(link)
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Encoding": "gzip, deflate, br",  # Allow the response to be compressed (common in HTTP requests)
            "Accept-Language": "en-US,en;q=0.5",  # Language preference
            "Connection": "keep-alive",  # Keep the connection open for multiple requests (like a real browser)
            "Upgrade-Insecure-Requests": "1",  # Tells the server to upgrade any HTTP requests to HTTPS if possible
            "TE": "Trailers",  # Common header for some browsers
            "Referer": "http://www.google.com"
        }
        cookies = {cookie['name']: cookie['value'] for cookie in self.cookie_list}

        res = requests.get(url=link, headers=headers, cookies=cookies)
        # if re.match(json_regex, link):
        #     return res.json()
        # else:
        #     return res.text.strip()
        return res.text.strip()

    def _split_js_content(self, js_content: str) -> list[str]:
        """Split JavaScript content into semantically meaningful chunks.
        
        Args:
            js_content: Raw JavaScript code string to split
            
        Returns:
            List of chunks that preserve code structure where possible
        """
        chunks = []
        current_chunk = []
        current_length = 0
        
        # First pass: Split at natural boundaries (;)
        statements = js_content.split(';')
        max_chunk_size = self.max_chunk_tokens * self.avg_chars_per_token
        
        for stmt in statements:
            # Add back the semicolon we removed in split
            full_stmt = f"{stmt.strip()};"
            stmt_len = len(full_stmt)
            
            if stmt_len > max_chunk_size:
                # Handle giant statements (e.g., minified code)
                if current_chunk:
                    chunks.append("".join(current_chunk))
                    current_chunk = []
                    current_length = 0
                chunks.extend(self._split_fallback(full_stmt, max_chunk_size))
                continue
                
            if current_length + stmt_len > max_chunk_size:
                chunks.append("".join(current_chunk))
                current_chunk = [full_stmt]
                current_length = stmt_len
            else:
                current_chunk.append(full_stmt)
                current_length += stmt_len
                
        # Add remaining content
        if current_chunk:
            chunks.append("".join(current_chunk))
        return chunks
    
    def _split_fallback(self, large_stmt: str, max_size: int) -> list[str]:
        """Fallback splitter for oversized statements"""
        return [large_stmt[i:i+max_size] 
                for i in range(0, len(large_stmt), max_size)]

    def pre_process(self, link:str) -> list[str]:
        '''
        A method which would preprocess the text response of the webpage
        '''
        try:
            response_text = self._get_resource(link)
            split_text = self._split_js_content(response_text)
            
            return split_text
        except Exception as e:
            print(f'Error retrieving content: {str(e)}')
    
    def output_data(self, arg: str = None) -> str:
        '''Appends data to self.output and returns confirmation'''
        if arg:
            # Strip unwanted characters (backticks, "json", etc.)
            arg = arg.strip().strip("`").strip("json").strip()
            self.output.append(arg)
            print("Data stored successfully.")
        else:
            print("Error: No input provided to output_data.")
        
    def parse_dom_scripts(self, arg: str = None) -> str:
        '''Retrieves the script tags from the DOM and formats them into a string.'''
        if self.content_to_parse:
            script_content = self.content_to_parse.pop(0)
            print(f"Script content extracted: {script_content}")  # Return meaningful observation
        else:
            print("No more script content to parse.")
    #TODO: Modify query loop to this parser agent
    def query(self, max_turns: int = 100):
        action_re = re.compile(
        r'^\s*Action:\s*(\w+)\s*:?\s*(?:```json)?\s*({.*?})\s*(?:```)?\s*$',  # Capture JSON block
        re.IGNORECASE | re.MULTILINE | re.DOTALL
    )
        tools = self._tools
        i = 0
        next_prompt = self.url

        while i < max_turns:
            i += 1
            # print(f"Turn {i}: Question: {next_prompt}")
            result = self.execute(next_prompt)
            print(f"Model output: \n\n{result}")

            actions = []
            for line in result.split('\n'):
                line = line.strip()
                match = action_re.match(line)
                if match:
                    action = match.group(1)
                    action_input = match.group(2).strip().strip('"').strip("'").strip()
                    actions.append((action, action_input))

            if actions:
                action, action_input = actions[0]
                if action not in tools:
                    raise Exception(f"Unknown action: {action}: {action_input} \n\n")

                print(f"---- Running {action} with input: {action_input} ----")
                if not action_input:
                    observation = tools[action]()
                else:
                    observation = tools[action](arg=str(action_input.strip().strip("`json")))  # Use keyword arg
                next_prompt = f"Observation: {observation}"
            else:
                return result

        return "Max turns reached without completing the task."
