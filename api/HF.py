import requests
from smolagents import CodeAgent, HfApiModel

# Define a custom tool for performing HTTP GET requests
class HttpGetTool:
    def __init__(self):
        pass

    def __call__(self, url: str) -> str:
        try:
            response = requests.get(url)
            response.raise_for_status()
            return response.text
        except requests.RequestException as e:
            return f"Error fetching the URL: {e}"

# Initialize the agent with the custom HTTP GET tool
agent = CodeAgent(
    tools={"http_get": HttpGetTool()},
    model=HfApiModel()  # Specify the model you prefer here
)

# Define the query
query = "how many quotes are on this page? https://quotes.toscrape.com/"

# Run the agent with the query
answer = agent.run(query)
print("Answer:", answer)
