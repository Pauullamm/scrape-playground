
# Terrier AI - Your Web Scraping Companion 🐕

Terrier AI combines web scraping tools with AI agents to aid with data extraction


## Current Features

- Background requests capture
- API testing (Postman API-like interface)
- AI agent browser automation - built upon the [browser-use library](https://browser-use.com/)


## Contributing

Contributions are welcome!

See `contributing.md` for ways to get started.

things to check out: UI-TARS, smolagents smolVLM

Please adhere to this project's `code of conduct`.


## Installation
- Install npm packages
```bash
cd client
npm run install
```
- Create a python virtual environment in the root folder 
```
pip install virtualenv
python3 -m venv venv
```
- on MacOS run:
```
source venv/bin/activate
```

- or with Windows:
```
cd venv/Scripts && activate && cd ../../
```

- Install python modules:
```
pip install -r requirements.txt
```
## Environment Variables

To run this project, you will need to add the following environment variables to your .env file(s) (depending on your usage)

`OPENAI_API_KEY`

`DEEPSEEK_API_KEY`


## Tech Stack

**Client:** React, Redux, TailwindCSS

**API:** FasAPI, Playwright, Selenium Wire, langchain, browser-use


## Demo


