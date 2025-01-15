from langchain_openai import ChatOpenAI
from browser_use import Agent
import asyncio, os
from load_dotenv import load_dotenv

load_dotenv()

async def main():
    agent = Agent(
        task="Go to https://books.toscrape.com/ and return a list of all the books on the first page.",
        llm=ChatOpenAI(model="gpt-4o", api_key=os.getenv('OPENAI_API_KEY')),
    )
    result = await agent.run()
    print(result)

asyncio.run(main())