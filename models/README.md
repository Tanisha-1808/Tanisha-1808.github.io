# ML Models

Place production artifacts here only when they are versioned, evaluated, and approved:

- `crop_recommender.joblib`: classifier with the seven feature order documented in `backend/main.py`
- Disease model: deploy a MobileNetV2/ResNet50-compatible inference service and set `DISEASE_MODEL_URL`
- Evaluation artifacts: store signed metrics and confusion matrices outside the frontend bundle

The API refuses to claim a disease result when the disease model endpoint is not configured. The crop endpoint uses a transparent agronomic fallback until a trained model artifact is available.
