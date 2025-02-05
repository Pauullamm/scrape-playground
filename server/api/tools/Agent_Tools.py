import requests
from bs4 import BeautifulSoup
from tools.utils import ScraperTool, HTMLParser
from tools.cookiegetter import cookiegetter
import re
import os
from urllib.parse import unquote, urljoin, urlparse
import pathvalidate
import mimetypes
import uuid


url_pattern = r'^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$'
json_regex = r"^https?:\/\/[^\s]*\.json(?:\?[^\s]*)?$"

import os
import requests
import mimetypes
import uuid
import pathlib
from urllib.parse import urlparse
from urllib.parse import unquote
import pathvalidate
from .mdconvert import MarkdownConverter, UnsupportedFormatException, FileConversionException  # Adjust imports accordingly

converter = MarkdownConverter()
def fetch_page_as_md(url: str, downloads_folder: str, request_kwargs: dict = None):
    download_path = ""
    try:
        if url.startswith("file://"):
            download_path = os.path.normcase(os.path.normpath(unquote(url[7:])))
            res = converter.convert_local(download_path)
            page_title = res.title
            page_content = res.text_content
        else:
            # Prepare the request parameters
            request_kwargs = request_kwargs.copy() if request_kwargs is not None else {}
            request_kwargs["stream"] = True

            # Send an HTTP request to the URL
            response = requests.get(url, **request_kwargs)
            response.raise_for_status()

            # If the HTTP request was successful
            content_type = response.headers.get("content-type", "")

            # Text or HTML
            if "text/" in content_type.lower():
                res = converter.convert_response(response)
                page_title = res.title
                page_content = res.text_content
            # A download
            else:
                # Try producing a safe filename
                fname = None
                download_path = None
                try:
                    fname = pathvalidate.sanitize_filename(os.path.basename(urlparse(url).path)).strip()
                    download_path = os.path.abspath(os.path.join(downloads_folder, fname))

                    suffix = 0
                    while os.path.exists(download_path) and suffix < 1000:
                        suffix += 1
                        base, ext = os.path.splitext(fname)
                        new_fname = f"{base}__{suffix}{ext}"
                        download_path = os.path.abspath(os.path.join(downloads_folder, new_fname))

                except NameError:
                    pass

                # No suitable name, so make one
                if fname is None:
                    extension = mimetypes.guess_extension(content_type)
                    if extension is None:
                        extension = ".download"
                    fname = str(uuid.uuid4()) + extension
                    download_path = os.path.abspath(os.path.join(downloads_folder, fname))

                # Open a file for writing
                with open(download_path, "wb") as fh:
                    for chunk in response.iter_content(chunk_size=512):
                        fh.write(chunk)

                # Render it
                local_uri = pathlib.Path(download_path).as_uri()
                print(local_uri)
                page_title = "Download complete."
                page_content = f"# Download complete\n\nSaved file to '{download_path}'"

    except UnsupportedFormatException as e:
        print(e)
        page_title = ("Download complete.",)
        page_content = f"# Download complete\n\nSaved file to '{download_path}'"
    except FileConversionException as e:
        print(e)
        page_title = ("Download complete.",)
        page_content = f"# Download complete\n\nSaved file to '{download_path}'"
    except FileNotFoundError:
        page_title = "Error 404"
        page_content = f"## Error 404\n\nFile not found: {download_path}"
    except requests.exceptions.RequestException as request_exception:
        try:
            page_title = f"Error {response.status_code}"

            # If the error was rendered in HTML we might as well render it
            content_type = response.headers.get("content-type", "")
            if content_type is not None and "text/html" in content_type.lower():
                res = converter.convert(response)
                page_title = f"Error {response.status_code}"
                page_content = f"## Error {response.status_code}\n\n{res.text_content}"
            else:
                text = ""
                for chunk in response.iter_content(chunk_size=512, decode_unicode=True):
                    text += chunk
                page_title = f"Error {response.status_code}"
                page_content = f"## Error {response.status_code}\n\n{text}"
        except NameError:
            page_title = "Error"
            page_content = f"## Error\n\n{str(request_exception)}"

    # Return the page title and content for further use, or perform the rendering in your app
    return page_title, page_content


# You can now call this function like so:

def get_resource(link:str):
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

def scrape(url:str):
    '''
    retrieves parsed html from a specified url
    '''
    scraper = ScraperTool()
    base_page_data = scraper.parse_html(scraper.get(url))
    return base_page_data

def regex_parse(html:str, regex:str):
    '''
    Parses html using a regex pattern
    '''
    return re.findall(regex, html)
def scrape_background_requests(url:str):
    '''
    Retrieves all background requests made by the page at the specified url
    Parses/filters responses to obtain relevant data (e.g. json/javascript variables with json content) 
    '''
    scraper = ScraperTool()
    background_request_data = scraper.capture_bg_responses(url)
    return str(background_request_data)

def take_screenshot(url:str):
    '''
    Takes a screenshot of the page at the specified url
    '''
    scraper = ScraperTool()
    return scraper.take_screenshot(url)


def search_google(query:str):
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

def parse_html(url: str):
    '''
    parses and searches DOM html content for json-like variables
    '''
    parser = HTMLParser(url=url)
    data = parser.extract_json()
    return str(data)

def parse_dom_scripts(url:str) -> str:
    '''
    Retrieves the script tags from the dom and formats it into a string
    '''
    response_text = get_resource(url)
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
    
actions = {
    "scrape": scrape,
    "scrape_background_requests": scrape_background_requests,
    "take_screenshot": take_screenshot,
    "search_google": search_google,
    "get_resource": get_resource,
    "parse_html": parse_html,
    "parse_dom_scripts": parse_dom_scripts
}