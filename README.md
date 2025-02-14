# Terrier AI - Your Web Scraping Companion 🐕 [![Netlify Status](https://api.netlify.com/api/v1/badges/ee4d5468-c54e-4c70-8711-02cc2115339b/deploy-status)](https://app.netlify.com/sites/terrier-hunt/deploys)

Terrier AI helps you extract structured data from webpages. 

## Key Features ✨

### 📄 HTML-JSON Extraction
- Parsing of browser HTML to look for structured content
- Uses Gemini's long context window under the hood to process HTML

### (New!) Chrome Extension - Terrier Pup
- Coming Soon
  
## Getting Started 🚀

### Prerequisites
- Node.js v16+
- Python 3.13+ (Important - previous versions will throw package version/OS related issues)
- Chrome/Firefox browsers

### Installation

**Client Setup:**
```bash
cd client
npm install
```
**API/Server Setup:**
```bash
cd server
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

`GEMINI_API_KEY=your_gemini_api_key`

`VITE_BACKEND_URL=your_backend_url_or_localhost`

## Running the Application
Start both services simultaneously in separate terminals (We recommend using Docker to run the server to avoid versioning issues):

Frontend:
```bash
cd client && npm run dev
```

Backend:
```bash
docker build -t <image_name> .
docker run -p 5000:5000 <image_name>
```

## Tech Stack

**Client:** React, Redux, TailwindCSS

**API:** FastAPI, Playwright, Selenium Wire, langchain, browser-use

**AI Components:** Custom agent implementations, smolagents class, pocketflow framework


## Contributing

Contributions are welcome!

See `contributing.md` for ways to get started.

Please adhere to this project's `code of conduct`.


