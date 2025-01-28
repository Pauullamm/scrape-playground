# Terrier AI - Your Web Scraping Companion 🐕

Terrier AI combines web scraping tools with AI agents to simplify data extraction. Our platform aims to automate tedious data collection tasks while maintaining compliance with website policies.

## Key Features ✨

### 🕵️ Background Requests Capture
- Automatically track and record all network activity during url calls
- Examine captured requests for analysis or replay

### 🔧 API Testing Toolkit
- Postman-style interface for API exploration and validation

### 🤖 AI Agent Automation
- Natural language instructions for browser automation
- Built on [browser-use](https://browser-use.com/) for intelligent DOM interaction
- Automatic retry and error recovery mechanisms

### (New!) 📄 HTML-JSON Extraction
- Parsing of browser HTML to look for json-like content
- Work in Progress

## Getting Started 🚀

### Prerequisites
- Node.js v16+
- Python 3.13+
- Chrome/Firefox browsers

### Installation

**Client Setup:**
```bash
cd client
npm install
```
**API/Server Setup:**
```bash
python3 -m venv venv
```
- on MacOS run:
```bash
source venv/bin/activate
```

- or with Windows:
```bash
cd venv/Scripts && activate && cd ../../
```

- Install python modules:
```bash
pip install -r requirements.txt
```


## Environment Variables

To run this project, you will need to add the following environment variables to your .env file(s) (depending on your usage)

`OPENAI_API_KEY=your_openai_api_key`

`DEEPSEEK_API_KEY=your_deepseek_api_key`

`REACT_APP_OPENAI_API_KEY=your_openai_api_key`

## Running the Application
Start both services simultaneously in separate terminals:
```bash
cd client && npm run dev
cd api && python main.py
```

## Tech Stack

**Client:** React, Redux, TailwindCSS

**API:** FasAPI, Playwright, Selenium Wire, langchain, browser-use

**AI Components:** Custom agent implementations, browser-use integration, smolagents class


## Contributing

Contributions are welcome!

See `contributing.md` for ways to get started.

Please adhere to this project's `code of conduct`.


