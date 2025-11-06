import asyncio
import csv
import os
from pathlib import Path
from typing import Optional

from sqlalchemy.orm import Session
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score
import joblib

from app.database import SessionLocal
from app.models import TrainingRun, TrainingStatus, Dataset
from backend.main import manager

MODEL_SAVE_DIR = Path("models")
MODEL_SAVE_DIR.mkdir(exist_ok=True)


async def train_model_async(run_id: int, ws_manager):
    # Use separate DB session for background task
    db: Optional[Session] = None
    try:
        db = SessionLocal()
        training_run = db.query(TrainingRun).filter(TrainingRun.id == run_id).first()
        if not training_run:
            return

        training_run.status = TrainingStatus.running
        db.commit()

        dataset = db.query(Dataset).filter(Dataset.id == training_run.dataset_id).first()
        if not dataset:
            training_run.status = TrainingStatus.failed
            db.commit()
            return

        csv_path = Path(dataset.csv_path)
        if not csv_path.exists():
            training_run.status = TrainingStatus.failed
            db.commit()
            return

        # Load CSV data
        features = []
        labels = []
        with open(csv_path, newline="", encoding="utf-8") as csvfile:
            reader = csv.reader(csvfile)
            header = next(reader, None)
            if header is None:
                training_run.status = TrainingStatus.failed
                db.commit()
                return
            for row in reader:
                if len(row) < 2:
                    continue
                features.append([float(x) for x in row[:-1]])
                labels.append(row[-1])

        if len(features) < 10:
            training_run.status = TrainingStatus.failed
            db.commit()
            return

        # Split dataset
        X_train, X_test, y_train, y_test = train_test_split(
            features, labels, test_size=0.2, random_state=42
        )

        model = LogisticRegression(max_iter=1000)

        # Simulate training steps with progress reports
        total_steps = 5
        for step in range(1, total_steps + 1):
            await asyncio.sleep(1)
            # Partial fitting or simulated step could be here
            progress_percent = int(step / total_steps * 100)
            await ws_manager.send_json({"run_id": run_id, "progress": progress_percent, "status": "running"})

        model.fit(X_train, y_train)

        y_pred = model.predict(X_test)
        accuracy = accuracy_score(y_test, y_pred)

        # Save the model artifact
        model_path = MODEL_SAVE_DIR / f"model_{run_id}.joblib"
        joblib.dump(model, model_path)

        training_run.accuracy = accuracy
        training_run.status = TrainingStatus.completed
        db.commit()

        await ws_manager.send_json({"run_id": run_id, "progress": 100, "status": "completed", "accuracy": accuracy})

    except Exception:
        if db:
            if 'training_run' in locals() and training_run:
                training_run.status = TrainingStatus.failed
                db.commit()
    finally:
        if db:
            db.close()
