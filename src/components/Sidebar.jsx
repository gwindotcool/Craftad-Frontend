import { C } from "../theme";

const NAV = {
    customer: [
        { k: "home",   l: "Dashboard",     i: "🏠" },
        { k: "post",   l: "Post a Job",    i: "➕" },
        { k: "wallet", l: "Wallet",        i: "💰" },
        { k: "notifs", l: "Notifications", i: "🔔" },
    ],
    artisan: [
        { k: "home",    l: "For You",       i: "✨" },
        { k: "active",  l: "Active Jobs",   i: "⚡" },
        { k: "history", l: "Job History",   i: "📖" },
        { k: "profile", l: "My Profile",    i: "👤" },
        { k: "wallet",  l: "Wallet",        i: "💰" },
        { k: "notifs",  l: "Notifications", i: "🔔" },
    ],
    admin: [
        { k: "home",        l: "Dashboard",   i: "📊" },
        { k: "users",       l: "Users",       i: "👥" },
        { k: "earnings",    l: "Earnings",    i: "💹" },
        { k: "withdrawals", l: "Withdrawals", i: "🏦" },
    ],
};

export default function Sidebar({ user, page, setPage, logout }) {
    const role  = user?.role || "customer";
    const items = NAV[role]  || NAV.customer;
    return (
        <div style={{ width: 230, background: C.sidebar, color: "#fff", display: "flex", flexDirection: "column", height: "100vh", position: "sticky", top: 0, flexShrink: 0 }}>
            <div style={{ padding: "20px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 36, height: 36, background: C.accent, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🔧</div>
                    <div>
                        <div style={{ fontWeight: 800, fontSize: 14 }}>ArtisanConnect</div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", textTransform: "capitalize" }}>{role} account</div>
                    </div>
                </div>
            </div>
            <nav style={{ flex: 1, padding: "14px 10px", overflowY: "auto" }}>
                {items.map((item) => (
                    <button key={item.k} onClick={() => setPage(item.k)} style={{ display: "flex", alignItems: "center", gap: 9, width: "100%", padding: "9px 10px", borderRadius: 9, border: "none", cursor: "pointer", background: page === item.k ? "rgba(245,158,11,0.15)" : "transparent", color: page === item.k ? C.accent : "rgba(255,255,255,0.55)", fontWeight: page === item.k ? 700 : 400, fontSize: 13, marginBottom: 2, textAlign: "left", transition: "all .1s" }}>
                        <span style={{ fontSize: 15 }}>{item.i}</span>{item.l}
                        {page === item.k && <span style={{ marginLeft: "auto", width: 5, height: 5, borderRadius: "50%", background: C.accent }} />}
                    </button>
                ))}
            </nav>
            <div style={{ padding: "14px 10px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: "50%", background: C.accent, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, flexShrink: 0 }}>
                        {(user?.fullName || user?.email || "U")[0].toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.fullName || "User"}</div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email}</div>
                    </div>
                </div>
                <button onClick={logout} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 10px", borderRadius: 8, border: "none", cursor: "pointer", background: "rgba(239,68,68,0.1)", color: "#EF4444", fontSize: 13, fontWeight: 600 }}>
                    🚪 Sign Out
                </button>
            </div>
        </div>
    );
}
