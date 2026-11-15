import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {CheckCircle2, MapPin, Clock, ArrowLeft, MessageSquare, Send, ChevronDown,} from "lucide-react";
import { craftad, listOf } from "../api";
import { ShareBar } from "../components/ShareBar";
import { useSession } from "../session";
import { FloatingNegotiationChat } from "../components/FloatingNegotiationChat";

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
    const navigate = useNavigate();
    const { token, user } = useSession();


    const [job, setJob] = useState(null);
    const [apps, setApps] = useState([]);
    const [myApplication, setMyApplication] = useState(null);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [message, setMessage] = useState("");
    const [rating, setRating] = useState("5");
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState("");
    const [reviewSubmitting, setReviewSubmitting] = useState(false);
    const [reviewSubmitted, setReviewSubmitted] = useState(false);
    const [error, setError] = useState("");
    const [attachmentsOpen, setAttachmentsOpen] = useState(true);


    async function load() {
        let all = [];

        if (user?.role === "customer") {
            try {
                const mine = await craftad.myJobs(token);
                all = listOf(mine, ["jobs"]);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Could not load your jobs.");
                return;
            }
        }

        if (user?.role === "artisan") {
            const [mine, open] = await Promise.allSettled([
                craftad.myJobs(token),
                craftad.openJobs(token),
            ]);

            all = [
                ...(mine.status === "fulfilled" ? listOf(mine.value, ["jobs"]) : []),
                ...(open.status === "fulfilled" ? listOf(open.value, ["jobs"]) : []),
            ];
        }

        const found = all.find((item) => item._id === jobId) || null;
        setJob(found);

        if (!found) {
            setApps([]);
            setMyApplication(null);
            return;
        }

        if (user?.role === "customer") {
            setMyApplication(null);

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

        if (user?.role === "artisan") {
            setApps([]);

            try {
                const data = await craftad.myJobApplication(token, jobId);
                setMyApplication(data?.application || data?.data?.application || null);
            } catch (err) {
                setMyApplication(null);
                setError(
                    err instanceof Error ? err.message : "Could not load your application"
                );
            }
        }
    }

    useEffect(() => {
        if (!token) return;
        load().catch((err) => setError(err.message));
    }, [token, jobId, user?.role]);

    async function run(action, ok) {
        try {
            await action();

            toast.success(ok);

            await load();
        } catch (err) {
            toast.error(
                err instanceof Error ? err.message : "That didn't work."
            );
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
    const assignedApplication = apps.find(
        (app) => app.status === "accepted"
    ) || null;

    return (
        <div className="mx-auto max-w-7xl space-y-6 pb-10">

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



            {/* Compact Job Header */}
            <header className="overflow-hidden rounded-3xl border border-line bg-cream p-6 shadow-sm sm:p-8">
                <div className="min-w-0">
        <span className="inline-flex items-center rounded-full border border-copper/20 bg-copper/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-copper-deep">
            {job.category || "General service"}
        </span>

                    <h1 className="mt-4 break-words font-display text-3xl leading-tight text-ink sm:text-4xl lg:text-5xl">
                        {job.title}
                    </h1>

                    <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-muted">
            <span className="inline-flex items-center gap-2">
                <MapPin size={16} className="shrink-0 text-copper" />
                {job.location || "Location not specified"}
            </span>
                    </div>
                </div>
            </header>


            {/* Main Two-Column Layout */}
            <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_390px]">

                {/* LEFT COLUMN */}
                <div className="min-w-0 flex flex-col gap-6">



                    {/* Job Description Card */}
                    <section className="order-1 rounded-3xl border border-line bg-cream p-6 shadow-sm sm:p-7">
                        <div className="mb-5 flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-copper/20 bg-copper/10 text-copper">
                                <MessageSquare size={18} />
                            </div>

                            <div className="min-w-0">
                                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-copper">
                                    PROJECT BRIEF
                                </p>

                                <h2 className="mt-1 font-display text-2xl text-ink">
                                    About this job
                                </h2>

                                <p className="mt-1 text-sm text-muted">
                                    The customer's requirements and details for this project.
                                </p>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-line/70 bg-paper p-5 sm:p-6">
                            <p className="whitespace-pre-wrap text-sm leading-7 text-ink sm:text-base">
                                {job.description || "No job description was provided."}
                            </p>
                        </div>
                    </section>



                    {/* Customer-uploaded job photos and videos */}
                    {Array.isArray(job.media) && job.media.length > 0 && (
                        <section
                            id="job-attachments"
                            className="order-4 overflow-hidden rounded-[2rem] border border-line bg-cream shadow-sm"
                        >
                            {/* Collapsible header */}
                            <button
                                type="button"
                                onClick={() => setAttachmentsOpen((previous) => !previous)}
                                aria-expanded={attachmentsOpen}
                                aria-controls="job-attachments-content"
                                className="flex w-full items-center justify-between gap-4 p-6 text-left transition hover:bg-paper/50 sm:p-8"
                            >
                                <div className="min-w-0 flex-1">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-copper">
                                        JOB ATTACHMENTS
                                    </p>

                                    <h2 className="mt-2 font-display text-2xl text-ink">
                                        Photos and videos
                                    </h2>

                                    <p className="mt-1 text-sm leading-relaxed text-muted">
                                        View the photos and videos uploaded by the customer to understand the work required.
                                    </p>

                                    <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full border border-line bg-paper px-3 py-1 text-xs font-medium text-muted">
                        {job.media.filter((media) =>
                            (media.mimeType || "").startsWith("image/")
                        ).length} photos
                    </span>

                                        <span className="rounded-full border border-line bg-paper px-3 py-1 text-xs font-medium text-muted">
                        {job.media.filter((media) =>
                            (media.mimeType || "").startsWith("video/")
                        ).length} videos
                    </span>
                                    </div>
                                </div>

                                <span
                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-paper text-muted transition-transform duration-200 ${
                                        attachmentsOpen ? "rotate-180" : ""
                                    }`}
                                >
                <ChevronDown size={19} />
            </span>
                            </button>

                            {/* Attachment content */}
                            {attachmentsOpen && (
                                <div
                                    id="job-attachments-content"
                                    className="border-t border-line p-6 sm:p-8"
                                >
                                    <div className="grid gap-5 sm:grid-cols-2">
                                        {job.media.map((media) => {
                                            const mediaType = media.mimeType || "";
                                            const mediaUrl = media.url || "";
                                            const isVideo = mediaType.startsWith("video/");
                                            const isImage = mediaType.startsWith("image/");
                                            const mediaKey =
                                                media._id || media.key || mediaUrl;

                                            return (
                                                <div
                                                    key={mediaKey}
                                                    className="overflow-hidden rounded-2xl border border-line bg-paper"
                                                >
                                                    {isImage && (
                                                        <a
                                                            href={mediaUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="block"
                                                        >
                                                            <img
                                                                src={mediaUrl}
                                                                alt={
                                                                    media.originalName ||
                                                                    "Customer-uploaded job photo"
                                                                }
                                                                loading="lazy"
                                                                className="h-64 w-full object-cover transition duration-300 hover:scale-[1.02]"
                                                            />
                                                        </a>
                                                    )}

                                                    {isVideo && (
                                                        <video
                                                            controls
                                                            preload="metadata"
                                                            playsInline
                                                            className="w-full max-h-80 bg-black"
                                                        >
                                                            <source
                                                                src={mediaUrl}
                                                                type={mediaType}
                                                            />
                                                            Your browser does not support video playback.
                                                        </video>
                                                    )}

                                                    {!isImage && !isVideo && (
                                                        <div className="p-5">
                                                            <a
                                                                href={mediaUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-sm font-semibold text-copper underline"
                                                            >
                                                                Open uploaded file
                                                            </a>
                                                        </div>
                                                    )}

                                                    <p className="truncate px-4 py-3 text-xs font-medium text-muted">
                                                        {media.originalName || "Job attachment"}
                                                    </p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </section>
                    )}





                    {/* Shared Job Progress Tracker */}
                    <section
                        id="job-progress"
                        className="order-4 rounded-3xl border border-line bg-cream p-5 shadow-sm sm:p-7"
                    >
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-copper">
                                PROJECT MILESTONES
                            </p>

                            <h2 className="mt-1 font-display text-2xl text-ink sm:text-3xl">
                                Job progress
                            </h2>

                            <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted">
                                {isCustomer
                                    ? "Follow your artisan's progress from assignment through completion."
                                    : "Track your progress and keep the customer updated at every stage."}
                            </p>
                        </div>

                        <ol className="mt-7 flex flex-col sm:flex-row sm:gap-2">
                            {stages.map((stage, index) => {
                                const complete = stageIndex > index;
                                const current = stageIndex === index;

                                return (
                                    <li
                                        key={stage.key}
                                        className="relative flex gap-4 pb-6 last:pb-0 sm:flex-1 sm:flex-col sm:items-center sm:gap-3 sm:pb-0"
                                    >
                                        {/* Connector */}
                                        {index < stages.length - 1 && (
                                            <span
                                                aria-hidden="true"
                                                className={`absolute left-[15px] top-9 h-[calc(100%-1.5rem)] w-0.5 sm:left-[calc(50%+1.25rem)] sm:top-[15px] sm:h-0.5 sm:w-[calc(100%-2.5rem)] ${
                                                    complete ? "bg-emerald-500" : "bg-line"
                                                }`}
                                            />
                                        )}

                                        {/* Milestone icon */}
                                        <span
                                            className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors ${
                                                current
                                                    ? "border-copper bg-copper text-white shadow-md shadow-copper/20"
                                                    : complete
                                                        ? "border-emerald-500 bg-emerald-500 text-white"
                                                        : "border-line bg-paper text-muted"
                                            }`}
                                        >
                        {complete ? (
                            <CheckCircle2 size={17} />
                        ) : (
                            index + 1
                        )}
                    </span>

                                        {/* Milestone details */}
                                        <div className="min-w-0 pt-0.5 sm:text-center">
                                            <div className="flex flex-wrap items-center gap-2 sm:min-h-5 sm:justify-center">
                                                <h3
                                                    className={`text-sm font-semibold ${
                                                        current || complete ? "text-ink" : "text-muted"
                                                    }`}
                                                >
                                                    {stage.label}
                                                </h3>

                                                {current && (
                                                    <span className="rounded-full bg-copper/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-copper-deep">
                                    Current
                                </span>
                                                )}

                                                {complete && (
                                                    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-700">
                                    Done
                                </span>
                                                )}
                                            </div>

                                            <p className="mt-1 max-w-[180px] text-xs leading-relaxed text-muted sm:mx-auto">
                                                {stage.description}
                                            </p>
                                        </div>
                                    </li>
                                );
                            })}
                        </ol>

                        {stageIndex === -1 && (
                            <p className="mt-5 rounded-xl border border-line bg-paper p-3 text-xs leading-relaxed text-muted">
                                This job currently has a status outside the standard progress milestones.
                            </p>
                        )}
                    </section>



                    {/* Customer Applications Review */}
                    {isCustomer && (
                        <section
                            id="applications"
                            className="order-1 rounded-[2rem] border border-line bg-cream p-6 shadow-sm sm:p-8"
                        >
                            <SectionHeading
                                eyebrow="APPLICATIONS"
                                title="Artisan applicants"
                                description="Review artisan applications, compare proposed prices, negotiate privately, and track the selected artisan's progress through completion."

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
                                            latestOffer?.proposedBy?.fullName ||
                                            (latestOffer?.proposedBy?._id === user?._id
                                                ? "You"
                                                : null);

                                        return (
                                            <article
                                                key={appId}
                                                className="group rounded-2xl border border-line bg-paper p-5 shadow-sm transition-all duration-200 hover:border-copper/40 hover:shadow-md sm:p-6"
                                            >
                                                <div className="flex flex-wrap items-start justify-between gap-4">
                                                    <div className="flex min-w-0 items-center gap-3.5">
                                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-copper/20 bg-copper/10 font-display text-lg font-semibold text-copper shadow-sm ring-4 ring-paper transition-transform duration-200 group-hover:scale-105">
                                                            {artisanName.charAt(0).toUpperCase()}
                                                        </div>

                                                        <div className="min-w-0">
                                                            <h3 className="truncate text-base font-bold leading-tight tracking-tight text-ink sm:text-lg">
                                                                {artisanName}
                                                            </h3>

                                                            <span
                                                                className={`mt-2 inline-flex items-center rounded-lg border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                                                                    app.status === "accepted"
                                                                        ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700"
                                                                        : app.status === "negotiating" || app.status === "price_agreed"
                                                                            ? "border-copper/20 bg-copper/10 text-copper-deep"
                                                                            : app.status === "rejected" || app.status === "withdrawn"
                                                                                ? "border-red-500/20 bg-red-500/10 text-red-700"
                                                                                : "border-line bg-paper text-muted"
                                                                }`}
                                                            >
        {(app.status || "pending").replaceAll("_", " ")}
    </span>
                                                        </div>
                                                    </div>

                                                    <div className="w-full rounded-2xl border border-line bg-cream p-4 sm:w-auto sm:min-w-[180px] sm:text-right">
                                                        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-copper">
                                                            {agreedPrice != null
                                                                ? "Agreed price"
                                                                : latestOffer
                                                                    ? "Latest offer"
                                                                    : app.proposedPrice != null
                                                                        ? "Initial proposal"
                                                                        : "Price not proposed"}
                                                        </p>

                                                        <p className="mt-2 font-display text-2xl font-bold leading-none tracking-tight text-copper-deep sm:text-3xl">
                                                            {displayPrice != null
                                                                ? formatMoney(displayPrice)
                                                                : "Not proposed"}
                                                        </p>

                                                        <p className="mt-1 text-xs font-medium text-muted">
                                                            {agreedPrice != null
                                                                ? "Price agreed"
                                                                : offerStatus === "pending"
                                                                    ? `Awaiting response to ${offerProposer ? `${offerProposer}'s offer` : "latest offer"}`
                                                                    : "Discuss in chat"}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="mt-5 rounded-2xl border border-line/70 bg-cream p-4 sm:p-5">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-copper/10 text-copper">
                                                            <MessageSquare size={14} />
                                                        </div>
                                                        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-copper">
                                                            Artisan proposal message
                                                        </p>
                                                    </div>

                                                    <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-ink">
                                                        {app.message || "No message provided."}
                                                    </p>
                                                </div>
                                                {!["rejected", "withdrawn"].includes(app.status) && (
                                                    <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                                                        <button
                                                            type="button"
                                                            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-6 text-xs font-semibold text-cream transition hover:bg-copper shadow-sm"
                                                            onClick={() => {
                                                                if (!app?._id) {
                                                                    toast.error("Could not identify this application.");
                                                                    return;
                                                                }

                                                                setSelectedApplication(app);
                                                            }}
                                                        >
                                                            <MessageSquare size={15} />
                                                            Open negotiation
                                                        </button>

                                                        {pending && (
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
                                                                Reject application
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </article>
                                        );
                                    })}
                                </div>
                            )}
                        </section>
                    )}

                    {/* Artisan Existing Application */}
                    {isArtisan && myApplication && (() => {
                        const applicationStatus = myApplication.status || "pending";

                        const applicationDetails = {
                            pending: {
                                eyebrow: "APPLICATION SUBMITTED",
                                title: "Your application is under review",
                                description: "The customer can review your application. Keep an eye on your private conversation for updates.",
                                button: "Open conversation with customer",
                            },
                            negotiating: {
                                eyebrow: "PRICE DISCUSSION",
                                title: "Negotiation in progress",
                                description: "You and the customer are discussing the job requirements and price. Continue the conversation to reach an agreement.",
                                button: "Continue negotiation",
                            },
                            price_agreed: {
                                eyebrow: "PRICE AGREED",
                                title: "Price discussion completed",
                                description: "You and the customer have agreed on a price. Check your conversation for updates on the customer's decision.",
                                button: "View conversation",
                            },
                            accepted: {
                                eyebrow: "APPLICATION ACCEPTED",
                                title: "You're the selected artisan",
                                description: "The customer has selected your application. Follow the project milestones and coordinate the next steps with the customer.",
                                button: "Open job conversation",
                            },
                            rejected: {
                                eyebrow: "APPLICATION CLOSED",
                                title: "Application not selected",
                                description: "The customer did not select your application for this job. You can continue exploring other available opportunities.",
                                button: "View conversation",
                            },
                            withdrawn: {
                                eyebrow: "APPLICATION WITHDRAWN",
                                title: "You withdrew this application",
                                description: "This application is no longer active. You can explore other available jobs.",
                                button: "View conversation",
                            },
                        };

                        const details = applicationDetails[applicationStatus] || {
                            eyebrow: "YOUR APPLICATION",
                            title: "Application status updated",
                            description: "Your application has an updated status. Open your conversation to review the latest details.",
                            button: "Open conversation",
                        };

                        return (
                            <section className="order-3 overflow-hidden rounded-3xl border border-line bg-cream p-6 shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-copper">
                                            {details.eyebrow}
                                        </p>

                                        <h2 className="mt-2 font-display text-2xl text-ink">
                                            {details.title}
                                        </h2>

                                        <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted">
                                            {details.description}
                                        </p>
                                    </div>

                                    <span className="inline-flex w-fit shrink-0 items-center rounded-lg border border-copper/20 bg-copper/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-copper-deep">
                    {applicationStatus.replaceAll("_", " ")}
                </span>
                                </div>

                                {myApplication.message && (
                                    <div className="mt-5 rounded-2xl border border-line/70 bg-paper p-5 shadow-sm">
                                        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-copper">
                                            Your proposal message
                                        </p>
                                        <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-ink">
                                            {myApplication.message}
                                        </p>
                                    </div>
                                )}

                                <button
                                    type="button"
                                    disabled={!myApplication._id}
                                    onClick={() => setSelectedApplication(myApplication)}
                                    className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-copper px-6 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-copper-deep hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-copper focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                                >
                                    <MessageSquare size={16} />
                                    {details.button}
                                </button>
                            </section>
                        );
                    })()}


                    {/* Artisan Application Form */}
                    {isArtisan && job.status === "open" && !myApplication && (
                        <form
                            id="apply"
                            className="order-3 overflow-hidden rounded-3xl border border-line bg-cream p-6 shadow-sm sm:p-8"
                            onSubmit={async (e) => {
                                e.preventDefault();
                                setError("");

                                try {
                                    const response = await craftad.apply(token, jobId, {
                                        message,
                                    });

                                    const createdApplication =
                                        response?.application ||
                                        response?.data?.application ||
                                        response?.data;

                                    if (!createdApplication?._id) {
                                        throw new Error(
                                            "Your application was sent, but its conversation could not be opened. Please refresh the page."
                                        );
                                    }

                                    setMessage("");
                                    navigate(`/chat/${createdApplication._id}`);
                                } catch (err) {
                                    toast.error(
                                        err instanceof Error
                                            ? err.message
                                            : "Could not submit your application."
                                    );
                                }
                            }}
                        >
                            <SectionHeading
                                eyebrow="SUBMIT PROPOSAL"
                                title="Apply for this job"
                                description="Introduce your expertise. Once the customer reviews your application, you can discuss the work and propose your price in the private chat."
                            />

                            <label className="mt-7 block text-sm font-bold text-ink">
                                Proposal message
                                <textarea
                                    required
                                    rows={4}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    className="mt-3 min-h-36 w-full resize-y rounded-2xl border border-line bg-paper p-4 text-sm leading-7 text-ink outline-none transition-all duration-200 placeholder:text-muted/70 hover:border-copper/50 focus:border-copper focus:ring-4 focus:ring-copper/10"
                                    placeholder="Explain why you are the ideal professional for this job..."
                                />
                            </label>

                            <button
                                type="submit"
                                className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-copper px-6 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-copper-deep hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-copper focus-visible:ring-offset-2 sm:w-auto"
                            >
                                <span>Send application and open chat</span>
                                <Send size={16} />
                            </button>
                        </form>
                    )}


                    {/* Review Form */}
                    {canReview && (
                        <section
                            id="review"
                            className="order-5 overflow-hidden rounded-3xl border border-line bg-cream shadow-sm transition-shadow duration-200 hover:shadow-md"
                        >
                            {reviewSubmitted ? (
                                <div className="p-7 text-center sm:p-10">
                                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                                        <CheckCircle2 size={32} />
                                    </div>

                                    <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700">
                                        FEEDBACK RECEIVED
                                    </p>

                                    <h2 className="mt-2 font-display text-2xl text-ink sm:text-3xl">
                                        Thank you for your review!
                                    </h2>

                                    <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">
                                        Your feedback has been submitted successfully. It helps
                                        other customers make informed decisions and encourages
                                        quality service across Craftad.
                                    </p>

                                    <div className="mt-6 flex justify-center gap-1 text-2xl text-copper">
                                        {"★★★★★".split("").map((star, index) => (
                                            <span key={index}>{star}</span>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <form
                                    onSubmit={async (e) => {
                                        e.preventDefault();

                                        if (reviewSubmitting || reviewSubmitted) return;

                                        setReviewSubmitting(true);

                                        try {
                                            await craftad.review(token, jobId, {
                                                rating: Number(rating),
                                                comment: comment.trim(),
                                            });

                                            setReviewSubmitted(true);
                                            setComment("");

                                            toast.success("Review submitted successfully.");

                                            await load();
                                        } catch (err) {
                                            toast.error(
                                                err instanceof Error
                                                    ? err.message
                                                    : "Could not submit your review."
                                            );
                                        } finally {
                                            setReviewSubmitting(false);
                                        }
                                    }}
                                >
                                    <div className="p-6 sm:p-8">
                                        <SectionHeading
                                            eyebrow="COMMUNITY FEEDBACK"
                                            title="How was your experience?"
                                            description="Your honest feedback helps customers find reliable artisans and helps professionals maintain high standards."
                                        />

                                        {/* Star Rating */}
                                        <div className="mt-7">
                                            <p className="text-sm font-semibold text-ink">
                                                Rate the completed work
                                            </p>

                                            <p className="mt-1 text-xs text-muted">
                                                Select a rating from 1 to 5 stars.
                                            </p>

                                            <div
                                                className="mt-4 flex items-center gap-2"
                                                onMouseLeave={() => setHoverRating(0)}
                                            >
                                                {[1, 2, 3, 4, 5].map((star) => {
                                                    const activeRating = hoverRating || Number(rating);
                                                    const active = star <= activeRating;

                                                    return (
                                                        <button
                                                            key={star}
                                                            type="button"
                                                            aria-label={`${star} ${star === 1 ? "star" : "stars"}`}
                                                            aria-pressed={Number(rating) === star}
                                                            onMouseEnter={() => setHoverRating(star)}
                                                            onClick={() => setRating(String(star))}
                                                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border text-2xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-copper focus-visible:ring-offset-2 ${
                                                                active
                                                                    ? "scale-105 border-copper/50 bg-copper/10 text-copper shadow-sm"
                                                                    : "border-line bg-paper text-muted hover:-translate-y-0.5 hover:border-copper/50 hover:bg-copper/5 hover:text-copper"
                                                            }`}
                                                        >
                                                            ★
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            <p className="mt-3 text-sm font-semibold text-copper-deep">
                                                {Number(rating) === 5
                                                    ? "Excellent"
                                                    : Number(rating) === 4
                                                        ? "Very good"
                                                        : Number(rating) === 3
                                                            ? "Average"
                                                            : Number(rating) === 2
                                                                ? "Below expectations"
                                                                : "Poor"}
                                            </p>
                                        </div>

                                        {/* Review Guidance */}
                                        <div className="mt-7 rounded-2xl border border-line bg-paper p-4">
                                            <p className="text-xs font-bold uppercase tracking-wider text-muted">
                                                What can you review?
                                            </p>

                                            <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-ink">
                                                <p>✓ Quality of workmanship</p>
                                                <p>✓ Punctuality</p>
                                                <p>✓ Communication</p>
                                                <p>✓ Professionalism</p>
                                            </div>
                                        </div>

                                        {/* Written Feedback */}
                                        <label className="mt-7 block text-sm font-semibold text-ink">
                                            Tell us about your experience
                                            <span className="ml-2 text-xs font-normal text-muted">
                            (Optional)
                        </span>

                                            <textarea
                                                rows={4}
                                                value={comment}
                                                onChange={(e) => setComment(e.target.value)}
                                                maxLength={1000}
                                                placeholder="How was the quality of work? Was the artisan professional and punctual? Share your experience..."
                                                className="mt-3 min-h-36 w-full resize-y rounded-2xl border border-line bg-paper p-4 text-sm leading-7 text-ink outline-none transition-all duration-200 placeholder:text-muted/70 hover:border-copper/50 focus:border-copper focus:ring-4 focus:ring-copper/10"
                                            />
                                        </label>

                                        <p className="mt-2 text-right text-xs tabular-nums text-muted">
                                            {comment.length}/1000 characters
                                        </p>

                                        {/* Submit */}
                                        <button
                                            type="submit"
                                            disabled={reviewSubmitting}
                                            className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-copper px-6 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-copper-deep hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-copper focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                                        >
                                            {reviewSubmitting ? (
                                                <>
                                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-cream/40 border-t-cream" />
                                                    Submitting review...
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle2 size={16} />
                                                    Submit my review
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </section>
                    )}
                </div>
                {/* RIGHT COLUMN */}
                <aside className="min-w-0 space-y-6">

                    {/* Action & Next Steps Panel */}
                    <section className="overflow-hidden rounded-3xl border border-line bg-cream p-6 shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-7">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-copper">
                            YOUR NEXT STEP
                        </p>

                        <h2 className="mt-1 font-display text-2xl text-ink">
                            {isArtisan && job.status === "open" && myApplication
                                ? "Continue your discussion"
                                : isArtisan && job.status === "open"
                                    ? "Opportunity available"
                                    : isArtisan && job.status === "assigned"
                                        ? "Ready to begin?"
                                        : isArtisan && job.status === "in_progress"
                                            ? "Complete the work"
                                            : isCustomer && job.status === "open"
                                                ? "Review applicants"
                                                : isCustomer && ["assigned", "in_progress"].includes(job.status)
                                                    ? "Track your artisan"
                                                    : isCustomer && job.status === "completed"
                                                        ? "Review completed work"
                                                        : canReview
                                                            ? "Leave a review"
                                                            : "Project progress"}
                        </h2>

                        <p className="mt-2 text-sm leading-relaxed text-muted">
                            {isArtisan && job.status === "open" && myApplication
                                ? "Your application has been submitted. Continue your private conversation with the customer to discuss the work and agree on a price."
                                : isArtisan && job.status === "open"
                                    ? "Introduce yourself to the customer. You can discuss the work and propose your price privately after applying."
                                    : isArtisan && job.status === "assigned"
                                        ? "You've been selected for this job. Start work when you're ready to begin."
                                        : isArtisan && job.status === "in_progress"
                                            ? "Keep the customer updated and mark the job complete when the agreed work has been delivered."
                                            : isCustomer && job.status === "open"
                                                ? "Review the artisans who have applied, compare their proposals, and continue negotiations."
                                                : isCustomer && ["assigned", "in_progress"].includes(job.status)
                                                    ? "Your artisan has been selected. Keep track of the work and stay in touch through your private conversation."
                                                    : isCustomer && job.status === "completed"
                                                        ? "The artisan has marked the job as completed. Confirm the work when you're satisfied."
                                                        : canReview
                                                            ? "Share your experience to help other customers choose reliable professionals."
                                                            : "Keep track of the project milestones and communicate through Craftad."}
                        </p>

                        <div className="mt-6 space-y-3.5">

                            {/* Artisan: application submitted */}
                            {isArtisan && job.status === "open" && myApplication && (
                                <button
                                    type="button"
                                    disabled={!myApplication._id}
                                    onClick={() => setSelectedApplication(myApplication)}
                                    className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-copper px-6 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-copper-deep hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-copper focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <MessageSquare size={16} />
                                    Continue negotiation
                                </button>
                            )}

                            {/* Artisan: hasn't applied */}
                            {isArtisan && job.status === "open" && !myApplication && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        const form = document.getElementById("apply");
                                        form?.scrollIntoView({ behavior: "smooth", block: "center" });
                                        form?.querySelector("textarea")?.focus({ preventScroll: true });
                                    }}
                                    className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-copper px-6 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-copper-deep hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-copper focus-visible:ring-offset-2"
                                >
                                    <Send size={16} />
                                    Write proposal application
                                </button>
                            )}

                            {/* Customer: review applications */}
                            {isCustomer && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        document.getElementById("applications")?.scrollIntoView({
                                            behavior: "smooth",
                                            block: "start",
                                        })
                                    }
                                    className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-copper px-6 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-copper-deep hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-copper focus-visible:ring-offset-2">
                                    <MessageSquare size={16} />
                                    {apps.length > 0 ? "Review applications" : "View application updates"}
                                </button>
                            )}

                            {/* Artisan: assigned job */}
                            {isArtisan && job.status === "assigned" && (
                                <>
                                    <button
                                        type="button"
                                        className="min-h-12 w-full rounded-xl bg-copper px-6 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-copper-deep hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-copper focus-visible:ring-offset-2"
                                        onClick={() =>
                                            run(
                                                () => craftad.startJob(token, jobId),
                                                "Job started successfully."
                                            )
                                        }
                                    >
                                        Start work
                                    </button>

                                    <button
                                        type="button"
                                        className="min-h-12 w-full rounded-xl border border-line bg-paper px-6 text-sm font-semibold text-muted transition-all duration-200 hover:border-copper/50 hover:bg-copper/5 hover:text-copper-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-copper focus-visible:ring-offset-2"
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

                            {/* Artisan: work in progress */}
                            {isArtisan && job.status === "in_progress" && (
                                <button
                                    type="button"
                                    className="min-h-12 w-full rounded-full bg-copper px-6 text-sm font-semibold text-white shadow-md transition hover:bg-copper-deep"
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

                            {/* Customer: confirm completed work */}
                            {isCustomer && job.status === "completed" && (
                                <button
                                    type="button"
                                    className="min-h-12 w-full rounded-full bg-copper px-6 text-sm font-semibold text-white shadow-md transition hover:bg-copper-deep"
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

                            {/* Track project progress */}
                            {["assigned", "in_progress", "completed", "customer_confirmed", "paid"].includes(job.status) && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        document.getElementById("job-progress")?.scrollIntoView({
                                            behavior: "smooth",
                                            block: "start",
                                        })
                                    }
                                    className="min-h-12 w-full rounded-xl border border-line bg-paper px-6 text-sm font-semibold text-muted transition-all duration-200 hover:border-copper/50 hover:bg-copper/5 hover:text-copper-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-copper focus-visible:ring-offset-2"
                                >
                                    View project progress
                                </button>
                            )}
                        </div>
                    </section>


                    {/* Share Panel */}
                    <section className="overflow-hidden rounded-3xl border border-line bg-cream p-6 shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-7">
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
            {selectedApplication && (
                <FloatingNegotiationChat
                    key={selectedApplication._id}
                    token={token}
                    user={user}
                    application={selectedApplication}
                    job={job}
                    initiallyOpen={true}
                    showLauncher={false}
                    embedded={false}
                    onClose={() => setSelectedApplication(null)}
                />
            )}
        </div>
    );
}