"""
STREAK ALGORITHM
================
Strategy: Pull only dates (not full rows) from an indexed column.
Walk descending date list in Python — O(n) single pass.

Why not pure SQL recursive CTE?
  - Recursive CTEs for gaps-and-islands are correct but harder to maintain.
  - Python walk on a date list is equally efficient (dates = integers).
  - We fetch ONLY dates, so memory per habit = O(log_count * 4 bytes).
  
At 10k logs per habit that's ~40KB max. Acceptable.
For 100k+ logs consider materializing streaks on write.
"""

from datetime import date, timedelta
from typing import List, Tuple
from sqlalchemy import text
from sqlalchemy.orm import Session
from models.habit import Habit, HabitLog
from schemas.habit import HabitCreate, HabitUpdate, AnalyticsResponse, WeeklyPoint


def create_habit(db, data: HabitCreate) -> Habit:
    habit = Habit(**data.model_dump())
    db.add(habit); db.commit(); db.refresh(habit)
    return habit


def get_habits(db) -> list:
    """Single query — avoids N+1 for completed_today check."""
    today = date.today()
    sql = text("""
        SELECT h.id, h.name, h.description, h.color, h.created_at, h.is_active,
               EXISTS (
                   SELECT 1 FROM habit_logs hl
                   WHERE hl.habit_id = h.id AND hl.log_date = :today
               ) AS completed_today
        FROM habits h
        WHERE h.is_active = TRUE
        ORDER BY h.created_at ASC
    """)
    return [dict(r) for r in db.execute(sql, {"today": today}).mappings().all()]


def get_habit(db, habit_id: int) -> Habit | None:
    return db.query(Habit).filter(Habit.id == habit_id, Habit.is_active == True).first()


def update_habit(db, habit_id: int, data: HabitUpdate) -> Habit | None:
    habit = get_habit(db, habit_id)
    if not habit: return None
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(habit, k, v)
    db.commit(); db.refresh(habit)
    return habit


def delete_habit(db, habit_id: int) -> bool:
    habit = get_habit(db, habit_id)
    if not habit: return False
    habit.is_active = False  # soft delete preserves analytics history
    db.commit()
    return True


def log_habit(db, habit_id: int, log_date=None):
    target = log_date or date.today()
    existing = db.query(HabitLog).filter(
        HabitLog.habit_id == habit_id, HabitLog.log_date == target
    ).first()
    if existing: return existing, False
    log = HabitLog(habit_id=habit_id, log_date=target)
    db.add(log); db.commit(); db.refresh(log)
    return log, True


def _compute_streaks(dates: List[date]) -> Tuple[int, int]:
    if not dates: return 0, 0
    today = date.today()
    
    # Current streak
    current = 0
    if dates[0] >= today - timedelta(days=1):
        current = 1
        for i in range(1, len(dates)):
            if (dates[i-1] - dates[i]).days == 1:
                current += 1
            else:
                break
    
    # Longest streak
    longest, run = 1, 1
    for i in range(1, len(dates)):
        if (dates[i-1] - dates[i]).days == 1:
            run += 1
            longest = max(longest, run)
        else:
            run = 1
    
    return current, max(longest, current)


def get_analytics(db, habit_id: int) -> AnalyticsResponse | None:
    habit = get_habit(db, habit_id)
    if not habit: return None
    today = date.today()
    
    dates = [r[0] for r in db.execute(
        text("SELECT log_date FROM habit_logs WHERE habit_id = :h ORDER BY log_date DESC"),
        {"h": habit_id}
    ).fetchall()]
    current_streak, longest_streak = _compute_streaks(dates)

    completed_30d = db.execute(text("""
        SELECT COUNT(*) FROM habit_logs
        WHERE habit_id = :h AND log_date >= :s AND log_date <= :e
    """), {"h": habit_id, "s": today - timedelta(days=29), "e": today}).scalar()

    weekly_rows = db.execute(text("""
        SELECT DATE_TRUNC('week', log_date)::date AS week_start, COUNT(*) AS completed
        FROM habit_logs
        WHERE habit_id = :h AND log_date >= NOW() - INTERVAL '56 days'
        GROUP BY week_start ORDER BY week_start ASC
    """), {"h": habit_id}).fetchall()

    return AnalyticsResponse(
        habit_id=habit_id, habit_name=habit.name,
        current_streak=current_streak, longest_streak=longest_streak,
        completion_rate_30d=round((completed_30d / 30) * 100, 1),
        weekly_data=[WeeklyPoint(week_start=str(r[0]), completed=r[1], total_possible=7)
                     for r in weekly_rows]
    )