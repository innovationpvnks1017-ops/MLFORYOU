import pytest
import asyncio
from httpx import AsyncClient, WebSocketDisconnect
from backend.main import app
from app.database import Base, engine, get_db, SessionLocal
from sqlalchemy.orm import sessionmaker
from app.models import User, Dataset, TrainingRun
from app.auth import get_password_hash

SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="module")
def db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    # Setup test data
    admin_user = User(
        username="tester",
        email="tester@example.com",
        hashed_password=get_password_hash("testpass123"),
        is_admin=False,
    )
    db.add(admin_user)
    db.commit()
    db.refresh(admin_user)

    dataset = Dataset(
        name="Test Dataset",
        description="Test dataset for training",
        csv_path="backend/tests/backend/sample_dataset.csv",
    )
    db.add(dataset)
    db.commit()
    db.refresh(dataset)

    yield db

    db.close()
    Base.metadata.drop_all(bind=engine)


@pytest.mark.anyio
async def test_training_process(db):
    async with AsyncClient(app=app, base_url="http://test") as ac:
        # Login user
        response = await ac.post("/api/auth/login", json={"username": "tester", "password": "testpass123"})
        assert response.status_code == 200
        token = response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Start training
        response = await ac.post("/api/train/start", json={"dataset_id": 1}, headers=headers)
        assert response.status_code == 201
        run = response.json()
        run_id = run["id"]

        # Check status endpoint
        response = await ac.get(f"/api/train/status/{run_id}", headers=headers)
        assert response.status_code == 200

        # Connect to WebSocket
        try:
            async with ac.websocket_connect("/ws/train-progress") as ws:
                # We expect to receive progress messages asynchronously
                for _ in range(3):
                    msg = await ws.receive_json()
                    assert "progress" in msg
                    assert "status" in msg
        except WebSocketDisconnect:
            pass
