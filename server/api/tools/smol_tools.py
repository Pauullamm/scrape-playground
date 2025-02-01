from smolagents import tool
from cookiegetter import cookiegetter
import requests

CONTENT_TO_PARSE = []
max_chunk_tokens = 800000
avg_chars_per_token = 4

@tool
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
    # if re.match(json_regex, link):
    #     return res.json()
    # else:
    #     return res.text.strip()
    return res.text.strip()



def split_js_content(js_content: str) -> list[str]:
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
    max_chunk_size = max_chunk_tokens * avg_chars_per_token
    
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
            chunks.extend(split_fallback(full_stmt, max_chunk_size))
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

def split_fallback(large_stmt: str, max_size: int) -> list[str]:
    """Fallback splitter for oversized statements"""
    return [large_stmt[i:i+max_size] 
            for i in range(0, len(large_stmt), max_size)]

def pre_process(link:str) -> list[str]:
    '''
    A method which would preprocess the text response of the webpage
    '''
    try:
        response_text = get_resource(link)
        split_text = split_js_content(response_text)
        
        return split_text
    except Exception as e:
        print(f'Error retrieving content: {str(e)}')
        
@tool
def retrieve_js_content(url: str) -> any:
    '''
    This tool retrieves javascript content from a webpage url and splits it into a list of javascript variables.
    It returns a list of javascript content
    Args:
        url: The webpage url from which its javascript variables are to be extracted from
    '''
    print(url)
    return pre_process(link=url)


@tool
def output_content(input: str) -> any:
    '''
    This tool writes the agent's output to a text file.
    It does not return an output
    
    Args:
        input: The string of text the agent wishes to output
    '''
    with open('output.txt', 'a') as f:
        f.write(input)
