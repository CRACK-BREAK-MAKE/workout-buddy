# Use Python 3.14 slim image
FROM python:3.14-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install uv
RUN curl -LsSf https://astral.sh/uv/install.sh | sh
ENV PATH="/root/.cargo/bin:${PATH}"

# Copy dependency files
COPY pyproject.toml ./

# Create virtual environment and install dependencies
RUN uv venv
RUN . .venv/bin/activate && uv pip install -e .

# Copy application code
COPY . .

# Expose port
EXPOSE 7001

# Activate venv and run application
CMD [".venv/bin/uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7001", "--reload"]
