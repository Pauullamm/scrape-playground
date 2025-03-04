from .pocketflow import Node, Flow
from playwright.sync_api import sync_playwright
import json
import re
from .JSReader import LoadJS, call_llm
from dotenv import load_dotenv
from .prompt import PF_INSPECTOR_PROMPT
import ast
import logging
import time

logger = logging.getLogger(__name__)


load_dotenv()

def return_js_variable(url: str, variable_name: str) -> any:
    '''
    This tool extracts and returns a javascript variable that is defined in a <script> tag in a webpage
    
    Args:
        url: webpage url from which to extract the javascript variable
        variable_name: name of the javascript variable to return
    '''
    with sync_playwright() as p:
        user_data_dir = f"/tmp/chrome_{time.time()}"
        browser = p.chromium.launch_persistent_context(
            user_data_dir=user_data_dir,
            headless=True,
            no_viewport=True
        )
        page = browser.new_page()
        page.goto(url, wait_until="domcontentloaded")

        # Get all script elements on the page
        scripts = page.locator("script").all_inner_texts()

        for script in scripts:
            if variable_name in script:
                # Extract the variable using regex
                escaped_name = re.escape(variable_name)
                match = re.search(rf"{escaped_name}\s*=\s*({{.*?}}|\[.*?\])", script, re.DOTALL)
                if match:
                    try:
                        data = json.loads(match.group(1))  # Parse JSON object
                        browser.close()
                        return data
                    except json.JSONDecodeError:
                        # Could not parse, might need further handling
                        logger.info('Could not parse variable as json')

        browser.close()
        return None

def return_var(url: str, var_name: str) -> any:
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(url, wait_until="domcontentloaded")
        try:
            content = page.evaluate(f"() => window.{var_name}")
            return content
        except Exception as e:
            logger.info(f'Could not parse JS variable: {var_name}')
            return None    
    
    browser.close()
        
class VarInspector(Node):
    def prep(self, shared):
        return [shared["data"], shared["api_key"]]
    
    def exec(self, prep_res):
        response = call_llm(api_key=str(prep_res[1]), system_prompt=PF_INSPECTOR_PROMPT, message=str(prep_res[0]))
        return response
    def post(self, shared, prep_res, exec_res):
        shared["variables"] = exec_res
        
    

class VarCaller(Node):
    def prep(self, shared):
        # Strip backticks and any surrounding whitespace
        js_variables = shared["variables"].strip('` \t\n\r')

        # Use regex with DOTALL flag to match across newlines
        match = re.search(r'\[.*\]', js_variables, re.DOTALL)
        if not match:
            raise ValueError("No valid JS variables found in the provided string.")
        
        var_str = match.group(0).strip()  # Remove any leading/trailing whitespace

        try:
            # Safely parse the matched string into a Python list
            var = ast.literal_eval(var_str)
        except SyntaxError as e:
            raise ValueError(f"Failed to parse variables: {e}")

        logger.info(f'Parsed variables: {var}')
        
        url = shared["url"]
        content = {}

        # Retrieve each variable's value
        for var_name in var:
            content[var_name] = return_var(url=url, var_name=var_name)

        return content
    
    def exec(self, prep_res):
        # Write results to output.json
        # with open('output.json', 'w') as f:
        #     json.dump(prep_res, f, indent=4)
        logger.info(f"JS parsing result: {prep_res}")
        pass
    
    def exec_fallback(self, prep_res, exc):
        return super().exec_fallback(prep_res, exc)
    
    def post(self, shared, prep_res, exec_res):
        shared["output"] = prep_res

loader = LoadJS() # prepare the DOM scripts
inspector = VarInspector() # the "agent" which view the contents of the DOM scripts and finds useful JS variables
caller = VarCaller() # tool to call the javascript variable and write its contents to a text file

loader >> inspector
inspector >> caller
caller_flow = Flow(start=loader)

# flow.run(shared=shared)