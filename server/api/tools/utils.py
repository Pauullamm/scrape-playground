import requests, json, time
from urllib3.exceptions import TimeoutError, ConnectionError
from bs4 import BeautifulSoup
from selenium.webdriver.chrome.options import Options
from seleniumwire import webdriver as wire_webdriver
from selenium.webdriver.support.wait import WebDriverWait
from seleniumwire.utils import decode
import re
import logging
from json5 import loads as json5_loads
from bs4 import BeautifulSoup
from typing import List, Dict, Union
from ..tools.cookiegetter import cookiegetter

logger = logging.getLogger(__name__)

RELEVANT_RESOURCE_TYPES = {
            'document',
            'stylesheet',
            'image',
            'font',
            'script',
            'iframe',
            'xhr'
        }

RELEVANT_CONTENT_TYPES = {
            'text/html',
            'text/css',
            'application/javascript',
            'image/',
            'font/',
            'application/json',
            'json'
        }

        # Additional patterns to filter out
IGNORED_URL_PATTERNS = {
            # Analytics and tracking
            'analytics',
            'tracking',
            'telemetry',
            'beacon',
            'metrics',
            # Ad-related
            'doubleclick',
            'adsystem',
            'adserver',
            'advertising',
            # Social media widgets
            'facebook.com/plugins',
            'platform.twitter',
            'linkedin.com/embed',
            # Live chat and support
            'livechat',
            'zendesk',
            'intercom',
            'crisp.chat',
            'hotjar',
            # Push notifications
            'push-notifications',
            'onesignal',
            'pushwoosh',
            # Background sync/heartbeat
            'heartbeat',
            'ping',
            'alive',
            # WebRTC and streaming
            'webrtc',
            'rtmp://',
            'wss://',
            # Common CDNs for dynamic content
            'cloudfront.net',
            'fastly.net',
}

        
def infer_resource_type(request):
    """Infer resource type using Content-Type and URL patterns"""
    content_type = (request.response.headers.get('Content-Type', '') 
                    if request.response else '').lower()
    url = request.url.lower()

    # First check by Content-Type
    if 'text/html' in content_type:
        return 'document'
    elif 'text/css' in content_type:
        return 'stylesheet'
    elif 'javascript' in content_type:
        return 'script'
    elif 'image/' in content_type:
        return 'image'
    elif 'font/' in content_type or 'otf' in content_type or 'ttf' in content_type:
        return 'font'
    elif 'json' in content_type:
        return 'xhr'

    # Fallback to URL patterns if Content-Type is missing/unreliable
    if any(url.endswith(ext) for ext in ('.js', '.mjs')):
        return 'script'
    elif any(url.endswith(ext) for ext in ('.css', '.scss', '.less')):
        return 'stylesheet'
    elif any(url.endswith(ext) for ext in ('.png', '.jpg', '.jpeg', '.gif', '.webp')):
        return 'image'
    elif any(url.endswith(ext) for ext in ('.woff', '.woff2', '.ttf', '.otf', '.eot')):
        return 'font'
    elif '/api/' in url or 'json' in url:
        return 'xhr'
    
    return 'other'
def filter_request(request):
    resource_type = infer_resource_type(request)
    if resource_type not in RELEVANT_RESOURCE_TYPES:
        return None
    # Filter out by URL patterns
    url = request.url.lower()
    if any(pattern in url for pattern in IGNORED_URL_PATTERNS):
        return None

    # Filter out data URLs and blob URLs
    if url.startswith(('data:', 'blob:')):
        return None

    # Filter out requests with certain headers
    headers = request.headers
    if headers.get('purpose') == 'prefetch' or headers.get('sec-fetch-dest') in [
        'video',
        'audio',
    ]:
        return None
    
    if not request.response:
        return None  # skip requests without a response
    
    # Filter by content type
    content_type = request.response.headers.get('Content-Type', '').lower()
    if not any(ct in content_type for ct in RELEVANT_CONTENT_TYPES):
        return None
                        
    return request

class ScraperTool:
    def __init__(self):
        """
        Initializes the client with a proxy URL.

        :param proxy_url: The URL of the proxy server.
        """
        self.proxy_url = None
        self.entries = []
        self.chrome_options = Options()
        self.chrome_options.add_argument('--no-sandbox')
        self.chrome_options.add_argument('--headless=new')  # Optional: run Chrome in headless mode
        self.chrome_options.add_argument('--disable-gpu')  # Disable GPU acceleration
        self.chrome_options.set_capability('goog:loggingPrefs', {'performance': 'ALL'})
        self.chrome_options.add_argument('--disable-blink-features=AutomationControlled')
        self.chrome_options.add_argument("--disable-browser-side-navigation");
        self.chrome_options.add_argument("--disable-dev-shm-usage");
        self.chrome_options.add_argument('--start-maximized')
        self.chrome_options.add_argument('--disable-extensions')
        self.chrome_options.add_argument("--disable-infobars")
        self.chrome_options.add_argument("enable-automation")
        self.chrome_options.add_argument("--disable-http2")
        self.chrome_options.add_argument('--disable-search-engine-choice-screen')
        self.chrome_options.set_capability('pageLoadStrategy', 'eager')  # Don't wait for full load
        # self.chrome_options.add_argument('--disable-software-rasterizer')
        # self.chrome_options.add_argument('--disable-features=NetworkService')
        #ChromeDriver is just AWFUL because every version or two it breaks unless you pass cryptic arguments
        #AGRESSIVE: options.setPageLoadStrategy(PageLoadStrategy.NONE); // https://www.skptricks.com/2018/08/timed-out-receiving-message-from-renderer-selenium.html

    def test_proxy(self, url: str):
        """
        Tests the proxy connection by sending a GET request to a test URL.

        :return: True if the proxy is working, False otherwise.
        """
        try:
            response = requests.get("https://www.example.com", proxies={url})
        
            response.raise_for_status()
            if response.status_code == 200:
                self.proxy_url = url
                return url
        
        except (TimeoutError, ConnectionError) as e:
            print(f"Proxy {url} failed: {e}")
            return False
    
    def get(self, url: str, enable_proxy: bool=False, get_text_markdown: bool=False):
        """
        Sends a GET request to the specified URL using the proxy.

        :param url: The URL to send the request to.
        :param enable_proxy: Whether to use the proxy for the request, defaults to True.
        :param get_text_markdown: Whether to format the site to a llm-readable markdown format, defaults to False
        :return: The response from the server.
        
        """
        if get_text_markdown:
            url = f"https://r.jina.ai/{url}"
        if enable_proxy:
            # Check if the proxy is working
            with open("http_proxy_list.txt", "r") as file:
                for line in file:
                    proxy = f"http://{line.strip()}"
                    if self.test_proxy(proxy):
                        self.proxy_url = proxy
                        break
            try:
                
                # Set the proxy URL
                proxies = {'http': self.proxy_url, 'https': self.proxy_url}

                # Send the GET request
                response = requests.get(url, proxies=proxies)

                # Check if the request was successful
                response.raise_for_status()

                return response.text

            except requests.RequestException as e:
                print(f"Error: {e}")
                return None
        else:
            try:
                response = requests.get(url)
                response.raise_for_status()
                return response.text
            except requests.RequestException as e:
                print(f"Error: {e}")
                return None
    
    def parse_html(self, html):
        """
        Parses the HTML content using BeautifulSoup.

        :param html: The HTML content to parse.
        :return: The parsed HTML content.
        """
        soup = BeautifulSoup(html, 'html.parser')
        return soup.prettify()
    
    def capture_bg_responses(self, url: str, view_links: bool=True) -> list:
        '''
        method which captures network activity between the client and the server
        uses seleniumwire webdriver instead of standard selenium
        Args: 
            url - url of site to capture background requests/apis
            view_links - allow user to view request links, default is True
        '''
        logging.getLogger('seleniumwire.handler').setLevel(logging.WARNING)
        re_pattern = re.compile(
            r'(?:const|let|var)\s+(\w+)\s*=\s*({.*?})\s*(?=;|,|\n|\r)',  # Added capture group around object
            re.DOTALL
        )
        driver = wire_webdriver.Chrome(
            options=self.chrome_options,
            seleniumwire_options={
                'disable_encoding': True,
                'connection_timeout': 60,
                'ignore_http_methods': [],
                'exclude_hosts': ['google-analytics.com', 'www.google-analytics.com', 'www.googletagmanager.com', 'doubleclick.net'],
                }
            )
        driver.set_page_load_timeout(60)
        driver.get(url)
        WebDriverWait(driver, 30).until(
            lambda d: d.execute_script('return document.readyState') == 'complete'
        )
        time.sleep(3)
        def scroll(driver):
            for _ in range(0, 6):
                driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
                time.sleep(1)
        scroll(driver)
        requests_data = []
        serialized_objects = {}
        # Function to handle circular references
        def serialize(obj):
            import seleniumwire
            # Check if the object has been serialized before
            if id(obj) in serialized_objects:
                return f"Object at {id(obj)} already serialized"
            
            if isinstance(obj, dict):
                serialized_objects[id(obj)] = True
                return {key: serialize(value) for key, value in obj.items()}
            
            if isinstance(obj, list):
                serialized_objects[id(obj)] = True
                return [serialize(item) for item in obj]
            
            # If it's an HTTPHeaders or any non-serializable object, convert it to a dictionary
            if isinstance(obj, seleniumwire.request.HTTPHeaders):
                return {key: str(value) for key, value in obj.items()}
            
            # Default: return the object as is
            return obj

        for request in driver.requests:
            filtered_request = filter_request(request)
            if not filtered_request:
                continue # Skip irrelevant requests
            response_data = {
                'method': request.method,
                'url': request.url,
                'headers': {key: value for key, value in request.headers.items()} if isinstance(request.headers, dict) else request.headers,
                'response_status': request.response.status_code if request.response else None,
                'json_api_responses': [],
                'js_variables': []
            }

            if filtered_request.response:
                url = request.url.lower()
                content_type = filtered_request.response.headers.get('Content-Type', '').lower()
                if any(ext in content_type or ext in url for ext in ['css', 'jpg', 'png', 'font', 'html']):
                    continue
                response_body = decode(
                    filtered_request.response.body, 
                    filtered_request.response.headers.get('Content-Encoding', 'identity')
                )
                try:
                    res_data = response_body.decode('utf-8')
                except UnicodeDecodeError:
                    try:
                        res_data = response_body.decode('latin-1')
                    except Exception as e:
                        print(f'Decoding failed: {str(e)}')
                        res_data = response_body.decode('utf-8', errors='ignore')
                # Parse JSON responses
                if 'application/json' in content_type:
                    try:
                        json_data = json.loads(res_data)
                        response_data['json_api_responses'].append({
                            'data': json_data
                        })
                    except (UnicodeDecodeError, json.JSONDecodeError):
                        pass
                
                # Parse JS variables with potential JSON content
                elif 'javascript' in content_type or url.endswith('.js'):
                    for match in re_pattern.finditer(res_data):
                        var_name = match.group(1)
                        obj_str = match.group(2)
                        try:
                            # Parse with json5 to handle JS-style syntax
                            # json_data = json.loads(obj_str)
                            json_str = re.sub(
                                r"(\s*)(\w+)(\s*):", 
                                r'\1"\2"\3:', 
                                obj_str
                            )
                            #json_data = json5_loads(json_str)
                            json_data = json.loads(json_str)
                            # Skip empty objects or noise
                            if isinstance(json_data, dict) and len(json_data) > 0 and all(isinstance(k, (str, int)) for k in json_data.keys()):
                                response_data['js_variables'].append({
                                    'var_name': var_name,
                                    'data': json_data
                                })

                        except Exception as e:
                            # print(f'Error parsing JS object: {str(e)}')
                            # print(f'Problematic object: {obj_str}')

                            continue  # Skip invalid objects
            if not response_data['json_api_responses']:
                del response_data['json_api_responses']
            if not response_data['js_variables']:
                del response_data['js_variables']
            
            requests_data.append(response_data)
        try:
                # Save the network requests to a JSON file
            with open('network_requests.json', 'w') as f:
                json.dump(requests_data, f, indent=4, default=serialize)
                
            return serialize(requests_data)
        except Exception as e:
            logging.error(f'Error saving network requests: {str(e)}')
        finally:
            driver.quit()
    
    def take_screenshot(self, url: str) -> str:
        '''
        A method to take a screenshot of a page that selenium wire navigates to
        Returns the screenshot as a base664 string
        '''
        driver = wire_webdriver.Chrome(options=self.chrome_options)
        driver.set_page_load_timeout(30)

        try:
            driver.get(url)
            screenshot_base64 = driver.get_screenshot_as_base64()
            return screenshot_base64
        
        except Exception as e:
            print(f'Error while taking a screenshot: {e}')
            return ''
        finally:
            driver.quit()


class TreeNode:
    def __init__(self, content: str):
        self.content = content
        self.children: List['TreeNode'] = []

    def add_child(self, child: 'TreeNode'):
        self.children.append(child)

    def __repr__(self):
        return f"TreeNode(content='{self.content}', children={self.children})"
    
class HTMLParser:
    '''
    A class which parses html content from a url to identify potential json-like content
    It recursively looks for curly braces in html text and formats it into a tree-like json object with nodes and children using the class TreeNode
    
    example use:
    url = 'your_url_to_scrape'
    parser = HTMLParser(url=url)
    json_content = parser.extract_json()
    
    with open('parsed_html.json', 'w', encoding='utf-8') as f:
        json.dump(json_content, f, ensure_ascii=False, indent=4)

    '''
    def __init__(self, url: str):
        self.url = url
        self.url_pattern = r'^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$'

    def get_resource(self, link:str):
        '''
        Retrieves the resource at the specified link
        '''
        if re.match(self.url_pattern, link):
            cookie_list = cookiegetter(link)
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
        cookies = {cookie['name']: cookie['value'] for cookie in cookie_list}

        res = requests.get(url=link, headers=headers, cookies=cookies)
        # if re.match(json_regex, link):
        #     return res.json()
        # else:
        #     return res.text.strip()
        return res.text.strip()
    def _parse_brackets(self, s: str) -> TreeNode:
        """
        Parses a string and constructs a tree of nested brackets.
        """
        stack = []
        root = TreeNode("root")
        stack.append(root)
        i = 0
        n = len(s)
        
        while i < n:
            if s[i] == '{':
                new_node = TreeNode("")
                stack[-1].add_child(new_node)
                stack.append(new_node)
                i += 1
            elif s[i] == '}':
                stack.pop()
                i += 1
            else:
                start = i
                while i < n and s[i] not in {'{', '}'}:
                    i += 1
                content = s[start:i].strip()
                if content:
                    stack[-1].content += content
            # Skip whitespace
            while i < n and s[i].isspace():
                i += 1
    
        return root
    def _tree_to_json(self, node: TreeNode) -> Union[str, Dict]:
        """
        Converts a TreeNode tree into a JSON-compatible dictionary.
        
        :param node: The root TreeNode of the tree.
        :return: A JSON-compatible dictionary representing the tree.
        """
        if not node.children:
            # If the node has no children, return its content as a string
            return node.content
        
        # If the node has children, create a dictionary to represent it
        result = {}
        if node.content:
            result["content"] = node.content
        
        # Recursively convert children to JSON
        if node.children:
            result["children"] = [self._tree_to_json(child) for child in node.children]
        
        return result


    def extract_json(self):
        response_text = self.get_resource(self.url)
        soup = BeautifulSoup(response_text, 'html.parser')
        
        # Find all script tags
        try:
            scripts = soup.find_all('script')
            extracted_data = []
            
            # Loop through script tags
            for script in scripts:
                script_content = script.string
                if script_content:
                    start = script_content.find("{")
                    end = script_content.rfind("}")
                    json_content = script.string[start:end]
                    json_content = json_content.replace("\r", "").replace("\n", "").replace("\t", "").strip()
                    tree = self._parse_brackets(json_content)
                    final_data = self._tree_to_json(tree)
                    extracted_data.append(final_data)
                    
                    with open('test.json', 'w', encoding='utf-8') as f:
                        json.dump(extracted_data, f, ensure_ascii=False, indent=4)
        
        except Exception as e:
            logger.info(str(e))
            return extracted_data
            
                
        return extracted_data
