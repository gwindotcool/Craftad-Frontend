import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    ArrowLeft,
    ArrowUpRight,
    Bell,
    Briefcase,
    Check,
    CheckCheck,
    Clock,
    Info,
    MessageSquare,
    RefreshCw,
    Wallet,
} from "lucide-react";
import { craftad, listOf } from "../api";
import { useSession } from "../session";

function formatRelativeTime(dateString) {
    if (!dateString) return null;
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return null;

    const diffMins = Math.floor((Date.now() - date.getTime()) / (1000 * 60));
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 30) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function getNotificationLink(item) {
    if (typeof item.link === "string" && item.link.startsWith("/")) {
        return item.link;
    }
    const jobId = item.jobId || item.job?._id || item.job;
    if (typeof jobId === "string" && jobId) {
        return `/jobs/${jobId}`;
    }
    const applicationId =
        item.applicationId || item.application?._id || item.application;
    if (typeof applicationId === "string" && applicationId) {
        return `/chat/${applicationId}`;
    }
    const kind = String(item.type || item.category || "").toLowerCase();
    if (kind.includes("wallet") || kind.includes("payment") || kind.includes("escrow")) {
        return "/wallet";
    }
    if (kind.includes("message") || kind.includes("chat")) {
        return "/chat";
    }
    return null;
}

function getNotificationIcon(item) {
    const kind = String(item.type || item.category || item.title || "").toLowerCase();
    if (kind.includes("wallet") || kind.includes("payment") || kind.includes("escrow") || kind.includes("payout")) {
        return Wallet;
    }
    if (kind.includes("message") || kind.includes("chat") || kind.includes("offer")) {
        return MessageSquare;
    }
    if (kind.includes("job") || kind.includes("application") || kind.includes("bid")) {
        return Briefcase;
    }
    return Info;
}

export function Notifications() {
    const { token } = useSession();

    const [items, setItems] = useState([]);
    const [filter, setFilter] = useState("all");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [busyId, setBusyId] = useState("");

    const loadNotifications = useCallback(
        async (isManual = false) => {
            if (!token) return;
            if (isManual) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }
            setError("");

            try {
                const data = await craftad.notifications(token);
                setItems(listOf(data, ["notifications", "data", "results"]));
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : "Unable to load notifications."
                );
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        [token]
    );

    useEffect(() => {
        loadNotifications(false);
    }, [loadNotifications]);

    const unreadCount = useMemo(
        () => items.filter((n) => !n.isRead).length,
        [items]
    );

    const visibleItems = useMemo(() => {
        if (filter === "unread") {
            return items.filter((n) => !n.isRead);
        }
        return items;
    }, [items, filter]);

    async function handleMarkRead(id) {
        if (!id || busyId) return;
        setBusyId(id);
        setError("");

        try {
            await craftad.markRead(token, id);
            setItems((list) =>
                list.map((n) => ((n._id || n.id) === id ? { ...n, isRead: true } : n))
            );
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Could not update notification."
            );
        } finally {
            setBusyId("");
        }
    }

    async function handleMarkAllRead() {
        if (unreadCount === 0 || busyId) return;
        setBusyId("ALL");
        setError("");

        try {
            await craftad.markAllRead(token);
            setItems((list) => list.map((n) => ({ ...n, isRead: true })));
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Could not mark all as read."
            );
        } finally {
            setBusyId("");
        }
    }

    return (
        <div className="mx-auto max-w-3xl space-y-7 pb-12">
            {/* Header & Mark All Read Action */}
            <div className="flex flex-col justify-between gap-4 border-b border-line pb-6 sm:flex-row sm:items-end">
                <div>
                    <Link
                        to="/dashboard"
                        className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold text-muted no-underline transition hover:text-copper"
                    >
                        <ArrowLeft size={15} />
                        <span>Back to overview</span>
                    </Link>

                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-copper">
                        Workspace Updates
                    </p>

                    <div className="mt-1 flex flex-wrap items-center gap-3">
                        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                            Alerts & Notifications
                        </h1>

                        {!loading && unreadCount > 0 && (
                            <span className="rounded-full bg-copper px-2.5 py-0.5 text-xs font-semibold text-white">
                {unreadCount} unread
              </span>
                        )}
                    </div>

                    <p className="mt-1 text-sm text-muted">
                        Stay informed on job applications, escrow movements, and negotiation
                        messages.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={() => loadNotifications(true)}
                        disabled={loading || refreshing}
                        aria-label="Refresh notifications"
                        title="Refresh notifications"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-cream text-muted transition hover:border-line-strong hover:text-ink disabled:opacity-50"
                    >
                        <RefreshCw
                            size={15}
                            className={refreshing ? "animate-spin text-copper" : ""}
                        />
                    </button>

                    <button
                        type="button"
                        disabled={loading || unreadCount === 0 || busyId === "ALL"}
                        onClick={handleMarkAllRead}
                        className="inline-flex min-h-10 items-center gap-2 rounded-full border border-line bg-cream px-4 text-xs font-semibold text-ink shadow-sm transition-all hover:border-copper hover:text-copper disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <CheckCheck size={15} className="text-copper" />
                        <span>
              {busyId === "ALL" ? "Updating..." : "Mark all read"}
            </span>
                    </button>
                </div>
            </div>

            {/* Filter Pills */}
            {!loading && items.length > 0 && (
                <div className="flex items-center gap-2">
                    {[
                        ["all", `All (${items.length})`],
                        ["unread", `Unread (${unreadCount})`],
                    ].map(([value, label]) => (
                        <button
                            key={value}
                            type="button"
                            onClick={() => setFilter(value)}
                            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                                filter === value
                                    ? "bg-ink text-paper shadow-sm"
                                    : "border border-line bg-cream text-muted hover:border-line-strong hover:text-ink"
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            )}

            {/* Error Alert Banner */}
            {error && (
                <div
                    role="alert"
                    className="rounded-2xl border border-danger/30 bg-danger-soft px-5 py-4 text-sm font-medium text-danger"
                >
                    {error}
                </div>
            )}

            {/* Notifications List Container */}
            {loading ? (
                <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, idx) => (
                        <div
                            key={idx}
                            className="h-24 animate-pulse rounded-3xl border border-line bg-cream/70 p-6"
                        />
                    ))}
                </div>
            ) : (
                <div className="overflow-hidden rounded-3xl border border-line bg-cream shadow-card">
                    <ul className="divide-y divide-line">
                        {visibleItems.length === 0 && (
                            <li className="p-12 text-center">
                                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-line bg-paper text-copper">
                                    <Bell size={22} />
                                </div>
                                <p className="font-display text-xl font-semibold text-ink">
                                    {filter === "unread"
                                        ? "No unread notifications"
                                        : "You’re completely caught up"}
                                </p>
                                <p className="mt-1 text-sm text-muted">
                                    {filter === "unread"
                                        ? "Switch back to All to review past workspace alerts."
                                        : "New alerts and escrow updates will appear here automatically."}
                                </p>
                            </li>
                        )}

                        {visibleItems.map((item, idx) => {
                            const id = item._id || item.id || idx;
                            const Icon = getNotificationIcon(item);
                            const targetLink = getNotificationLink(item);
                            const timeLabel = formatRelativeTime(item.createdAt);

                            return (
                                <li
                                    key={id}
                                    className={`p-5 transition-colors sm:p-6 ${
                                        item.isRead
                                            ? "bg-cream"
                                            : "border-l-4 border-l-copper bg-paper/75"
                                    }`}
                                >
                                    <div className="flex flex-wrap items-start justify-between gap-4">
                                        <div className="flex min-w-0 flex-1 gap-3.5">
                                            <div
                                                className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border ${
                                                    item.isRead
                                                        ? "border-line bg-paper text-muted"
                                                        : "border-copper/20 bg-copper/12 text-copper"
                                                }`}
                                            >
                                                <Icon size={18} />
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h2 className="text-base font-semibold text-ink">
                                                        {item.title || "Workspace Update"}
                                                    </h2>

                                                    {timeLabel && (
                                                        <span className="inline-flex items-center gap-1 text-xs text-muted">
                              <Clock size={12} />
                                                            {timeLabel}
                            </span>
                                                    )}
                                                </div>

                                                <p className="mt-1 text-sm leading-relaxed text-muted">
                                                    {item.message}
                                                </p>

                                                {targetLink && (
                                                    <Link
                                                        to={targetLink}
                                                        onClick={() => {
                                                            if (!item.isRead && (item._id || item.id)) {
                                                                handleMarkRead(item._id || item.id);
                                                            }
                                                        }}
                                                        className="mt-2.5 inline-flex items-center gap-1 text-xs font-semibold text-copper no-underline transition hover:text-copper-deep"
                                                    >
                                                        <span>View details</span>
                                                        <ArrowUpRight size={14} />
                                                    </Link>
                                                )}
                                            </div>
                                        </div>

                                        {!item.isRead && (item._id || item.id) && (
                                            <button
                                                type="button"
                                                disabled={busyId === (item._id || item.id)}
                                                onClick={() => handleMarkRead(item._id || item.id)}
                                                className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full border border-line bg-cream px-4 text-xs font-semibold text-copper shadow-sm transition hover:border-copper disabled:opacity-50"
                                            >
                                                <Check size={14} />
                                                <span>
                          {busyId === (item._id || item.id)
                              ? "Saving..."
                              : "Mark read"}
                        </span>
                                            </button>
                                        )}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </div>
    );
}