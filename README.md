# Fieldwise

**AI-Based Farmer Crop Recommendation and Disease Advisory System**

Repository: https://github.com/Tanisha-1808/Agri

Live web preview: https://tanisha-1808.github.io/Agri/

Fieldwise is a farmer-focused decision-support platform combining field details, crop suitability, plant-health screening, weather, market signals, a grounded English/Tamil assistant, and bilingual workflows.

## Problem

Farm decisions are often made with fragmented soil readings, uncertain weather, difficult-to-interpret symptoms, and hard-to-compare market information. Fieldwise organizes those signals in one accessible workspace while keeping confidence, sources, and expert escalation visible.

## Features

- Farmer registration, login, JWT sessions, bcrypt password hashing, and admin role protection
- Farm profile, location, soil N/P/K, pH, organic carbon, season, and weather synchronization
- Crop recommendations with suitability percentage and explanations
- Leaf-image disease model adapter with confidence and safe advisory guidance
- Weather forecast, farming alerts, market prices, and source/date labels
- English/Tamil agriculture assistant with source references and browser voice support
- Previous recommendations, disease scans, and assistant history
- Offline cache and field guide for basic crop, disease, and advisory information
- Admin statistics, popular crops, common diseases, model metrics, confusion matrix, farmer/content APIs
- Responsive farmer-first UI for mobile, tablet, and desktop

## Project structure

```text
src/            React frontend and reusable farmer/admin UI
backend/        FastAPI routes, validation, storage, and service adapters
models/         Trained model artifacts and signed evaluation reports
datasets/       Versioned crop, disease, and knowledge-base inputs
database/       MongoDB Atlas schema and operations notes
api/            API contracts and integration notes
docs/           Architecture and deployment documentation
```

## Architecture

```text
React + Vite + Tailwind CSS -> FastAPI + Pydantic + JWT/bcrypt
                                  |          |          |
                               MongoDB    ML APIs   Open-Meteo
```

FastAPI is the primary backend. MongoDB is used when `MONGODB_URI` is configured; local development can use the in-memory store. The previous Node service remains available as `npm run api:node`.

## Technologies

- React 19, Vite, Tailwind CSS 4, Lucide React
- Python 3.11+, FastAPI, Uvicorn, Pydantic, HTTPX
- bcrypt, JWT HTTP-only cookies, CORS, environment secrets
- MongoDB / MongoDB Atlas
- joblib crop-model adapter and HTTP disease-model adapter
- Open-Meteo weather integration

## Datasets and models

The included dataset files are versioned starter content with provenance fields. Replace them with reviewed regional agricultural datasets before production. The crop API loads `CROP_MODEL_PATH` when a trained artifact exists, otherwise it uses a transparent fallback and labels that method. Disease inference requires `DISEASE_MODEL_URL` and refuses to guess when unavailable. Market prices require `MARKET_API_URL`; no synthetic prices are returned.

Model metrics require a signed report at `MODEL_EVALUATION_PATH`; the admin UI shows an unavailable state until that report is provided.

## Local setup

Prerequisites: Node.js 20+, Python 3.11+, and optionally MongoDB.

```powershell
npm install
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
```

Set a strong `JWT_SECRET`, plus `MONGODB_URI`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `MARKET_API_URL`, model URLs, and signed artifact paths in `.env`.

```powershell
npm run dev:full
```

Frontend: `http://localhost:5173`  
FastAPI docs: `http://localhost:8000/docs`  
Health: `http://localhost:8000/api/health`

## API summary

Public: `GET /api/health`, `GET /api/offline-content`  
Auth: `POST /api/auth/register`, `/login`, `/admin-login`, `/logout`; `GET /api/auth/me`  
Farmer: `PUT /api/farm-details`, `POST /api/crop-recommendations`, `POST /api/disease-detection`, `GET /api/disease-advisories`, `/weather`, `/market`, `/history`; `POST /api/assistant`  
Admin: `GET /api/admin/stats`, `/model-evaluation`, `/farmers`, `/content`; `POST /api/admin/content`; `DELETE /api/admin/farmers/{farmer_id}`

Validation errors return `{ error, code, fields }` where applicable. Secrets and model URLs stay server-side.

## Testing

```powershell
python -m pytest backend/test_api.py -q
python -m compileall -q backend
npm run lint
npm run build
```

The API tests cover registration, invalid input, protected recommendations, history, grounded assistant responses, disease-model gating, admin authorization, analytics, and evaluation metrics.

## Deployment

### Render + MongoDB Atlas

1. Create an Atlas cluster and database user; place its connection string in `MONGODB_URI`.
2. Deploy the Python service from `render.yaml`, or use `pip install -r requirements.txt` and `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`.
3. Add `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `MONGODB_URI`, `DISEASE_MODEL_URL`, and `CROP_MODEL_PATH` as Render secrets.
4. Deploy the Vite frontend on Vercel and replace `YOUR-RENDER-API` in `vercel.json` with the API hostname.
5. Restrict CORS to the deployed frontend origin and use HTTPS for secure cookies.

`render.yaml` and `vercel.json` are starter deployment manifests. Review limits, health checks, model storage, and secrets before production.

## Responsible use

Predictions are decision support, not guarantees. Confirm disease diagnoses and important treatment decisions with a qualified agriculture expert. Do not use generic pesticide doses; follow the local label and official extension advice. Keep farmer data private, rotate secrets, use HTTPS, and replace demo market/model/evaluation content with reviewed production sources.

## Future enhancements

- Signed model registry with reproducible evaluation artifacts
- Regional Tamil voice model and better low-bandwidth sync queue
- Official live market integrations
- More crop/disease classes with calibrated confidence
- Push alerts, task planning, and expert referral workflows
