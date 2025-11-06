import os
import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from starlette.websockets import WebSocketState

from app.config import settings
from app.routers import auth, users, train, admin
from app.database import get_db
from app.train_worker import train_model_async

app = FastAPI(title="MLops Intelligent Analyzer")

origins = [settings.FRONTEND_URL] if settings.FRONTEND_URL else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(train.router, prefix="/api/train", tags=["train"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])

# WebSocket manager for training progress
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def send_json(self, message: dict):
        to_remove = []
        for connection in self.active_connections:
            if connection.application_state == WebSocketState.DISCONNECTED:
                to_remove.append(connection)
                continue
            try:
                await connection.send_json(message)
            except Exception:
                to_remove.append(connection)
        for c in to_remove:
            self.disconnect(c)


manager = ConnectionManager()

@app.websocket("/ws/train-progress")
async def websocket_train_progress(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive; no incoming messages expected
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=settings.PORT,
        reload=True,
        log_level="info",
    )
