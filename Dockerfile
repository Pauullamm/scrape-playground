# Use an official Python runtime as the base image
FROM --platform=linux/amd64 python:3.13-slim

# Install system dependencies required by Playwright
RUN apt-get update && \
    apt-get install -y \
    curl \
    gnupg \
    ca-certificates \
    unzip \
    fonts-liberation \
    libgtk-3-0 \
    wget \
    xdg-utils \
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libpango-1.0-0 \
    libcairo2 \
    libasound2 \
    libatspi2.0-0 \
    libwayland-client0 \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Install Google Chrome from the official repository (amd64)
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /etc/apt/trusted.gpg.d/google-chrome.gpg && \
    echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list && \
    apt-get update && \
    apt-get install -y google-chrome-stable

# Verify Chrome installation
RUN google-chrome --version

# Install the closest matching ChromeDriver version
RUN CHROME_VERSION=$(google-chrome --version | awk '{print $3}') && \
    CHROME_MAJOR_VERSION=$(echo $CHROME_VERSION | cut -d. -f1) && \
    echo "Detected Chrome Version: $CHROME_VERSION (Major: $CHROME_MAJOR_VERSION)" && \
    CHROMEDRIVER_VERSION=$(curl -sS https://googlechromelabs.github.io/chrome-for-testing/LATEST_RELEASE_$CHROME_MAJOR_VERSION || echo "") && \
    if [ -z "$CHROMEDRIVER_VERSION" ]; then \
        echo "No exact match for ChromeDriver version $CHROME_MAJOR_VERSION, using latest available version"; \
        CHROMEDRIVER_VERSION=$(curl -sS https://googlechromelabs.github.io/chrome-for-testing/LATEST_RELEASE); \
    fi && \
    echo "Using ChromeDriver Version: $CHROMEDRIVER_VERSION" && \
    curl -sSL "https://storage.googleapis.com/chrome-for-testing-public/$CHROMEDRIVER_VERSION/linux64/chromedriver-linux64.zip" -o chromedriver.zip && \
    unzip -j chromedriver.zip -d /usr/local/bin/ && \
    chmod +x /usr/local/bin/chromedriver && \
    rm chromedriver.zip
# Configure environment (Ensure ChromeDriver is in the system path)
ENV PATH="/usr/local/bin:${PATH}"

# Set the working directory inside the container
WORKDIR /server

# Upgrade pip and install dependencies
COPY server/requirements.txt ./
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Create a shared directory for Playwright browsers and adjust permissions    
RUN mkdir -p /ms-playwright && \
    chmod -R 777 /ms-playwright && \
    # Set the environment variable so browsers install here
    PLAYWRIGHT_BROWSERS_PATH=/ms-playwright playwright install --with-deps chromium

# **Set the environment variable for runtime**
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

# Copy in the entire project (adjust as needed)
COPY server ./

RUN adduser --disabled-password --uid 1000 appuser && \
    chown -R appuser:appuser /server && \
    chown -R appuser:appuser /ms-playwright


USER appuser

# Expose the port that your FastAPI app will run on
EXPOSE 5000

# Start the FastAPI app using uvicorn
CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "5000"]
