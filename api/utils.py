import requests, json, time
from urllib3.exceptions import TimeoutError, ConnectionError
from bs4 import BeautifulSoup
from selenium.webdriver.chrome.options import Options
from seleniumwire import webdriver as wire_webdriver

class ScraperTool:
    def __init__(self):
        """
        Initializes the client with a proxy URL.

        :param proxy_url: The URL of the proxy server.
        """
        self.proxy_url = None
        self.entries = []

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
    
    def capture_har_wire(self, url: str, view_links: bool=True) -> None:
        '''
        method which captures network activity between the client and the server
        uses seleniumwire webdriver instead of standard selenium
        Args: 
            url - url of site to capture background requests/apis
            view_links - allow user to view request links, default is True
        '''
        chrome_options = Options()
        chrome_options.add_argument('--headless')  # Optional: run Chrome in headless mode
        chrome_options.add_argument('--disable-gpu')  # Disable GPU acceleration
        chrome_options.set_capability('goog:loggingPrefs', {'performance': 'ALL'})
        chrome_options.add_argument('--disable-blink-features=AutomationControlled')
        chrome_options.add_argument("--disable-browser-side-navigation");
        chrome_options.add_argument("--disable-dev-shm-usage");
        chrome_options.add_argument('--start-maximized')
        chrome_options.add_argument('--disable-extensions')
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument("--disable-infobars");
        chrome_options.add_argument("enable-automation");
        #ChromeDriver is just AWFUL because every version or two it breaks unless you pass cryptic arguments
        #AGRESSIVE: options.setPageLoadStrategy(PageLoadStrategy.NONE); // https://www.skptricks.com/2018/08/timed-out-receiving-message-from-renderer-selenium.html


        driver = wire_webdriver.Chrome(options=chrome_options)
        driver.set_page_load_timeout(30)
        driver.get(url)
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
            if view_links:
                print(request)

            headers = {key: value for key, value in request.headers.items()} if isinstance(request.headers, dict) else request.headers
            response_headers = {}

            if request.response:
                response_headers = serialize(request.response.headers)

            request_data = {
                'method': request.method,
                'url': request.url,
                'headers': headers,
                'response_status': request.response.status_code if request.response else None,
            }
            requests_data.append(request_data)

            # Save the network requests to a JSON file
        with open('network_requests.json', 'w') as f:
            json.dump(requests_data, f, indent=4, default=serialize)
        driver.quit()
        return requests_data
    
    def take_screenshot(self, url: str) -> str:
        '''
        A method to take a screenshot of a page that selenium wire navigates to
        Returns the screenshot as a base664 string
        '''
        chrome_options = Options()
        chrome_options.add_argument('--headless')  # Optional: run Chrome in headless mode
        chrome_options.add_argument('--disable-gpu')  # Disable GPU acceleration
        chrome_options.set_capability('goog:loggingPrefs', {'performance': 'ALL'})
        chrome_options.add_argument('--disable-blink-features=AutomationControlled')
        chrome_options.add_argument("--disable-dev-shm-usage");
        chrome_options.add_argument("--disable-browser-side-navigation");
        chrome_options.add_argument('--start-maximized')
        chrome_options.add_argument('--disable-extensions')
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument("--disable-infobars");
        chrome_options.add_argument("enable-automation");
        #ChromeDriver is just AWFUL because every version or two it breaks unless you pass cryptic arguments
        #AGRESSIVE: options.setPageLoadStrategy(PageLoadStrategy.NONE); // https://www.skptricks.com/2018/08/timed-out-receiving-message-from-renderer-selenium.html

        driver = wire_webdriver.Chrome(options=chrome_options)
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

# scraper = ScraperTool()
# scraper.capture_har_wire("https://proxy.incolumitas.com/proxy_detect.html")