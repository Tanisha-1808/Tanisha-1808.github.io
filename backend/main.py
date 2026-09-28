from __future__ import annotations

import os
import json
import re
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Literal
from uuid import uuid4

import bcrypt
import httpx
import jwt
from dotenv import load_dotenv
from fastapi import Cookie, Depends, FastAPI, File, HTTPException, Request, Response, UploadFile
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from pydantic import BaseModel, Field, field_validator

from .storage import Storage, utc_now

load_dotenv()

JWT_SECRET = os.getenv("JWT_SECRET", "dev-only-change-this-secret-before-production")
JWT_ALGORITHM = "HS256"
JWT_COOKIE = "fieldwise_session"
MONGO_URI = os.getenv("MONGODB_URI")
DISEASE_MODEL_URL = os.getenv("DISEASE_MODEL_URL")
CROP_MODEL_PATH = os.getenv("CROP_MODEL_PATH")
MARKET_API_URL = os.getenv("MARKET_API_URL")
MODEL_EVALUATION_PATH = os.getenv("MODEL_EVALUATION_PATH")
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "")

app = FastAPI(title="Fieldwise Agriculture API", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:5173"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
storage = Storage(MONGO_URI)
bearer = HTTPBearer(auto_error=False)


@app.exception_handler(RequestValidationError)
async def validation_error_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    del request
    fields = [".".join(str(part) for part in error.get("loc", []) if part != "body") for error in exc.errors()]
    return JSONResponse(status_code=422, content={"error": "Please check the highlighted fields and try again.", "code": "VALIDATION_ERROR", "fields": fields})


@app.exception_handler(HTTPException)
async def http_error_handler(request: Request, exc: HTTPException) -> JSONResponse:
    del request
    message = exc.detail if isinstance(exc.detail, str) else "The request could not be completed."
    return JSONResponse(status_code=exc.status_code, content={"error": message, "code": f"HTTP_{exc.status_code}"})


@app.exception_handler(Exception)
async def unexpected_error_handler(request: Request, exc: Exception) -> JSONResponse:
    del request
    print(f"Unhandled API error: {exc}")
    return JSONResponse(status_code=500, content={"error": "Something went wrong. Please try again.", "code": "INTERNAL_ERROR"})


def public_user(user: dict[str, Any]) -> dict[str, Any]:
    return {key: user.get(key) for key in ["id", "name", "mobile", "email", "district", "village", "preferred_language", "farm_size", "main_crops", "farm_details", "role", "created_at"]}


def clean_doc(document: dict[str, Any]) -> dict[str, Any]:
    cleaned = dict(document)
    if "_id" in cleaned:
        cleaned["_id"] = str(cleaned["_id"])
    return cleaned


def issue_session(response: Response, user_id: str, role: str = "farmer") -> None:
    token = jwt.encode({"sub": user_id, "role": role, "exp": datetime.now(timezone.utc) + timedelta(days=7)}, JWT_SECRET, algorithm=JWT_ALGORITHM)
    response.set_cookie(JWT_COOKIE, token, httponly=True, samesite="lax", secure=os.getenv("NODE_ENV") == "production", max_age=7 * 24 * 60 * 60)


def decode_token(token: str | None) -> dict[str, Any]:
    if not token:
        raise HTTPException(status_code=401, detail="Authentication required.")
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.PyJWTError as error:
        raise HTTPException(status_code=401, detail="Session is no longer valid.") from error


def current_user(fieldwise_session: str | None = Cookie(default=None)) -> dict[str, Any]:
    payload = decode_token(fieldwise_session)
    if payload.get("role") == "admin" and payload.get("sub") == "admin":
        return {"id": "admin", "name": "Fieldwise Admin", "email": ADMIN_EMAIL, "role": "admin"}
    user = storage.find_one("users", "id", payload["sub"])
    if not user:
        raise HTTPException(status_code=401, detail="User account not found.")
    return user


def require_admin(user: dict[str, Any] = Depends(current_user)) -> dict[str, Any]:
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required.")
    return user


class RegisterRequest(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    mobile: str = Field(pattern=r"^\+?[0-9]{10,15}$")
    email: str = Field(max_length=160)
    password: str = Field(min_length=8, max_length=128)
    district: str = Field(min_length=2, max_length=80)
    village: str = Field(min_length=2, max_length=80)
    preferredLanguage: Literal["English", "Tamil"] = "English"
    farmSize: str = Field(min_length=1, max_length=40)
    mainCrops: list[str] = Field(min_length=1, max_length=8)

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        normalized = value.strip().lower()
        if not re.match(r"^\S+@\S+\.\S+$", normalized):
            raise ValueError("Enter a valid email address.")
        return normalized


class LoginRequest(BaseModel):
    email: str
    password: str


class FarmDetailsRequest(BaseModel):
    state: str
    district: str
    village: str
    latitude: float
    longitude: float
    nitrogen: float
    phosphorus: float
    potassium: float
    soilPh: float
    soilType: str
    organicCarbon: float | None = None
    temperature: float | None = None
    humidity: float | None = None
    rainfall: float | None = None
    season: str


class RecommendationRequest(BaseModel):
    nitrogen: float
    phosphorus: float
    potassium: float
    soilPh: float
    temperature: float
    humidity: float
    rainfall: float
    season: str
    district: str


class AssistantRequest(BaseModel):
    question: str = Field(min_length=3, max_length=1000)
    language: Literal["EN", "TA"] = "EN"


CROP_PROFILES = [
    {"crop": "Rice", "variety": "ADT 45", "seasons": ["Kharif", "Year-round"], "ph": (5.5, 7.5), "temperature": (20, 35), "humidity": (60, 95), "rainfall": (900, 2500), "npk": (80, 35, 40), "districts": ["Thanjavur", "Trichy", "Nagapattinam"], "explanation": "Strong match for warm, humid fields with dependable rainfall and balanced nitrogen."},
    {"crop": "Groundnut", "variety": "TMV 7", "seasons": ["Kharif", "Rabi"], "ph": (6, 7.5), "temperature": (24, 32), "humidity": (45, 75), "rainfall": (500, 1000), "npk": (35, 25, 45), "districts": ["Thanjavur", "Madurai", "Villupuram"], "explanation": "A water-efficient choice for well-drained soil and moderate rainfall."},
    {"crop": "Blackgram", "variety": "VBN 6", "seasons": ["Rabi", "Zaid"], "ph": (6, 7.5), "temperature": (25, 35), "humidity": (40, 70), "rainfall": (400, 800), "npk": (25, 20, 25), "districts": ["Thanjavur", "Madurai", "Trichy"], "explanation": "Fits a shorter season and helps rotate nitrogen-demanding crops."},
    {"crop": "Maize", "variety": "COH(M) 8", "seasons": ["Kharif", "Rabi"], "ph": (5.8, 7.2), "temperature": (21, 32), "humidity": (50, 80), "rainfall": (500, 800), "npk": (100, 45, 45), "districts": ["Salem", "Erode", "Villupuram"], "explanation": "Good option when nitrogen is available and the field has reliable drainage."},
    {"crop": "Cotton", "variety": "MCU 5", "seasons": ["Kharif"], "ph": (6, 8), "temperature": (21, 35), "humidity": (40, 70), "rainfall": (500, 900), "npk": (60, 30, 35), "districts": ["Madurai", "Salem", "Villupuram"], "explanation": "Suitable for a warm Kharif cycle with moderate rainfall and neutral soil."},
]

ADVISORIES = {
    "healthy": {"name": "Healthy leaf", "symptoms": ["Even green colour", "No spreading spots or curling"], "prevention": ["Inspect both sides of leaves weekly", "Keep tools and nursery material clean"], "management": ["Continue balanced irrigation and nutrition", "Remove badly damaged leaves from the field"], "expertWhen": "Consult an expert if spots, wilt, or rapid yellowing appears across multiple plants."},
    "bacterial_leaf_blight": {"name": "Bacterial leaf blight", "symptoms": ["Water-soaked streaks along leaf edges", "Yellowing that moves inward from the margin"], "prevention": ["Use clean seed and avoid working in wet foliage", "Maintain field drainage and balanced nitrogen"], "management": ["Remove heavily affected leaves where practical", "Use only locally approved, label-directed products after expert confirmation"], "expertWhen": "Contact a local agriculture officer when symptoms spread beyond one patch or reach the flag leaf."},
    "leaf_blast": {"name": "Leaf blast", "symptoms": ["Spindle-shaped grey or brown lesions", "Lesions may join and dry large areas of the leaf"], "prevention": ["Use resistant varieties where recommended", "Avoid excess nitrogen and keep spacing open"], "management": ["Remove volunteer plants and crop residue where appropriate", "Follow local integrated disease management guidance"], "expertWhen": "Seek expert advice before treatment if lesions appear near the neck or panicle."},
}

KNOWLEDGE_BASE = [
    {"keywords": ["rice", "water", "irrigation"], "answer": "For rice, keep the field moist and avoid continuous deep flooding. Alternate wetting and drying can reduce water use where local extension guidance supports it.", "tamil": "நெல்லுக்கு வயலை ஈரமாக வைத்துக் கொள்ளுங்கள்; தொடர்ந்து ஆழமாக நீர் தேங்க விட வேண்டாம். உள்ளூர் வேளாண் ஆலோசனை அனுமதித்தால், மாறி மாறி ஈரப்படுத்துதல் நீரை சேமிக்க உதவும்.", "source": "Tamil Nadu Agricultural University, Water management in rice"},
    {"keywords": ["soil", "ph"], "answer": "Most field crops perform well around mildly acidic to neutral soil. Test soil before applying lime or nutrients and follow the soil test recommendation.", "tamil": "பெரும்பாலான பயிர்கள் மிதமான அமிலம் முதல் நடுநிலை மண் வரை நன்றாக வளரும். சுண்ணாம்பு அல்லது உரம் இடுவதற்கு முன் மண் பரிசோதனை செய்யுங்கள்.", "source": "Soil Health Card Programme, Government of India"},
    {"keywords": ["disease", "leaf", "spot", "spray"], "answer": "Isolate the affected patch, avoid handling wet foliage, and take clear photos of both leaf surfaces. Confirm disease with an agriculture expert before using any plant-protection product.", "tamil": "பாதிக்கப்பட்ட பகுதியை தனிமைப்படுத்தி, ஈரமான இலைகளை கையாளாமல் இருங்கள். எந்த தாவர பாதுகாப்பு பொருளையும் பயன்படுத்தும் முன் வேளாண் நிபுணரிடம் நோயை உறுதி செய்யுங்கள்.", "source": "TNAU Agritech Portal, Integrated Pest and Disease Management"},
]


DATASET_DIR = Path(__file__).resolve().parent.parent / "datasets"


def load_dataset(filename: str, key: str, fallback: Any) -> Any:
    path = DATASET_DIR / filename
    try:
        with path.open(encoding="utf-8") as dataset_file:
            return json.load(dataset_file).get(key, fallback)
    except (OSError, json.JSONDecodeError) as error:
        print(f"Dataset {filename} could not be loaded; using in-code fallback: {error}")
        return fallback


CROP_PROFILES = load_dataset("crop_profiles.json", "profiles", CROP_PROFILES)
ADVISORIES = load_dataset("advisories.json", "advisories", ADVISORIES)
KNOWLEDGE_BASE = load_dataset("knowledge_base.json", "entries", KNOWLEDGE_BASE)


def score_range(value: float, bounds: tuple[float, float]) -> float:
    midpoint = sum(bounds) / 2
    return max(0, 1 - abs(value - midpoint) / ((bounds[1] - bounds[0]) * 1.5))


def rule_recommendations(payload: RecommendationRequest) -> list[dict[str, Any]]:
    results = []
    for profile in CROP_PROFILES:
        nutrient = sum(score_range(value, (target * 0.65, target * 1.35)) for value, target in zip([payload.nitrogen, payload.phosphorus, payload.potassium], profile["npk"])) / 3
        score = nutrient * 0.32 + score_range(payload.soilPh, profile["ph"]) * 0.18 + score_range(payload.temperature, profile["temperature"]) * 0.16 + score_range(payload.humidity, profile["humidity"]) * 0.10 + score_range(payload.rainfall, profile["rainfall"]) * 0.14 + (0.07 if payload.season in profile["seasons"] else 0.015) + (0.03 if payload.district.strip() in profile["districts"] else 0.01)
        results.append({"crop": profile["crop"], "variety": profile["variety"], "suitability": min(98, max(45, round(score * 100))), "explanation": profile["explanation"], "factors": {"season": payload.season in profile["seasons"], "location": payload.district.strip() in profile["districts"]}})
    return sorted(results, key=lambda item: item["suitability"], reverse=True)[:5]


class CropModelAdapter:
    def __init__(self, model_path: str | None) -> None:
        self.model = None
        if model_path and Path(model_path).exists():
            try:
                import joblib
                self.model = joblib.load(model_path)
            except Exception as error:  # pragma: no cover - depends on supplied artifact
                print(f"Crop model could not be loaded; using rule fallback: {error}")

    @property
    def loaded(self) -> bool:
        return self.model is not None

    def predict(self, payload: RecommendationRequest) -> list[dict[str, Any]] | None:
        if self.model is None:
            return None
        features = [[payload.nitrogen, payload.phosphorus, payload.potassium, payload.soilPh, payload.temperature, payload.humidity, payload.rainfall]]
        try:
            if hasattr(self.model, "predict_proba") and hasattr(self.model, "classes_"):
                probabilities = self.model.predict_proba(features)[0]
                ranked = sorted(zip(self.model.classes_, probabilities), key=lambda item: item[1], reverse=True)[:5]
                return [{"crop": str(label), "variety": "Model output", "suitability": round(float(probability) * 100), "explanation": "Ranked by the configured trained crop recommendation model.", "factors": {"season": True, "location": True}} for label, probability in ranked]
            prediction = self.model.predict(features)[0]
            return [{"crop": str(prediction), "variety": "Model output", "suitability": 95, "explanation": "Selected by the configured trained crop recommendation model.", "factors": {"season": True, "location": True}}]
        except Exception as error:  # pragma: no cover - depends on supplied artifact shape
            print(f"Crop model prediction failed; using rule fallback: {error}")
            return None


crop_model = CropModelAdapter(CROP_MODEL_PATH)


@app.get("/api/health")
def health() -> dict[str, Any]:
    return {"ok": True, "backend": "fastapi", "storage": "mongodb" if storage.persistent else "memory", "crop_model_configured": crop_model.loaded, "disease_model_configured": bool(DISEASE_MODEL_URL)}


@app.post("/api/auth/register")
def register(payload: RegisterRequest, response: Response) -> dict[str, Any]:
    email = payload.email
    if storage.find_one("users", "email", email):
        raise HTTPException(status_code=409, detail="An account with that email already exists.")
    user = {"id": str(uuid4()), "name": payload.name.strip(), "mobile": payload.mobile, "email": email, "password_hash": bcrypt.hashpw(payload.password.encode(), bcrypt.gensalt()).decode(), "district": payload.district.strip(), "village": payload.village.strip(), "preferred_language": payload.preferredLanguage, "farm_size": payload.farmSize, "main_crops": payload.mainCrops, "farm_details": None, "role": "farmer"}
    storage.insert("users", user)
    issue_session(response, user["id"])
    return {"farmer": public_user(user)}


@app.post("/api/auth/login")
def login(payload: LoginRequest, response: Response) -> dict[str, Any]:
    user = storage.find_one("users", "email", payload.email.strip().lower())
    if not user or not bcrypt.checkpw(payload.password.encode(), user["password_hash"].encode()):
        raise HTTPException(status_code=401, detail="Email or password is incorrect.")
    issue_session(response, user["id"], user.get("role", "farmer"))
    return {"farmer": public_user(user)}


@app.post("/api/auth/admin-login")
def admin_login(payload: LoginRequest, response: Response) -> dict[str, Any]:
    if not ADMIN_EMAIL or not ADMIN_PASSWORD or payload.email.lower() != ADMIN_EMAIL.lower() or payload.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Admin credentials are incorrect.")
    admin = {"id": "admin", "name": "Fieldwise Admin", "email": ADMIN_EMAIL, "role": "admin"}
    issue_session(response, "admin", "admin")
    return {"admin": admin}


@app.post("/api/auth/logout")
def logout(response: Response) -> dict[str, bool]:
    response.delete_cookie(JWT_COOKIE)
    return {"ok": True}


@app.get("/api/auth/me")
def me(user: dict[str, Any] = Depends(current_user)) -> dict[str, Any]:
    return {"farmer": public_user(user)}


@app.put("/api/farm-details")
def save_farm_details(payload: FarmDetailsRequest, user: dict[str, Any] = Depends(current_user)) -> dict[str, Any]:
    details = payload.model_dump()
    storage.update_one("users", "id", user["id"], {"farm_details": details})
    return {"farmDetails": details}


@app.post("/api/crop-recommendations")
def crop_recommendations(payload: RecommendationRequest, user: dict[str, Any] = Depends(current_user)) -> dict[str, Any]:
    model_recommendations = crop_model.predict(payload)
    recommendations = model_recommendations or rule_recommendations(payload)
    method = "Configured trained crop recommendation model." if model_recommendations else "Weighted agronomic fit fallback; configure CROP_MODEL_PATH for trained model inference."
    document = {"farmer_id": user["id"], "inputs": payload.model_dump(), "recommendations": recommendations, "method": method}
    storage.insert("recommendations", document)
    return {"recommendations": recommendations, "generatedAt": utc_now(), "method": method}


@app.post("/api/disease-detection")
async def disease_detection(image: UploadFile = File(...), user: dict[str, Any] = Depends(current_user)) -> dict[str, Any]:
    if not DISEASE_MODEL_URL:
        raise HTTPException(status_code=503, detail="The disease model is not connected yet. No diagnosis was made.")
    contents = await image.read()
    async with httpx.AsyncClient(timeout=30) as client:
        model_response = await client.post(DISEASE_MODEL_URL, files={"image": (image.filename, contents, image.content_type or "application/octet-stream")})
    if model_response.status_code >= 300:
        raise HTTPException(status_code=502, detail="The disease model could not process this image.")
    prediction = model_response.json()
    advisory_key = "healthy" if prediction.get("healthy") else str(prediction.get("disease", "")).lower().replace(" ", "_")
    advisory = ADVISORIES.get(advisory_key, ADVISORIES["healthy"])
    result = {"healthy": bool(prediction.get("healthy")), "disease": advisory["name"], "confidence": float(prediction.get("confidence", 0)), "advisory": advisory, "model": prediction.get("model", "Configured plant disease model")}
    storage.insert("disease_scans", {"farmer_id": user["id"], "file_name": image.filename, **result})
    return result


@app.get("/api/disease-advisories")
def disease_advisories(user: dict[str, Any] = Depends(current_user)) -> dict[str, Any]:
    del user
    return {"advisories": list(ADVISORIES.values())}


@app.get("/api/weather")
async def weather(latitude: float, longitude: float, user: dict[str, Any] = Depends(current_user)) -> dict[str, Any]:
    del user
    params = {"latitude": latitude, "longitude": longitude, "current": "temperature_2m,relative_humidity_2m,precipitation,rain", "daily": "temperature_2m_max,temperature_2m_min,precipitation_sum,rain_sum", "forecast_days": 5, "timezone": "auto"}
    async with httpx.AsyncClient(timeout=15) as client:
        result = await client.get("https://api.open-meteo.com/v1/forecast", params=params)
    if result.status_code >= 300:
        raise HTTPException(status_code=502, detail="Weather service is unavailable.")
    data = result.json()
    return {"temperature": data["current"]["temperature_2m"], "humidity": data["current"]["relative_humidity_2m"], "rainfall": data["current"]["precipitation"], "forecast": data.get("daily"), "units": data.get("current_units")}


@app.get("/api/market")
async def market(user: dict[str, Any] = Depends(current_user)) -> dict[str, Any]:
    del user
    if not MARKET_API_URL:
        raise HTTPException(status_code=503, detail="Live market data is not configured. No price was shown.")
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            result = await client.get(MARKET_API_URL)
        if result.status_code >= 300:
            raise HTTPException(status_code=502, detail="The configured market service is unavailable.")
        snapshot = result.json()
        if not isinstance(snapshot.get("prices"), list) or not snapshot["prices"]:
            raise HTTPException(status_code=502, detail="The market service returned no dated price records.")
        snapshot.setdefault("asOf", utc_now())
        snapshot.setdefault("source", MARKET_API_URL)
        storage.insert("market", snapshot)
        return snapshot
    except HTTPException:
        raise
    except (httpx.HTTPError, ValueError) as error:
        raise HTTPException(status_code=502, detail="The configured market service returned invalid data.") from error


@app.post("/api/assistant")
def assistant(payload: AssistantRequest, user: dict[str, Any] = Depends(current_user)) -> dict[str, Any]:
    question = payload.question.lower()
    match = next((item for item in KNOWLEDGE_BASE if any(keyword in question for keyword in item["keywords"])), KNOWLEDGE_BASE[1])
    answer = match["tamil"] if payload.language == "TA" else match["answer"]
    storage.insert("chats", {"farmer_id": user["id"], "question": payload.question, "answer": answer, "language": payload.language, "source": match["source"], "grounded": True})
    return {"answer": answer, "source": match["source"], "grounded": True}


@app.get("/api/history")
def history(user: dict[str, Any] = Depends(current_user)) -> dict[str, Any]:
    return {"recommendations": [clean_doc(item) for item in storage.find_many("recommendations", "farmer_id", user["id"])], "diseaseScans": [clean_doc(item) for item in storage.find_many("disease_scans", "farmer_id", user["id"])], "chats": [clean_doc(item) for item in storage.find_many("chats", "farmer_id", user["id"]) ]}


@app.get("/api/offline-content")
def offline_content() -> dict[str, Any]:
    return {"version": "2026.09", "crops": [{"name": profile["crop"], "season": ", ".join(profile["seasons"]), "summary": profile["explanation"]} for profile in CROP_PROFILES], "diseases": list(ADVISORIES.values()), "guidance": [{"title": item["source"], "answer": item["answer"], "tamil": item["tamil"]} for item in KNOWLEDGE_BASE]}


@app.get("/api/admin/stats")
def admin_stats(admin: dict[str, Any] = Depends(require_admin)) -> dict[str, Any]:
    del admin
    recommendations = storage.all("recommendations")
    scans = storage.all("disease_scans")
    crop_counts: dict[str, int] = {}
    disease_counts: dict[str, int] = {}
    for record in recommendations:
        for item in record.get("recommendations", [])[:1]:
            crop_counts[item.get("crop", "Unknown")] = crop_counts.get(item.get("crop", "Unknown"), 0) + 1
    for record in scans:
        disease = record.get("disease", "Unknown")
        disease_counts[disease] = disease_counts.get(disease, 0) + 1
    return {"farmers": storage.count("users"), "recommendations": storage.count("recommendations"), "diseaseScans": storage.count("disease_scans"), "chatMessages": storage.count("chats"), "popularCrops": sorted([{"name": key, "count": value} for key, value in crop_counts.items()], key=lambda item: item["count"], reverse=True)[:5], "commonDiseases": sorted([{"name": key, "count": value} for key, value in disease_counts.items()], key=lambda item: item["count"], reverse=True)[:5], "storage": "mongodb" if storage.persistent else "memory"}


@app.get("/api/admin/model-evaluation")
def model_evaluation(admin: dict[str, Any] = Depends(require_admin)) -> dict[str, Any]:
    del admin
    if not MODEL_EVALUATION_PATH or not Path(MODEL_EVALUATION_PATH).exists():
        return {"available": False, "message": "No signed model evaluation artifact is configured."}
    try:
        with Path(MODEL_EVALUATION_PATH).open(encoding="utf-8") as evaluation_file:
            return {"available": True, **json.load(evaluation_file)}
    except (OSError, json.JSONDecodeError) as error:
        raise HTTPException(status_code=503, detail="The model evaluation artifact could not be read.") from error


@app.get("/api/admin/farmers")
def admin_farmers(admin: dict[str, Any] = Depends(require_admin)) -> dict[str, Any]:
    del admin
    return {"farmers": [public_user(item) for item in storage.all("users")]}


@app.get("/api/admin/content")
def admin_content(admin: dict[str, Any] = Depends(require_admin)) -> dict[str, Any]:
    del admin
    return {"crops": CROP_PROFILES, "diseases": list(ADVISORIES.values()), "knowledgeBase": KNOWLEDGE_BASE}


class ContentUpdate(BaseModel):
    collection: Literal["crops", "diseases", "advisories", "market"]
    key: str = Field(min_length=2, max_length=120)
    content: dict[str, Any]


@app.post("/api/admin/content")
def update_admin_content(payload: ContentUpdate, admin: dict[str, Any] = Depends(require_admin)) -> dict[str, Any]:
    del admin
    document = {"key": payload.key, "content": payload.content, "updated_at": utc_now()}
    storage.update_one("advisories", "key", f"{payload.collection}:{payload.key}", document)
    return {"saved": True, "item": document}


@app.delete("/api/admin/farmers/{farmer_id}")
def deactivate_farmer(farmer_id: str, admin: dict[str, Any] = Depends(require_admin)) -> dict[str, Any]:
    del admin
    if storage.persistent:
        storage.db.users.update_one({"id": farmer_id}, {"$set": {"active": False}})
    else:
        user = storage.find_one("users", "id", farmer_id)
        if user:
            user["active"] = False
    return {"saved": True, "farmer_id": farmer_id, "active": False}
