import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, FileText, MapPin } from "lucide-react";
import { craftad, listOf } from "../api";
import { useSession } from "../session";
import { FloatingNegotiationChat } from "../components/FloatingNegotiationChat";
import { JobProgressTracker } from "../components/job-detail/JobProgressTracker";
import { JobMediaGallery } from "../components/job-detail/JobMediaGallery";
import { CustomerApplicationsPanel } from "../components/job-detail/CustomerApplicationsPanel";
import { ArtisanApplicationPanel } from "../components/job-detail/ArtisanApplicationPanel";
import { JobReviewCard } from "../components/job-detail/JobReviewCard";
import { JobActionSidebar } from "../components/job-detail/JobActionSidebar";

function StatusBadge({ status }) {
    const label = (status || "unknown").replaceAll("_", " ");

    return (
        <span className="inline-flex items-center gap-2 rounded-full border border-line bg-cream px-3.5 py-1.5 text-xs font-semibold capitalize text-ink shadow-card">
      <span className="h-2 w-2 rounded-full bg-copper animate-pulse" />
            {label}
    </span>
    );
}

export function JobDetail() {
    const { jobId } = useParams();
    const { token, user } = useSession();

    const [job, setJob] = useState(null);
    const [apps, setApps] = useState([]);
    const [myApplication, setMyApplication] = useState(null);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [error, setError] = useState("");

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

    async function runAction(action, okMessage) {
        try {
            await action();
            toast.success(okMessage);
            await load();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "That didn't work.");
        }
    }

    if (!job) {
        return (
            <div className="mx-auto max-w-4xl py-12">
                <Link
                    to="/jobs"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted no-underline transition-colors hover:text-copper"
                >
                    <ArrowLeft size={14} /> Back to jobs
                </Link>

                <div className="mt-6 rounded-3xl border border-line bg-cream p-10 text-center shadow-card">
                    <p className="font-display text-2xl font-semibold text-ink">
                        {error ? "We couldn't find this job" : "Loading job details…"}
                    </p>
                    <p className="mt-2 text-sm text-muted">
                        {error || "Please wait while we load the workspace information."}
                    </p>
                </div>
            </div>
        );
    }

    const isCustomer = user?.role === "customer";
    const isArtisan = user?.role === "artisan";
    const canReview =
        isCustomer &&
        (job.status === "customer_confirmed" || job.status === "paid");

    const handleOpenChat = (app) => {
        if (!app?._id) {
            toast.error("Could not identify this application.");
            return;
        }
        setSelectedApplication(app);
    };

    return (
        <div className="mx-auto max-w-7xl space-y-6 pb-10">
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

            <header className="rounded-3xl border border-line bg-cream p-6 shadow-card sm:p-8">
        <span className="inline-flex items-center rounded-full border border-copper/20 bg-copper/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-copper">
          {job.category || "General service"}
        </span>

                <h1 className="mt-3 break-words font-display text-3xl font-semibold leading-tight text-ink sm:text-4xl lg:text-5xl">
                    {job.title}
                </h1>

                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted">
          <span className="inline-flex items-center gap-2">
            <MapPin size={16} className="shrink-0 text-copper" />
              {job.location || "Location not specified"}
          </span>
                </div>
            </header>

            <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_390px]">
                <div className="min-w-0 space-y-6">
                    <section className="rounded-3xl border border-line bg-cream p-6 shadow-card sm:p-7">
                        <div className="mb-5 flex items-start gap-3.5">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-copper/20 bg-copper/10 text-copper">
                                <FileText size={18} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-copper">
                                    Project Brief
                                </p>
                                <h2 className="mt-1 font-display text-2xl font-semibold text-ink">
                                    About this job
                                </h2>
                                <p className="mt-0.5 text-sm text-muted">
                                    Requirements and scope provided by the customer.
                                </p>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-line/70 bg-paper p-5 sm:p-6">
                            <p className="whitespace-pre-wrap text-sm leading-7 text-ink sm:text-base">
                                {job.description || "No job description was provided."}
                            </p>
                        </div>
                    </section>

                    {isCustomer && (
                        <CustomerApplicationsPanel
                            apps={apps}
                            job={job}
                            user={user}
                            onSelectNegotiate={handleOpenChat}
                            onRejectApplication={(app) =>
                                runAction(
                                    () => craftad.rejectApplication(token, app._id || app.id),
                                    "Application rejected."
                                )
                            }
                        />
                    )}

                    {isArtisan && (
                        <ArtisanApplicationPanel
                            job={job}
                            jobId={jobId}
                            token={token}
                            myApplication={myApplication}
                            onOpenChat={handleOpenChat}
                        />
                    )}

                    <JobProgressTracker status={job.status} isCustomer={isCustomer} />

                    <JobMediaGallery media={job.media} />

                    {canReview && (
                        <JobReviewCard token={token} jobId={jobId} onReviewed={load} />
                    )}
                </div>

                <JobActionSidebar
                    job={job}
                    jobId={jobId}
                    token={token}
                    isCustomer={isCustomer}
                    isArtisan={isArtisan}
                    apps={apps}
                    myApplication={myApplication}
                    canReview={canReview}
                    onSelectApplication={handleOpenChat}
                    onRunAction={runAction}
                />
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
                    onOfferUpdated={load}
                    onAccepted={load}
                    onClose={() => setSelectedApplication(null)}
                />
            )}
        </div>
    );
}