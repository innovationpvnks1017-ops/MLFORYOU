import pytest
from httpx import AsyncClient
from backend.main import app
from app.database import Base, engine, get_db
from sqlalchemy.orm import sessionmaker
from app.models import User
from app.auth import get_password_hash

import asyncio

SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="module")
def anyio_backend():
    return "asyncio"


@pytest.fixture(scope="module")
def db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    yield db
    db.close()
    Base.metadata.drop_all(bind=engine)


@pytest.mark.anyio
async def test_register_and_login(db):
    async with AsyncClient(app=app, base_url="http://test") as ac:
        # Register new user
        response = await ac.post(
            "/api/auth/register",
            json={"username": "testuser", "email": "testuser@example.com", "password": "testpass123"},
        )
        assert response.status_code == 201
        data = response.json()
        assert data["username"] == "testuser"
        assert data["email"] == "testuser@example.com"

        # Duplicate registration should fail
        response = await ac.post(
            "/api/auth/register",
            json={"username": "testuser", "email": "testuser@example.com", "password": "testpass123"},
        )
        assert response.status_code == 400

        # Login with correct credentials
        response = await ac.post(
            "/api/auth/login",
            json={"username": "testuser", "password": "testpass123"},
        )
        assert response.status_code == 200
        token_data = response.json()
        assert "access_token" in token_data
        assert token_data["token_type"] == "bearer"

        # Login with wrong credentials
        response = await ac.post(
            "/api/auth/login",
            json={"username": "testuser", "password": "wrongpass"},
        )
        assert response.status_code == 401
