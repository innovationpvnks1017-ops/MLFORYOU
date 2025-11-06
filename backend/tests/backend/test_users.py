import pytest
from httpx import AsyncClient
from backend.main import app
from app.database import Base, engine, get_db
from sqlalchemy.orm import sessionmaker
from app.models import User
from app.auth import get_password_hash

SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="module")
def db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    yield db
    db.close()
    Base.metadata.drop_all(bind=engine)


@pytest.mark.anyio
async def test_user_endpoints(db):
    # Create admin user
    admin_user = User(
        username="admin",
        email="admin@example.com",
        hashed_password=get_password_hash("adminpass123"),
        is_admin=True,
    )
    db.add(admin_user)
    db.commit()
    db.refresh(admin_user)

    # Create normal user
    normal_user = User(
        username="normal",
        email="normal@example.com",
        hashed_password=get_password_hash("normalpass123"),
        is_admin=False,
    )
    db.add(normal_user)
    db.commit()
    db.refresh(normal_user)

    async with AsyncClient(app=app, base_url="http://test") as ac:
        # Admin login
        response = await ac.post("/api/auth/login", json={"username": "admin", "password": "adminpass123"})
        assert response.status_code == 200
        admin_token = response.json()["access_token"]
        headers_admin = {"Authorization": f"Bearer {admin_token}"}

        # Normal user login
        response = await ac.post("/api/auth/login", json={"username": "normal", "password": "normalpass123"})
        assert response.status_code == 200
        user_token = response.json()["access_token"]
        headers_user = {"Authorization": f"Bearer {user_token}"}

        # Get current user as normal user
        response = await ac.get("/api/users/me", headers=headers_user)
        assert response.status_code == 200
        assert response.json()["username"] == "normal"

        # Admin gets users list
        response = await ac.get("/api/users", headers=headers_admin)
        assert response.status_code == 200
        users = response.json()
        assert any(u["username"] == "admin" for u in users)
        assert any(u["username"] == "normal" for u in users)

        # Normal user tries to get users list (should fail)
        response = await ac.get("/api/users", headers=headers_user)
        assert response.status_code == 403
