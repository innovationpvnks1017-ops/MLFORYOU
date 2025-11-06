import asyncio
from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect, status
from sqlalchemy.orm import Session
from typing import Optional

from app.schemas import TrainingRunCreate, TrainingRunOut
from app.database import get_db
from app.models import TrainingRun, TrainingStatus, User
from app.auth import get_current_user
from app.train_worker import train_model_async
from backend.main import manager

router = APIRouter()


@router.post("/start", response_model=TrainingRunOut, status_code=status.HTTP_201_CREATED)
async def start_training(
    training_req: TrainingRunCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Validate dataset exists
    from app.models import Dataset

    dataset = db.query(Dataset).filter(Dataset.id == training_req.dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dataset not found")

    training_run = TrainingRun(
        user_id=current_user.id,
        dataset_id=dataset.id,
        status=TrainingStatus.pending,
    )
    db.add(training_run)
    db.commit()
    db.refresh(training_run)

    # Start training asynchronously
    asyncio.create_task(train_model_async(training_run.id, manager))

    return training_run


@router.get("/status/{run_id}", response_model=TrainingRunOut)
def training_status(
    run_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    training_run = db.query(TrainingRun).filter(TrainingRun.id == run_id, TrainingRun.user_id == current_user.id).first()
    if not training_run:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Training run not found")
    return training_run
