import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSocket } from "../socket";
import {
    Check,
    CheckCheck,
    CheckCircle2,
    HandCoins,
    LoaderCircle,
    MessageSquare,
    Minus,
    Paperclip,
    Send,
    X,
} from "lucide-react";
const MAX_MEDIA_FILES = 5;
const MAX_MEDIA_SIZE = 50 * 1024 * 1024;

const ALLOWED_MEDIA_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "video/mp4",
    "video/quicktime",
    "video/webm",
];
import { craftad, listOf } from "../api";

function formatMoney(amount) {
    return `₦${Number(amount || 0).toLocaleString("en-NG")}`;
}

function getId(value) {
    if (!value) return "";
    if (typeof value === "string") return value;
    return String(value._id || value.id || "");
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
     onOfferUpdated,
     initialConversation = null,
     initiallyOpen = true,
     openSignal = 0,
     showLauncher = true,
     embedded = false,
     onClose,
 }) {

    const socket = useSocket();
    const [presence, setPresence] = useState(null);

    const [isOpen, setIsOpen] = useState(initiallyOpen);
    const [conversation, setConversation] = useState(initialConversation);
    const [messages, setMessages] = useState([]);
    const [offers, setOffers] = useState([]);
    const [messageText, setMessageText] = useState("");
    const [offerAmount, setOfferAmount] = useState("");
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [mediaPreviews, setMediaPreviews] = useState([]);
    const fileInputRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [accepting, setAccepting] = useState(false);
    const [error, setError] = useState("");

    const messagesEndRef = useRef(null);
    // Generate local previews and release browser memory when files change.
    useEffect(() => {
        const nextPreviews = selectedFiles.map((file) => ({
            file,
            url: URL.createObjectURL(file),
        }));

        setMediaPreviews(nextPreviews);

        return () => {
            nextPreviews.forEach((preview) => {
                URL.revokeObjectURL(preview.url);
            });
        };
    }, [selectedFiles]);

    // Open the chat when the parent sends a new open signal.
    useEffect(() => {
        if (openSignal > 0) {
            setIsOpen(true);
        }
    }, [openSignal]);

    // Sync initialConversation if parent switches threads in ChatLauncher
    useEffect(() => {
        if (initialConversation) {
            setConversation(initialConversation);
        }
    }, [initialConversation]);

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

    const isClosed = Boolean(conversation?.isClosed);

    // Offer information
    const latestOffer = useMemo(() => {
        const pending = offers.filter((offer) => offer.status === "pending");
        return pending.length ? pending[pending.length - 1] : null;
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

    // Auto-scroll to newest message
    useEffect(() => {
        if (!isOpen) return;
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages.length, latestOffer?._id, isOpen]);

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
                const [messageResponse, offerResponse] = await Promise.all([
                    craftad.conversationMessages(token, conversationId),
                    craftad.priceOffers(token, applicationId),
                ]);

                setMessages(listOf(messageResponse, ["messages"]));
                setOffers(listOf(offerResponse, ["data", "offers"]));
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
                    : await craftad.getOrCreateConversation(token, applicationId);

                const foundConversation =
                    initialConversation || response?.conversation;

                if (!foundConversation?._id) {
                    throw new Error(
                        "The negotiation conversation could not be opened."
                    );
                }

                if (cancelled) return;

                setConversation(foundConversation);

                const [messageResponse, offerResponse] = await Promise.all([
                    craftad.conversationMessages(token, foundConversation._id),
                    craftad.priceOffers(token, applicationId),
                ]);

                if (cancelled) return;

                setMessages(listOf(messageResponse, ["messages"]));
                setOffers(listOf(offerResponse, ["data", "offers"]));
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

    // Periodic REST sync fallback (every 15 seconds while open)
    useEffect(() => {
        if (!isOpen || !conversation?._id) return;

        const interval = setInterval(() => {
            refresh(conversation._id);
        }, 15000);

        return () => clearInterval(interval);
    }, [isOpen, conversation?._id, refresh]);

    // Subscribe to presence & real-time conversation events
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

        const handleIncomingSync = (data) => {
            const eventConvId = String(
                data?.conversationId || data?.conversation?._id || ""
            );
            if (!eventConvId || eventConvId === conversationId) {
                refresh(conversationId);
            }
        };

        const handlePresenceError = (data) => {
            console.error("Presence subscription error:", data?.message);
        };

        socket.on("presence_snapshot", handlePresence);
        socket.on("user_presence_changed", handlePresence);
        socket.on("presence_error", handlePresenceError);
        socket.on("new_message", handleIncomingSync);
        socket.on("price_offer_created", handleIncomingSync);
        socket.on("price_offer_updated", handleIncomingSync);
        socket.on("connect", subscribe);

        if (socket.connected) {
            subscribe();
        }

        return () => {
            socket.off("presence_snapshot", handlePresence);
            socket.off("user_presence_changed", handlePresence);
            socket.off("presence_error", handlePresenceError);
            socket.off("new_message", handleIncomingSync);
            socket.off("price_offer_created", handleIncomingSync);
            socket.off("price_offer_updated", handleIncomingSync);
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
        refresh,
    ]);

    // Listen for backend read receipts.
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

    function renderReadReceipt(message, mine) {
        if (!mine) return null;

        return message.isRead ? (
            <CheckCheck
                size={14}
                className="text-sky-300"
                aria-label="Read"
                title="Read"
            />
        ) : (
            <Check
                size={14}
                className="text-white/70"
                aria-label="Sent"
                title="Sent"
            />
        );
    }
    function handleFileSelection(event) {
        const incomingFiles = Array.from(event.target.files || []);

        // Allow selecting the same file again later.
        event.target.value = "";

        if (!incomingFiles.length) return;

        setError("");

        const remainingSlots = MAX_MEDIA_FILES - selectedFiles.length;

        if (incomingFiles.length > remainingSlots) {
            setError(
                `You can attach a maximum of ${MAX_MEDIA_FILES} files per message.`
            );
            return;
        }

        const invalidFile = incomingFiles.find(
            (file) => !ALLOWED_MEDIA_TYPES.includes(file.type)
        );

        if (invalidFile) {
            setError(
                `${invalidFile.name} has an unsupported format. Use JPEG, PNG, WebP, MP4, MOV, or WebM.`
            );
            return;
        }

        const oversizedFile = incomingFiles.find(
            (file) => file.size > MAX_MEDIA_SIZE
        );

        if (oversizedFile) {
            setError(`${oversizedFile.name} exceeds the 50 MB file limit.`);
            return;
        }

        setSelectedFiles((previous) => [...previous, ...incomingFiles]);
    }

    function handleRemoveSelectedFile(index) {
        setSelectedFiles((previous) =>
            previous.filter((_, fileIndex) => fileIndex !== index)
        );
    }

    async function handleSendMessage(event) {
        event?.preventDefault();

        const text = messageText.trim();
        const hasAttachments = selectedFiles.length > 0;

        if ((!text && !hasAttachments) || !conversation?._id || sending) {
            return;
        }

        setSending(true);
        setError("");

        try {
            if (hasAttachments) {
                const formData = new FormData();

                selectedFiles.forEach((file) => {
                    formData.append("media", file);
                });

                if (text) {
                    formData.append("text", text);
                }

                await craftad.sendConversationMedia(
                    token,
                    conversation._id,
                    formData
                );

                setSelectedFiles([]);
            } else {
                await craftad.sendConversationMessage(
                    token,
                    conversation._id,
                    text
                );
            }

            setMessageText("");

            await refresh(conversation._id);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setSending(false);
        }
    }

    function handleComposerKeyDown(event) {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            handleSendMessage();
        }
    }

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
            await craftad.submitPriceOffer(token, applicationId, amount);
            setOfferAmount("");
            await refresh(conversation?._id);

            if (onOfferUpdated) {
                await onOfferUpdated();
            }
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setSending(false);
        }
    }

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

    function renderOffer(message) {
        const offerId = getId(message.priceOffer);

        const populatedOffer =
            message.priceOffer &&
            typeof message.priceOffer === "object" &&
            message.priceOffer.amount != null
                ? message.priceOffer
                : null;

        const offer = populatedOffer || offerById.get(offerId);
        const senderId = getId(message.sender);
        const mine = senderId === currentUserId;

        return (
            <div
                key={message._id}
                className={`my-3 max-w-[92%] rounded-2xl border p-4 shadow-sm ${
                    mine
                        ? "ml-auto border-copper/35 bg-copper/12"
                        : "mr-auto border-line bg-cream"
                }`}
            >
                <div className="flex items-center gap-2 text-xs font-semibold text-muted">
                    <HandCoins size={15} className="text-copper" />
                    <span>
            {message.sender?.fullName ||
                (mine ? user?.fullName : "Participant")}
                        {" · "}
                        {message.sender?.role ||
                            (mine ? user?.role : "participant")}
          </span>
                </div>

                <p className="mt-2 font-display text-2xl font-bold text-copper">
                    {offer ? formatMoney(offer.amount) : message.text}
                </p>

                {offer && (
                    <p className="mt-1 text-xs capitalize text-muted">
                        Offer status: <span className="font-semibold text-ink">{offer.status}</span>
                    </p>
                )}

                <div className="mt-2 flex items-center justify-end gap-1.5">
          <span className="text-[10px] text-muted">
            {message.createdAt
                ? new Date(message.createdAt).toLocaleTimeString([], {
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
                    : "fixed bottom-5 right-5 z-[80] flex flex-col items-end max-sm:bottom-0 max-sm:left-0 max-sm:right-0"
            }
        >
            {isOpen && (
                <section
                    className={
                        embedded
                            ? "flex h-full w-full flex-col overflow-hidden bg-paper"
                            : "mb-3 flex h-[min(680px,78vh)] w-[min(420px,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl border border-line bg-paper shadow-raised max-sm:mb-0 max-sm:h-[85dvh] max-sm:w-full max-sm:rounded-b-none max-sm:rounded-t-3xl"
                    }
                >
                    {/* Header (explicit dark espresso palette so dark-mode tokens don't invert it) */}
                    <header className="relative flex shrink-0 items-start justify-between gap-3 overflow-hidden border-b border-white/10 bg-[#1A1715] px-5 py-4 text-[#FAF6EF]">
                        <div className="min-w-0">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#E07A4F]">
                                CRAFTAD <span className="text-[#FAF6EF]/45">/</span> PRIVATE NEGOTIATION
                            </p>

                            <h3 className="mt-1.5 truncate font-display text-lg font-semibold tracking-tight text-white sm:text-xl">
                                {job?.title || "Private conversation"}
                            </h3>

                            <p className="mt-1.5 text-xs leading-relaxed text-[#FAF6EF]/75">
                                Customer:{" "}
                                <span className="font-medium text-white">
                  {customerParticipant?.fullName || "Loading..."}
                </span>
                                {" · "}
                                Artisan:{" "}
                                <span className="font-medium text-white">
                  {artisanParticipant?.fullName || "Loading..."}
                </span>
                            </p>

                            <p className="mt-2 flex items-center gap-2 text-xs font-medium text-[#FAF6EF]/85">
                <span
                    className={`h-2 w-2 rounded-full ring-2 ring-white/15 ${
                        presence?.isOnline ? "bg-emerald-400" : "bg-neutral-500"
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
                                                ).toLocaleTimeString([], {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}`
                                                : ""
                                        }`}
                            </p>
                        </div>

                        {!embedded && (
                            <div className="flex shrink-0 items-center gap-1">
                                <button
                                    type="button"
                                    onClick={handleCloseChat}
                                    aria-label="Minimize chat"
                                    className="rounded-xl border border-white/10 p-2 text-[#FAF6EF]/75 transition-colors hover:bg-white/10 hover:text-white"
                                >
                                    <Minus size={17} />
                                </button>

                                <button
                                    type="button"
                                    onClick={handleCloseChat}
                                    aria-label="Close chat"
                                    className="rounded-xl border border-white/10 p-2 text-[#FAF6EF]/75 transition-colors hover:bg-white/10 hover:text-white"
                                >
                                    <X size={17} />
                                </button>
                            </div>
                        )}
                    </header>

                    {/* Guidance Sub-bar */}
                    <div className="shrink-0 border-b border-line bg-cream px-5 py-2.5">
                        <p className="text-xs leading-relaxed text-muted">
                            {isClosed
                                ? "Use this private chat to coordinate details and communicate about the job."
                                : "Discuss the scope, ask questions, and agree on a fair price before the job is assigned."}
                        </p>
                    </div>

                    {/* Messages & Offers Stream */}
                    <div className="flex-1 space-y-3.5 overflow-y-auto bg-paper p-4 sm:p-5">
                        {loading && messages.length === 0 && (
                            <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted">
                                <LoaderCircle size={17} className="animate-spin text-copper" />
                                <span>Loading conversation…</span>
                            </div>
                        )}

                        {!loading && messages.length === 0 && !error && (
                            <div className="py-10 text-center">
                                <MessageSquare className="mx-auto text-copper" size={28} />
                                <p className="mt-3 font-semibold text-ink">
                                    Start the conversation
                                </p>
                                <p className="mt-1 text-xs text-muted">
                                    Send a message or submit the first price offer.
                                </p>
                            </div>
                        )}

                        {messages.map((item) => {
                            if (item.type === "price_offer") {
                                return renderOffer(item);
                            }
                            if (item.type === "media") {
                                const senderId = getId(item.sender);
                                const mine = senderId === currentUserId;

                                const mediaItems = Array.isArray(item.media) ? item.media : [];

                                return (
                                    <div
                                        key={item._id}
                                        className={`my-3 max-w-[86%] overflow-hidden rounded-2xl border shadow-sm ${
                                            mine
                                                ? "ml-auto border-copper/30 bg-copper/10"
                                                : "mr-auto border-line bg-cream"
                                        }`}
                                    >
                                        <div className="px-3 pt-3">
                                            <p className="text-[10px] font-semibold uppercase tracking-wide text-copper">
                                                {item.sender?.fullName ||
                                                    (mine ? user?.fullName : "Participant")}
                                                {" · "}
                                                {item.sender?.role ||
                                                    (mine ? user?.role : "participant")}
                                            </p>
                                        </div>

                                        {item.text && (
                                            <p className="whitespace-pre-wrap break-words px-3 pt-2 text-sm text-ink">
                                                {item.text}
                                            </p>
                                        )}

                                        <div className="grid grid-cols-1 gap-2 p-3">
                                            {mediaItems.map((media, index) => {
                                                const url = media.url;
                                                const mimeType = media.mimeType || "";

                                                const isImage =
                                                    media.resourceType === "image" ||
                                                    mimeType.startsWith("image/");

                                                const isVideo =
                                                    media.resourceType === "video" ||
                                                    mimeType.startsWith("video/");

                                                return (
                                                    <div
                                                        key={media._id || media.publicId || `${item._id}-${index}`}
                                                        className="overflow-hidden rounded-xl"
                                                    >
                                                        {url && isImage && (
                                                            <a
                                                                href={url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                            >
                                                                <img
                                                                    src={url}
                                                                    alt={media.originalName || "Chat attachment"}
                                                                    loading="lazy"
                                                                    className="max-h-72 w-full rounded-xl object-contain"
                                                                />
                                                            </a>
                                                        )}

                                                        {url && isVideo && (
                                                            <video
                                                                controls
                                                                playsInline
                                                                preload="metadata"
                                                                className="max-h-72 w-full rounded-xl bg-black"
                                                            >
                                                                <source src={url} type={mimeType} />
                                                                Your browser does not support video playback.
                                                            </video>
                                                        )}

                                                        {!url && (
                                                            <p className="rounded-lg bg-paper p-3 text-xs text-muted">
                                                                Attachment temporarily unavailable. Refresh the conversation to try again.
                                                            </p>
                                                        )}

                                                        <p className="mt-1 truncate text-[10px] text-muted">
                                                            {media.originalName || "Attachment"}
                                                        </p>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <div className="flex items-center justify-end gap-1.5 px-3 pb-3">
                <span className="text-[10px] text-muted">
                    {item.createdAt
                        ? new Date(item.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                        })
                        : ""}
                </span>

                                            {renderReadReceipt(item, mine)}
                                        </div>
                                    </div>
                                );
                            }

                            const senderId = getId(item.sender);
                            const mine = senderId === currentUserId;

                            return (
                                <div
                                    key={item._id}
                                    className={`max-w-[86%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                                        mine
                                            ? "ml-auto rounded-br-md bg-copper text-white"
                                            : "mr-auto rounded-bl-md border border-line bg-cream text-ink"
                                    }`}
                                >
                                    <p
                                        className={`mb-1 text-[10px] font-semibold uppercase tracking-wide ${
                                            mine ? "text-white/80" : "text-copper"
                                        }`}
                                    >
                                        {item.sender?.fullName ||
                                            (mine ? user?.fullName : "Participant")}
                                        {" · "}
                                        {item.sender?.role ||
                                            (mine ? user?.role : "participant")}
                                    </p>

                                    <p className="whitespace-pre-wrap break-words">{item.text}</p>

                                    <div className="mt-1.5 flex items-center justify-end gap-1.5">
                    <span
                        className={`text-[10px] tracking-wide ${
                            mine ? "text-white/75" : "text-muted"
                        }`}
                    >
                      {item.createdAt
                          ? new Date(item.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                          })
                          : ""}
                    </span>

                                        {renderReadReceipt(item, mine)}
                                    </div>
                                </div>
                            );
                        })}

                        {latestOffer && (
                            <div className="rounded-2xl border border-copper/30 bg-cream p-5 shadow-card">
                                <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-copper">
                                    <HandCoins size={15} />
                                    <span>Current pending offer</span>
                                </p>

                                <p className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink">
                                    {formatMoney(latestOffer.amount)}
                                </p>

                                {canAccept && (
                                    <button
                                        type="button"
                                        onClick={handleAcceptOffer}
                                        disabled={accepting}
                                        className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-pine px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-pine/90 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {accepting ? (
                                            <LoaderCircle size={16} className="animate-spin" />
                                        ) : (
                                            <CheckCircle2 size={16} />
                                        )}
                                        <span>Accept offer and fund escrow</span>
                                    </button>
                                )}

                                {!isMyTurn && (
                                    <p className="mt-2 text-xs text-muted">
                                        Waiting for the other participant to respond to this offer.
                                    </p>
                                )}
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Error Banner */}
                    {error && (
                        <div
                            role="alert"
                            className="mx-4 mb-2 rounded-xl border border-danger/30 bg-danger-soft px-3.5 py-2.5 text-xs font-medium text-danger"
                        >
                            {error}
                        </div>
                    )}

                    {/* Price Offer Form */}
                    {!isClosed && isMyTurn && (
                        <form
                            onSubmit={handleSubmitOffer}
                            className="shrink-0 border-t border-line bg-cream/90 px-4 py-3"
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
                                    onChange={(event) => setOfferAmount(event.target.value)}
                                    placeholder="Minimum ₦5,000"
                                    className="min-w-0 flex-1 rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-copper focus:ring-2 focus:ring-copper/15"
                                />

                                <button
                                    type="submit"
                                    disabled={sending}
                                    className="flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-copper px-5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-copper-deep disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {sending ? "Sending…" : "Offer"}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Message Composer */}
                    <form
                        onSubmit={handleSendMessage}
                        className="shrink-0 border-t border-line bg-cream p-3.5 sm:p-4"
                    >
                        {/* Selected attachment previews */}
                        {mediaPreviews.length > 0 && (
                            <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                                {mediaPreviews.map((preview, index) => {
                                    const isVideo = preview.file.type.startsWith("video/");

                                    return (
                                        <div
                                            key={`${preview.file.name}-${preview.file.lastModified}-${index}`}
                                            className="group relative overflow-hidden rounded-xl border border-line bg-paper"
                                        >
                                            {isVideo ? (
                                                <video
                                                    src={preview.url}
                                                    controls
                                                    preload="metadata"
                                                    className="h-24 w-full object-cover"
                                                />
                                            ) : (
                                                <img
                                                    src={preview.url}
                                                    alt={preview.file.name}
                                                    className="h-24 w-full object-cover"
                                                />
                                            )}

                                            <button
                                                type="button"
                                                onClick={() => handleRemoveSelectedFile(index)}
                                                disabled={sending}
                                                aria-label={`Remove ${preview.file.name}`}
                                                className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black disabled:opacity-50"
                                            >
                                                <X size={14} />
                                            </button>

                                            <p className="truncate px-2 py-1.5 text-[10px] text-muted">
                                                {preview.file.name}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        <div className="flex items-end gap-2.5">
                            {/* Hidden attachment input */}
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm"
                                onChange={handleFileSelection}
                                disabled={sending || isClosed}
                                className="hidden"
                            />

                            {/* Attachment button */}
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={
                                    sending ||
                                    isClosed ||
                                    selectedFiles.length >= MAX_MEDIA_FILES
                                }
                                aria-label="Attach photos or videos"
                                title="Attach photos or videos"
                                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-line bg-paper text-copper transition-colors hover:bg-copper/10 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <Paperclip size={18} />
                            </button>

                            <textarea
                                rows={1}
                                maxLength={5000}
                                value={messageText}
                                onChange={(event) => setMessageText(event.target.value)}
                                onKeyDown={handleComposerKeyDown}
                                placeholder="Write a message… (Enter to send)"
                                disabled={sending || isClosed}
                                className="max-h-28 min-h-11 min-w-0 flex-1 resize-none rounded-2xl border border-line bg-paper px-4 py-3 text-sm leading-relaxed text-ink outline-none transition focus:border-copper focus:ring-2 focus:ring-copper/15 disabled:opacity-60"
                            />

                            <button
                                type="submit"
                                disabled={
                                    sending ||
                                    isClosed ||
                                    (!messageText.trim() && selectedFiles.length === 0)
                                }
                                aria-label="Send message"
                                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-copper text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-copper-deep disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
                            >
                                {sending ? (
                                    <LoaderCircle size={17} className="animate-spin" />
                                ) : (
                                    <Send size={16} />
                                )}
                            </button>
                        </div>

                        <div className="mt-2 flex items-center justify-between gap-2 text-[10px] text-muted">
        <span>
            JPEG, PNG, WebP, MP4, MOV or WebM · Max 50 MB each
        </span>

                            <span className="shrink-0">
            {selectedFiles.length}/{MAX_MEDIA_FILES} files
        </span>
                        </div>
                    </form>
                </section>
            )}

            {showLauncher && !isOpen && (
                <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    aria-label="Open negotiation chat"
                    className="relative flex h-14 items-center gap-2.5 rounded-full border border-white/15 bg-copper px-5 text-sm font-semibold text-white shadow-raised transition-all hover:-translate-y-0.5 hover:bg-copper-deep max-sm:mb-16"
                >
                    <MessageSquare size={18} />
                    <span>Negotiate</span>
                    {latestOffer && (
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-300 ring-2 ring-copper" />
                    )}
                </button>
            )}
        </div>
    );
}