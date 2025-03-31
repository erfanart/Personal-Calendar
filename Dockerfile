# Use official Python image
FROM python:3.13-slim

# Set working directory


# Set the working directory in the container
WORKDIR /app

# Copy the application source code
COPY app .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose any necessary ports (if applicable)
EXPOSE 8000

# Create volumes for data persistence
VOLUME [ "/app/out", "/app/db", "/app/settings.conf" ]

# Set the command to run the application
CMD ["python", "main.py"]