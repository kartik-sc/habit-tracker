from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from db.database import get_db
from schemas.habit import HabitCreate, HabitUpdate, AnalyticsResponse
import services.habit_service as svc

router = APIRouter(prefix="/habits",tags=["habits"])

@router.post("",status_code = 201)
def create(data: HabitCreate, db=Depends(get_db)):
    h = svc.create_habit(db, data)
    return {"id": h.id, "name": h.name, "color": h.color}

@router.get("")
def list_habits(db=Depends(get_db)):
    return svc.get_habits(db)

@router.put("/{habit_id}")
def update(habit_id: int, data: HabitUpdate, db=Depends(get_db)):
    h = svc.update_habit(db, habit_id, data)
    if not h: raise HTTPException(404, "Not found")
    return {"id": h.id, "name": h.name}

@router.delete("/{habit_id}", status_code=204)
def delete(habit_id: int, db=Depends(get_db)):
    if not svc.delete_habit(db, habit_id): raise HTTPException(404, "Not found")

@router.post("/{habit_id}/log")
def log(habit_id: int, log_date: Optional[date] = None, db=Depends(get_db)):
    if not svc.get_habit(db, habit_id): raise HTTPException(404, "Not found")
    log, created = svc.log_habit(db, habit_id, log_date)
    return {"log_date": str(log.log_date), "created": created}

@router.get("/{habit_id}/analytics", response_model=AnalyticsResponse)
def analytics(habit_id: int, db=Depends(get_db)):
    r = svc.get_analytics(db, habit_id)
    if not r: raise HTTPException(404, "Not found")
    return r