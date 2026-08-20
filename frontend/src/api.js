const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

export async function api(path, options = {}) {
  const token = localStorage.getItem("toqa_token");
  const sessionId = localStorage.getItem("toqa_session");
  const headers = { ...(options.headers || {}) };
  if (!(options.body instanceof FormData)) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;
  if (sessionId) headers["x-session-id"] = sessionId;

  const response = await fetch(`${API_URL}${path}`, { ...options, headers, credentials: "include" });
  const returnedSession = response.headers.get("x-session-id");
  if (returnedSession) localStorage.setItem("toqa_session", returnedSession);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.message || "Something went wrong");
    error.status = response.status;
    error.details = payload.errors;
    throw error;
  }
  return payload.data;
}

export const money = (value) => new Intl.NumberFormat("en-EG", {
  style: "currency", currency: "EGP", maximumFractionDigits: 0,
}).format(value || 0);
