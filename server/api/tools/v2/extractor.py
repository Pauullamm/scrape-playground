import extruct
import requests
import pprint
from w3lib.html import get_base_url
from playwright.sync_api import sync_playwright
import time
import json

def cookiegetter(url):
    with sync_playwright() as p:
        user_data_dir = f"/tmp/chrome_{time.time()}"
        browser = p.chromium.launch_persistent_context(
            user_data_dir=user_data_dir,
            headless=True,
            no_viewport=True
        )
        page = browser.new_page()
        page.goto(url)
        time.sleep(3)
        cookies = page.context.cookies()
        browser.close()
        return cookies

def get_resource(link:str) -> str:
    '''
    Retrieves the resource at the specified link
    Args:
        link: str -> the url of the resource to be retrieved
    Returns:
        The content of the resource as a string
    '''
    # url_pattern = r'^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$'

    # if re.match(url_pattern, link):
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

    return res.text.strip(), get_base_url(res.text, res.url)

def extract(url:str) -> dict:
    """
    Extracts structured data after retrieving from a resource
    """
    response = get_resource(url)

    data = extruct.extract(response[0], base_url=response[1], errors="ignore")

    with open('outputB.json', 'w') as f:
        json.dump(data, f, indent=4)
    
    return data
