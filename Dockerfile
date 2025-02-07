# Use an official Python runtime as the base image
FROM python:3.13-slim

# Install system dependencies required by Playwright and Chrome
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

# Add the Google Chrome repository and install Chrome
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - && \
    echo "deb http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list && \
    apt-get update && \
    apt-get install -y google-chrome-stable && \
    rm -rf /var/lib/apt/lists/*

# Install ChromeDriver (ensure the version matches the installed Chrome version)
RUN CHROME_VERSION=$(google-chrome --product-version | grep -oE '[0-9]+\.[0-9]+\.[0-9]+') && \
    CHROMEDRIVER_VERSION=$(curl -sS chromedriver.storage.googleapis.com/LATEST_RELEASE_$CHROME_VERSION) && \
    curl -sSL https://chromedriver.storage.googleapis.com/$CHROMEDRIVER_VERSION/chromedriver_linux64.zip -o chromedriver.zip && \
    unzip chromedriver.zip && \
    mv chromedriver /usr/local/bin/chromedriver && \
    chmod +x /usr/local/bin/chromedriver && \
    rm chromedriver.zip

# Set the working directory inside the container
WORKDIR /server

# Upgrade pip and install dependencies
COPY server/requirements.txt ./
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt && \
    playwright install --with-deps chromium

# Copy in the entire project
COPY server ./

# Expose the port that your FastAPI app will run on
EXPOSE 5000

# Create non-root user (UID 1000 is safer for most hosts)
RUN adduser \
    --disabled-password \
    --no-create-home \
    --uid 1000 \
    appuser && \
    chown -R appuser:appuser /server

USER appuser

# Start the FastAPI app using uvicorn
CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "5000"]
