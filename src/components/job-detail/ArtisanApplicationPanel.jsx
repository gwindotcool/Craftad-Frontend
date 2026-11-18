import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { MessageSquare, Send } from "lucide-react";
import { craftad } from "../../api";

const STATUS_COPY = {
    pending: {
        eyebrow: "Application Submitted",
        title: "Your application is under review",
        description:
            "The customer has received your note. Open your private chat to discuss job details or propose your price.",
        button: "Open Conversation",
    },
    negotiating: {
        eyebrow: "Price Discussion",
        title: "Negotiation in progress",
        description:
            "You and the customer are discussing scope and pricing. Continue the chat to lock in an agreed amount.",
        button: "Continue Negotiation",
    },
    price_agreed: {
        eyebrow: "Price Agreed",
        title: "Quote agreed — awaiting assignment",
        description:
            "You and the customer have agreed on a price. Watch your conversation for final job assignment.",
        button: "View Conversation",
    },
    accepted: {
        eyebrow: "Application Accepted",
        title: "You’re assigned to this job",
        description:
            "Follow the project milestones above and coordinate directly with the customer until completion.",
        button: "Open Job Chat",
    },
    rejected: {
        eyebrow: "Application Closed",
        title: "Application not selected",
        description:
            "The customer selected another artisan for this job. Browse the marketplace for other open work.",
        button: "View Conversation",
    },
    withdrawn: {
        eyebrow: "Application Withdrawn",
        title: "You withdrew this application",
        description: "This application is closed.",
        button: "View Conversation",
    },
};

function getBadgeTone(status) {
    switch (status) {
        case "accepted":
        case "price_agreed":
            return "bg-success-soft text-success border-success/20";
        case "negotiating":
            return "bg-warning-soft text-warning border-warning/20";
        case "rejected":
        case "withdrawn":
            return "bg-danger-soft text-danger border-danger/20";
        default:
            return "bg-copper/12 text-copper border-copper/20";
    }
}

export function ArtisanApplicationPanel({
                                            job,
                                            jobId,
                                            token,
                                            myApplication,
                                            onOpenChat,
                                        }) {
    const navigate = useNavigate();
    const [message, setMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // Case 1: Artisan already applied
    if (myApplication) {
        const status = myApplication.status || "pending";
        const info = STATUS_COPY[status] || {
            eyebrow: "Your Application",
            title: "Application status updated",
            description: "Open your conversation to review the latest updates.",
            button: "Open Conversation",
        };
        const latestOffer =
            myApplication.currentOffer &&
            typeof myApplication.currentOffer === "object"
                ? myApplication.currentOffer
                : null;

        const agreedPrice = myApplication.agreedPrice ?? null;

        const displayPrice = agreedPrice ?? latestOffer?.amount ?? null;

// Compare IDs as strings to avoid ObjectId/string comparison issues.
        const offerProposerId = latestOffer?.proposedBy?._id?.toString();
        const artisanId = myApplication.artisan?._id?.toString();

        const offerProposer =
            offerProposerId && offerProposerId === artisanId
                ? "You"
                : latestOffer?.proposedBy?.fullName || "Customer";

        return (
            <section className="rounded-3xl border border-line bg-cream p-6 shadow-card sm:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-copper">
                            {info.eyebrow}
                        </p>
                        <h2 className="mt-1.5 font-display text-2xl font-semibold text-ink">
                            {info.title}
                        </h2>
                        <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted">
                            {info.description}
                        </p>
                    </div>

                    <span
                        className={`inline-flex w-fit shrink-0 items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wider ${getBadgeTone(
                            status
                        )}`}
                    >
            {status.replaceAll("_", " ")}
          </span>
                </div>

                {myApplication.message && (
                    <div className="mt-5 rounded-2xl border border-line/70 bg-paper p-5">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                            Your Proposal Note
                        </p>
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-ink">
                            {myApplication.message}
                        </p>
                    </div>
                )}
                <div className="mt-4 rounded-2xl border border-line bg-paper p-5">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                        {agreedPrice != null
                            ? "Agreed Price"
                            : latestOffer
                                ? "Latest Offer"
                                : "Quote Status"}
                    </p>

                    <p className="mt-2 font-display text-2xl font-semibold text-copper">
                        {displayPrice != null
                            ? `₦${Number(displayPrice).toLocaleString("en-NG")}`
                            : "Awaiting quote"}
                    </p>

                    <p className="mt-1 text-xs text-muted">
                        {agreedPrice != null
                            ? "Price agreed"
                            : latestOffer?.status === "pending"
                                ? `Pending · proposed by ${offerProposer}`
                                : "No active price offer"}
                    </p>
                </div>

                <button
                    type="button"
                    disabled={!myApplication._id}
                    onClick={() => onOpenChat(myApplication)}
                    className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-copper px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-copper-deep disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                    <MessageSquare size={16} />
                    <span>{info.button}</span>
                </button>
            </section>
        );
    }

    // Case 2: Open job — show proposal form
    if (job.status !== "open") return null;

    async function handleSubmit(e) {
        e.preventDefault();
        if (!message.trim() || submitting) return;
        setSubmitting(true);

        try {
            const response = await craftad.apply(token, jobId, {
                message: message.trim(),
            });

            const created =
                response?.application ||
                response?.data?.application ||
                response?.data;

            if (!created?._id) {
                throw new Error(
                    "Your application was sent, but its conversation could not be opened. Please refresh."
                );
            }

            setMessage("");
            toast.success("Application submitted!");
            navigate(`/chat/${created._id}`);
        } catch (err) {
            toast.error(
                err instanceof Error ? err.message : "Could not submit your application."
            );
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <form
            id="apply"
            onSubmit={handleSubmit}
            className="rounded-3xl border border-line bg-cream p-6 shadow-card sm:p-8"
        >
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-copper">
                Submit Proposal
            </p>
            <h2 className="mt-1 font-display text-2xl font-semibold text-ink sm:text-3xl">
                Apply for this job
            </h2>
            <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted">
                Introduce your trade experience and availability. Once submitted, you can negotiate pricing directly in the private job chat.
            </p>

            <div className="mt-6 space-y-2">
                <label htmlFor="proposal-message" className="text-xs font-semibold text-ink">
                    Proposal Message
                </label>
                <textarea
                    id="proposal-message"
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Explain your relevant experience, tools, and how soon you can inspect or start the job..."
                    className="min-h-32 w-full resize-y rounded-2xl border border-line bg-paper p-4 text-sm leading-7 text-ink outline-none transition placeholder:text-muted/75 focus:border-copper focus:ring-2 focus:ring-copper/15"
                />
            </div>

            <button
                type="submit"
                disabled={submitting}
                className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-copper px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-copper-deep disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
                <span>{submitting ? "Sending..." : "Send Application & Open Chat"}</span>
                <Send size={15} />
            </button>
        </form>
    );
}