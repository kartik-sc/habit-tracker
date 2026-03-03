from sqlalchemy import Boolean, Column, Integer, String, Text, Date, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from db.database import Base

class Habit(Base):
  __tablename__ = "habits"
  id = Column(Integer, primary_key=True)
  name = Column(String(255),nullable=False)
  description = Column(Text)
  color = Column(String(7),default = "#6366f1")
  created_at = Column(DateTime(timezone=True),server_default=func.now())
  updated_at = Column(DateTime(timezone=True),server_default=func.now(),onupdate=func.now())
  is_active = Column(Boolean, default = True)
  logs = relationship("HabitLog",back_populates="habit",cascade="all, delete-orphan")


class HabitLog(Base):
  __tablename__ = "habit_logs"
  id = Column(Integer, primary_key=True)
  habit_id = Column(Integer, ForeignKey("habits.id",ondelete="CASCADE"),nullable=False)
  log_date = Column(Date,nullable=False)
  created_at = Column(DateTime(timezone=True),server_default=func.now())
  habit = relationship("Habit",back_populates="logs")