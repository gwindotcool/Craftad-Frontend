export const C = {
    sidebar: "#0A1628", accent: "#F59E0B", bg: "#F0F4F8", card: "#FFFFFF",
    text: "#0F172A", muted: "#64748B", border: "#E2E8F0",
    success: "#10B981", danger: "#EF4444", info: "#3B82F6", purple: "#8B5CF6",
};

export const statusColors = {
    pending: "#F59E0B", assigned: "#8B5CF6", accepted: "#3B82F6",
    "in-progress": "#06B6D4", completed: "#10B981", paid: "#10B981",
    cancelled: "#EF4444", approved: "#10B981", rejected: "#EF4444",
    successful: "#10B981", failed: "#EF4444", suspended: "#F59E0B",
    banned: "#EF4444", customer: "#3B82F6", artisan: "#8B5CF6", admin: "#EF4444",
};

export const sc = (s) => statusColors[s?.toLowerCase()] || "#64748B";
export const fmtDate  = (d) => d ? new Date(d).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" }) : "—";
export const fmtMoney = (n) => `₦${Number(n || 0).toLocaleString()}`;
export const arr      = (v) => (Array.isArray(v) ? v : []);
export const extract  = (d, ...keys) => { for (const k of keys) { if (d?.[k]) return d[k]; } return d || []; };
export const greeting = () => { const h = new Date().getHours(); return h < 12 ? "Good Morning ☀️" : h < 17 ? "Good Afternoon 🌤️" : "Good Evening 🌙"; };

export const SKILLS = ["electrician","plumber","generator repair","mechanic","locksmith","cleaner","painter","welder","houseAgent","chef","laundry","labourer","declutter"];

export const globalStyle = `
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Inter, system-ui, sans-serif; background: #F0F4F8; }
    @keyframes spin { to { transform: rotate(360deg); } }
    input:focus, select:focus, textarea:focus { border-color: #F59E0B !important; box-shadow: 0 0 0 3px rgba(245,158,11,0.15) !important; outline: none; }
    ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-thumb { background: #CBD5E0; border-radius: 99px; }
`;
