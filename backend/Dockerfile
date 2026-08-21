FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app

EXPOSE 8000

# Render (and most PaaS Docker runtimes) inject $PORT and route traffic to
# whatever port the container actually listens on — hardcoding 8000 would
# silently break there. Falls back to 8000 for local `docker run`/compose,
# where $PORT is unset.
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
