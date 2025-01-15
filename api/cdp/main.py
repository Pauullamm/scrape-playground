import asyncio
from playwright.async_api import async_playwright

async def capture_network_requests(page):
    # Enable CDP to capture network requests
    cdp_session = await page.context.new_cdp_session(page)
    
    # Enable network tracking
    await cdp_session.send('Network.enable')

    # Define event handlers
    def on_request(request):
        try:
            # Debugging: Print the full request object to see its structure
            print("Request Event: ", request)
            
            # Now access the nested 'url', 'method', and 'headers' fields
            url = request['request'].get('url', 'No URL available')
            method = request['request'].get('method', 'No Method available')
            headers = request['request'].get('headers', 'No Headers available')
            
            print(f"Request URL: {url}")
            print(f"Request Method: {method}")
            print(f"Request Headers: {headers}")
        except Exception as e:
            print(f"Error processing request: {e}")

    def on_response(response):
        try:
            # Debugging: Print the full response object to see its structure
            print("Response Event: ", response)

            # Now access the nested 'url', 'status', and 'headers' fields
            url = response.get('url', 'No URL available')
            status = response.get('status', 'No Status available')
            headers = response.get('headers', 'No Headers available')
            
            print(f"Response URL: {url}")
            print(f"Response Status: {status}")
            print(f"Response Headers: {headers}")
        except Exception as e:
            print(f"Error processing response: {e}")

    # Listen for network events
    cdp_session.on('Network.requestWillBeSent', on_request)
    cdp_session.on('Network.responseReceived', on_response)

    # Go to the desired URL
    await page.goto('https://example.com')  # Replace with your desired URL

    # Wait for a few seconds to capture network events
    await page.wait_for_timeout(5000)  # Wait for 5 seconds

async def main():
    async with async_playwright() as p:
        # Launch a browser instance
        browser = await p.chromium.launch(headless=True)
        
        # Create a new page
        page = await browser.new_page()
        
        # Capture network requests
        await capture_network_requests(page)
        
        # Close the browser
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
