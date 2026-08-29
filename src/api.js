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
