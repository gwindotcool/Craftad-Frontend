import { useState, useEffect } from "react";
import { C, arr, extract, fmtDate } from "../../theme";
import { api } from "../../api";
import { Btn, Card, Badge, Spinner, Empty, Toast } from "../../components/ui";

export default function AdminUsers({ token }) {
    const [users, setUsers]       = useState([]);
    const [loading, setLoading]   = useState(true);
    const [q, setQ]               = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [toast, setToast]       = useState(null);

    useEffect(() => {
        api.get("/api/admin/users", token)
            .then((d) => setUsers(arr(extract(d, "users", "data"))))
            .catch((e) => console.error(e.message))
            .finally(() => setLoading(false));
    }, [token]);

    // NOTE: add this route to your backend to enable suspend/ban:
    // router.patch("/users/:userId/status", protect, authorizeRoles("admin"), async (req,res) => {
    //   const user = await User.findByIdAndUpdate(req.params.userId, { accountStatus: req.body.accountStatus }, { new: true });
    //   res.json({ success: true, data: user });
    // });
    const updateStatus = async (userId, accountStatus) => {
        try {
            await api.patch(`/api/admin/users/${userId}/status`, { accountStatus }, token);
            setUsers((u) => u.map((x) => x._id === userId ? { ...x, accountStatus } : x));
            setToast({ msg: `User ${accountStatus}.`, type: "success" });
        } catch (e) { setToast({ msg: "Add PATCH /api/admin/users/:userId/status to your backend first.", type: "error" }); }
    };

    if (loading) return <Spinner />;

    const filtered = users.filter((u) =>
        `${u.fullName}${u.email}${u.role}`.toLowerCase().includes(q.toLowerCase()) &&
        (!roleFilter || u.role === roleFilter)
    );

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text }}>Users <span style={{ color: C.muted, fontWeight: 400, fontSize: 16 }}>({users.length})</span></h2>
                <div style={{ display: "flex", gap: 10 }}>
                    <input placeholder="🔍 Search…" value={q} onChange={(e) => setQ(e.target.value)} style={{ padding: "8px 12px", borderRadius: 8, border: `1.5px solid ${C.border}`, fontSize: 13, outline: "none", width: 180 }} />
                    <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} style={{ padding: "8px 12px", borderRadius: 8, border: `1.5px solid ${C.border}`, fontSize: 13, outline: "none", background: "#fff" }}>
                        <option value="">All Roles</option>
                        <option value="customer">Customer</option>
                        <option value="artisan">Artisan</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
            </div>
            {filtered.length === 0 ? <Empty msg="No users found" icon="👥" /> : (
                <Card style={{ padding: 0, overflow: "hidden" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead><tr style={{ background: C.bg }}>
                            {["Name","Email","Phone","Role","Status","Joined","Actions"].map((h) => <th key={h} style={{ padding: "11px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>)}
                        </tr></thead>
                        <tbody>
                            {filtered.map((u, i) => (
                                <tr key={u._id} style={{ borderTop: `1px solid ${C.border}`, background: i % 2 === 0 ? "#fff" : "#FAFAFA" }}>
                                    <td style={{ padding: "11px 14px" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                                            <div style={{ width: 30, height: 30, borderRadius: "50%", background: u.accountStatus === "banned" ? C.danger : C.accent, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 12, color: "#fff", flexShrink: 0, opacity: u.accountStatus !== "active" ? 0.6 : 1 }}>
                                                {(u.fullName || u.email || "U")[0].toUpperCase()}
                                            </div>
                                            <span style={{ fontSize: 14, fontWeight: 600, color: u.accountStatus === "banned" ? C.danger : C.text }}>{u.fullName || "—"}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: "11px 14px", fontSize: 13, color: C.muted }}>{u.email}</td>
                                    <td style={{ padding: "11px 14px", fontSize: 13, color: C.muted }}>{u.phone || "—"}</td>
                                    <td style={{ padding: "11px 14px" }}><Badge status={u.role} /></td>
                                    <td style={{ padding: "11px 14px" }}><Badge status={u.accountStatus || "active"} /></td>
                                    <td style={{ padding: "11px 14px", fontSize: 13, color: C.muted }}>{fmtDate(u.createdAt)}</td>
                                    <td style={{ padding: "11px 14px" }}>
                                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                                            {u.role !== "admin" && (<>
                                                {u.accountStatus !== "suspended" && u.accountStatus !== "banned" && <Btn size="sm" variant="ghost" onClick={() => updateStatus(u._id, "suspended")}>Suspend</Btn>}
                                                {u.accountStatus !== "banned" && <Btn size="sm" variant="danger" onClick={() => updateStatus(u._id, "banned")}>Ban</Btn>}
                                                {(u.accountStatus === "suspended" || u.accountStatus === "banned") && <Btn size="sm" variant="success" onClick={() => updateStatus(u._id, "active")}>Restore</Btn>}
                                            </>)}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card>
            )}
            <Toast msg={toast?.msg} type={toast?.type} onClose={() => setToast(null)} />
        </div>
    );
}
