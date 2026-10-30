
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
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
        <span className="inline-flex items-center gap-2 rounded-full border border-line bg-cream px-3 py-1.5 text-xs font-semibold capitalize text-ink">
      <span className="h-2 w-2 rounded-full bg-copper" />
            {label}
    </span>
    );
}

function SectionHeading({ eyebrow, title, description }) {
    return (
        <div className="mb-5">
            {eyebrow && (
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-copper-deep">
                    {eyebrow}
                </p>
            )}
            <h2 className="mt-1 font-display text-2xl text-ink sm:text-3xl">
                {title}
            </h2>
            {description && (
                <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
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
            <div className="mx-auto max-w-4xl py-8">
                <Link
                    to="/jobs"
                    className="text-sm font-medium text-muted no-underline hover:text-copper-deep"
                >
                    ← Back to jobs
                </Link>

                <div className="mt-6 rounded-card border border-line bg-cream p-8">
                    <p className="font-display text-2xl text-ink">
                        {error ? "We couldn't find this job" : "Finding your job…"}
                    </p>
                    <p className="mt-2 text-sm text-muted">
                        {error || "Please wait while we load the details."}
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
        <div className="mx-auto max-w-7xl space-y-7 pb-12">
            {/* Top navigation */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <Link
                    to="/jobs"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-muted no-underline transition hover:text-copper-deep"
                >
                    <span aria-hidden="true">←</span>
                    All jobs
                </Link>

                <StatusBadge status={job.status} />
            </div>

            {/* Feedback */}
            {error && (
                <div
                    role="alert"
                    className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
                >
                    {error}
                </div>
            )}

            {note && (
                <div
                    role="status"
                    className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
                >
                    {note}
                </div>
            )}

            {/* Editorial job heading */}
            <header className="relative overflow-hidden rounded-card bg-ink px-6 py-8 text-cream sm:px-10 sm:py-11">
                <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full border border-white/10" />
                <div className="pointer-events-none absolute -right-2 -top-10 h-52 w-52 rounded-full border border-white/10" />
                <div className="pointer-events-none absolute -bottom-28 right-28 h-56 w-56 rounded-full bg-copper/20 blur-3xl" />

                <div className="relative max-w-3xl">
                    <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-copper px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white">
              {job.category || "General service"}
            </span>
                        <span className="text-xs text-white/60">
              Craftad job
            </span>
                    </div>

                    <h1 className="mt-6 max-w-3xl font-display text-4xl leading-[1.08] tracking-tight sm:text-6xl">
                        {job.title}
                    </h1>

                    <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-white/70">
            <span className="inline-flex items-center gap-2">
              <span aria-hidden="true">⌖</span>
                {job.location || "Location not specified"}
            </span>
                        <span className="inline-flex items-center gap-2 capitalize">
              <span aria-hidden="true">◷</span>
                            {job.status?.replaceAll("_", " ") || "Status unavailable"}
            </span>
                    </div>
                </div>

                <div className="relative mt-8 flex flex-wrap items-center gap-3 border-t border-white/15 pt-5">
          <span className="text-xs font-medium text-white/60">
            Clear expectations. Better work.
          </span>
                    <span className="h-1 w-1 rounded-full bg-copper" />
                    <span className="text-xs font-medium text-white/60">
            Powered by Craftad
          </span>
                </div>
            </header>

            {/* Main two-column layout */}
            <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_370px]">

                {/* LEFT COLUMN */}
                <div className="min-w-0 space-y-6">

                    {/* Job description */}
                    <section className="rounded-card border border-line bg-cream p-6 shadow-sm sm:p-8">
                        <SectionHeading
                            eyebrow="The brief"
                            title="About this job"
                            description="Here's what the customer needs help with."
                        />

                        <p className="whitespace-pre-wrap text-sm leading-8 text-muted sm:text-base">
                            {job.description || "No job description was provided."}
                        </p>

                        <div className="mt-7 grid gap-3 border-t border-line pt-6 sm:grid-cols-2">
                            <div className="rounded-2xl bg-paper p-4">
                                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
                                    Service category
                                </p>
                                <p className="mt-2 font-semibold capitalize text-ink">
                                    {job.category || "Not specified"}
                                </p>
                            </div>

                            <div className="rounded-2xl bg-paper p-4">
                                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
                                    Work location
                                </p>
                                <p className="mt-2 font-semibold text-ink">
                                    {job.location || "Not specified"}
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Job progress */}
                    <section className="rounded-card border border-line bg-cream p-6 shadow-sm sm:p-8">
                        <SectionHeading
                            eyebrow="The journey"
                            title="Job progress"
                            description="Every job moves through clear stages, so both sides know what comes next."
                        />

                        <div className="mt-7 space-y-0">
                            {stages.map((stage, index) => {
                                const complete = stageIndex >= index && stageIndex !== -1;
                                const current = stageIndex === index;

                                return (
                                    <div key={stage.key} className="relative flex gap-4 pb-6 last:pb-0">
                                        {index !== stages.length - 1 && (
                                            <div
                                                className={`absolute left-[15px] top-8 h-[calc(100%-24px)] w-px ${
                                                    complete && stageIndex > index
                                                        ? "bg-copper"
                                                        : "bg-line"
                                                }`}
                                            />
                                        )}

                                        <div
                                            className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${
                                                current
                                                    ? "border-copper bg-copper text-white"
                                                    : complete
                                                        ? "border-copper bg-copper/10 text-copper-deep"
                                                        : "border-line bg-paper text-muted"
                                            }`}
                                        >
                                            {complete && !current ? "✓" : index + 1}
                                        </div>

                                        <div className="min-w-0 pt-0.5">
                                            <p
                                                className={`text-sm font-semibold ${
                                                    current ? "text-copper-deep" : "text-ink"
                                                }`}
                                            >
                                                {stage.label}
                                                {current && (
                                                    <span className="ml-2 text-[10px] font-bold uppercase tracking-wider text-copper">
                            Current stage
                          </span>
                                                )}
                                            </p>
                                            <p className="mt-1 text-xs leading-5 text-muted">
                                                {stage.description}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {stageIndex === -1 && (
                            <p className="mt-4 rounded-xl bg-paper p-3 text-xs text-muted">
                                This job has a status outside the standard progress stages.
                            </p>
                        )}
                    </section>

                    {/* Applications */}
                    {isCustomer && (
                        <section className="rounded-card border border-line bg-cream p-6 shadow-sm sm:p-8">
                            <SectionHeading
                                eyebrow="Find the right person"
                                title="Artisan applications"
                                description="Review the offers and choose the artisan who best fits the job."
                            />

                            {apps.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-line bg-paper px-5 py-8 text-center">
                                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-cream text-xl text-copper-deep">
                                        ✳
                                    </div>
                                    <p className="mt-4 font-display text-xl text-ink">
                                        No applications yet
                                    </p>
                                    <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">
                                        When artisans apply for this job, their messages and proposed prices will appear here.
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
                                                className="rounded-2xl border border-line bg-paper p-4 sm:p-5"
                                            >
                                                <div className="flex flex-wrap items-start justify-between gap-4">
                                                    <div className="flex min-w-0 items-center gap-3">
                                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink font-display text-lg text-cream">
                                                            {artisanName.charAt(0).toUpperCase()}
                                                        </div>

                                                        <div className="min-w-0">
                                                            <h3 className="truncate font-semibold text-ink">
                                                                {artisanName}
                                                            </h3>
                                                            <p className="mt-1 text-xs capitalize text-muted">
                                                                {app.status || "pending"} application
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="sm:text-right">
                                                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
                                                            Proposed price
                                                        </p>
                                                        <p className="mt-1 font-display text-2xl text-copper-deep">
                                                            {formatMoney(app.proposedPrice)}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="mt-4 rounded-xl bg-cream p-4">
                                                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
                                                        Artisan's message
                                                    </p>
                                                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-ink">
                                                        {app.message || "No message provided."}
                                                    </p>
                                                </div>

                                                {pending && (
                                                    <div className="mt-4 flex flex-wrap gap-2">
                                                        <button
                                                            type="button"
                                                            className="min-h-10 rounded-full bg-ink px-5 text-xs font-semibold text-cream transition hover:bg-pine"
                                                            onClick={() =>
                                                                run(
                                                                    () => craftad.acceptApplication(token, appId),
                                                                    "Application accepted"
                                                                )
                                                            }
                                                        >
                                                            Accept application
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="min-h-10 rounded-full border border-line bg-cream px-5 text-xs font-semibold text-copper-deep transition hover:border-copper"
                                                            onClick={() =>
                                                                run(
                                                                    () => craftad.rejectApplication(token, appId),
                                                                    "Application rejected"
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

                    {/* Artisan application */}
                    {isArtisan && job.status === "open" && (
                        <form
                            className="rounded-card border border-line bg-cream p-6 shadow-sm sm:p-8"
                            onSubmit={(e) => {
                                e.preventDefault();
                                run(
                                    () =>
                                        craftad.apply(token, jobId, {
                                            message,
                                            proposedPrice: Number(price),
                                        }),
                                    "Application sent"
                                );
                            }}
                        >
                            <SectionHeading
                                eyebrow="Make your move"
                                title="Apply for this job"
                                description="Introduce yourself and tell the customer how you can help."
                            />

                            <label className="mt-6 block text-sm font-semibold text-ink">
                                Your message
                                <textarea
                                    required
                                    rows={5}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm leading-6 text-ink outline-none transition placeholder:text-muted/70 focus:border-copper"
                                    placeholder="Tell the customer why you're a good fit for this job…"
                                />
                            </label>

                            <label className="mt-5 block text-sm font-semibold text-ink">
                                Your proposed price (₦)
                                <input
                                    required
                                    type="number"
                                    min={0}
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    className="mt-2 min-h-12 w-full rounded-2xl border border-line bg-white px-4 text-sm text-ink outline-none transition placeholder:text-muted/70 focus:border-copper"
                                    placeholder="Enter your price"
                                />
                            </label>

                            <button
                                type="submit"
                                className="mt-6 min-h-12 rounded-full bg-copper px-7 text-sm font-semibold text-white transition hover:bg-copper-deep"
                            >
                                Send application
                            </button>
                        </form>
                    )}

                    {/* Review */}
                    {canReview && (
                        <form
                            className="rounded-card border border-line bg-cream p-6 shadow-sm sm:p-8"
                            onSubmit={(e) => {
                                e.preventDefault();
                                run(
                                    () =>
                                        craftad.review(token, jobId, {
                                            rating: Number(rating),
                                            comment,
                                        }),
                                    "Review saved"
                                );
                            }}
                        >
                            <SectionHeading
                                eyebrow="Help the community"
                                title="Review the work"
                                description="Your feedback helps other customers make confident choices."
                            />

                            <label className="mt-6 block text-sm font-semibold text-ink">
                                Your rating
                                <select
                                    value={rating}
                                    onChange={(e) => setRating(e.target.value)}
                                    className="mt-2 min-h-12 w-full rounded-2xl border border-line bg-white px-4 text-sm outline-none focus:border-copper"
                                >
                                    {[5, 4, 3, 2, 1].map((n) => (
                                        <option key={n} value={n}>
                                            {n} {n === 1 ? "star" : "stars"}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label className="mt-5 block text-sm font-semibold text-ink">
                                Your comments
                                <textarea
                                    rows={4}
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="How was your experience?"
                                    className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm outline-none transition placeholder:text-muted/70 focus:border-copper"
                                />
                            </label>

                            <button
                                type="submit"
                                className="mt-6 min-h-12 rounded-full bg-ink px-7 text-sm font-semibold text-cream transition hover:bg-pine"
                            >
                                Submit review
                            </button>
                        </form>
                    )}
                </div>

                {/* RIGHT SIDEBAR */}
                <aside className="space-y-5 lg:sticky lg:top-6">

                    {/* Price panel */}
                    <section className="overflow-hidden rounded-card border border-line bg-cream shadow-sm">
                        <div className="bg-paper px-6 py-5">
                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-copper-deep">
                                Job overview
                            </p>
                            <h2 className="mt-2 font-display text-2xl text-ink">
                                The numbers
                            </h2>
                        </div>

                        <div className="space-y-5 p-6">
                            <div>
                                <p className="text-xs font-medium text-muted">
                                    Customer budget
                                </p>
                                <p className="mt-1 font-display text-3xl text-ink">
                                    {formatMoney(job.budget)}
                                </p>
                            </div>

                            <div className="border-t border-line pt-5">
                                <p className="text-xs font-medium text-muted">
                                    Agreed price
                                </p>
                                <p className="mt-1 font-display text-3xl text-copper-deep">
                                    {job.agreedPrice
                                        ? formatMoney(job.agreedPrice)
                                        : "Not set"}
                                </p>
                            </div>

                            <div className="rounded-2xl bg-paper p-4">
                                <p className="text-xs leading-6 text-muted">
                                    {job.agreedPrice
                                        ? "The agreed price is displayed here for easy reference."
                                        : "The final price will be agreed when the customer accepts an artisan's application."}
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Action panel */}
                    <section className="rounded-card border border-line bg-cream p-6 shadow-sm">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-copper-deep">
                            Next step
                        </p>

                        <h2 className="mt-2 font-display text-2xl text-ink">
                            {isArtisan && job.status === "open"
                                ? "This could be your next job."
                                : isArtisan && job.status === "assigned"
                                    ? "Ready to get started?"
                                    : isArtisan && job.status === "in_progress"
                                        ? "Keep the customer updated."
                                        : isCustomer && job.status === "completed"
                                            ? "Is the work complete?"
                                            : isCustomer && job.status === "open"
                                                ? "Find your artisan."
                                                : "Keep things moving."}
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-muted">
                            {isArtisan && job.status === "open"
                                ? "Send an application with your message and proposed price."
                                : isArtisan && job.status === "assigned"
                                    ? "Start the work when you're ready."
                                    : isArtisan && job.status === "in_progress"
                                        ? "Mark the job complete when the work is finished."
                                        : isCustomer && job.status === "completed"
                                            ? "Confirm the job once you're satisfied with the work."
                                            : isCustomer && job.status === "open"
                                                ? "Review applications as artisans respond."
                                                : "Use the job progress and chat to stay informed."}
                        </p>

                        <div className="mt-5 space-y-3">
                            {job.status !== "open" && (
                                <Link
                                    to={`/chat/${jobId}`}
                                    className="flex min-h-12 w-full items-center justify-center rounded-full bg-ink px-5 text-sm font-semibold text-cream no-underline transition hover:bg-pine"
                                >
                                    Open job chat
                                </Link>
                            )}

                            {isArtisan && job.status === "assigned" && (
                                <>
                                    <button
                                        type="button"
                                        className="min-h-12 w-full rounded-full bg-copper px-5 text-sm font-semibold text-white transition hover:bg-copper-deep"
                                        onClick={() =>
                                            run(() => craftad.startJob(token, jobId), "Job started")
                                        }
                                    >
                                        Start work
                                    </button>

                                    <button
                                        type="button"
                                        className="min-h-11 w-full rounded-full border border-line px-5 text-sm font-semibold text-copper-deep transition hover:bg-paper"
                                        onClick={() =>
                                            run(
                                                () => craftad.rejectJob(token, jobId),
                                                "You declined this job"
                                            )
                                        }
                                    >
                                        Decline job
                                    </button>
                                </>
                            )}

                            {isArtisan && job.status === "in_progress" && (
                                <button
                                    type="button"
                                    className="min-h-12 w-full rounded-full bg-copper px-5 text-sm font-semibold text-white transition hover:bg-copper-deep"
                                    onClick={() =>
                                        run(
                                            () => craftad.completeJob(token, jobId),
                                            "Marked complete"
                                        )
                                    }
                                >
                                    Mark work complete
                                </button>
                            )}

                            {isCustomer && job.status === "completed" && (
                                <button
                                    type="button"
                                    className="min-h-12 w-full rounded-full bg-copper px-5 text-sm font-semibold text-white transition hover:bg-copper-deep"
                                    onClick={() =>
                                        run(
                                            () => craftad.confirmJob(token, jobId),
                                            "You confirmed the job"
                                        )
                                    }
                                >
                                    Confirm completed work
                                </button>
                            )}

                            {isArtisan && job.status === "open" && (
                                <a
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        document.querySelector("textarea")?.focus();
                                    }}
                                    className="flex min-h-12 w-full items-center justify-center rounded-full bg-copper px-5 text-sm font-semibold text-white no-underline transition hover:bg-copper-deep"
                                >
                                    Write an application
                                </a>
                            )}
                        </div>
                    </section>

                    {/* Share panel */}
                    <section className="rounded-card border border-line bg-cream p-6 shadow-sm">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-copper-deep">
                            Pass it on
                        </p>
                        <h2 className="mt-2 font-display text-xl text-ink">
                            Know someone?
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-muted">
                            Share this job with someone who might be interested.
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
