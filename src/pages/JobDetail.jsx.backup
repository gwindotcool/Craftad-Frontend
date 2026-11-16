import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CheckCircle2, MapPin, Clock, ArrowLeft, Star, MessageSquare, Send } from "lucide-react";
import { craftad, listOf } from "../api";
import { ShareBar } from "../components/ShareBar";
import { useSession } from "../session";

const stages = [
    { key: "open", label: "Open", description: "Waiting for an artisan" },
    { key: "assigned", label: "Assigned", description: "An artisan has been selected" },
    { key: "in_progress", label: "In progress", description: "The work is underway" },
    { key: "completed", label: "Completed", description: "The artisan has finished" },
    { key: "customer_confirmed", label: "Confirmed", description: "The customer approved the work" },
];

function formatMoney(amount) {
    return `₦${(Number(amount) || 0).toLocaleString("en-NG")}`;
}

function getStageIndex(status) {
    if (status === "paid") return 4;
    return stages.findIndex((stage) => stage.key === status);
}

function StatusBadge({ status }) {
    const label = (status || "unknown").replaceAll("_", " ");

    return (
        <span className="inline-flex items-center gap-2 rounded-full border border-line bg-paper px-3.5 py-1.5 text-xs font-semibold capitalize text-ink shadow-sm">
            <span className="h-2 w-2 rounded-full bg-copper animate-pulse" />
            {label}
        </span>
    );
}

function SectionHeading({ eyebrow, title, description }) {
    return (
        <div className="mb-6">
            {eyebrow && (
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-copper">
                    {eyebrow}
                </p>
            )}
            <h2 className="mt-1 font-display text-2xl text-ink sm:text-3xl">
                {title}
            </h2>
            {description && (
                <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted">
                    {description}
                </p>
            )}
        </div>
    );
}

export function JobDetail() {
    const { jobId } = useParams();
    const { token, user } = useSession();

    const [job, setJob] = useState(null);
    const [apps, setApps] = useState([]);
    const [message, setMessage] = useState("");
    const [price, setPrice] = useState("");
    const [note, setNote] = useState("");
    const [rating, setRating] = useState("5");
    const [comment, setComment] = useState("");
    const [error, setError] = useState("");

    async function load() {
        const [mine, open] = await Promise.allSettled([
            craftad.myJobs(token),
            craftad.openJobs(token),
        ]);

        const all = [
            ...(mine.status === "fulfilled" ? listOf(mine.value, ["jobs"]) : []),
            ...(open.status === "fulfilled" ? listOf(open.value, ["jobs"]) : []),
        ];

        const found = all.find((item) => item._id === jobId) || null;
        setJob(found);

        if (found && user?.role === "customer") {
            try {
                const data = await craftad.applications(token, jobId);
                setApps(listOf(data, ["applications"]));
            } catch (err) {
                setApps([]);
                setError(
                    err instanceof Error ? err.message : "Could not load applications"
                );
            }
        }
    }

    useEffect(() => {
        if (!token) return;
        load().catch((err) => setError(err.message));
    }, [token, jobId, user?.role]);

    async function run(action, ok) {
        setError("");

        try {
            await action();
            setNote(ok);
            await load();
        } catch (err) {
            setError(err instanceof Error ? err.message : "That didn’t work");
        }
    }

    if (!job) {
        return (
            <div className="mx-auto max-w-4xl py-12">
                <Link
                    to="/jobs"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted no-underline hover:text-copper transition-colors"
                >
                    <ArrowLeft size={14} /> Back to jobs
                </Link>

                <div className="mt-6 rounded-[2rem] border border-line bg-cream p-10 text-center shadow-sm">
                    <p className="font-display text-2xl text-ink">
                        {error ? "We couldn't find this job" : "Finding your job details…"}
                    </p>
                    <p className="mt-2 text-sm text-muted">
                        {error || "Please wait while we load the workspace information."}
                    </p>
                </div>
            </div>
        );
    }

    const stageIndex = getStageIndex(job.status);
    const isCustomer = user?.role === "customer";
    const isArtisan = user?.role === "artisan";
    const canReview =
        isCustomer &&
        (job.status === "customer_confirmed" || job.status === "paid");

    return (
        <div className="mx-auto max-w-7xl space-y-8 pb-12">

            {/* Top Navigation & Status */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <Link
                    to="/jobs"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted no-underline transition hover:text-copper"
                >
                    <ArrowLeft size={14} />
                    Back to jobs workspace
                </Link>

                <StatusBadge status={job.status} />
            </div>

            {/* Error & Success Notification Banners */}
            {error && (
                <div role="alert" className="rounded-2xl border border-copper/30 bg-copper/5 px-5 py-4 text-sm text-copper-deep shadow-sm">
                    {error}
                </div>
            )}

            {note && (
                <div role="status" className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 px-5 py-4 text-sm text-emerald-800 shadow-sm flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    <span>{note}</span>
                </div>
            )}

            {/* Editorial Job Header Banner */}
            <header className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-ink via-ink/95 to-copper-deep px-8 py-10 text-cream shadow-xl sm:px-12 sm:py-14">
                <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full border border-cream/10 bg-white/5 blur-2xl" />
                <div className="absolute -left-12 -bottom-16 h-48 w-48 rounded-full border border-copper/20 bg-copper/10 blur-xl" />

                <div className="relative z-10 max-w-3xl">
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="rounded-full bg-copper px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white shadow-sm">
                            {job.category || "General service"}
                        </span>
                        <span className="text-xs font-medium text-cream/70">
                            Craftad Verified Project
                        </span>
                    </div>

                    <h1 className="mt-5 max-w-3xl font-display text-3xl leading-tight tracking-tight sm:text-5xl">
                        {job.title}
                    </h1>

                    <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-cream/80">
                        <span className="inline-flex items-center gap-2">
                            <MapPin size={16} className="text-copper" />
                            {job.location || "Location not specified"}
                        </span>
                        <span className="inline-flex items-center gap-2 capitalize">
                            <Clock size={16} className="text-copper" />
                            {job.status?.replaceAll("_", " ") || "Status unavailable"}
                        </span>
                    </div>
                </div>
            </header>

            {/* Main Two-Column Layout */}
            <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_390px]">

                {/* LEFT COLUMN */}
                <div className="min-w-0 space-y-8">

                    {/* Job Description Card */}
                    <section className="rounded-[2rem] border border-line bg-cream p-8 shadow-sm sm:p-10">
                        <SectionHeading
                            eyebrow="PROJECT BRIEF"
                            title="About this job"
                            description="Detailed requirements and specifications outlined by the customer."
                        />

                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted sm:text-base">
                            {job.description || "No job description was provided."}
                        </p>

                        <div className="mt-8 grid gap-4 border-t border-line pt-6 sm:grid-cols-2">
                            <div className="rounded-2xl bg-paper p-5 border border-line/60">
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
                                    Service category
                                </p>
                                <p className="mt-2 font-semibold capitalize text-ink">
                                    {job.category || "Not specified"}
                                </p>
                            </div>

                            <div className="rounded-2xl bg-paper p-5 border border-line/60">
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
                                    Work location
                                </p>
                                <p className="mt-2 font-semibold text-ink">
                                    {job.location || "Not specified"}
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Job Progress Tracker */}
                    <section className="rounded-[2rem] border border-line bg-cream p-8 shadow-sm sm:p-10">
                        <SectionHeading
                            eyebrow="MILESTONE PIPELINE"
                            title="Job progress tracking"
                            description="Every project moves through verified stages so both parties remain fully aligned."
                        />

                        <div className="mt-8 space-y-0">
                            {stages.map((stage, index) => {
                                const complete = stageIndex >= index && stageIndex !== -1;
                                const current = stageIndex === index;

                                return (
                                    <div key={stage.key} className="relative flex gap-5 pb-8 last:pb-0">
                                        {index !== stages.length - 1 && (
                                            <div
                                                className={`absolute left-[19px] top-9 h-[calc(100%-20px)] w-0.5 ${
                                                    complete && stageIndex > index
                                                        ? "bg-copper"
                                                        : "bg-line"
                                                }`}
                                            />
                                        )}

                                        <div
                                            className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-xs font-bold transition-all ${
                                                current
                                                    ? "border-copper bg-copper text-white shadow-md shadow-copper/25"
                                                    : complete
                                                        ? "border-copper bg-copper/10 text-copper-deep"
                                                        : "border-line bg-paper text-muted"
                                            }`}
                                        >
                                            {complete && !current ? <CheckCircle2 size={16} /> : index + 1}
                                        </div>

                                        <div className="min-w-0 pt-1">
                                            <p
                                                className={`text-sm font-semibold ${
                                                    current ? "text-copper-deep" : "text-ink"
                                                }`}
                                            >
                                                {stage.label}
                                                {current && (
                                                    <span className="ml-2.5 rounded-full bg-copper/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-copper border border-copper/20">
                                                        Current stage
                                                    </span>
                                                )}
                                            </p>
                                            <p className="mt-1 text-xs leading-relaxed text-muted">
                                                {stage.description}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {stageIndex === -1 && (
                            <p className="mt-4 rounded-xl bg-paper p-4 text-xs text-muted border border-line">
                                This job currently has a status outside standard progress milestones.
                            </p>
                        )}
                    </section>

                    {/* Customer Applications Review */}
                    {isCustomer && (
                        <section className="rounded-[2rem] border border-line bg-cream p-8 shadow-sm sm:p-10">
                            <SectionHeading
                                eyebrow="APPLICATIONS"
                                title="Artisan applicants"
                                description="Review proposed quotes and background credentials to select the best professional."
                            />

                            {apps.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-line bg-paper px-6 py-12 text-center">
                                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-cream text-copper mb-3 border border-line">
                                        ✨
                                    </div>
                                    <p className="font-display text-xl text-ink">
                                        No applications yet
                                    </p>
                                    <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-muted">
                                        When qualified artisans apply for this job, their introductory messages and price proposals will show up here.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {apps.map((app) => {
                                        const appId = app._id || app.id;
                                        const artisanName =
                                            app.artisan?.fullName ||
                                            app.artisan?.email ||
                                            "Artisan";
                                        const pending = (app.status || "pending") === "pending";

                                        return (
                                            <article
                                                key={appId}
                                                className="rounded-2xl border border-line bg-paper p-6 shadow-sm transition-all hover:border-copper/40"
                                            >
                                                <div className="flex flex-wrap items-start justify-between gap-4">
                                                    <div className="flex min-w-0 items-center gap-3.5">
                                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-ink font-display text-lg text-cream shadow-sm">
                                                            {artisanName.charAt(0).toUpperCase()}
                                                        </div>

                                                        <div className="min-w-0">
                                                            <h3 className="truncate font-semibold text-ink">
                                                                {artisanName}
                                                            </h3>
                                                            <p className="mt-0.5 text-xs capitalize text-muted">
                                                                {app.status || "pending"} application
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="sm:text-right">
                                                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
                                                            Proposed price
                                                        </p>
                                                        <p className="mt-0.5 font-display text-2xl font-bold text-copper-deep">
                                                            {formatMoney(app.proposedPrice)}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="mt-5 rounded-xl bg-cream p-4 border border-line/60">
                                                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
                                                        Artisan proposal message
                                                    </p>
                                                    <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-ink">
                                                        {app.message || "No message provided."}
                                                    </p>
                                                </div>

                                                {pending && (
                                                    <div className="mt-5 flex flex-wrap gap-3">
                                                        <button
                                                            type="button"
                                                            className="min-h-11 rounded-full bg-ink px-6 text-xs font-semibold text-cream transition hover:bg-copper shadow-sm"
                                                            onClick={() =>
                                                                run(
                                                                    () => craftad.acceptApplication(token, appId),
                                                                    "Application accepted successfully."
                                                                )
                                                            }
                                                        >
                                                            Accept application
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="min-h-11 rounded-full border border-line bg-cream px-6 text-xs font-semibold text-copper-deep transition hover:border-copper"
                                                            onClick={() =>
                                                                run(
                                                                    () => craftad.rejectApplication(token, appId),
                                                                    "Application rejected."
                                                                )
                                                            }
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                )}
                                            </article>
                                        );
                                    })}
                                </div>
                            )}
                        </section>
                    )}

                    {/* Artisan Application Form */}
                    {isArtisan && job.status === "open" && (
                        <form
                            className="rounded-[2rem] border border-line bg-cream p-8 shadow-sm sm:p-10"
                            onSubmit={(e) => {
                                e.preventDefault();
                                run(
                                    () =>
                                        craftad.apply(token, jobId, {
                                            message,
                                            proposedPrice: Number(price),
                                        }),
                                    "Application sent successfully."
                                );
                            }}
                        >
                            <SectionHeading
                                eyebrow="SUBMIT PROPOSAL"
                                title="Apply for this job"
                                description="Introduce your expertise and let the customer know how you plan to execute the work."
                            />

                            <label className="mt-6 block text-sm font-semibold text-ink">
                                Proposal message
                                <textarea
                                    required
                                    rows={4}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    className="mt-2 w-full rounded-2xl border border-line bg-paper p-4 text-sm leading-relaxed text-ink outline-none transition focus:border-copper focus:ring-2 focus:ring-copper/10"
                                    placeholder="Explain why you are the ideal professional for this job..."
                                />
                            </label>

                            <label className="mt-5 block text-sm font-semibold text-ink">
                                Proposed price (₦)
                                <input
                                    required
                                    type="number"
                                    min={0}
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    className="mt-2 min-h-12 w-full rounded-2xl border border-line bg-paper px-4 text-sm text-ink outline-none transition focus:border-copper focus:ring-2 focus:ring-copper/10"
                                    placeholder="Enter quote in Naira"
                                />
                            </label>

                            <button
                                type="submit"
                                className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-copper px-8 text-sm font-semibold text-white transition hover:bg-copper-deep shadow-md"
                            >
                                <span>Send application proposal</span>
                                <Send size={16} />
                            </button>
                        </form>
                    )}

                    {/* Review Form */}
                    {canReview && (
                        <form
                            className="rounded-[2rem] border border-line bg-cream p-8 shadow-sm sm:p-10"
                            onSubmit={(e) => {
                                e.preventDefault();
                                run(
                                    () =>
                                        craftad.review(token, jobId, {
                                            rating: Number(rating),
                                            comment,
                                        }),
                                    "Review saved successfully."
                                );
                            }}
                        >
                            <SectionHeading
                                eyebrow="COMMUNITY FEEDBACK"
                                title="Review completed work"
                                description="Rate your experience to help maintain high quality standards across the marketplace."
                            />

                            <label className="mt-6 block text-sm font-semibold text-ink">
                                Star rating
                                <select
                                    value={rating}
                                    onChange={(e) => setRating(e.target.value)}
                                    className="mt-2 min-h-12 w-full rounded-2xl border border-line bg-paper px-4 text-sm outline-none focus:border-copper focus:ring-2 focus:ring-copper/10"
                                >
                                    {[5, 4, 3, 2, 1].map((n) => (
                                        <option key={n} value={n}>
                                            ★ {n} {n === 1 ? "Star" : "Stars"}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label className="mt-5 block text-sm font-semibold text-ink">
                                Feedback comments
                                <textarea
                                    rows={3}
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Describe your collaboration experience..."
                                    className="mt-2 w-full rounded-2xl border border-line bg-paper p-4 text-sm outline-none transition focus:border-copper focus:ring-2 focus:ring-copper/10"
                                />
                            </label>

                            <button
                                type="submit"
                                className="mt-6 min-h-12 rounded-full bg-ink px-8 text-sm font-semibold text-cream transition hover:bg-copper shadow-sm"
                            >
                                Submit verified review
                            </button>
                        </form>
                    )}
                </div>

                {/* RIGHT SIDEBAR */}
                <aside className="space-y-6 lg:sticky lg:top-6">

                    {/* Financial Numbers Panel */}
                    <section className="overflow-hidden rounded-[2rem] border border-line bg-cream shadow-sm">
                        <div className="bg-paper px-7 py-5 border-b border-line/60">
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-copper">
                                FINANCIAL METRICS
                            </p>
                            <h2 className="mt-1 font-display text-2xl text-ink">
                                Budget & Pricing
                            </h2>
                        </div>

                        <div className="space-y-6 p-7">
                            <div>
                                <p className="text-xs font-medium text-muted">
                                    Customer budget ceiling
                                </p>
                                <p className="mt-1 font-display text-3xl font-bold text-ink">
                                    {formatMoney(job.budget)}
                                </p>
                            </div>

                            <div className="border-t border-line pt-5">
                                <p className="text-xs font-medium text-muted">
                                    Agreed milestone price
                                </p>
                                <p className="mt-1 font-display text-3xl font-bold text-copper-deep">
                                    {job.agreedPrice
                                        ? formatMoney(job.agreedPrice)
                                        : "Not set yet"}
                                </p>
                            </div>

                            <div className="rounded-2xl bg-paper p-4 border border-line/60">
                                <p className="text-xs leading-relaxed text-muted">
                                    {job.agreedPrice
                                        ? "The final agreed price is locked into escrow for this contract."
                                        : "Final price gets locked automatically when an application is accepted."}
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Action & Next Steps Panel */}
                    <section className="rounded-[2rem] border border-line bg-cream p-7 shadow-sm">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-copper">
                            NEXT ACTIONS
                        </p>

                        <h2 className="mt-1 font-display text-2xl text-ink">
                            {isArtisan && job.status === "open"
                                ? "Opportunity available"
                                : isArtisan && job.status === "assigned"
                                    ? "Ready to begin?"
                                    : isArtisan && job.status === "in_progress"
                                        ? "Deliver & complete"
                                        : isCustomer && job.status === "completed"
                                            ? "Review milestone"
                                            : "Project progress"}
                        </h2>

                        <p className="mt-2 text-sm leading-relaxed text-muted">
                            {isArtisan && job.status === "open"
                                ? "Submit an application with your proposed fee to secure this contract."
                                : isArtisan && job.status === "assigned"
                                    ? "Initiate work when you are ready to start the project timeline."
                                    : isArtisan && job.status === "in_progress"
                                        ? "Mark the job complete once deliverables have been successfully met."
                                        : isCustomer && job.status === "completed"
                                            ? "Confirm the completed work to release escrow funds to the artisan."
                                            : "Monitor milestones and communicate securely through chat."}
                        </p>

                        <div className="mt-6 space-y-3.5">
                            {job.status !== "open" && (
                                <Link
                                    to={`/chat/${jobId}`}
                                    className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-ink px-6 text-sm font-semibold text-cream no-underline transition hover:bg-copper shadow-sm"
                                >
                                    <MessageSquare size={16} />
                                    <span>Open project chat</span>
                                </Link>
                            )}

                            {isArtisan && job.status === "assigned" && (
                                <>
                                    <button
                                        type="button"
                                        className="min-h-12 w-full rounded-full bg-copper px-6 text-sm font-semibold text-white transition hover:bg-copper-deep shadow-md"
                                        onClick={() =>
                                            run(() => craftad.startJob(token, jobId), "Job started successfully.")
                                        }
                                    >
                                        Start work
                                    </button>

                                    <button
                                        type="button"
                                        className="min-h-11 w-full rounded-full border border-line bg-paper px-6 text-sm font-semibold text-copper-deep transition hover:border-copper"
                                        onClick={() =>
                                            run(
                                                () => craftad.rejectJob(token, jobId),
                                                "You have declined this job."
                                            )
                                        }
                                    >
                                        Decline job assignment
                                    </button>
                                </>
                            )}

                            {isArtisan && job.status === "in_progress" && (
                                <button
                                    type="button"
                                    className="min-h-12 w-full rounded-full bg-copper px-6 text-sm font-semibold text-white transition hover:bg-copper-deep shadow-md"
                                    onClick={() =>
                                        run(
                                            () => craftad.completeJob(token, jobId),
                                            "Job marked as complete."
                                        )
                                    }
                                >
                                    Mark work complete
                                </button>
                            )}

                            {isCustomer && job.status === "completed" && (
                                <button
                                    type="button"
                                    className="min-h-12 w-full rounded-full bg-copper px-6 text-sm font-semibold text-white transition hover:bg-copper-deep shadow-md"
                                    onClick={() =>
                                        run(
                                            () => craftad.confirmJob(token, jobId),
                                            "Job confirmed and escrow released."
                                        )
                                    }
                                >
                                    Confirm completed work
                                </button>
                            )}

                            {isArtisan && job.status === "open" && (
                                <a
                                    href="#apply"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        document.querySelector("textarea")?.focus();
                                    }}
                                    className="flex min-h-12 w-full items-center justify-center rounded-full bg-copper px-6 text-sm font-semibold text-white no-underline transition hover:bg-copper-deep shadow-md"
                                >
                                    Write proposal application
                                </a>
                            )}
                        </div>
                    </section>

                    {/* Share Panel */}
                    <section className="rounded-[2rem] border border-line bg-cream p-7 shadow-sm">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-copper">
                            NETWORKING
                        </p>
                        <h2 className="mt-1 font-display text-xl text-ink">
                            Share this project
                        </h2>
                        <p className="mt-1 text-sm leading-relaxed text-muted">
                            Broadcast this job listing to colleagues or professional networks.
                        </p>

                        <div className="mt-4">
                            <ShareBar
                                title="Share this job"
                                text={`${job.title} in ${job.location}. Budget ${formatMoney(job.budget)} on Craftad.`}
                            />
                        </div>
                    </section>
                </aside>
            </div>
        </div>
    );
}