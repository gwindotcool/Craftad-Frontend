import {
    CheckCircle2,
    CreditCard,
    ListChecks,
    MessageSquare,
    Play,
    Send,
    ShieldCheck,
    XCircle,
} from "lucide-react";
import { craftad } from "../../api";
import { ShareBar } from "../ShareBar";

function formatMoney(amount) {
    return `₦${(Number(amount) || 0).toLocaleString("en-NG")}`;
}

export function JobActionSidebar({
                                     job,
                                     jobId,
                                     token,
                                     isCustomer,
                                     isArtisan,
                                     apps,
                                     myApplication,
                                     canReview,
                                     onSelectApplication,
                                     onRunAction,
                                 }) {
    const hasAgreedPrice = job.agreedPrice != null && Number(job.agreedPrice) > 0;
    const displayAmount = hasAgreedPrice ? job.agreedPrice : job.budget;

    const getNextStepContent = () => {
        if (isArtisan && job.status === "open" && myApplication) {
            return {
                title: "Continue your discussion",
                body: "Your application has been submitted. Use the private chat to discuss scope and lock in an agreed price.",
            };
        }
        if (isArtisan && job.status === "open") {
            return {
                title: "Opportunity available",
                body: "Introduce yourself to the customer. Once you apply, you can propose your price privately in chat.",
            };
        }
        if (isArtisan && job.status === "assigned") {
            return {
                title: "Ready to begin?",
                body: "You’ve been selected for this job. Start work when you’re ready to begin on-site or remotely.",
            };
        }
        if (isArtisan && job.status === "in_progress") {
            return {
                title: "Complete the work",
                body: "Keep the customer updated and mark the job complete once all agreed deliverables are finished.",
            };
        }
        if (isCustomer && job.status === "open") {
            return {
                title: "Review applicants",
                body: "Compare artisan proposals, negotiate prices privately, and accept an artisan to assign this job.",
            };
        }
        if (isCustomer && ["assigned", "in_progress"].includes(job.status)) {
            return {
                title: "Track your artisan",
                body: "Your artisan is assigned. Follow progress milestones and stay in touch via private chat.",
            };
        }
        if (isCustomer && job.status === "completed") {
            return {
                title: "Review completed work",
                body: "The artisan marked this job complete. Confirm satisfaction to release payment from escrow.",
            };
        }
        if (canReview) {
            return {
                title: "Leave a review",
                body: "Share your experience to help other customers choose reliable professionals.",
            };
        }
        return {
            title: "Project progress",
            body: "Track the project milestones and communicate securely through Craftad.",
        };
    };

    const nextStep = getNextStepContent();

    return (
        <aside className="min-w-0 space-y-6 lg:sticky lg:top-24">
            {/* Financial Summary Card */}
            <section className="rounded-3xl border border-line bg-cream p-6 shadow-card sm:p-7">
                <div className="flex items-center justify-between gap-2">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-copper">
                        {hasAgreedPrice ? "Agreed Escrow Price" : "Estimated Budget"}
                    </p>
                    <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2.5 py-0.5 text-[11px] font-semibold text-success">
            <ShieldCheck size={12} />
            Escrow Protected
          </span>
                </div>

                <p className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                    {displayAmount != null ? formatMoney(displayAmount) : "Open to quotes"}
                </p>

                {hasAgreedPrice && job.budget != null && Number(job.budget) !== Number(job.agreedPrice) && (
                    <p className="mt-1 text-xs text-muted">
                        Original posted budget: {formatMoney(job.budget)}
                    </p>
                )}

                <div className="mt-4 flex items-center gap-2 border-t border-line/70 pt-4 text-xs text-muted">
                    <CreditCard size={14} className="shrink-0 text-copper" />
                    <span>Funds are held safely until the customer confirms completion.</span>
                </div>
            </section>

            {/* Action & Next Steps Panel */}
            <section className="rounded-3xl border border-line bg-cream p-6 shadow-card sm:p-7">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-copper">
                    Your Next Step
                </p>

                <h2 className="mt-1 font-display text-2xl font-semibold text-ink">
                    {nextStep.title}
                </h2>

                <p className="mt-2 text-sm leading-relaxed text-muted">
                    {nextStep.body}
                </p>

                <div className="mt-6 space-y-3">
                    {/* Artisan: already applied on open job */}
                    {isArtisan && job.status === "open" && myApplication && (
                        <button
                            type="button"
                            disabled={!myApplication._id}
                            onClick={() => onSelectApplication(myApplication)}
                            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-copper px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-copper-deep disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <MessageSquare size={16} />
                            <span>Continue Negotiation</span>
                        </button>
                    )}

                    {/* Artisan: hasn't applied yet */}
                    {isArtisan && job.status === "open" && !myApplication && (
                        <button
                            type="button"
                            onClick={() => {
                                const form = document.getElementById("apply");
                                form?.scrollIntoView({ behavior: "smooth", block: "center" });
                                form?.querySelector("textarea")?.focus({ preventScroll: true });
                            }}
                            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-copper px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-copper-deep"
                        >
                            <Send size={15} />
                            <span>Write Proposal Application</span>
                        </button>
                    )}

                    {/* Customer: jump to applications */}
                    {isCustomer && (
                        <button
                            type="button"
                            onClick={() =>
                                document.getElementById("applications")?.scrollIntoView({
                                    behavior: "smooth",
                                    block: "start",
                                })
                            }
                            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-copper px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-copper-deep"
                        >
                            <MessageSquare size={16} />
                            <span>
                {apps.length > 0
                    ? `Review Applications (${apps.length})`
                    : "View Application Updates"}
              </span>
                        </button>
                    )}

                    {/* Artisan: assigned job -> start or decline */}
                    {isArtisan && job.status === "assigned" && (
                        <>
                            <button
                                type="button"
                                onClick={() =>
                                    onRunAction(
                                        () => craftad.startJob(token, jobId),
                                        "Job started successfully."
                                    )
                                }
                                className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-copper px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-copper-deep"
                            >
                                <Play size={15} />
                                <span>Start Work</span>
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    onRunAction(
                                        () => craftad.rejectJob(token, jobId),
                                        "You have declined this job."
                                    )
                                }
                                className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-line bg-paper px-6 text-sm font-semibold text-muted transition hover:border-danger/40 hover:bg-danger-soft hover:text-danger"
                            >
                                <XCircle size={15} />
                                <span>Decline Assignment</span>
                            </button>
                        </>
                    )}

                    {/* Artisan: work in progress -> mark complete */}
                    {isArtisan && job.status === "in_progress" && (
                        <button
                            type="button"
                            onClick={() =>
                                onRunAction(
                                    () => craftad.completeJob(token, jobId),
                                    "Job marked as complete."
                                )
                            }
                            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-copper px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-copper-deep"
                        >
                            <CheckCircle2 size={16} />
                            <span>Mark Work Complete</span>
                        </button>
                    )}

                    {/* Customer: confirm completed work */}
                    {isCustomer && job.status === "completed" && (
                        <button
                            type="button"
                            onClick={() =>
                                onRunAction(
                                    () => craftad.confirmJob(token, jobId),
                                    "Job confirmed and escrow released."
                                )
                            }
                            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-copper px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-copper-deep"
                        >
                            <CheckCircle2 size={16} />
                            <span>Confirm Completed Work</span>
                        </button>
                    )}

                    {/* Jump to milestone tracker */}
                    {["assigned", "in_progress", "completed", "customer_confirmed", "paid"].includes(
                        job.status
                    ) && (
                        <button
                            type="button"
                            onClick={() =>
                                document.getElementById("job-progress")?.scrollIntoView({
                                    behavior: "smooth",
                                    block: "start",
                                })
                            }
                            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-line bg-paper px-6 text-sm font-semibold text-ink transition hover:border-copper hover:text-copper"
                        >
                            <ListChecks size={15} />
                            <span>View Project Progress</span>
                        </button>
                    )}
                </div>
            </section>

            {/* Share Panel */}
            <section className="rounded-3xl border border-line bg-cream p-6 shadow-card sm:p-7">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-copper">
                    Share Listing
                </p>
                <h2 className="mt-1 font-display text-xl font-semibold text-ink">
                    Share this project
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-muted">
                    Send this job link to trusted artisans or colleagues.
                </p>

                <div className="mt-4">
                    <ShareBar
                        title="Share this job"
                        text={`${job.title} in ${job.location || "Nigeria"}. Budget ${formatMoney(
                            job.budget
                        )} on Craftad.`}
                    />
                </div>
            </section>
        </aside>
    );
}