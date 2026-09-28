# Database

Production persistence is MongoDB Atlas configured with `MONGODB_URI`. The FastAPI repository in `backend/storage.py` owns the persistence boundary and supports local in-memory smoke tests when MongoDB is not configured.

Collections include users, recommendations, disease scans, chats, market snapshots, and advisories. Use Atlas IP access controls, least-privilege database users, encrypted connections, backups, and retention policies in production.
