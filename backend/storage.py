from __future__ import annotations

from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

try:
    from pymongo import MongoClient
except ImportError:  # pragma: no cover - requirements.txt provides this in production
    MongoClient = None


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class Storage:
    """Small repository boundary with MongoDB in production and memory for local API tests."""

    def __init__(self, mongo_uri: str | None) -> None:
        self.mongo = None
        self.db = None
        self.memory: dict[str, list[dict[str, Any]]] = {
            "users": [],
            "recommendations": [],
            "disease_scans": [],
            "chats": [],
            "market": [],
            "advisories": [],
        }
        if mongo_uri and MongoClient:
            try:
                client = MongoClient(mongo_uri, serverSelectionTimeoutMS=3000)
                client.admin.command("ping")
                self.mongo = client
                self.db = client.get_default_database() or client["fieldwise"]
                print("MongoDB connected")
            except Exception as error:  # pragma: no cover - depends on local infrastructure
                print(f"MongoDB unavailable; using memory storage: {error}")

    @property
    def persistent(self) -> bool:
        return self.db is not None

    def _collection(self, name: str):
        return self.db[name] if self.db is not None else self.memory[name]

    def insert(self, collection: str, document: dict[str, Any]) -> dict[str, Any]:
        document = {**document, "_id": document.get("_id", str(uuid4())), "created_at": document.get("created_at", utc_now())}
        target = self._collection(collection)
        if self.db is not None:
            target.insert_one(document)
        else:
            target.append(document)
        return document

    def find_one(self, collection: str, key: str, value: Any) -> dict[str, Any] | None:
        target = self._collection(collection)
        if self.db is not None:
            return target.find_one({key: value})
        return next((item for item in target if item.get(key) == value), None)

    def find_many(self, collection: str, key: str, value: Any, limit: int = 20) -> list[dict[str, Any]]:
        target = self._collection(collection)
        if self.db is not None:
            return list(target.find({key: value}).sort("created_at", -1).limit(limit))
        return sorted((item for item in target if item.get(key) == value), key=lambda item: item.get("created_at", datetime.min), reverse=True)[:limit]

    def update_one(self, collection: str, key: str, value: Any, updates: dict[str, Any]) -> dict[str, Any] | None:
        target = self._collection(collection)
        if self.db is not None:
            target.update_one({key: value}, {"$set": updates}, upsert=True)
            return target.find_one({key: value})
        item = next((item for item in target if item.get(key) == value), None)
        if item is None:
            item = {key: value, "_id": str(uuid4()), "created_at": utc_now()}
            target.append(item)
        item.update(updates)
        return item

    def count(self, collection: str) -> int:
        target = self._collection(collection)
        return target.count_documents({}) if self.db is not None else len(target)

    def all(self, collection: str, limit: int = 100) -> list[dict[str, Any]]:
        target = self._collection(collection)
        return list(target.find().sort("created_at", -1).limit(limit)) if self.db is not None else target[-limit:]
