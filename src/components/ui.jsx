import { C, sc } from "../theme";

export const Btn = ({ children, onClick, variant = "primary", size = "md", disabled, full, style: sx }) => {
    const base = { border: "none", borderRadius: 8, cursor: disabled ? "not-allowed" : "pointer", fontWeight: 600, fontSize: size === "sm" ? 13 : 14, padding: size === "sm" ? "6px 14px" : "10px 22px", transition: "all .15s", opacity: disabled ? 0.6 : 1, display: "inline-flex", alignItems: "center", gap: 6, width: full ? "100%" : "auto", justifyContent: full ? "center" : "flex-start", ...sx };
    const variants = { primary: { background: C.accent, color: "#fff" }, danger: { background: C.danger, color: "#fff" }, success: { background: C.success, color: "#fff" }, ghost: { background: "transparent", color: C.text, border: `1.5px solid ${C.border}` }, dark: { background: C.sidebar, color: "#fff" }, purple: { background: C.purple, color: "#fff" }, info: { background: C.info, color: "#fff" } };
    return <button onClick={onClick} disabled={disabled} style={{ ...base, ...variants[variant] }}>{children}</button>;
};

export const Inp = ({ label, ...p }) => (
    <div style={{ marginBottom: 14 }}>
        {label && <label style={{ display: "block", marginBottom: 5, fontSize: 13, fontWeight: 600, color: C.text }}>{label}</label>}
        <input style={{ width: "100%", padding: "9px 12px", borderRadius: 8, fontSize: 14, border: `1.5px solid ${C.border}`, background: "#fff", color: C.text, outline: "none", boxSizing: "border-box" }} {...p} />
    </div>
);

export const Sel = ({ label, children, ...p }) => (
    <div style={{ marginBottom: 14 }}>
        {label && <label style={{ display: "block", marginBottom: 5, fontSize: 13, fontWeight: 600, color: C.text }}>{label}</label>}
        <select style={{ width: "100%", padding: "9px 12px", borderRadius: 8, fontSize: 14, border: `1.5px solid ${C.border}`, background: "#fff", color: C.text, outline: "none", boxSizing: "border-box" }} {...p}>{children}</select>
    </div>
);

export const Tex = ({ label, ...p }) => (
    <div style={{ marginBottom: 14 }}>
        {label && <label style={{ display: "block", marginBottom: 5, fontSize: 13, fontWeight: 600, color: C.text }}>{label}</label>}
        <textarea style={{ width: "100%", padding: "9px 12px", borderRadius: 8, fontSize: 14, border: `1.5px solid ${C.border}`, background: "#fff", color: C.text, outline: "none", minHeight: 90, resize: "vertical", boxSizing: "border-box" }} {...p} />
    </div>
);

export const Card    = ({ children, style }) => <div style={{ background: C.card, borderRadius: 12, padding: 22, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: `1px solid ${C.border}`, ...style }}>{children}</div>;
export const Badge   = ({ status }) => <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700, background: sc(status) + "20", color: sc(status), textTransform: "capitalize" }}>{status || "—"}</span>;
export const Spinner = () => <div style={{ display: "flex", justifyContent: "center", padding: 48 }}><div style={{ width: 34, height: 34, border: `3px solid ${C.border}`, borderTop: `3px solid ${C.accent}`, borderRadius: "50%", animation: "spin .7s linear infinite" }} /></div>;
export const Empty   = ({ msg = "Nothing here yet", icon = "📭" }) => <div style={{ textAlign: "center", padding: "48px 24px", color: C.muted }}><div style={{ fontSize: 40, marginBottom: 10 }}>{icon}</div><p style={{ fontWeight: 500 }}>{msg}</p></div>;
export const ErrBox  = ({ msg }) => msg ? <div style={{ background: "#FEF2F2", border: `1px solid ${C.danger}40`, borderRadius: 8, padding: "10px 14px", marginBottom: 14, fontSize: 13, color: C.danger }}>{msg}</div> : null;
export const Stat    = ({ icon, label, value, color }) => <Card><div style={{ display: "flex", alignItems: "center", gap: 14 }}><div style={{ fontSize: 30 }}>{icon}</div><div><div style={{ fontSize: 26, fontWeight: 800, color: color || C.accent }}>{value}</div><div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{label}</div></div></div></Card>;

export const Toast = ({ msg, type, onClose }) => msg ? (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, background: type === "error" ? C.danger : C.success, color: "#fff", padding: "12px 20px", borderRadius: 10, fontWeight: 600, fontSize: 14, boxShadow: "0 4px 20px rgba(0,0,0,0.2)", display: "flex", alignItems: "center", gap: 10 }}>
        {msg}<button onClick={onClose} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", fontSize: 18, lineHeight: 1 }}>×</button>
    </div>
) : null;

export const Modal = ({ open, onClose, title, children, maxWidth = 540 }) => {
    if (!open) return null;
    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div style={{ background: "#fff", borderRadius: 16, padding: 28, width: "100%", maxWidth, maxHeight: "88vh", overflow: "auto" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
                    <h2 style={{ fontSize: 18, fontWeight: 800, color: C.text }}>{title}</h2>
                    <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, color: C.muted }}>×</button>
                </div>
                {children}
            </div>
        </div>
    );
};
