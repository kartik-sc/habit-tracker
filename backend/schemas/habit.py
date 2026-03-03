from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel, Field

class HabitCreate(BaseModel):
  name: str = Field(...,min_length=1,max_length=255)
  description: Optional[str] = None
  color: str = Field(default = "#6366f1",pattern=r"^#[0-9a-fA-F]{6}$")


class HabitUpdate(BaseModel):
  name: Optional[str] = Field(None, min_length=1,max_length=255)
  description: Optional[str] = None
  color: str = Field(default = "#6366f1",pattern=r"^#[0-9a-fA-F]{6}$")

class WeeklyPoint(BaseModel):
  week_start: str
  completed: int
  total_possible: int

class AnalyticsResponse(BaseModel):
  habit_id: int
  habit_name: str
  current_streak: int
  longest_streak: int
  completion_rate_30d: float
  weekly_data: List[WeeklyPoint]