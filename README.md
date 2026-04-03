# Discipline Dashboard

A full-stack habit-tracking web application built with **React + Vite**, **FastAPI**, and **PostgreSQL**.  
Users can create habits, log daily completions, and view analytics including **streaks**, **completion rates**, **weekly charts**, and a **70-day activity heatmap**.

---

## Live Demo

- **Frontend (Vercel):** [https://habit-tracker-one-ebon.vercel.app/]
- **Backend API (Render):** [https://habit-tracker-sofb.onrender.com/docs]

---

## Architecture

```text
┌──────────────────┐       REST/JSON        ┌──────────────────┐       SQLAlchemy       ┌──────────────┐
│  React + Vite    │  ◄──────────────────►   │  FastAPI         │  ◄──────────────────►  │  PostgreSQL  │
│  Vercel          │                         │  Render          │                        │  Neon        │
└──────────────────┘                         └──────────────────┘                        └──────────────┘
  
| Tier             | Technology         | Default Port |  
|------------------|--------------------|--------------|  
| Frontend SPA     | React + Vite       | 5173         |  
| Backend REST API | FastAPI (Python)   | 8000         |  
| Database         | PostgreSQL         | 5432         |  
  
## Project Structure  
```text

habit-tracker/
├── backend/
│   ├── main.py                     # FastAPI app entrypoint, CORS, route registration
│   ├── db/
│   │   └── database.py             # SQLAlchemy engine, session, DB connection setup
│   ├── models/
│   │   └── habit.py                # ORM models: Habit, HabitLog
│   ├── schemas/
│   │   └── habit.py                # Pydantic schemas for request/response validation
│   ├── routers/
│   │   └── habits.py               # REST API endpoints under /habits
│   ├── services/
│   │   └── habit_service.py        # Business logic: CRUD, streaks, analytics
│   ├── requirements.txt            # Python dependencies
│   ├── .env.example                # Example backend environment variables
│   └── .python-version             # Python version pin for deployment
│
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   ├── eslint.config.js
│   ├── .env.example                # Example frontend environment variables
│   └── src/
│       ├── App.jsx                 # Root React component
│       ├── main.jsx                # Vite app entry point
│       ├── index.css               # Global styles
│       ├── api/
│       │   └── habits.js           # API client and backend communication
│       ├── pages/
│       │   └── Dashboard.jsx       # Main dashboard page and state orchestration
│       └── components/
│           ├── Navbar.jsx          # Top navigation bar
│           ├── HabitTable.jsx      # Habit list/table container
│           ├── HabitRow.jsx        # Individual desktop habit row
│           ├── HabitCard.jsx       # Mobile-friendly habit card
│           ├── AnalyticsPanel.jsx  # Streaks, stats, and analytics view
│           ├── WeeklyChart.jsx     # Weekly completion chart
│           ├── HeatmapGrid.jsx     # 70-day activity heatmap
│           ├── AddHabitModal.jsx   # Add habit modal
│           ├── HabitModal.jsx      # Create / edit habit modal
│           ├── ConfirmModal.jsx    # Delete confirmation modal
│           └── ThemeToggle.jsx     # Dark / light mode toggle
│
├── README.md
└── PROJECT_OVERVIEW.md
```
  
## Prerequisites  
  
- **Python** 3.10+  
- **Node.js** 18+  
- **PostgreSQL** 15+  
  
## Getting Started  
  
### 1. Database Setup  
  
Create a PostgreSQL database named `discipline`:  
  
```sql  
CREATE DATABASE discipline;  
```  
  
The backend will auto-create tables on startup via SQLAlchemy's `Base.metadata.create_all()`.  
  
### 2. Backend Setup  
  
```bash  
cd backend  
  
# Create and activate a virtual environment  [header-1](#header-1)
python -m venv venv  
source venv/bin/activate  # On Windows: venv\Scripts\activate  
  
# Install dependencies  [header-2](#header-2)
pip install fastapi uvicorn[standard] sqlalchemy psycopg2-binary pydantic python-multipart  
  
# Start the server  [header-3](#header-3)
uvicorn main:app --reload  
```  
  
The API will be available at `http://localhost:8000`.    
Swagger docs at `http://localhost:8000/docs`.  
  
### 3. Frontend Setup  
  
```bash  
cd frontend  
  
# Install dependencies  [header-4](#header-4)
npm install  
  
# Start the dev server  [header-5](#header-5)
npm run dev  
```  
  
The app will be available at `http://localhost:5173`.  
  
## Environment Variables  
  
| Variable       | Used In  | Default                                                        | Description                    |  
|----------------|----------|----------------------------------------------------------------|--------------------------------|  
| `DATABASE_URL` | Backend  | `postgresql://postgres:password@localhost:5432/discipline`      | PostgreSQL connection string   |  
| `VITE_API_URL` | Frontend | `http://localhost:8000`                                        | Backend API base URL           |  
  
## API Endpoints  
  
All endpoints are prefixed with `/habits`.  
  
| Method   | Path                      | Description                          | Status |  
|----------|---------------------------|--------------------------------------|--------|  
| `GET`    | `/health`                 | Health check                         | 200    |  
| `POST`   | `/habits`                 | Create a new habit                   | 201    |  
| `GET`    | `/habits`                 | List all active habits               | 200    |  
| `PUT`    | `/habits/{habit_id}`      | Update a habit                       | 200    |  
| `DELETE` | `/habits/{habit_id}`      | Soft-delete a habit                  | 204    |  
| `POST`   | `/habits/{habit_id}/log`  | Log a daily completion (idempotent)  | 200    |  
| `GET`    | `/habits/{habit_id}/analytics` | Get streak & weekly analytics   | 200    |  
  
### Request/Response Examples  
  
**Create Habit** — `POST /habits`  
```json  
{  
  "name": "Morning Run",  
  "description": "30 min jog",  
  "color": "#6366f1"  
}  
```  
  
**Analytics Response** — `GET /habits/{id}/analytics`  
```json  
{  
  "habit_id": 1,  
  "habit_name": "Morning Run",  
  "current_streak": 7,  
  "longest_streak": 21,  
  "completion_rate_30d": 73.3,  
  "weekly_data": [  
    { "week_start": "2026-03-23", "completed": 5, "total_possible": 7 }  
  ]  
}  
```  
  
## Data Models  
  
### Habit  
| Column       | Type              | Notes                        |  
|--------------|-------------------|------------------------------|  
| `id`         | Integer (PK)      | Auto-increment               |  
| `name`       | String(255)       | Required                     |  
| `description`| Text              | Optional                     |  
| `color`      | String(7)         | Hex color, default `#6366f1` |  
| `is_active`  | Boolean           | Soft-delete flag             |  
| `created_at` | DateTime (tz)     | Server default `now()`       |  
| `updated_at` | DateTime (tz)     | Auto-updates on change       |  
  
### HabitLog  
| Column       | Type              | Notes                                  |  
|--------------|-------------------|----------------------------------------|  
| `id`         | Integer (PK)      | Auto-increment                         |  
| `habit_id`   | Integer (FK)      | References `habits.id`, CASCADE delete |  
| `log_date`   | Date              | Required                               |  
| `created_at` | DateTime (tz)     | Server default `now()`                 |  
  
## Key Features  
  
### Streak Algorithm  
The streak calculation in `habit_service.py` uses an O(n) single-pass algorithm over descending dates. It fetches only `log_date` values (not full rows) for memory efficiency — ~40KB max at 10k logs per habit.  
  
### Mock Mode  
The frontend API client (`src/api/habits.js`) includes a `USE_MOCK` flag. Set it to `true` to run the UI entirely in-browser with in-memory mock data — no backend required. Useful for frontend-only development.  
  
### Responsive Design  
The dashboard adapts to mobile screens with a tabbed interface (Habits / Analytics / Activity), controlled by a resize listener in `Dashboard.jsx`.  
  
### Dark/Light Theme  
Theme preference is persisted in `localStorage` and toggled via the navbar. Defaults to dark mode.  
  
## Tech Stack  
  
| Layer            | Libraries / Tools                                    |  
|------------------|------------------------------------------------------|  
| Frontend build   | Vite, ESLint (react-hooks, react-refresh)            |  
| Frontend UI      | React, Recharts (bar charts), custom heatmap grid    |  
| HTTP client      | Browser `fetch` via `src/api/habits.js`              |  
| Backend          | FastAPI, Uvicorn                                     |  
| Validation       | Pydantic v2                                          |  
| ORM              | SQLAlchemy (declarative base, pool_size=10)          |  
| Database         | PostgreSQL                                           |  
  
## License  
  
MIT
