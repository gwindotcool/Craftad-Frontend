import { useState, useEffect } from "react";
import { C, arr, extract, fmtDate } from "../theme";
import { api } from "../api";
import { Spinner, Empty } from "./ui";

export default function Notifs({ token }) {
    const [notifs, setNotifs]   = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("/api/notifications", token)
            .then((d) => setNotifs(arr(extract(d, "notifications", "data"))))
            .catch((e) => console.error("Notifs:", e.message))
            .finally(() => setLoading(false));
    }, [token]);

    if (loading) return <Spinner />;
    return (
        <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 22 }}>Notifications</h2>
            {notifs.length === 0 ? <Empty msg="You're all caught up!" icon="🎉" /> :
                notifs.map((n, i) => (
                    <div key={i} style={{ padding: "14px 18px", borderRadius: 10, background: n.isRead ? "#fff" : "#FFFBEB", border: `1px solid ${n.isRead ? C.border : "#FDE68A"}`, marginBottom: 8 }}>
                        {!n.isRead && <span style={{ fontSize: 10, fontWeight: 700, color: C.accent, textTransform: "uppercase", letterSpacing: 0.5 }}>New · </span>}
                        <span style={{ fontWeight: 600, fontSize: 14 }}>{n.title}</span>
                        <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>{n.message}</div>
                        <div style={{ fontSize: 12, color: C.muted, marginTop: 6 }}>{fmtDate(n.createdAt)}</div>
                    </div>
                ))
            }
        </div>
    );
}
