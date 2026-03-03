from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from db.database import Base, engine
from routers.habits import router as habits_router
import models.habit

Base.metadata.create_all(bind=engine)
app=FastAPI(title="Discipline Dashboard",version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:5173"],allow_methods = ["*"],allow_headers=["*"])
app.include_router(habits_router)

@app.get("/health")
def health(): return {"status": "ok"}