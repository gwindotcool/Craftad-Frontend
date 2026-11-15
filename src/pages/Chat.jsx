import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { craftad } from "../api";
import { useSession } from "../session";
import { FloatingNegotiationChat } from "../components/FloatingNegotiationChat";

export function Chat() {
    const { applicationId } = useParams();
    const { token, user } = useSession();

    const [conversation, setConversation] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token || !applicationId) return;

        let cancelled = false;

        async function loadConversation() {
            setLoading(true);
            setError("");

            try {
                const response = await craftad.getOrCreateConversation(
                    token,
                    applicationId
                );

                if (!response?.conversation?._id) {
                    throw new Error("The conversation could not be opened.");
                }

                if (!cancelled) {
                    setConversation(response.conversation);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err.message || "Failed to load this conversation.");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadConversation();

        return () => {
            cancelled = true;
        };
    }, [token, applicationId]);

    if (loading) {
        return (
            <div className="mx-auto max-w-3xl p-8 text-center text-muted">
                Loading your conversation...
            </div>
        );
    }

    if (error || !conversation) {
        return (
            <div className="mx-auto max-w-3xl space-y-4 p-8">
                <Link
                    to="/chat"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-muted no-underline hover:text-copper"
                >
                    <ArrowLeft size={16} />
                    Back to inbox
                </Link>

                <div className="rounded-2xl border border-copper/30 bg-copper/5 p-5 text-sm text-copper-deep">
                    {error || "Conversation not found."}
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-3xl space-y-4 px-4 py-6">
            <Link
                to="/chat"
                className="inline-flex items-center gap-2 text-sm font-semibold text-muted no-underline hover:text-copper"
            >
                <ArrowLeft size={16} />
                Back to inbox
            </Link>

            <div className="rounded-2xl border border-line bg-cream p-5">
                <h1 className="font-display text-2xl text-ink">
                    {conversation.job?.title || "Application conversation"}
                </h1>
                <p className="mt-1 text-sm text-muted">
                    Customer: {conversation.customer?.fullName || "Customer"}
                    {" · "}
                    Artisan: {conversation.artisan?.fullName || "Artisan"}
                </p>
            </div>

            <FloatingNegotiationChat
                token={token}
                user={user}
                showLauncher={false}
                application={conversation.application}
                job={conversation.job}
                initialConversation={conversation}
                initiallyOpen={true}
            />
        </div>
    );
}
