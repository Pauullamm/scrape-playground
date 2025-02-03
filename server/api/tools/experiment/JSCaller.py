from pocketflow import Node, Flow
from playwright.sync_api import sync_playwright
import json
import re
from JSReader import LoadJS

def return_js_variable(url: str, variable_name: str) -> any:
    '''
    This tool extracts and returns a javascript variable that is defined in a <script> tag in a webpage
    
    Args:
        url: webpage url from which to extract the javascript variable
        variable_name: name of the javascript variable to return
    '''
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(url, wait_until="domcontentloaded")

        # Get all script elements on the page
        scripts = page.locator("script").all_inner_texts()

        for script in scripts:
            if variable_name in script:
                # Extract the variable using regex
                match = re.search(rf"{variable_name}\s*=\s*({{.*?}}|\[.*?\])", script, re.DOTALL)
                if match:
                    try:
                        data = json.loads(match.group(1))  # Parse JSON object
                        browser.close()
                        return data
                    except json.JSONDecodeError:
                        # Could not parse, might need further handling
                        print('Could not parse variable as json')

        browser.close()
        return None
    
class VarCaller(Node):
    def prep(self, shared):
        pass
    def exec(self, prep_res):
        pass
    def post(self, shared, prep_res, exec_res):
        pass
    
shared = {
    "url": "https://bibleread.online/life-study-of-the-bible/life-study-of-matthew/1/#cont1",
    "variables": []
}
loader = LoadJS()
caller = VarCaller()

loader >> caller
flow = Flow(start=loader)