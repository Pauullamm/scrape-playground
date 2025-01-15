import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
import re
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
from playwright.sync_api import sync_playwright


# -------------------------
# 1. Crawl Website
# -------------------------
def crawl_website(start_url):
    """
    Crawls the given website and collects links to pages, JavaScript files, and other resources.
    """
    visited = set()
    resources = []

    def crawl(url):
        if url in visited:
            return
        visited.add(url)
        try:
            response = requests.get(url)
            soup = BeautifulSoup(response.text, "html.parser")
            # Extract <script> and <link> tags
            for script in soup.find_all("script", src=True):
                resources.append(urljoin(url, script["src"]))
            for link in soup.find_all("link", href=True):
                resources.append(urljoin(url, link["href"]))
            # Extract internal page links
            for a_tag in soup.find_all("a", href=True):
                link = urljoin(url, a_tag["href"])
                if link.startswith(start_url):  # Stay within the domain
                    crawl(link)
        except Exception as e:
            print(f"Error crawling {url}: {e}")

    crawl(start_url)
    return visited, resources


# -------------------------
# 2. Analyze JavaScript Files
# -------------------------
def analyze_js(js_url):
    """
    Fetches and analyzes JavaScript files to find potential API endpoints or embedded data.
    """
    try:
        response = requests.get(js_url)
        # Look for URL patterns (e.g., https://example.com/api/endpoint)
        endpoints = re.findall(r"https?://[a-zA-Z0-9./_%-]+", response.text)
        return endpoints
    except Exception as e:
        print(f"Error analyzing {js_url}: {e}")
        return []


# -------------------------
# 3. Intercept Network Requests with Selenium
# -------------------------
def capture_requests_with_selenium(url):
    """
    Uses Selenium to open a webpage and intercept network requests made during loading.
    """
    options = Options()
    options.add_argument("--headless")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")

    # Enable logging of network requests
    capabilities = DesiredCapabilities.CHROME
    capabilities["goog:loggingPrefs"] = {"performance": "ALL"}

    driver = webdriver.Chrome(service=Service("/path/to/chromedriver"), options=options, desired_capabilities=capabilities)

    try:
        driver.get(url)
        logs = driver.get_log("performance")
        endpoints = []
        for entry in logs:
            message = entry["message"]
            if "Network.requestWillBeSent" in message:
                match = re.search(r'"url":"(https?://.*?)"', message)
                if match:
                    endpoints.append(match.group(1))
        return endpoints
    finally:
        driver.quit()


# -------------------------
# 4. Intercept Network Requests with Playwright
# -------------------------
def capture_requests_with_playwright(url):
    """
    Uses Playwright to open a webpage and intercept network requests made during loading.
    """
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        endpoints = []

        # Intercept and log requests
        def log_request(route, request):
            print(f"Request URL: {request.url}")
            endpoints.append(request.url)
            route.continue_()

        page.route("**/*", log_request)
        page.goto(url)
        browser.close()
        return endpoints


# -------------------------
# Main Script
# -------------------------
def main(start_url):
    print(f"Starting crawl for: {start_url}")

    # Step 1: Crawl the website
    visited_pages, resources = crawl_website(start_url)
    print("\nCrawled pages:")
    print("\n".join(visited_pages))
    print("\nDiscovered resources:")
    print("\n".join(resources))

    # Step 2: Analyze JavaScript files
    all_endpoints = []
    print("\nAnalyzing JavaScript files...")
    for js_url in resources:
        if js_url.endswith(".js"):
            endpoints = analyze_js(js_url)
            all_endpoints.extend(endpoints)
            print(f"Endpoints in {js_url}: {endpoints}")

    # Step 3: Capture network requests (Selenium)
    print("\nCapturing network requests with Selenium...")
    selenium_endpoints = capture_requests_with_selenium(start_url)
    all_endpoints.extend(selenium_endpoints)
    print(f"Network requests captured with Selenium: {selenium_endpoints}")

    # Step 4: Capture network requests (Playwright)
    print("\nCapturing network requests with Playwright...")
    playwright_endpoints = capture_requests_with_playwright(start_url)
    all_endpoints.extend(playwright_endpoints)
    print(f"Network requests captured with Playwright: {playwright_endpoints}")

    # Combine and deduplicate all endpoints
    all_endpoints = list(set(all_endpoints))
    print("\nAll discovered endpoints:")
    print("\n".join(all_endpoints))


if __name__ == "__main__":
    start_url = "https://example.com"  # Replace with your target URL
    main(start_url)
