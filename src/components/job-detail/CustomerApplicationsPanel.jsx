import {
    CheckCircle2,
    MessageSquare,
    Sparkles,
    UserCheck,
    XCircle,
} from "lucide-react";

function formatMoney(amount) {
    return `₦${(Number(amount) || 0).toLocaleString("en-NG")}`;
}

function getAppBadgeStyle(status) {
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
            return "bg-subtle text-muted border-line";
    }
}

export function CustomerApplicationsPanel({
                                              apps,
                                              job,
                                              user,
                                              onSelectNegotiate,
                                              onAcceptApplication,
                                              onRejectApplication,
                                          }) {
    return (
        <section
            id="applications"
            className="rounded-3xl border border-line bg-cream p-6 shadow-card sm:p-8"
        >
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-copper">
                        Applications
                    </p>
                    <h2 className="mt-1 font-display text-2xl font-semibold text-ink sm:text-3xl">
                        Artisan Applicants
                    </h2>
                    <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted">
                        Compare proposed prices, negotiate terms privately, and accept one artisan to lock in escrow.
                    </p>
                </div>

                <span className="rounded-full border border-line bg-paper px-3.5 py-1 text-xs font-semibold text-ink">
          {apps.length} {apps.length === 1 ? "applicant" : "applicants"}
        </span>
            </div>

            {apps.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-line-strong bg-paper px-6 py-12 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-line bg-cream text-copper shadow-card">
                        <Sparkles size={20} />
                    </div>
                    <p className="font-display text-xl font-semibold text-ink">
                        No applications yet
                    </p>
                    <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-muted">
                        When local artisans submit quotes for this job, their messages and proposed prices will appear here.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {apps.map((app) => {
                        const appId = app._id || app.id;
                        const artisanName =
                            app.artisan?.fullName || app.artisan?.email || "Artisan";

                        const latestOffer =
                            app.currentOffer && typeof app.currentOffer === "object"
                                ? app.currentOffer
                                : null;

                        const agreedPrice =
                            app.agreedPrice ??
                            (app.status === "accepted" ? job.agreedPrice : null);

                        const displayPrice =
                            agreedPrice ?? latestOffer?.amount ?? app.proposedPrice ?? null;

                        const offerStatus = latestOffer?.status;
                        const offerProposer =
                            latestOffer?.proposedBy?._id === user?._id
                                ? "You"
                                : latestOffer?.proposedBy?.fullName || null;

                        const isAccepted = app.status === "accepted";
                        const isClosed =
                            app.status === "rejected" || app.status === "withdrawn";
                        const canDecide = job.status === "open" && !isClosed && !isAccepted;

                        return (
                            <article
                                key={appId}
                                className={`group rounded-2xl border p-5 transition-all duration-200 sm:p-6 ${
                                    isAccepted
                                        ? "border-success/40 bg-paper shadow-raised"
                                        : "border-line bg-paper shadow-card hover:border-line-strong hover:shadow-raised"
                                }`}
                            >
                                <div className="flex flex-wrap items-start justify-between gap-4">
                                    {/* Left: Avatar + Name + Status */}
                                    <div className="flex min-w-0 items-center gap-3.5">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-copper/20 bg-copper/10 font-display text-lg font-semibold text-copper">
                                            {artisanName.charAt(0).toUpperCase()}
                                        </div>

                                        <div className="min-w-0">
                                            <h3 className="truncate text-base font-semibold text-ink sm:text-lg">
                                                {artisanName}
                                            </h3>

                                            <span
                                                className={`mt-1.5 inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold capitalize ${getAppBadgeStyle(
                                                    app.status
                                                )}`}
                                            >
                        {(app.status || "pending").replaceAll("_", " ")}
                      </span>
                                        </div>
                                    </div>

                                    {/* Right: Price Quote Box */}
                                    <div className="w-full rounded-2xl border border-line bg-cream px-4 py-3 sm:w-auto sm:min-w-[190px] sm:text-right">
                                        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                                            {agreedPrice != null
                                                ? "Agreed Price"
                                                : latestOffer
                                                    ? "Latest Offer"
                                                    : app.proposedPrice != null
                                                        ? "Initial Proposal"
                                                        : "Quote Status"}
                                        </p>

                                        <p className="mt-1 font-display text-2xl font-semibold tracking-tight text-copper">
                                            {displayPrice != null
                                                ? formatMoney(displayPrice)
                                                : "Open quote"}
                                        </p>

                                        <p className="mt-0.5 text-xs text-muted">
                                            {agreedPrice != null
                                                ? "Locked for escrow"
                                                : offerStatus === "pending"
                                                    ? `Pending${offerProposer ? ` · by ${offerProposer}` : ""}`
                                                    : "Awaiting agreement"}
                                        </p>
                                    </div>
                                </div>

                                {/* Cover Message */}
                                {(app.coverNote || app.message) && (
                                    <p className="mt-4 rounded-xl border border-line/70 bg-cream/60 p-4 text-sm leading-relaxed text-ink">
                                        {app.coverNote || app.message}
                                    </p>
                                )}

                                {/* Action Footer */}
                                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line/70 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => onSelectNegotiate?.(app)}
                                        className="inline-flex min-h-10 items-center gap-2 rounded-full border border-line bg-cream px-4 text-xs font-semibold text-ink transition hover:border-copper hover:text-copper"
                                    >
                                        <MessageSquare size={14} />
                                        <span>Negotiate & Chat</span>
                                    </button>

                                    {canDecide && (
                                        <div className="flex flex-wrap items-center gap-2">
                                            {onRejectApplication && (
                                                <button
                                                    type="button"
                                                    onClick={() => onRejectApplication(app)}
                                                    className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-line bg-cream px-4 text-xs font-semibold text-muted transition hover:border-danger/40 hover:bg-danger-soft hover:text-danger"
                                                >
                                                    <XCircle size={14} />
                                                    <span>Decline</span>
                                                </button>
                                            )}

                                            {onAcceptApplication && (
                                                <button
                                                    type="button"
                                                    onClick={() => onAcceptApplication(app)}
                                                    className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-copper px-5 text-xs font-semibold text-white shadow-sm transition hover:bg-copper-deep"
                                                >
                                                    <UserCheck size={14} />
                                                    <span>Accept & Assign</span>
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    {isAccepted && (
                                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-success">
                      <CheckCircle2 size={15} />
                      <span>Assigned to this job</span>
                    </span>
                                    )}
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </section>
    );
}