# Architecture Notes

- `src/`: React farmer and admin experiences
- `backend/`: FastAPI routes, validation, storage, model and external-service adapters
- `models/`: production model artifacts and evaluation notes
- `datasets/`: versioned crop, advisory, and knowledge-base inputs with provenance
- `database/`: MongoDB Atlas deployment and retention notes
- `api/`: API contracts and integration notes
- `docs/`: deployment and architecture documentation
- `server/`: legacy Node API retained only for rollback compatibility

All external data integrations must fail closed with a clear unavailable state. Demo seed content is marked as such and must be replaced or reviewed before production.
