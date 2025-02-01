from playwright.sync_api import sync_playwright
import time

def cookiegetter(url):
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(url)
        time.sleep(2)
        cookies = page.context.cookies()
        browser.close()
        return cookies
