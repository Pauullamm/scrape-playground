# Use an official Python runtime as the base image
FROM python:3.13-slim

# Install system dependencies required by Playwright
RUN apt-get update && \
    apt-get install -y \
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
    # Optional: Add ffmpeg if needed for pydub
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*


# Set playwright browser path
ENV PLAYWRIGHT_BROWSERS_PATH=/app/playwright-browsers

# Set the working directory inside the container
WORKDIR /server

# Upgrade pip and install dependencies
COPY server/requirements.txt ./
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt && \
    playwright install --with-deps chromium

# Copy in the entire project (adjust as needed)
# This assumes your directory structure looks like:
# └── server
#     ├── api
#     │   └── main.py
#     └── (other directories/files)
COPY server ./

# Expose the port that your FastAPI app will run on
EXPOSE 5000

# Create non-root user (UID 1000 is safer for most hosts)
RUN adduser \
    --disabled-password \
    --no-create-home \
    --uid 1000 \
    appuser && \
    chown -R appuser:appuser $PLAYWRIGHT_BROWSERS_PATH

USER appuser

# Start the FastAPI app using uvicorn.
# Since main.py is in /server/api and contains "app", the module path is "api.main:app"
CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "5000"]
