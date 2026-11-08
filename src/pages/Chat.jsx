import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";
import { craftad, listOf } from "../api";
import { useSession } from "../session";

export function Chat() {
    const { jobId } = useParams();
    const { token, user } = useSession();

    const [messages, setMessages] = useState([]);
    const [error, setError] = useState("");
    const [draft, setDraft] = useState("");
    const [sending, setSending] = useState(false);

    const me = user?.id || user?._id || "";

    // Fetch chat history
    const pullMessages = async () => {
        const data = await craftad.chat(token, jobId);
        setMessages(listOf(data, ["messages"]));
    };

    // Load messages and refresh every 12 seconds
    useEffect(() => {
        if (!token || !jobId) return;

        let stop = false;

        const pull = async () => {
            try {
                const data = await craftad.chat(token, jobId);

                if (!stop) {
                    setMessages(listOf(data, ["messages"]));
                    setError("");
                }
            } catch (err) {
                if (!stop) {
                    setError(err.message);
                }
            }
        };

        pull();

        const timer = window.setInterval(pull, 12000);

        return () => {
            stop = true;
            window.clearInterval(timer);
        };
    }, [token, jobId]);

    // Send a new message
    const handleSend = async (e) => {
        e.preventDefault();

        const text = draft.trim();

        if (!text || sending) return;

        try {
            setSending(true);
            setError("");

            await craftad.sendMessage(token, jobId, text);

            setDraft("");

            // Fetch the updated conversation
            await pullMessages();
        } catch (err) {
            setError(err.message || "Failed to send message.");
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="mx-auto flex h-[calc(100vh-10rem)] max-w-3xl flex-col pb-6">

            {/* Top Back Link & Header */}
            <div className="mb-4">
                <Link
                    to={`/jobs/${jobId}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted hover:text-copper transition-colors no-underline"
                >
                    <ArrowLeft size={14} /> Back to job details
                </Link>

                <h1 className="mt-2 font-display text-3xl tracking-tight sm:text-4xl text-ink">Project chat room</h1>
                <p className="text-sm text-muted">
                    Secure real-time communication channel with your project counterpart.
                </p>
            </div>

            {/* Messages Box Container */}
            <div className="flex-1 space-y-3.5 overflow-y-auto rounded-[1.75rem] border border-line bg-cream p-5 shadow-sm">
                {error && (
                    <div className="rounded-2xl border border-copper/30 bg-copper/5 px-4 py-3 text-sm text-copper-deep shadow-sm">
                        {error}
                    </div>
                )}

                {!error && messages.length === 0 && (
                    <div className="flex h-full flex-col items-center justify-center text-center p-8 text-muted">
                        <p className="font-display text-xl text-ink">No messages yet.</p>
                        <p className="text-xs mt-1">Start the conversation by sending a message below.</p>
                    </div>
                )}

                {messages.map((msg) => {
                    const senderId =
                        typeof msg.sender === "object"
                            ? msg.sender?._id || msg.sender?.id
                            : msg.sender;

                    const mine = String(senderId) === String(me);

                    return (
                        <div
                            key={msg._id}
                            className={`flex ${
                                mine ? "justify-end" : "justify-start"
                            }`}
                        >
                            <div
                                className={`max-w-[75%] rounded-2xl px-5 py-3 text-sm shadow-sm ${
                                    mine
                                        ? "bg-copper text-cream rounded-br-none"
                                        : "bg-paper border border-line text-ink rounded-bl-none"
                                }`}
                            >
                                <p className="leading-relaxed">{msg.text}</p>

                                <p
                                    className={`mt-1.5 text-[10px] text-right font-medium ${
                                        mine ? "text-cream/75" : "text-muted"
                                    }`}
                                >
                                    {msg.createdAt
                                        ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                        : ""}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Message Input Form */}
            <form className="mt-4 flex gap-3" onSubmit={handleSend}>
                <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Write a message..."
                    maxLength={2000}
                    disabled={sending}
                    className="min-h-12 flex-1 rounded-2xl border border-line bg-paper px-5 text-sm outline-none transition focus:border-copper focus:ring-2 focus:ring-copper/10 disabled:opacity-50"
                />

                <button
                    type="submit"
                    disabled={sending || !draft.trim()}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-ink px-6 text-sm font-semibold text-cream transition-all hover:bg-copper shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <span>{sending ? "Sending..." : "Send"}</span>
                    <Send size={16} />
                </button>
            </form>
        </div>
    );
}