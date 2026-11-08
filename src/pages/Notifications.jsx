import { useEffect, useState } from "react";
import { Bell, CheckCheck, Check, Info } from "lucide-react";
import { craftad } from "../api";
import { useSession } from "../session";

export function Notifications() {
    const { token } = useSession();
    const [items, setItems] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) return;
        setLoading(true);
        craftad.notifications(token)
            .then((data) => setItems(data.notifications || []))
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [token]);

    return (
        <div className="mx-auto max-w-3xl space-y-8 pb-12">

            {/* Header & Mark All Read Action */}
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-copper">WORKSPACE UPDATES</p>
                    <h1 className="mt-1 font-display text-3xl tracking-tight sm:text-4xl text-ink">Alerts & Notifications</h1>
                    <p className="mt-1 text-sm text-muted">Stay informed on job application updates, escrow movements, and messages.</p>
                </div>

                <button
                    className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-cream px-5 text-xs font-semibold uppercase tracking-wider text-ink transition-all hover:border-copper hover:bg-paper shadow-sm"
                    onClick={() =>
                        craftad.markAllRead(token)
                            .then(() => setItems((list) => list.map((n) => ({ ...n, isRead: true }))))
                            .catch((err) => setError(err.message))
                    }
                >
                    <CheckCheck size={16} className="text-copper" />
                    <span>Mark all read</span>
                </button>
            </div>

            {/* Error Alert Banner */}
            {error && (
                <div className="rounded-2xl border border-copper/30 bg-copper/5 px-5 py-4 text-sm text-copper-deep shadow-sm">
                    {error}
                </div>
            )}

            {/* Notifications List Container */}
            {loading ? (
                <div className="rounded-[1.75rem] border border-line bg-cream p-12 text-center text-muted">
                    Loading notifications...
                </div>
            ) : (
                <div className="overflow-hidden rounded-[1.75rem] border border-line bg-cream shadow-sm">
                    <ul className="divide-y divide-line">
                        {items.length === 0 && (
                            <li className="p-12 text-center">
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-paper border border-line text-copper mb-3">
                                    <Bell size={22} />
                                </div>
                                <p className="font-display text-xl text-ink">You’re completely caught up</p>
                                <p className="mt-1 text-sm text-muted">New alerts and updates will appear here automatically.</p>
                            </li>
                        )}

                        {items.map((item) => (
                            <li
                                key={item._id}
                                className={`p-6 transition-colors ${item.isRead ? "bg-cream" : "bg-paper/70 border-l-4 border-l-copper"}`}
                            >
                                <div className="flex flex-wrap items-start justify-between gap-4">
                                    <div className="flex gap-3.5">
                                        <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line ${item.isRead ? "bg-cream text-muted" : "bg-copper/10 text-copper"}`}>
                                            <Info size={18} />
                                        </div>
                                        <div>
                                            <h2 className="font-semibold text-ink text-base">{item.title || "Update"}</h2>
                                            <p className="mt-1 text-sm leading-relaxed text-muted">{item.message}</p>
                                        </div>
                                    </div>

                                    {!item.isRead && (
                                        <button
                                            className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-line bg-cream px-4 text-xs font-semibold text-copper transition hover:border-copper shadow-sm shrink-0"
                                            onClick={() =>
                                                craftad
                                                    .markRead(token, item._id)
                                                    .then(() => setItems((list) => list.map((n) => (n._id === item._id ? { ...n, isRead: true } : n))))
                                                    .catch((err) => setError(err.message))
                                            }
                                        >
                                            <Check size={14} />
                                            <span>Mark read</span>
                                        </button>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}