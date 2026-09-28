# API

The primary API is FastAPI in `backend/main.py`. Route contracts are available at `/docs` when the service is running. Frontend requests use `/api/*`; Vite proxies those requests to port 8000 in development and the deployment platform routes them to the deployed API.

Keep integrations behind server-side environment variables: `MONGODB_URI`, `DISEASE_MODEL_URL`, `MARKET_API_URL`, and model paths. Never expose provider keys to the browser.
