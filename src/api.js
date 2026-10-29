<<<<<<< HEAD
const BASE = "https://craftad-lite-2.onrender.com";

async function request(path, init = {}, token) {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const res = await fetch(`${BASE}${path}`, { ...init, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || data.error || "Something went wrong");
  return data;
}

export const craftad = {
  register: (body) => request("/api/auth/register", { method: "POST", body: JSON.stringify(body) }),
  login: (body) => request("/api/auth/login", { method: "POST", body: JSON.stringify(body) }),
  profile: (token) => request("/api/auth/profile", {}, token),
  myJobs: (token) => request("/api/job/my-jobs?limit=50", {}, token),
  openJobs: (token) => request("/api/job/open-jobs?limit=50", {}, token),
  createJob: (token, body) => request("/api/job/create-job", { method: "POST", body: JSON.stringify(body) }, token),
  startJob: (token, id) => request(`/api/job/${id}/start`, { method: "PATCH" }, token),
  rejectJob: (token, id) => request(`/api/job/${id}/reject`, { method: "PATCH" }, token),
  completeJob: (token, id) => request(`/api/job/${id}/complete`, { method: "PATCH" }, token),
  confirmJob: (token, id) => request(`/api/job/${id}/confirm`, { method: "PATCH" }, token),
  apply: (token, id, body) => request(`/api/applications/apply/${id}`, { method: "POST", body: JSON.stringify(body) }, token),
  applications: (token, id) => request(`/api/applications/job/${id}`, {}, token),
  acceptApplication: (token, id) => request(`/api/applications/accept/${id}`, { method: "PATCH" }, token),
  rejectApplication: (token, id) => request(`/api/applications/${id}/reject`, { method: "PATCH" }, token),
  review: (token, jobId, body) => request(`/api/reviews/${jobId}`, { method: "POST", body: JSON.stringify(body) }, token),
    chat: (token, id) => request(`/api/chat/${id}`, {}, token),

    sendChatMessage: (token, id, text) =>
        request(`/api/chat/${id}`, {
            method: "POST",
            body: JSON.stringify({ text }),
        }, token),
  wallet: (token) => request("/api/wallet/me", {}, token),
  transactions: (token) => request("/api/transactions/my", {}, token),
  myTransactions: (token) => request("/api/transactions/my", {}, token),
  fund: (token, amount) => request("/api/wallet/deposit", { method: "POST", body: JSON.stringify({ amount }) }, token),
  withdraw: (token, amount) => request("/api/wallet/withdrawals", { method: "POST", body: JSON.stringify({ amount }) }, token),
  resolveBank: (token, accountNumber, bankCode) =>
    request(`/api/wallet/banks/resolve?accountNumber=${encodeURIComponent(accountNumber)}&bankCode=${encodeURIComponent(bankCode)}`, {}, token),
  addBank: (token, body) => request("/api/wallet/banks", { method: "POST", body: JSON.stringify(body) }, token),
  notifications: (token) => request("/api/notifications", {}, token),
  markAllRead: (token) => request("/api/notifications/read-all", { method: "PATCH" }, token),
  markRead: (token, id) => request(`/api/notifications/${id}/read`, { method: "PATCH" }, token),
  saveFcmToken: (token, fcmToken) => request("/api/auth/fcm-token", { method: "POST", body: JSON.stringify({ token: fcmToken }) }, token),
  removeFcmToken: (token, fcmToken) => request("/api/auth/fcm-token", { method: "DELETE", body: JSON.stringify({ token: fcmToken }) }, token),
  artisanMe: (token) => request("/api/artisans/me", {}, token),
  createArtisan: (token, body) => request("/api/artisans/create", { method: "POST", body: JSON.stringify(body) }, token),
  updateArtisan: (token, body) => request("/api/artisans/update", { method: "PATCH", body: JSON.stringify(body) }, token),
  releaseEscrow: (token, id) => request(`/api/escrow/${id}/release`, { method: "PATCH" }, token),
  disputeEscrow: (token, id, reason) => request(`/api/escrow/${id}/dispute`, { method: "PATCH", body: JSON.stringify({ reason }) }, token),
  resolveEscrow: (token, id, body) => request(`/api/escrow/${id}/resolve`, { method: "PATCH", body: JSON.stringify(body) }, token),
};

export function listOf(payload, keys) {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === "object") {
    for (const key of keys) if (Array.isArray(payload[key])) return payload[key];
    if (Array.isArray(payload.data)) return payload.data;
  }
  return [];
}

const TOKEN_KEY = "craftad_token";
const USER_KEY = "craftad_user";

export function loadSession() {
  const token = localStorage.getItem(TOKEN_KEY);
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem(USER_KEY) || "null");
  } catch {
    user = null;
  }
  if (!token || token === "undefined" || token === "null") return { token: null, user: null };
  return { token, user };
}

export function saveSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
=======
export const BASE_URL = "http://localhost:3000";

const req = async (method, path, body, token) => {
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const r = await fetch(`${BASE_URL}${path}`, {
        method, headers, body: body ? JSON.stringify(body) : undefined,
    });
    const d = await r.json();
    if (!r.ok) throw new Error(d.message || d.error || "Request failed");
    return d;
};

export const api = {
    get:   (p, t)    => req("GET",   p, null, t),
    post:  (p, b, t) => req("POST",  p, b,    t),
    patch: (p, b, t) => req("PATCH", p, b,    t),
};
>>>>>>> 89413558c3ac50fe7a5b979ccbe772016af0d5c9
