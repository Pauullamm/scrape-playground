from playwright.async_api import async_playwright
import time

async def cookiegetter(url):
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        await page.goto(url)
        time.sleep(2)
        cookies = await page.context.cookies()
        await browser.close()
        # print(cookies)
        return cookies

# if __name__ == "__main__":
#     import asyncio
#     asyncio.run(cookiegetter('https://chatgpt.com/'))
