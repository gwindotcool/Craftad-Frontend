
import { useEffect, useMemo, useRef, useState } from "react";
import {
    MessageCircle,
    MessageSquare,
    Search,
    X,
    ArrowLeft,
    LoaderCircle,
} from "lucide-react";

import { craftad, listOf } from "../api";
import { useSession } from "../session";
import { FloatingNegotiationChat } from "./FloatingNegotiationChat";

function getId(value) {
    if (!value) return "";
    if (typeof value === "string") return value;
    return String(value._id || value.id || "");
}

function getInitials(name) {
    if (!name) return "?";

    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();
}

function getLastMessage(conversation) {
    const message = conversation.lastMessage;

    if (typeof message === "string") return message;
    if (message?.text) return message.text;

    return "Start a conversation";
}

function formatTime(value) {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "";

    const today = new Date();

    if (date.toDateString() === today.toDateString()) {
        return date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    return date.toLocaleDateString([], {
        day: "numeric",
        month: "short",
    });
}

const CLOSED_STATUSES = [
    "accepted",
    "rejected",
    "withdrawn",
    "price_agreed",
];

export function ChatLauncher({ fullPage = false }) {
    const { token, user } = useSession();

    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [open, setOpen] = useState(fullPage);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");
    const [panelPosition, setPanelPosition] = useState(null);
    const [launcherPosition, setLauncherPosition] = useState(null);
    const panelRef = useRef(null);
    const dragState = useRef(null);
    const suppressLauncherClick = useRef(false);

    function startDrag(kind, event) {
        if (fullPage) return;

        // Keep touch interaction natural on mobile.
        if (event.pointerType === "touch" || window.innerWidth < 640) {
            return;
        }

        if (
            kind === "panel" &&
            event.target.closest("button, input, textarea, a, select")
        ) {
            return;
        }

        if (kind === "launcher") {
            suppressLauncherClick.current = false;
        }

        const element =
            kind === "panel" ? panelRef.current : event.currentTarget;

        if (!element) return;

        const rect = element.getBoundingClientRect();

        dragState.current = {
            kind,
            pointerId: event.pointerId,
            startX: event.clientX,
            startY: event.clientY,
            originX: rect.left,
            originY: rect.top,
            width: rect.width,
            height: rect.height,
        };

        if (kind === "panel") {
            setPanelPosition({ x: rect.left, y: rect.top });
        } else {
            setLauncherPosition({ x: rect.left, y: rect.top });
        }

        event.currentTarget.setPointerCapture(event.pointerId);
    }

    function moveDrag(event) {
        const drag = dragState.current;

        if (!drag || drag.pointerId !== event.pointerId) return;

        if (
            drag.kind === "launcher" &&
            (Math.abs(event.clientX - drag.startX) > 4 ||
                Math.abs(event.clientY - drag.startY) > 4)
        ) {
            suppressLauncherClick.current = true;
        }

        const maxX = Math.max(8, window.innerWidth - drag.width - 8);
        const maxY = Math.max(8, window.innerHeight - drag.height - 8);

        const x = Math.min(
            maxX,
            Math.max(8, drag.originX + event.clientX - drag.startX)
        );

        const y = Math.min(
            maxY,
            Math.max(8, drag.originY + event.clientY - drag.startY)
        );

        if (drag.kind === "panel") {
            setPanelPosition({ x, y });
        } else {
            setLauncherPosition({ x, y });
        }
    }

    function endDrag(event) {
        if (
            dragState.current &&
            dragState.current.pointerId === event.pointerId
        ) {
            dragState.current = null;
        }
    }

    // If the viewport becomes mobile-sized, restore the mobile layout.
    useEffect(() => {
        function handleResize() {
            if (window.innerWidth < 640) {
                dragState.current = null;
                setPanelPosition(null);
                setLauncherPosition(null);
            }
        }

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        if (!token || !open) return;

        let cancelled = false;

        async function loadConversations() {
            setLoading(true);
            setError("");

            try {
                const response = await craftad.conversations(token);
                const items = listOf(response, ["conversations"]);

                if (!cancelled) {
                    setConversations(items);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err.message || "Could not load conversations."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadConversations();

        return () => {
            cancelled = true;
        };
    }, [token, open]);

    function getOtherParticipant(conversation) {
        const currentUserId = getId(user);
        const customer = conversation.customer;
        const artisan = conversation.artisan;

        if (getId(customer) === currentUserId) return artisan;
        if (getId(artisan) === currentUserId) return customer;

        return user?.role === "customer" ? artisan : customer;
    }

    const filteredConversations = useMemo(() => {
        return conversations.filter((conversation) => {
            const applicationStatus =
                conversation.application?.status || "pending";

            const isActive = !CLOSED_STATUSES.includes(applicationStatus);

            if (filter === "active" && !isActive) return false;

            const participant = getOtherParticipant(conversation);

            const searchText = [
                participant?.fullName,
                conversation.job?.title,
                getLastMessage(conversation),
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return searchText.includes(search.trim().toLowerCase());
        });
    }, [conversations, filter, search, user]);

    function closeInbox() {
        setSelectedConversation(null);
        setOpen(false);
    }

    function returnToInbox() {
        setSelectedConversation(null);
    }

    if (!token || !user) return null;

    return (
        <>
            {open && (
                <section
                    ref={panelRef}
                    style={
                        panelPosition
                            ? {
                                  left: `${panelPosition.x}px`,
                                  top: `${panelPosition.y}px`,
                              }
                            : undefined
                    }
                    className={
                        fullPage
                            ? "relative z-0 flex h-[min(760px,calc(100dvh-10rem))] w-full flex-col overflow-hidden rounded-3xl border border-line bg-paper shadow-sm"
                            : `fixed z-[90] flex h-[min(600px,calc(100dvh-6rem))] w-[min(480px,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl border border-line bg-paper shadow-2xl ${
                                  panelPosition ? "" : "bottom-24 right-5"
                              } max-sm:inset-0 max-sm:h-[100dvh] max-sm:w-full max-sm:rounded-none`
                    }
                >

                    {/* Main inbox header */}
                    <header className="flex shrink-0 items-center justify-between gap-4 bg-ink px-5 py-4 text-cream sm:px-6">
                        <div
                            className="flex min-w-0 items-center gap-3 cursor-move select-none"
                            onPointerDown={(event) => startDrag("panel", event)}
                            onPointerMove={moveDrag}
                            onPointerUp={endDrag}
                            onPointerCancel={endDrag}
                            onLostPointerCapture={endDrag}
                            title="Drag to move messages"
                        >
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-copper text-white">
                                <MessageCircle size={22} />
                            </div>

                            <div className="min-w-0">
                                <h2 className="font-display text-xl font-bold">
                                    Messages
                                </h2>
                                <p className="text-xs text-cream/70">
                                    Your Craftad conversations
                                </p>
                            </div>
                        </div>

                        {!fullPage && (
                            <button
                                type="button"
                                onClick={closeInbox}
                                aria-label="Close messages"
                                className="rounded-full p-2 transition hover:bg-white/10"
                            >
                                <X size={22} />
                            </button>
                        )}
                    </header>

                    {/* Inbox and negotiation area */}
                    <div className="flex min-h-0 flex-1">

                        {/* Conversation sidebar */}
                        <aside
                            className={`flex w-full shrink-0 flex-col border-r border-line bg-paper ${
                                fullPage ? "md:w-[320px]" : "md:w-full"
                            } ${
                                selectedConversation && !fullPage ? "hidden" : ""
                            }`}
                        >
                            {/* Search */}
                            <div className="border-b border-line p-4">
                                <div className="flex items-center gap-3 rounded-full bg-cream px-4 py-3">
                                    <Search
                                        size={18}
                                        className="shrink-0 text-muted"
                                    />

                                    <input
                                        type="search"
                                        value={search}
                                        onChange={(event) =>
                                            setSearch(event.target.value)
                                        }
                                        placeholder="Search conversations..."
                                        className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-muted"
                                    />
                                </div>

                                {/* Filters */}
                                <div className="mt-4 flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setFilter("all")}
                                        className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                                            filter === "all"
                                                ? "bg-copper text-white"
                                                : "bg-cream text-muted hover:text-ink"
                                        }`}
                                    >
                                        All messages
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setFilter("active")}
                                        className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                                            filter === "active"
                                                ? "bg-copper text-white"
                                                : "bg-cream text-muted hover:text-ink"
                                        }`}
                                    >
                                        Active
                                    </button>
                                </div>
                            </div>

                            {/* Conversation list */}
                            <div className="min-h-0 flex-1 overflow-y-auto">
                                {loading ? (
                                    <div className="flex items-center justify-center gap-2 p-10 text-sm text-muted">
                                        <LoaderCircle
                                            size={18}
                                            className="animate-spin"
                                        />
                                        Loading conversations...
                                    </div>
                                ) : error ? (
                                    <div className="p-5">
                                        <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                            {error}
                                        </p>
                                    </div>
                                ) : filteredConversations.length === 0 ? (
                                    <div className="px-6 py-16 text-center">
                                        <MessageSquare
                                            size={34}
                                            className="mx-auto text-copper"
                                        />

                                        <p className="mt-3 font-semibold text-ink">
                                            {search
                                                ? "No matching conversations"
                                                : "No conversations yet"}
                                        </p>

                                        <p className="mt-2 text-sm text-muted">
                                            {search
                                                ? "Try another name or job title."
                                                : "Your customer and artisan conversations will appear here."}
                                        </p>
                                    </div>
                                ) : (
                                    <ul className="divide-y divide-line">
                                        {filteredConversations.map(
                                            (conversation) => {
                                                const participant =
                                                    getOtherParticipant(
                                                        conversation
                                                    );

                                                const application =
                                                    conversation.application;

                                                const job = conversation.job;

                                                const participantName =
                                                    participant?.fullName ||
                                                    "Conversation participant";

                                                const isSelected =
                                                    getId(
                                                        selectedConversation
                                                    ) === getId(conversation);

                                                return (
                                                    <li key={conversation._id}>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setSelectedConversation(
                                                                    conversation
                                                                )
                                                            }
                                                            className={`flex w-full items-center gap-3 px-4 py-4 text-left transition hover:bg-cream ${
                                                                isSelected
                                                                    ? "bg-cream"
                                                                    : ""
                                                            }`}
                                                        >
                                                            {/* Participant avatar */}
                                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-copper/10 text-sm font-bold text-copper">
                                                                {getInitials(
                                                                    participantName
                                                                )}
                                                            </div>

                                                            {/* Conversation details */}
                                                            <div className="min-w-0 flex-1">
                                                                <div className="flex items-center justify-between gap-2">
                                                                    <p className="truncate text-sm font-semibold text-ink">
                                                                        {participantName}
                                                                    </p>

                                                                    <span className="shrink-0 text-[10px] text-muted">
                                                                        {formatTime(
                                                                            conversation.lastMessageAt
                                                                        )}
                                                                    </span>
                                                                </div>

                                                                <p className="mt-1 truncate text-xs font-medium text-copper-deep">
                                                                    {job?.title ||
                                                                        "Job conversation"}
                                                                </p>

                                                                <p className="mt-1 truncate text-xs text-muted">
                                                                    {getLastMessage(
                                                                        conversation
                                                                    )}
                                                                </p>
                                                            </div>

                                                            <span
                                                                className={`h-2 w-2 shrink-0 rounded-full ${
                                                                    CLOSED_STATUSES.includes(
                                                                        application?.status
                                                                    )
                                                                        ? "bg-line"
                                                                        : "bg-copper"
                                                                }`}
                                                                title={
                                                                    application?.status?.replaceAll(
                                                                        "_",
                                                                        " "
                                                                    ) || "Pending"
                                                                }
                                                            />
                                                        </button>
                                                    </li>
                                                );
                                            }
                                        )}
                                    </ul>
                                )}
                            </div>

                            <footer className="shrink-0 border-t border-line bg-cream px-4 py-3">
                                <p className="text-center text-xs text-muted">
                                    Private customer and artisan conversations
                                </p>
                            </footer>
                        </aside>

                        {/* Selected conversation */}
                        <div
                            className={`min-w-0 flex-1 flex-col bg-paper ${
                                selectedConversation
                                    ? "flex"
                                    : fullPage
                                      ? "hidden md:flex"
                                      : "hidden"
                            }`}
                        >
                            {selectedConversation ? (
                                <>
                                    {/* Return to the list in compact and mobile layouts */}
                                    <button
                                        type="button"
                                        onClick={returnToInbox}
                                        className={`flex shrink-0 items-center gap-2 border-b border-line bg-cream px-4 py-3 text-sm font-semibold text-ink ${
                                            fullPage ? "md:hidden" : ""
                                        }`}
                                    >
                                        <ArrowLeft size={18} />
                                        All messages
                                    </button>

                                    <div className="min-h-0 flex-1">
                                        <FloatingNegotiationChat
                                            token={token}
                                            user={user}
                                            application={
                                                selectedConversation.application
                                            }
                                            job={selectedConversation.job}
                                            initialConversation={
                                                selectedConversation
                                            }
                                            initiallyOpen={true}
                                            showLauncher={false}
                                            embedded={true}
                                            onClose={returnToInbox}
                                        />
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
                                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-copper/10 text-copper">
                                        <MessageCircle size={36} />
                                    </div>

                                    <h3 className="mt-5 font-display text-xl font-bold text-ink">
                                        Your messages
                                    </h3>

                                    <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted">
                                        Select a conversation to discuss a job,
                                        exchange messages and negotiate a fair
                                        price.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            )}

            {/* Global floating inbox launcher */}
            {!open && !fullPage && (
                <button
                    type="button"
                    onClick={() => {
                        if (suppressLauncherClick.current) {
                            suppressLauncherClick.current = false;
                            return;
                        }

                        setOpen(true);
                    }}
                    onPointerDown={(event) => startDrag("launcher", event)}
                    onPointerMove={moveDrag}
                    onPointerUp={endDrag}
                    onPointerCancel={endDrag}
                    onLostPointerCapture={endDrag}
                    style={
                        launcherPosition
                            ? {
                                  left: `${launcherPosition.x}px`,
                                  top: `${launcherPosition.y}px`,
                              }
                            : undefined
                    }
                    aria-label="Open messages"
                    title="Drag to move messages button"
                    className={`fixed z-[85] flex h-14 w-14 items-center justify-center rounded-full bg-copper text-white shadow-xl transition hover:bg-copper-deep ${
                        launcherPosition ? "" : "bottom-5 right-5 max-sm:bottom-4 max-sm:right-4"
                    }`}
                >
                    <MessageCircle size={25} />
                </button>
            )}
        </>
    );
}
