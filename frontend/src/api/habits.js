// ─── API Client ───────────────────────────────────────────────────────────────
// Swap USE_MOCK = false when FastAPI backend is running.
// All functions mirror the exact REST contract.

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";


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
  return _fetch("/habits");
}

/**
 * POST /habits
 * @param {{ name: string, description?: string }} data
 */
export async function createHabit(data) {
  return _fetch("/habits", { method: "POST", body: JSON.stringify(data) });
}

/**
 * PUT /habits/:id
 * @param {number} id
 * @param {{ name?: string, description?: string }} data
 */
export async function updateHabit(id, data) {
  return _fetch(`/habits/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

/**
 * DELETE /habits/:id  (soft delete)
 * @param {number} id
 */
export async function deleteHabit(id) {
  return _fetch(`/habits/${id}`, { method: "DELETE" });
}

/**
 * POST /habits/:id/log
 * Idempotent — backend enforces UNIQUE(habit_id, log_date).
 * @param {number} id
 * @returns {{ log_date: string, created: boolean }}
 */
export async function logHabit(id) {
  return _fetch(`/habits/${id}/log`, { method: "POST" });
}

/**
 * GET /habits/:id/analytics
 * @param {number} id
 * @returns {AnalyticsResponse}
 */
export async function getAnalytics(id) {
  return _fetch(`/habits/${id}/analytics`);
}