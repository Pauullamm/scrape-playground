import requests
from bs4 import BeautifulSoup
import requests.cookies
from server_tools.utils import ScraperTool
from server_tools.cookiegetter import cookiegetter
import re

url_pattern = r'^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$'
json_regex = r"^https?:\/\/[^\s]*\.json(?:\?[^\s]*)?$"

def get_resource(link):
    '''
    Retrieves the resource at the specified link
    '''
    if re.match(url_pattern, link):
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

def scrape(url):
    '''
    retrieves parsed html from a specified url
    '''
    scraper = ScraperTool()
    base_page_data = scraper.parse_html(scraper.get(url))
    return base_page_data

def regex_parse(html, regex):
    '''
    Parses html using a regex pattern
    '''
    return re.findall(regex, html)
def scrape_background_requests(url):
    '''
    Retrieves all background requests made by the page at the specified url
    Parses/filters responses to obtain relevant data (e.g. json/javascript variables with json content) 
    '''
    scraper = ScraperTool()
    background_request_data = scraper.capture_bg_responses(url)
    return background_request_data

def take_screenshot(url):
    '''
    Takes a screenshot of the page at the specified url
    '''
    scraper = ScraperTool()
    return scraper.take_screenshot(url)


def search_google(query):
    '''
    Applies a search query to google search and obtains the title and links of the search results
    '''
    url = f"https://www.google.com/search?q={query}"
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
    response = requests.get(url, headers=headers)
    soup = BeautifulSoup(response.text, 'html.parser')

    # Find the search results (adjust the selector as needed)
    results = soup.find_all('div', class_='g')

    for result in results:
        title = result.find('h3').text
        link = result.find('a')['href']
        # snippet = result.find('div', class_='s3v9rd').text
        print(f"Title: {title}\nLink: {link}\n")

actions = {
    "basic_scrape": scrape,
    "scrape_background_requests": scrape_background_requests,
    "take_screenshot": take_screenshot,
    "search_google": search_google,
    "get_resource": get_resource
}