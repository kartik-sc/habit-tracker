// ─── API Client ───────────────────────────────────────────────────────────────
// Swap USE_MOCK = false when FastAPI backend is running.
// All functions mirror the exact REST contract.

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
const USE_MOCK = false;

// ─── Mock state (in-memory, survives re-renders via module scope) ─────────────
const _habits = [
  { id: 1, name: "Morning Run", description: "30 min jog", completed_today: true, is_active: true },
  { id: 2, name: "Read 20 Pages", description: "Non-fiction only", completed_today: false, is_active: true },
  { id: 3, name: "Meditate", description: "10 min minimum", completed_today: true, is_active: true },
  { id: 4, name: "No Sugar", description: "Refined sugar", completed_today: false, is_active: true },
  { id: 5, name: "Cold Shower", description: "2 min minimum", completed_today: true, is_active: true },
];

const _analytics = {
  1: {
    habit_id: 1, habit_name: "Morning Run", current_streak: 7, longest_streak: 21, completion_rate_30d: 73.3,
    weekly_data: [{ week: "01/06", completed: 4 }, { week: "01/13", completed: 5 }, { week: "01/20", completed: 6 }, { week: "01/27", completed: 7 }, { week: "02/03", completed: 5 }, { week: "02/10", completed: 7 }, { week: "02/17", completed: 7 }]
  },
  2: {
    habit_id: 2, habit_name: "Read 20 Pages", current_streak: 3, longest_streak: 14, completion_rate_30d: 56.7,
    weekly_data: [{ week: "01/06", completed: 3 }, { week: "01/13", completed: 4 }, { week: "01/20", completed: 4 }, { week: "01/27", completed: 5 }, { week: "02/03", completed: 3 }, { week: "02/10", completed: 4 }, { week: "02/17", completed: 3 }]
  },
  3: {
    habit_id: 3, habit_name: "Meditate", current_streak: 12, longest_streak: 30, completion_rate_30d: 86.7,
    weekly_data: [{ week: "01/06", completed: 6 }, { week: "01/13", completed: 7 }, { week: "01/20", completed: 6 }, { week: "01/27", completed: 7 }, { week: "02/03", completed: 6 }, { week: "02/10", completed: 7 }, { week: "02/17", completed: 7 }]
  },
  4: {
    habit_id: 4, habit_name: "No Sugar", current_streak: 0, longest_streak: 8, completion_rate_30d: 43.3,
    weekly_data: [{ week: "01/06", completed: 2 }, { week: "01/13", completed: 3 }, { week: "01/20", completed: 4 }, { week: "01/27", completed: 3 }, { week: "02/03", completed: 2 }, { week: "02/10", completed: 3 }, { week: "02/17", completed: 1 }]
  },
  5: {
    habit_id: 5, habit_name: "Cold Shower", current_streak: 5, longest_streak: 12, completion_rate_30d: 66.7,
    weekly_data: [{ week: "01/06", completed: 5 }, { week: "01/13", completed: 4 }, { week: "01/20", completed: 5 }, { week: "01/27", completed: 6 }, { week: "02/03", completed: 4 }, { week: "02/10", completed: 5 }, { week: "02/17", completed: 5 }]
  },
};

// ─── Mock helpers ─────────────────────────────────────────────────────────────
function _mockHabits() {
  return _habits.filter(h => h.is_active).map(h => ({ ...h }));
}

// ─── Real fetch wrapper ───────────────────────────────────────────────────────
async function _fetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new Error(detail?.detail ?? `HTTP ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * GET /habits
 * Returns list of active habits with completed_today flag.
 */
export async function getHabits() {
  if (USE_MOCK) return _mockHabits();
  return _fetch("/habits");
}

/**
 * POST /habits
 * @param {{ name: string, description?: string }} data
 */
export async function createHabit(data) {
  if (USE_MOCK) {
    const id = Date.now();
    const habit = { id, ...data, completed_today: false, is_active: true };
    _habits.push(habit);
    _analytics[id] = {
      habit_id: id, habit_name: data.name,
      current_streak: 0, longest_streak: 0, completion_rate_30d: 0,
      weekly_data: [],
    };
    return { ...habit };
  }
  return _fetch("/habits", { method: "POST", body: JSON.stringify(data) });
}

/**
 * PUT /habits/:id
 * @param {number} id
 * @param {{ name?: string, description?: string }} data
 */
export async function updateHabit(id, data) {
  if (USE_MOCK) {
    const h = _habits.find(h => h.id === id);
    if (h) Object.assign(h, data);
    if (_analytics[id]) _analytics[id].habit_name = data.name ?? _analytics[id].habit_name;
    return { ...h };
  }
  return _fetch(`/habits/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

/**
 * DELETE /habits/:id  (soft delete)
 * @param {number} id
 */
export async function deleteHabit(id) {
  if (USE_MOCK) {
    const h = _habits.find(h => h.id === id);
    if (h) h.is_active = false;
    return null;
  }
  return _fetch(`/habits/${id}`, { method: "DELETE" });
}

/**
 * POST /habits/:id/log
 * Idempotent — backend enforces UNIQUE(habit_id, log_date).
 * @param {number} id
 * @returns {{ log_date: string, created: boolean }}
 */
export async function logHabit(id) {
  if (USE_MOCK) {
    const h = _habits.find(h => h.id === id);
    if (h) h.completed_today = !h.completed_today;
    return { log_date: new Date().toISOString().slice(0, 10), created: true };
  }
  return _fetch(`/habits/${id}/log`, { method: "POST" });
}

/**
 * GET /habits/:id/analytics
 * @param {number} id
 * @returns {AnalyticsResponse}
 */
export async function getAnalytics(id) {
  if (USE_MOCK) return _analytics[id] ?? null;
  return _fetch(`/habits/${id}/analytics`);
}