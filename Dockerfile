# Use an official Python runtime as the base image
FROM python:3.13-slim

# Set the working directory inside the container
WORKDIR /server

# Upgrade pip and install dependencies
COPY server/requirements.txt ./
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt && \
    playwright install

# Copy in the entire project (adjust as needed)
# This assumes your directory structure looks like:
# └── server
#     ├── api
#     │   └── main.py
#     └── (other directories/files)
COPY server ./

# Expose the port that your FastAPI app will run on
EXPOSE 5000

# Setup an app user so the container doesn't run as root
RUN adduser --disabled-password --gecos '' app
USER app

# Start the FastAPI app using uvicorn.
# Since main.py is in /server/api and contains "app", the module path is "api.main:app"
CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "5000"]
