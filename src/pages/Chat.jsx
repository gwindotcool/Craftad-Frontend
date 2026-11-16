import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, LoaderCircle } from "lucide-react";
import { craftad } from "../api";
import { useSession } from "../session";
import { FloatingNegotiationChat } from "../components/FloatingNegotiationChat";

export function Chat() {
    const { applicationId } = useParams();
    const navigate = useNavigate();
    const { token, user } = useSession();

    const [conversation, setConversation] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    const loadConversation = useCallback(async () => {
        if (!token || !applicationId) return;

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

            setConversation(response.conversation);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to load this conversation."
            );
        } finally {
            setLoading(false);
        }
    }, [token, applicationId]);

    useEffect(() => {
        loadConversation();
    }, [loadConversation]);

    if (loading) {
        return (
            <div className="mx-auto flex max-w-3xl items-center justify-center gap-2.5 p-12 text-sm text-muted">
                <LoaderCircle size={18} className="animate-spin text-copper" />
                <span>Loading your conversation...</span>
            </div>
        );
    }

    if (error || !conversation) {
        return (
            <div className="mx-auto max-w-3xl space-y-4 px-4 py-8">
                <Link
                    to="/chat"
                    className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted no-underline transition hover:text-copper"
                >
                    <ArrowLeft size={15} />
                    <span>Back to inbox</span>
                </Link>

                <div
                    role="alert"
                    className="rounded-2xl border border-danger/30 bg-danger-soft p-5 text-sm font-medium text-danger"
                >
                    {error || "Conversation not found."}
                </div>
            </div>
        );
    }

    const jobId = conversation.job?._id || conversation.job?.id;

    return (
        <div className="mx-auto max-w-3xl space-y-4 pb-10">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <Link
                    to="/chat"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted no-underline transition hover:text-copper"
                >
                    <ArrowLeft size={15} />
                    <span>Back to inbox</span>
                </Link>

                {jobId && (
                    <Link
                        to={`/jobs/${jobId}`}
                        className="inline-flex items-center gap-1.5 rounded-full border border-line bg-cream px-3.5 py-1.5 text-xs font-semibold text-ink no-underline transition hover:border-copper hover:text-copper"
                    >
                        <span>Open Job Workspace</span>
                        <ArrowUpRight size={14} />
                    </Link>
                )}
            </div>

            <div className="rounded-2xl border border-line bg-cream p-5 shadow-card">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-copper">
                    Negotiation Thread
                </p>
                <h1 className="mt-1 font-display text-2xl font-semibold text-ink">
                    {conversation.job?.title || "Application conversation"}
                </h1>
                <p className="mt-1 text-sm text-muted">
                    Customer:{" "}
                    <span className="font-medium text-ink">
            {conversation.customer?.fullName || "Customer"}
          </span>
                    {" · "}
                    Artisan:{" "}
                    <span className="font-medium text-ink">
            {conversation.artisan?.fullName || "Artisan"}
          </span>
                </p>
            </div>

            <div className="h-[min(680px,calc(100dvh-16rem))] overflow-hidden rounded-3xl border border-line bg-paper shadow-card">
                <FloatingNegotiationChat
                    token={token}
                    user={user}
                    showLauncher={false}
                    embedded={true}
                    application={conversation.application}
                    job={conversation.job}
                    initialConversation={conversation}
                    initiallyOpen={true}
                    onAccepted={loadConversation}
                    onClose={() => navigate("/chat")}
                />
            </div>
        </div>
    );
}