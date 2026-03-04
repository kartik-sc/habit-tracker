# Project Architecture & File Overview: Habit Tracker (Discipline Dashboard)

This document provides a comprehensive overview of the system architecture and the role of each file in the Habit Tracker project.

---

## 1. System Architecture

The project is built using a modern **Client-Server** architecture:

*   **Frontend**: A React-based Single Page Application (SPA) designed with a "premium/futuristic" aesthetic. It handles user interactions, data visualization (charts/heatmaps), and state management.
*   **Backend**: A RESTful API built with **FastAPI** (Python). it handles data persistence, business logic (streak calculations), and serves analytics.
*   **Database**: **PostgreSQL** used for storing habit definitions and daily completion logs (managed via SQLAlchemy ORM).

---

## 2. Backend Logic (`/backend`)

The backend is organized into functional layers to ensure modularity and maintainability.

### Core Components:
*   **Entry Point (`main.py`)**: Initializes the FastAPI app, configures CORS (allowing connections from the React dev server), and registers API routes.
*   **API Layer (`routers/`)**: Defines the REST endpoints.
    *   `habits.py`: Handles routes for creating, listing, updating, and deleting habits, as well as logging completions (`/log`) and fetching analytics (`/analytics`).
*   **Business Logic Layer (`services/`)**: The "brain" of the backend.
    *   `habit_service.py`: Contains the **Streak Algorithm**. It computes current and longest streaks by processing a list of dates in a single pass ($O(n)$ efficiency). It also aggregates weekly data points for the frontend charts.
*   **Data Layer**:
    *   `models/`: Defines the database schema using SQLAlchemy (e.g., `Habit` and `HabitLog` classes).
    *   `schemas/`: Pydantic models that define the "contract" for data entering and leaving the API.
    *   `db/`: Manages database connections and session lifecycle.

---

## 3. Frontend Logic (`/frontend`)

The frontend focuses on a high-fidelity user experience with a focus on "Discipline" and "Analytics".

### Core Components:
*   **Main Application (`App.jsx`)**: The primary controller that manages global state (theme, selected habit, habit list). It coordinates between the sidebar, the main dashboard, and the analytics panel.
*   **API Client (`src/api/habits.js`)**: A wrapper around the browser's `fetch` API. 
    *   **Hybrid Strategy**: It features a `USE_MOCK` toggle. When enabled, the app runs entirely in the browser using in-memory mock data, allowing for UI development without a backend.
*   **Visualizations**:
    *   **Recharts**: Used for the weekly completion bar charts in the analytics panel.
    *   **Custom Heatmap**: A custom-built grid component that visualizes habit consistency over the last 70 days.
*   **Responsive Engine**: Implementation of mobile-first logic to ensure the dashboard remains functional on smaller screens via a tabbed view.

---

## 4. File-by-File Directory

### **Root Directory**
| File | Purpose |
| :--- | :--- |
| `schema.sql` | The raw SQL schema for creating `habits` and `habit_logs` tables. |

### **Backend (`/backend`)**
| Path | Responsibility |
| :--- | :--- |
| `main.py` | App configuration, middleware, and route mounting. |
| `db/database.py` | Connection string and SQLAlchemy session setup. |
| `models/habit.py` | Database table definitions (SQLAlchemy). |
| `schemas/habit.py` | Data validation and serialization (Pydantic). |
| `routers/habits.py` | HTTP endpoint definitions. |
| `services/habit_service.py` | Logic for Streaks, Analytics, and CRUD operations. |

### **Frontend (`/frontend`)**
| Path | Responsibility |
| :--- | :--- |
| `App.jsx` | Root component containing UI logic, themeing, and layout. |
| `src/api/habits.js` | Abstracted API calls with built-in Mock Data support. |
| `src/components/` | Reusable UI elements (Modals, Charts, Heatmaps). |

---

## 5. Summary of Data Flow
1.  **User action**: User clicks "Log" for a habit in the frontend.
2.  **API Client**: `logHabit(id)` is called in `frontend/src/api/habits.js`.
3.  **Network**: A `POST` request is sent to `http://localhost:8000/habits/{id}/log`.
4.  **Backend Router**: FastAPI intercepts the request in `backend/routers/habits.py`.
5.  **Service Logic**: `habit_service.log_habit` is called, which interacts with the database to record the date and then triggers streak recalculation.
6.  **Response**: The backend returns the new log status, and the frontend updates the UI immediately.
