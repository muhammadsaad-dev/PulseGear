# ==============================================================================
# Stage 1: Build Frontend (Vite + React 18 + Tailwind CSS v4)
# ==============================================================================
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Install dependencies
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

# Build production bundle
COPY frontend/ ./
RUN npm run build

# ==============================================================================
# Stage 2: Production Python Application
# ==============================================================================
FROM python:3.12-slim AS runner

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy backend source code
COPY . /app/

# Copy built frontend assets from builder stage
COPY --from=frontend-builder /app/frontend/build /app/frontend/build

# Collect static files
RUN python manage.py collectstatic --noinput

# Expose port
EXPOSE 8000

# Run entrypoint with database migrations, demo seeding, and Gunicorn
CMD ["sh", "-c", "python manage.py migrate && python manage.py seed_data && gunicorn backend.wsgi:application --bind 0.0.0.0:${PORT:-8000} --workers 3 --timeout 120"]
