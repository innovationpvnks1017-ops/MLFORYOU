from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.schemas import TrainingRunOut, UserOut
from app.database import get_db
from app.models import TrainingRun, User, TrainingStatus
from app.auth import admin_required

router = APIRouter()


@router.get("/runs", response_model=List[TrainingRunOut])
def list_training_runs(db: Session = Depends(get_db), admin=Depends(admin_required)):
    runs = db.query(TrainingRun).all()
    return runs


@router.put("/runs/{run_id}/status", response_model=TrainingRunOut)
def update_training_run_status(
    run_id: int,
    status: TrainingStatus,
    db: Session = Depends(get_db),
    admin=Depends(admin_required),
):
    run = db.query(TrainingRun).filter(TrainingRun.id == run_id).first()
    if not run:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Training run not found")
    run.status = status
    db.commit()
    db.refresh(run)
    return run


@router.delete("/runs/{run_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_training_run(run_id: int, db: Session = Depends(get_db), admin=Depends(admin_required)):
    run = db.query(TrainingRun).filter(TrainingRun.id == run_id).first()
    if not run:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Training run not found")
    db.delete(run)
    db.commit()
    return


@router.get("/users", response_model=List[UserOut])
def list_all_users(db: Session = Depends(get_db), admin=Depends(admin_required)):
    users = db.query(User).all()
    return users
