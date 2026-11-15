
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSocket } from "../socket";
import {
    MessageSquare,
    X,
    Minus,
    Send,
    HandCoins,
    CheckCircle2,
    Check,
    CheckCheck,
    LoaderCircle,
} from "lucide-react";
import { craftad, listOf } from "../api";

function formatMoney(amount) {
    return `₦${Number(amount || 0).toLocaleString("en-NG")}`;
}

function getId(value) {
    if (!value) return "";
    if (typeof value === "string") return value;
    return value._id || value.id || "";
}

function getErrorMessage(error) {
    return error?.message || "Something went wrong. Please try again.";
}

export function FloatingNegotiationChat({
                                            token,
                                            user,
                                            application,
                                            job,
                                            onAccepted,
                                            initialConversation = null,
                                            initiallyOpen = true,
                                            openSignal = 0,
                                            showLauncher = true,
                                            embedded = false,
                                            onClose,
                                        }) {
    // Socket and component state
    const socket = useSocket();
    const [presence, setPresence] = useState(null);

    const [isOpen, setIsOpen] = useState(initiallyOpen);
    const [conversation, setConversation] = useState(initialConversation);
    const [messages, setMessages] = useState([]);
    const [offers, setOffers] = useState([]);
    const [messageText, setMessageText] = useState("");
    const [offerAmount, setOfferAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [accepting, setAccepting] = useState(false);
    const [error, setError] = useState("");

    // Open the chat when the parent sends a new open signal.
    useEffect(() => {
        setIsOpen(true);
    }, [openSignal]);

    // Participant and application information
    const applicationId = getId(application);
    const currentUserId = getId(user);
    const applicationStatus = application?.status || "pending";

    const isCustomer = user?.role === "customer";
    const isArtisan = user?.role === "artisan";

    const customerParticipant =
        conversation?.customer || (isCustomer ? user : null);

    const artisanParticipant =
        conversation?.artisan ||
        application?.artisan ||
        (isArtisan ? user : null);

    const customerId = getId(customerParticipant);
    const artisanId = getId(artisanParticipant);

    const otherParticipantId =
        currentUserId === customerId ? artisanId : customerId;

    const isValidParticipant =
        (isCustomer && currentUserId === customerId) ||
        (isArtisan && currentUserId === artisanId);

    const isClosed =
        ["accepted", "rejected", "withdrawn", "price_agreed"].includes(
            applicationStatus
        ) || job?.status !== "open";

    // Offer information
    const latestOffer = useMemo(() => {
        const pending = offers.filter(
            (offer) => offer.status === "pending"
        );

        return pending.length
            ? pending[pending.length - 1]
            : null;
    }, [offers]);

    const latestOfferMaker = getId(latestOffer?.proposedBy);

    const isMyTurn = !latestOffer
        ? isArtisan && applicationStatus === "pending"
        : latestOfferMaker !== currentUserId;

    const expectedOfferMaker = isCustomer ? artisanId : customerId;

    const canAccept =
        !isClosed &&
        isValidParticipant &&
        latestOffer?.status === "pending" &&
        latestOfferMaker !== currentUserId &&
        latestOfferMaker === expectedOfferMaker;

    const offerById = useMemo(() => {
        const map = new Map();

        offers.forEach((offer) => {
            map.set(getId(offer), offer);
        });

        return map;
    }, [offers]);

    // Close or minimize the chat.
    function handleCloseChat() {
        if (!showLauncher && onClose) {
            onClose();
            return;
        }

        setIsOpen(false);
    }

    // Fetch messages and price offers.
    const refresh = useCallback(
        async (conversationId, showLoading = false) => {
            if (!conversationId) return;

            if (showLoading) {
                setLoading(true);
            }

            try {
                const [messageResponse, offerResponse] =
                    await Promise.all([
                        craftad.conversationMessages(
                            token,
                            conversationId
                        ),
                        craftad.priceOffers(token, applicationId),
                    ]);

                setMessages(listOf(messageResponse, ["messages"]));
                setOffers(
                    listOf(offerResponse, ["data", "offers"])
                );
                setError("");
            } catch (err) {
                setError(getErrorMessage(err));
            } finally {
                if (showLoading) {
                    setLoading(false);
                }
            }
        },
        [token, applicationId]
    );

    // Initialize the conversation when the chat opens.
    useEffect(() => {
        if (!isOpen || !token || !applicationId) return;

        let cancelled = false;

        async function initialize() {
            setLoading(true);
            setError("");

            try {
                const response = initialConversation
                    ? null
                    : await craftad.getOrCreateConversation(
                        token,
                        applicationId
                    );

                const foundConversation =
                    initialConversation || response?.conversation;

                if (!foundConversation?._id) {
                    throw new Error(
                        "The negotiation conversation could not be opened."
                    );
                }

                if (cancelled) return;

                setConversation(foundConversation);

                const [messageResponse, offerResponse] =
                    await Promise.all([
                        craftad.conversationMessages(
                            token,
                            foundConversation._id
                        ),
                        craftad.priceOffers(token, applicationId),
                    ]);

                if (cancelled) return;

                setMessages(listOf(messageResponse, ["messages"]));
                setOffers(
                    listOf(offerResponse, ["data", "offers"])
                );
            } catch (err) {
                if (!cancelled) {
                    setError(getErrorMessage(err));
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        initialize();

        return () => {
            cancelled = true;
        };
    }, [isOpen, token, applicationId, initialConversation]);

    // Keep the existing REST refresh as a fallback.
    useEffect(() => {
        if (!isOpen || !conversation?._id) return;

        const interval = setInterval(() => {
            refresh(conversation._id);
        }, 1000000);

        return () => clearInterval(interval);
    }, [isOpen, conversation?._id, refresh]);

    // Subscribe to presence only when the chat is open
    // and the current user is a conversation participant.
    useEffect(() => {
        setPresence(null);

        if (
            !socket ||
            !isOpen ||
            !conversation?._id ||
            !otherParticipantId ||
            !isValidParticipant
        ) {
            return;
        }

        const conversationId = String(conversation._id);

        const subscribe = () => {
            socket.emit("subscribe_conversation_presence", {
                conversationId,
            });
        };

        const handlePresence = (data) => {
            if (
                String(data?.conversationId) !== conversationId ||
                String(data?.userId) !== otherParticipantId
            ) {
                return;
            }

            setPresence({
                isOnline: Boolean(data.isOnline),
                lastSeen: data.lastSeen || null,
            });
        };

        const handlePresenceError = (data) => {
            console.error(
                "Presence subscription error:",
                data?.message
            );
        };

        socket.on("presence_snapshot", handlePresence);
        socket.on("user_presence_changed", handlePresence);
        socket.on("presence_error", handlePresenceError);
        socket.on("connect", subscribe);

        if (socket.connected) {
            subscribe();
        }

        return () => {
            socket.off("presence_snapshot", handlePresence);
            socket.off("user_presence_changed", handlePresence);
            socket.off("presence_error", handlePresenceError);
            socket.off("connect", subscribe);

            if (socket.connected) {
                socket.emit("unsubscribe_conversation_presence", {
                    conversationId,
                });
            }
        };
    }, [
        socket,
        isOpen,
        conversation?._id,
        otherParticipantId,
        isValidParticipant,
    ]);

    // Listen for backend read receipts.
    // Only the other participant reading our messages
    // should update our sent-message indicators.
    useEffect(() => {
        if (
            !socket ||
            !isOpen ||
            !conversation?._id ||
            !isValidParticipant
        ) {
            return;
        }

        const conversationId = String(conversation._id);

        const handleMessagesRead = (data) => {
            if (
                String(data?.conversationId) !== conversationId ||
                String(data?.readBy) !== otherParticipantId
            ) {
                return;
            }

            const readMessageIds = new Set(
                (data.messageIds || []).map(String)
            );

            if (readMessageIds.size === 0) return;

            setMessages((currentMessages) =>
                currentMessages.map((message) =>
                    readMessageIds.has(String(message._id))
                        ? { ...message, isRead: true }
                        : message
                )
            );
        };

        socket.on("messages_read", handleMessagesRead);

        return () => {
            socket.off("messages_read", handleMessagesRead);
        };
    }, [
        socket,
        isOpen,
        conversation?._id,
        isValidParticipant,
        otherParticipantId,
    ]);

    // Render the appropriate sent/read indicator.
    function renderReadReceipt(message, mine) {
        if (!mine) return null;

        return message.isRead ? (
            <CheckCheck
                size={14}
                className="text-sky-400"
                aria-label="Read"
                title="Read"
            />
        ) : (
            <Check
                size={14}
                className="text-cream/50"
                aria-label="Sent"
                title="Sent"
            />
        );
    }

    // Send a normal chat message.
    async function handleSendMessage(event) {
        event.preventDefault();

        const text = messageText.trim();

        if (!text || !conversation?._id || sending) return;

        setSending(true);
        setError("");

        try {
            await craftad.sendConversationMessage(
                token,
                conversation._id,
                text
            );

            setMessageText("");
            await refresh(conversation._id);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setSending(false);
        }
    }

    // Submit a price offer or counteroffer.
    async function handleSubmitOffer(event) {
        event.preventDefault();

        const amount = Number(offerAmount);

        if (!Number.isFinite(amount) || amount < 5000) {
            setError("The minimum price offer is ₦5,000.");
            return;
        }

        if (!isMyTurn || sending) return;

        setSending(true);
        setError("");

        try {
            await craftad.submitPriceOffer(
                token,
                applicationId,
                amount
            );

            setOfferAmount("");
            await refresh(conversation?._id);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setSending(false);
        }
    }

    // Accept the other participant's price offer.
    async function handleAcceptOffer() {
        if (!canAccept || accepting) return;

        const offerMaker = isCustomer ? "artisan" : "customer";

        const confirmed = window.confirm(
            `Accept the ${offerMaker}'s offer of ${formatMoney(
                latestOffer.amount
            )}?\n\nThe customer will pay this amount from their wallet, and it will be locked in escrow.`
        );

        if (!confirmed) return;

        setAccepting(true);
        setError("");

        try {
            await craftad.acceptApplication(token, applicationId);
            await refresh(conversation?._id);

            if (onAccepted) {
                await onAccepted();
            }
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setAccepting(false);
        }
    }

    // Render a price offer as a chat message.
    function renderOffer(message) {
        const offerId = getId(message.priceOffer);
        const offer = offerById.get(offerId);
        const senderId = getId(message.sender);
        const mine = senderId === currentUserId;

        return (
            <div
                key={message._id}
                className={`my-3 max-w-[92%] rounded-2xl border p-4 ${
                    mine
                        ? "ml-auto border-copper/30 bg-copper/10"
                        : "mr-auto border-line bg-cream"
                }`}
            >
                <div className="flex items-center gap-2 text-xs font-semibold text-muted">
                    <HandCoins size={15} />
                    {message.sender?.fullName ||
                        (mine ? user?.fullName : "Participant")}
                    {" · "}
                    {message.sender?.role ||
                        (mine ? user?.role : "participant")}
                </div>

                <p className="mt-2 font-display text-2xl font-bold text-copper-deep">
                    {offer ? formatMoney(offer.amount) : message.text}
                </p>

                {offer && (
                    <p className="mt-1 text-xs capitalize text-muted">
                        Offer status: {offer.status}
                    </p>
                )}

                <div className="mt-2 flex items-center justify-end gap-1">
                    <span className="text-[10px] text-muted">
                        {message.createdAt
                            ? new Date(
                                message.createdAt
                            ).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                            })
                            : ""}
                    </span>

                    {renderReadReceipt(message, mine)}
                </div>
            </div>
        );
    }

    if (!applicationId) return null;

    return (
        <div
            className={
                embedded
                    ? "relative flex h-full w-full flex-col"
                    : "fixed bottom-5 right-5 z-[80] flex flex-col items-end max-sm:bottom-0 max-sm:right-0 max-sm:left-0"
            }
        >
            {isOpen && (
                <section
                    className={
                        embedded
                            ? "flex h-full w-full flex-col overflow-hidden bg-paper"
                            : "mb-3 flex h-[min(680px,78vh)] w-[min(420px,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl border border-line bg-paper shadow-2xl max-sm:mb-0 max-sm:h-[85dvh] max-sm:w-full max-sm:rounded-b-none max-sm:rounded-t-3xl"
                    }
                >
                    <header className="relative flex shrink-0 items-center justify-between gap-3 overflow-hidden border-b border-white/10 bg-ink px-5 py-5 text-cream">
                        <div className="min-w-0">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-copper">
                                CRAFTAD <span className="text-cream/50">/</span> PRIVATE NEGOTIATION
                            </p>

                            <h3 className="mt-2 truncate font-display text-xl font-semibold tracking-tight">
                                {job?.title || "Private conversation"}
                            </h3>

                            <p className="mt-2 text-xs leading-relaxed text-cream/75">
                                Customer:{" "}
                                {customerParticipant?.fullName ||
                                    "Loading name"}
                                {" · "}
                                Artisan:{" "}
                                {artisanParticipant?.fullName ||
                                    "Loading name"}
                            </p>

                            <p className="mt-0.5 text-[10px] capitalize text-cream/50">
                                {customerParticipant?.role || "customer"}
                                {" · "}
                                {artisanParticipant?.role || "artisan"}
                            </p>

                            <p className="mt-3 flex items-center gap-2 text-xs font-medium text-cream/80">
                                <span
                                    className={`h-2.5 w-2.5 rounded-full ring-2 ring-white/10 ${
                                        presence?.isOnline
                                            ? "bg-emerald-400"
                                            : "bg-muted"
                                    }`}
                                />

                                {presence === null
                                    ? "Checking status..."
                                    : presence.isOnline
                                        ? "Online"
                                        : `Offline${
                                            presence.lastSeen
                                                ? ` · Last seen ${new Date(
                                                    presence.lastSeen
                                                ).toLocaleString()}`
                                                : ""
                                        }`}
                            </p>
                        </div>

                        <div className="flex shrink-0 items-center gap-1">
                            <button
                                type="button"
                                onClick={handleCloseChat}
                                aria-label="Minimize chat"
                                className="rounded-xl border border-white/10 p-2.5 text-cream/75 transition-colors hover:bg-white/10 hover:text-white"
                            >
                                <Minus size={18} />
                            </button>

                            <button
                                type="button"
                                onClick={handleCloseChat}
                                aria-label="Close chat"
                                className="rounded-xl border border-white/10 p-2.5 text-cream/75 transition-colors hover:bg-white/10 hover:text-white"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </header>

                    <div className="border-b border-line bg-cream px-5 py-3">
                        <p className="text-xs leading-relaxed text-muted">
                            {isClosed
                                ? "Use this private chat to coordinate details and communicate about the job."
                                : "Discuss the work, ask questions, and agree on a fair price before the job is assigned."}
                        </p>
                    </div>

                    <div className="flex-1 space-y-4 overflow-y-auto bg-paper p-4 sm:p-5">
                        {loading && messages.length === 0 && (
                            <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted">
                                <LoaderCircle
                                    size={17}
                                    className="animate-spin"
                                />
                                Loading conversation…
                            </div>
                        )}

                        {!loading &&
                            messages.length === 0 &&
                            !error && (
                                <div className="py-10 text-center">
                                    <MessageSquare
                                        className="mx-auto text-copper"
                                        size={28}
                                    />

                                    <p className="mt-3 font-semibold text-ink">
                                        Start the conversation
                                    </p>

                                    <p className="mt-1 text-xs text-muted">
                                        Send a message or submit the first
                                        price offer.
                                    </p>
                                </div>
                            )}

                        {messages.map((item) => {
                            if (item.type === "price_offer") {
                                return renderOffer(item);
                            }

                            const senderId = getId(item.sender);
                            const mine = senderId === currentUserId;

                            return (
                                <div
                                    key={item._id}
                                    className={`max-w-[88%] rounded-2xl px-4 py-3.5 text-sm leading-7 shadow-sm ${
                                        mine
                                            ? "ml-auto rounded-br-md border border-ink bg-ink text-cream"
                                            : "mr-auto rounded-bl-md border border-line bg-cream text-ink"
                                    }`}
                                >
                                    <p
                                        className={`mb-1.5 text-[10px] font-semibold uppercase tracking-wide ${
                                            mine
                                                ? "text-cream/70"
                                                : "text-copper-deep"
                                        }`}
                                    >
                                        {item.sender?.fullName ||
                                            (mine
                                                ? user?.fullName
                                                : "Participant")}
                                        {" · "}
                                        {item.sender?.role ||
                                            (mine
                                                ? user?.role
                                                : "participant")}
                                    </p>

                                    <p className="whitespace-pre-wrap break-words">
                                        {item.text}
                                    </p>

                                    <div className="mt-1.5 flex items-center justify-end gap-1">
                                        <span
                                            className={`text-[10px] tracking-wide ${
                                                mine
                                                    ? "text-cream/50"
                                                    : "text-muted"
                                            }`}
                                        >
                                            {item.createdAt
                                                ? new Date(
                                                    item.createdAt
                                                ).toLocaleTimeString(
                                                    [],
                                                    {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    }
                                                )
                                                : ""}
                                        </span>

                                        {renderReadReceipt(item, mine)}
                                    </div>
                                </div>
                            );
                        })}

                        {latestOffer && (
                            <div className="rounded-2xl border border-copper/25 bg-cream p-5 shadow-sm">
                                <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-copper">
                                    <HandCoins size={15} />
                                    Current pending offer
                                </p>

                                <p className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink">
                                    {formatMoney(latestOffer.amount)}
                                </p>

                                {canAccept && (
                                    <button
                                        type="button"
                                        onClick={handleAcceptOffer}
                                        disabled={accepting}
                                        className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-pine px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-pine/90 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {accepting ? (
                                            <LoaderCircle
                                                size={16}
                                                className="animate-spin"
                                            />
                                        ) : (
                                            <CheckCircle2 size={16} />
                                        )}

                                        Accept offer and fund escrow
                                    </button>
                                )}

                                {!isMyTurn && (
                                    <p className="mt-2 text-xs text-muted">
                                        Waiting for the other participant
                                        to respond to this offer.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
                            {error}
                        </div>
                    )}

                    {!isClosed && isMyTurn && (
                        <form
                            onSubmit={handleSubmitOffer}
                            className="border-t border-line bg-cream/80 p-4"
                        >
                            <label className="mb-1.5 block text-xs font-semibold text-ink">
                                {latestOffer
                                    ? "Submit a counteroffer (₦)"
                                    : "Your price offer (₦)"}
                            </label>

                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    min="5000"
                                    step="1"
                                    required
                                    value={offerAmount}
                                    onChange={(event) =>
                                        setOfferAmount(event.target.value)
                                    }
                                    placeholder="Minimum ₦5,000"
                                    className="min-w-0 flex-1 rounded-xl border border-line bg-paper px-4 py-3 text-sm text-ink outline-none transition-shadow focus:border-copper focus:ring-2 focus:ring-copper/10"
                                />

                                <button
                                    type="submit"
                                    disabled={sending}
                                    className="flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-copper px-5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-copper-deep disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {sending ? "Sending…" : "Offer"}
                                </button>
                            </div>
                        </form>
                    )}

                    <form
                        onSubmit={handleSendMessage}
                        className="flex shrink-0 items-end gap-3 border-t border-line bg-cream/80 p-4"
                    >
                        <textarea
                            rows={1}
                            maxLength={5000}
                            value={messageText}
                            onChange={(event) =>
                                setMessageText(event.target.value)
                            }
                            placeholder="Write a message…"
                            className="max-h-32 min-h-12 min-w-0 flex-1 resize-y rounded-2xl border border-line bg-paper px-4 py-3.5 text-sm leading-relaxed text-ink outline-none transition-shadow focus:border-copper focus:ring-2 focus:ring-copper/10"
                        />

                        <button
                            type="submit"
                            disabled={sending || !messageText.trim()}
                            aria-label="Send message"
                            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-copper text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-copper-deep disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
                        >
                            <Send size={17} />
                        </button>
                    </form>
                </section>
            )}

            {showLauncher && (
                <button
                    type="button"
                    onClick={() =>
                        setIsOpen((current) => !current)
                    }
                    className="flex min-h-14 items-center gap-3 rounded-full bg-copper px-6 text-sm font-bold text-white shadow-xl transition hover:-translate-y-0.5 hover:bg-copper-deep max-sm:mb-4 max-sm:mr-4"
                >
                    <MessageSquare size={20} />
                    {isOpen ? "Minimize chat" : "Open chat"}
                </button>
            )}
        </div>
    );
}
