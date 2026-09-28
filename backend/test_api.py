import os
from uuid import uuid4

os.environ.setdefault("JWT_SECRET", "test-secret-that-is-long-enough-for-jwt-123456")
os.environ.setdefault("ADMIN_EMAIL", "admin@test.local")
os.environ.setdefault("ADMIN_PASSWORD", "AdminPassword123!")

from fastapi.testclient import TestClient

from backend.main import app, storage

client = TestClient(app)


def register_and_login():
    email = f"farmer-{uuid4().hex[:8]}@test.local"
    response = client.post("/api/auth/register", json={"name": "Test Farmer", "mobile": "9876543217", "email": email, "password": "SecurePass123!", "district": "Thanjavur", "village": "Kumbakonam", "preferredLanguage": "Tamil", "farmSize": "3 acres", "mainCrops": ["Rice"]})
    assert response.status_code == 200
    return response.json()["farmer"]


def test_health_and_offline_content():
    health = client.get("/api/health")
    content = client.get("/api/offline-content")
    assert health.status_code == 200
    assert health.json()["backend"] == "fastapi"
    assert content.status_code == 200
    assert len(content.json()["crops"]) >= 3


def test_registration_validation_and_crop_history():
    farmer = register_and_login()
    invalid = client.post("/api/crop-recommendations", json={"nitrogen": "not-a-number"})
    assert invalid.status_code == 422
    assert invalid.json()["code"] == "VALIDATION_ERROR"
    prediction = client.post("/api/crop-recommendations", json={"nitrogen": 90, "phosphorus": 42, "potassium": 55, "soilPh": 6.8, "temperature": 29, "humidity": 78, "rainfall": 900, "season": "Kharif", "district": "Thanjavur"})
    assert prediction.status_code == 200
    assert prediction.json()["recommendations"][0]["suitability"] >= 45
    history = client.get("/api/history")
    assert history.status_code == 200
    assert len(history.json()["recommendations"]) == 1
    assert farmer["preferred_language"] == "Tamil"


def test_assistant_is_grounded_and_disease_model_is_explicit():
    register_and_login()
    assistant = client.post("/api/assistant", json={"question": "How much water does rice need?", "language": "TA"})
    assert assistant.status_code == 200
    assert assistant.json()["grounded"] is True
    assert assistant.json()["source"]
    upload = client.post("/api/disease-detection", files={"image": ("leaf.jpg", b"not-a-real-image", "image/jpeg")})
    assert upload.status_code == 503
    assert upload.json()["code"] == "HTTP_503"


def test_admin_requires_role_and_can_read_metrics():
    register_and_login()
    assert client.get("/api/admin/stats").status_code == 403
    admin = client.post("/api/auth/admin-login", json={"email": "admin@test.local", "password": "AdminPassword123!"})
    assert admin.status_code == 200
    stats = client.get("/api/admin/stats")
    evaluation = client.get("/api/admin/model-evaluation")
    assert stats.status_code == 200
    assert evaluation.status_code == 200
    assert evaluation.json()["available"] is False


def teardown_module():
    if not storage.persistent:
        for collection in storage.memory.values():
            collection.clear()
