
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
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
        <div className="mx-auto flex h-[calc(100vh-9rem)] max-w-2xl flex-col">
            <Link
                to={`/jobs/${jobId}`}
                className="text-sm text-muted no-underline"
            >
                Back to the job
            </Link>

            <h1 className="font-display text-3xl">Job chat</h1>

            <p className="mb-4 text-sm text-muted">
                Communicate directly with the other person on this job.
            </p>

            <div className="flex-1 space-y-3 overflow-y-auto rounded-card border border-line bg-cream p-4">
                {error && (
                    <p className="text-sm text-copper-deep">{error}</p>
                )}

                {!error && messages.length === 0 && (
                    <p className="text-sm text-muted">No messages yet.</p>
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
                                className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                                    mine
                                        ? "bg-ink text-cream"
                                        : "bg-paper text-ink"
                                }`}
                            >
                                <p>{msg.text}</p>

                                <p
                                    className={`mt-1 text-xs ${
                                        mine ? "text-line" : "text-muted"
                                    }`}
                                >
                                    {msg.createdAt
                                        ? new Date(msg.createdAt).toLocaleString()
                                        : ""}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            <form className="mt-3 flex gap-2" onSubmit={handleSend}>
                <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Write a message"
                    maxLength={2000}
                    disabled={sending}
                    className="min-h-12 flex-1 rounded-full border border-line bg-cream px-4 outline-none"
                />

                <button
                    type="submit"
                    disabled={sending || !draft.trim()}
                    className="min-h-12 rounded-full bg-copper px-5 text-sm font-medium text-cream disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {sending ? "Sending..." : "Send"}
                </button>
            </form>
        </div>
    );
}
