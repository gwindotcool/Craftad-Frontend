import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    ArrowRight,
    ArrowUpRight,
    BriefcaseBusiness,
    CheckCircle2,
    Eye,
    EyeOff,
    MapPin,
    Plus,
    RefreshCw,
    UserCheck,
    Wallet,
} from "lucide-react";

import { craftad, listOf } from "../api";
import { useSession } from "../session";
import { SocialLinksForm } from "../components/SocialLinksForm";

const ACTIVE_JOB_STATUSES = ["open", "assigned", "in_progress"];
const COMPLETED_JOB_STATUSES = ["completed", "customer_confirmed", "paid"];

function formatNaira(amount) {
    const value = Number(amount);
    if (!Number.isFinite(value)) return "—";
    return `₦${value.toLocaleString("en-NG", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    })}`;
}


function getJobPriceInfo(job, isArtisan) {
    const agreed = Number(job.agreedPrice);
    const budget = Number(job.budget);

    const validBudget = Number.isFinite(budget) && budget > 0;

    // An agreed price always takes priority.
    if (Number.isFinite(agreed) && agreed > 0) {
        return {
            label: "Agreed price",
            value: formatNaira(agreed),
            detail: "",
            secondary: validBudget
                ? `Original budget: ${formatNaira(budget)}`
                : "",
        };
    }

    let latestOffer = null;

    if (isArtisan) {
        // Artisans must only see their own application's offer.
        const offer = job.myApplication?.currentOffer;

        if (offer?.status === "pending") {
            latestOffer = offer;
        }
    } else {
        // Customers can see offers across their own applications.
        const pendingOffers = (job.applications || [])
            .map((application) => application.currentOffer)
            .filter(
                (offer) =>
                    offer &&
                    typeof offer === "object" &&
                    offer.status === "pending" &&
                    Number(offer.amount) > 0
            );

        pendingOffers.sort(
            (a, b) =>
                new Date(b.createdAt || 0).getTime() -
                new Date(a.createdAt || 0).getTime()
        );

        latestOffer = pendingOffers[0] || null;
    }

    if (latestOffer && Number(latestOffer.amount) > 0) {
        const proposerName = latestOffer.proposedBy?.fullName;

        return {
            label: isArtisan ? "Latest offer on your application" : "Latest offer",
            value: formatNaira(latestOffer.amount),
            detail: proposerName
                ? `Proposed by ${proposerName}`
                : "Pending negotiation",
            secondary: validBudget
                ? `Customer budget: ${formatNaira(budget)}`
                : "",
        };
    }

    if (validBudget) {
        return {
            label: "Customer budget",
            value: formatNaira(budget),
            detail: "",
            secondary: "",
        };
    }

    return {
        label: "Budget",
        value: "Open budget",
        detail: "",
        secondary: "",
    };
}


function getStatusBadgeStyle(status) {
    switch (status) {
        case "completed":
        case "customer_confirmed":
        case "paid":
            return "bg-success-soft text-success";
        case "in_progress":
        case "assigned":
            return "bg-warning-soft text-warning";
        case "disputed":
        case "cancelled":
            return "bg-danger-soft text-danger";
        default:
            return "bg-copper/12 text-copper";
    }
}
function getCurrentCoordinates() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(
                new Error(
                    "Your browser does not support location services."
                )
            );
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve([
                    position.coords.longitude,
                    position.coords.latitude,
                ]);
            },
            (error) => {
                const messages = {
                    1: "Location permission was denied. Allow location access in your browser settings and try again.",
                    2: "Your location could not be determined. Please try again.",
                    3: "Location request timed out. Please try again.",
                };

                reject(
                    new Error(
                        messages[error.code] ||
                        "Unable to obtain your location."
                    )
                );
            },
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 60000,
            }
        );
    });
}
export function Dashboard() {
    const { token, user } = useSession();

    const [jobs, setJobs] = useState([]);
    const [balance, setBalance] = useState(null);
    const [note, setNote] = useState("");
    const [jobsLoading, setJobsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [skills, setSkills] = useState("");
    const [years, setYears] = useState("1");
    const [bio, setBio] = useState("");
    const [profileNote, setProfileNote] = useState({ type: "", text: "" });
    const [profileSaving, setProfileSaving] = useState(false);
    const [profileExists, setProfileExists] = useState(false);
    const [profileLoading, setProfileLoading] = useState(true);
    const [profileLoadFailed, setProfileLoadFailed] = useState(false);
    const [balanceVisible, setBalanceVisible] = useState(true);

    const isArtisan = user?.role === "artisan";

    const loadDashboard = useCallback(
        async (isManual = false) => {
            if (!token || !user) return;
            if (isManual) {
                setRefreshing(true);
            } else {
                setJobsLoading(true);
            }
            setNote("");

            const jobsRequest =
                user.role === "artisan"
                    ? craftad.openJobs(token)
                    : craftad.myJobs(token);

            const requests = [jobsRequest, craftad.wallet(token)];
            if (user.role === "artisan") {
                setProfileLoading(true);
                requests.push(craftad.artisanMe(token));
            }

            const [jobsResult, walletResult, profileResult] =
                await Promise.allSettled(requests);
            if (jobsResult.status === "fulfilled") {
                setJobs(listOf(jobsResult.value, ["jobs"]));
            } else {
                setJobs([]);
                setNote(
                    jobsResult.reason?.message ||
                    "Unable to load your jobs. Please try again."
                );
            }

            if (walletResult.status === "fulfilled") {
                setBalance(walletResult.value?.wallet?.balance ?? null);
            } else {
                setBalance(null);
            }

            if (user.role === "artisan") {
                if (profileResult?.status === "fulfilled") {
                    const artisanData = profileResult.value?.artisan;

                    if (artisanData) {
                        setProfileExists(true);
                        setProfileLoadFailed(false);

                        setSkills(
                            Array.isArray(artisanData.skills)
                                ? artisanData.skills.join(", ")
                                : ""
                        );

                        setYears(
                            artisanData.yearsOfExperience != null
                                ? String(artisanData.yearsOfExperience)
                                : "0"
                        );

                        setBio(artisanData.bio || "");
                    } else {
                        setProfileExists(false);
                        setProfileLoadFailed(true);
                    }
                } else if (profileResult?.reason?.status === 404) {
                    setProfileExists(false);
                    setProfileLoadFailed(false);
                    setSkills("");
                    setYears("1");
                    setBio("");
                } else {
                    setProfileLoadFailed(true);

                    setProfileNote({
                        type: "error",
                        text:
                            profileResult?.reason?.message ||
                            "Could not load your professional profile.",
                    });
                }

                setProfileLoading(false);
            }

            setJobsLoading(false);
            setRefreshing(false);
        },
        [token, user]
    );

    useEffect(() => {
        loadDashboard(false);
    }, [loadDashboard]);

    const activeJobs = isArtisan
        ? jobs.filter((job) => job.status === "open")
        : jobs.filter((job) => ACTIVE_JOB_STATUSES.includes(job.status));

    const completedJobsCount = jobs.filter((job) =>
        COMPLETED_JOB_STATUSES.includes(job.status)
    ).length;

    async function handleProfileSubmit(event) {
        event.preventDefault();

        setProfileNote({ type: "", text: "" });

        if (profileLoading) {
            setProfileNote({
                type: "error",
                text: "Please wait while your profile loads.",
            });
            return;
        }
        if (profileLoadFailed) {
            setProfileNote({
                type: "error",
                text: "We couldn't confirm your saved profile. Refresh the dashboard and try again.",
            });
            return;
        }

        setProfileSaving(true);

        try {
            const parsedSkills = skills
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean);

            if (parsedSkills.length === 0) {
                throw new Error("Please enter at least one trade skill.");
            }

            const experience = Number(years);

            if (
                !Number.isInteger(experience) ||
                experience < 0 ||
                experience > 80
            ) {
                throw new Error("Enter a valid experience between 0 and 80 years.");
            }

            const body = {
                skills: parsedSkills,
                yearsOfExperience: experience,
                bio: bio.trim(),
            };

            if (profileExists) {
                // Update existing profile. Preserve its saved location.
                await craftad.updateArtisan(token, body);
            } else {
                // A new profile requires the artisan's actual GPS location.
                const coordinates = await getCurrentCoordinates();

                body.location = {
                    type: "Point",
                    coordinates,
                };

                await craftad.createArtisan(token, body);
                setProfileExists(true);
            }

            // Reload the persisted profile instead of trusting form state.
            const result = await craftad.artisanMe(token);
            const savedProfile = result?.artisan;

            if (!savedProfile) {
                throw new Error(
                    "Profile was saved, but we could not reload it. Please refresh."
                );
            }
            setProfileExists(true);
            setProfileLoadFailed(false);

            setSkills(
                Array.isArray(savedProfile.skills)
                    ? savedProfile.skills.join(", ")
                    : ""
            );

            setYears(
                savedProfile.yearsOfExperience != null
                    ? String(savedProfile.yearsOfExperience)
                    : "0"
            );
            setBio(savedProfile.bio || "");

            setProfileNote({
                type: "success",
                text: "Your professional profile has been saved successfully.",
            });
        } catch (error) {
            setProfileNote({
                type: "error",
                text:
                    error instanceof Error
                        ? error.message
                        : "Could not save your profile.",
            });
        } finally {
            setProfileSaving(false);
        }
    }

    return (
        <div className="space-y-8 pb-12 sm:space-y-10">
            {/* Welcome Banner (Role-tinted: Pine for Artisans, Espresso/Copper for Customers) */}
            <section
                className={`relative isolate overflow-hidden rounded-3xl p-6 text-[#F5EFE7] shadow-raised sm:p-9 lg:p-10 ${
                    isArtisan
                        ? "bg-gradient-to-br from-[#192B23] via-[#243D32] to-[#1D3229]"
                        : "bg-gradient-to-br from-[#1D1815] via-[#2A201A] to-[#853C22]"
                }`}
            >
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full border border-white/10 bg-white/5 blur-2xl"
                />

                <div className="relative z-10 flex flex-col justify-between gap-7 sm:flex-row sm:items-center">
                    <div className="max-w-2xl space-y-3.5">
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#F5EFE7] backdrop-blur-md">
              <span
                  className={`h-1.5 w-1.5 rounded-full ${
                      isArtisan ? "bg-[#7AC7A4]" : "bg-[#F29C77]"
                  }`}
              />
                            {isArtisan ? "Artisan Workspace" : "Customer Workspace"}
                        </div>

                        <div className="space-y-2">
                            <h1 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
                                Welcome back, {user?.fullName?.split(" ")[0] || "there"}.
                            </h1>

                            <p className="max-w-xl text-sm leading-relaxed text-[#F5EFE7]/80 sm:text-base">
                                {isArtisan
                                    ? "Browse open local jobs, submit competitive quotes, and track your escrow payouts."
                                    : "Post new jobs, compare artisan quotes, and monitor active milestones in one place."}
                            </p>
                        </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2.5">
                        <button
                            type="button"
                            onClick={() => loadDashboard(true)}
                            disabled={jobsLoading || refreshing}
                            aria-label="Refresh workspace"
                            title="Refresh workspace"
                            className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20 disabled:opacity-50"
                        >
                            <RefreshCw
                                size={17}
                                className={refreshing ? "animate-spin" : ""}
                            />
                        </button>

                        {isArtisan ? (
                            <Link
                                to="/jobs?view=all"
                                className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-[#FFFCF6] px-6 text-sm font-semibold text-[#211B17] no-underline shadow-md transition-all hover:-translate-y-0.5 hover:bg-white"
                            >
                                <span>Explore Open Jobs</span>
                                <ArrowUpRight size={17} />
                            </Link>
                        ) : (
                            <Link
                                to="/jobs/new"
                                className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-[#FFFCF6] px-6 text-sm font-semibold text-[#211B17] no-underline shadow-md transition-all hover:-translate-y-0.5 hover:bg-white"
                            >
                                <Plus size={17} />
                                <span>Post a Job</span>
                            </Link>
                        )}
                    </div>
                </div>
            </section>

            {/* Error Alert */}
            {note && (
                <div
                    role="alert"
                    className="rounded-2xl border border-danger/25 bg-danger-soft px-5 py-4 text-sm font-medium text-danger"
                >
                    {note}
                </div>
            )}

            {/* Key Metrics */}
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <StatCard
                    label={isArtisan ? "Open Opportunities" : "Active Jobs"}
                    value={jobsLoading ? "—" : String(activeJobs.length)}
                    description={
                        isArtisan
                            ? "Live jobs accepting applications"
                            : "Jobs currently open or in progress"
                    }
                    icon={BriefcaseBusiness}
                />

                <StatCard
                    label="Escrow & Wallet"
                    value={
                        balance === null
                            ? "—"
                            : balanceVisible
                                ? formatNaira(balance)
                                : "₦ ••••••"
                    }
                    description="Available balance for payouts & hires"
                    icon={Wallet}
                    action={
                        balance !== null && (
                            <button
                                type="button"
                                onClick={() => setBalanceVisible((visible) => !visible)}
                                aria-label={
                                    balanceVisible ? "Hide wallet balance" : "Show wallet balance"
                                }
                                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-subtle hover:text-ink"
                            >
                                {balanceVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        )
                    }
                />

                <StatCard
                    label={isArtisan ? "Profile Readiness" : "Completed Jobs"}
                    value={
                        isArtisan
                            ? profileLoading
                                ? "Loading..."
                                : profileLoadFailed
                                    ? "Unavailable"
                                    : profileExists && skills.trim() && years !== ""
                                        ? "Ready"
                                        : "Incomplete"
                            : jobsLoading
                                ? "—"
                                : String(completedJobsCount)
                    }
                    description={
                        isArtisan
                            ? "Complete your trade bio to win more bids"
                            : "Jobs signed off and paid out"
                    }
                    icon={isArtisan ? UserCheck : CheckCircle2}
                    badge={
                        isArtisan
                            ? profileLoading
                                ? {
                                    text: "Checking profile",
                                    tone: "warning",
                                }
                                : profileLoadFailed
                                    ? {
                                        text: "Unable to verify",
                                        tone: "warning",
                                    }
                                    : {
                                        text: profileExists && skills.trim() && years !== ""
                                            ? "Profile complete"
                                            : "Action needed",
                                        tone: profileExists && skills.trim() && years !== ""
                                            ? "success"
                                            : "warning",
                                    }
                            : {
                                text: "Account Active",
                                tone: "success",
                            }
                    }
                />
            </section>

            {/* Primary Action Strip */}
            <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-cream p-4 shadow-card sm:px-6">
                <div className="flex flex-wrap items-center gap-2.5">
                    <QuickLink to="/jobs?view=all">Browse Marketplace</QuickLink>
                    <QuickLink to="/jobs?view=assigned">Assigned Jobs</QuickLink>
                    <QuickLink to="/chat">Job Messages</QuickLink>
                </div>

                <Link
                    to="/wallet"
                    className="inline-flex min-h-10 items-center gap-2 rounded-full bg-copper px-5 text-xs font-semibold text-white no-underline transition-colors hover:bg-copper-deep"
                >
                    <span>Manage Wallet</span>
                    <ArrowRight size={14} />
                </Link>
            </section>

            {/* Priority #1: Recent / Available Jobs */}
            <section className="space-y-5">
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-copper">
                            Live Activity
                        </p>
                        <h2 className="mt-1 font-display text-2xl font-semibold text-ink sm:text-3xl">
                            {isArtisan ? "Available Jobs" : "Recent Jobs"}
                        </h2>
                    </div>

                    <Link
                        to="/jobs"
                        className="inline-flex items-center gap-1.5 rounded-full border border-line bg-cream px-4 py-2 text-xs font-semibold text-ink no-underline transition-colors hover:border-copper hover:text-copper"
                    >
                        <span>View all jobs</span>
                        <ArrowRight size={14} />
                    </Link>
                </div>

                <div className="grid gap-3.5">
                    {jobsLoading ? (
                        Array.from({ length: 3 }).map((_, idx) => (
                            <div
                                key={idx}
                                className="h-24 animate-pulse rounded-2xl border border-line bg-cream/70 p-6"
                            />
                        ))
                    ) : jobs.length > 0 ? (
                        jobs.slice(0, 5).map((job) => (
                            <Link
                                key={job._id}
                                to={`/jobs/${job._id}`}
                                className="group flex flex-col justify-between gap-4 rounded-2xl border border-line bg-cream p-5 no-underline shadow-card transition-all hover:-translate-y-0.5 hover:border-line-strong hover:shadow-raised sm:flex-row sm:items-center sm:p-6"
                            >
                                <div className="min-w-0 space-y-2">
                                    <div className="flex flex-wrap items-center gap-2.5">
                                        <h3 className="truncate text-base font-semibold text-ink transition-colors group-hover:text-copper">
                                            {job.title || "Untitled Job"}
                                        </h3>

                                        <span className="rounded-full border border-line bg-subtle px-3 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-muted">
                      {job.category || "General"}
                    </span>
                                    </div>

                                    <p className="flex items-center gap-1.5 text-xs text-muted">
                                        <MapPin size={13} className="shrink-0 text-copper/80" />
                                        <span>{job.location || "Location not specified"}</span>
                                    </p>
                                </div>

                                <div className="flex items-center justify-between gap-4 sm:justify-end">

                                    <div className="sm:text-right">
                                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
                                            {getJobPriceInfo(job, isArtisan).label}
                                        </p>

                                        <p className="font-display text-lg font-semibold text-ink">
                                            {getJobPriceInfo(job, isArtisan).value}
                                        </p>

                                        {getJobPriceInfo(job, isArtisan).detail && (
                                            <p className="mt-1 text-[11px] text-muted">
                                                {getJobPriceInfo(job, isArtisan).detail}
                                            </p>
                                        )}

                                        {getJobPriceInfo(job, isArtisan).secondary && (
                                            <p className="mt-1 text-[11px] text-muted">
                                                {getJobPriceInfo(job, isArtisan).secondary}
                                            </p>
                                        )}

                                        <span
                                            className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${getStatusBadgeStyle(
                                                job.status
                                            )}`}
                                        >
        {(job.status || "open").replaceAll("_", " ")}
    </span>
                                    </div>


                                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line bg-paper text-muted transition-all group-hover:border-copper group-hover:bg-copper group-hover:text-white">
                    <ArrowUpRight size={16} />
                  </span>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="rounded-3xl border border-dashed border-line-strong bg-cream px-6 py-12 text-center">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-subtle text-copper">
                                <BriefcaseBusiness size={22} />
                            </div>

                            <h3 className="mt-4 font-display text-xl font-semibold text-ink">
                                {isArtisan ? "No open opportunities yet" : "No jobs posted yet"}
                            </h3>

                            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted">
                                {isArtisan
                                    ? "New local jobs will appear here as soon as customers publish them."
                                    : "Post your first job to receive quotes from vetted local artisans."}
                            </p>

                            <Link
                                to={isArtisan ? "/jobs?view=all" : "/jobs/new"}
                                className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-copper px-6 text-xs font-semibold text-white no-underline shadow-sm transition-colors hover:bg-copper-deep"
                            >
                                <span>{isArtisan ? "Explore Jobs" : "Post Your First Job"}</span>
                                <ArrowRight size={14} />
                            </Link>
                        </div>
                    )}
                </div>
            </section>

            {/* Secondary Settings Grid (Profile & Social Links side-by-side on desktop) */}
            <div className={`grid gap-6 ${isArtisan ? "lg:grid-cols-12" : ""}`}>
                {isArtisan && (
                    <section className="rounded-3xl border border-line bg-cream p-6 shadow-card sm:p-8 lg:col-span-7">
                        <div className="mb-6">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-copper">
                                Professional Profile
                            </p>
                            <h2 className="mt-1.5 font-display text-2xl font-semibold text-ink">
                                Your Artisan Credentials
                            </h2>
                            <p className="mt-1.5 text-sm leading-relaxed text-muted">
                                Keep your trade skills and experience up to date so customers
                                trust your bids.
                            </p>
                        </div>

                        <form className="grid gap-5" onSubmit={handleProfileSubmit}>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <label
                                        htmlFor="artisan-skills"
                                        className="text-xs font-semibold text-ink"
                                    >
                                        Trade Skills
                                    </label>
                                    <input
                                        id="artisan-skills"
                                        value={skills}
                                        onChange={(e) => setSkills(e.target.value)}
                                        placeholder="e.g. Carpentry, Plumbing"
                                        className="min-h-11 w-full rounded-xl border border-line bg-paper px-3.5 text-sm text-ink outline-none transition focus:border-copper focus:ring-2 focus:ring-copper/15"
                                        required
                                    />
                                    <p className="text-[11px] text-muted">
                                        Separate multiple skills with commas.
                                    </p>
                                </div>

                                <div className="space-y-1.5">
                                    <label
                                        htmlFor="artisan-years"
                                        className="text-xs font-semibold text-ink"
                                    >
                                        Years of Experience
                                    </label>
                                    <input
                                        id="artisan-years"
                                        type="number"
                                        min="0"
                                        max="80"
                                        value={years}
                                        onChange={(e) => setYears(e.target.value)}
                                        className="min-h-11 w-full rounded-xl border border-line bg-paper px-3.5 text-sm text-ink outline-none transition focus:border-copper focus:ring-2 focus:ring-copper/15"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label
                                    htmlFor="artisan-bio"
                                    className="text-xs font-semibold text-ink"
                                >
                                    Workshop & Work Summary
                                </label>
                                <textarea
                                    id="artisan-bio"
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    rows={3}
                                    maxLength={1000}
                                    placeholder="Describe your specialty, past projects, and tools..."
                                    className="w-full resize-y rounded-xl border border-line bg-paper p-3.5 text-sm text-ink outline-none transition focus:border-copper focus:ring-2 focus:ring-copper/15"
                                />
                                <p className="text-right text-[11px] text-muted">
                                    {bio.length}/1000
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-4">
                                <button
                                    type="submit"
                                    disabled={profileSaving}
                                    className="inline-flex min-h-11 items-center justify-center rounded-full bg-copper px-6 text-sm font-semibold text-white transition-all hover:bg-copper-deep disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {profileSaving ? "Saving..." : "Save Profile"}
                                </button>

                                {profileNote.text && (
                                    <p
                                        role="status"
                                        className={`text-sm font-medium ${
                                            profileNote.type === "error"
                                                ? "text-danger"
                                                : "text-success"
                                        }`}
                                    >
                                        {profileNote.text}
                                    </p>
                                )}
                            </div>
                        </form>
                    </section>
                )}

                <section
                    className={`rounded-3xl border border-line bg-cream p-6 shadow-card sm:p-8 ${
                        isArtisan ? "lg:col-span-5" : ""
                    }`}
                >
                    <div className="mb-6">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-copper">
                            Social Proof
                        </p>
                        <h2 className="mt-1.5 font-display text-2xl font-semibold text-ink">
                            Portfolio & Social Links
                        </h2>
                        <p className="mt-1.5 text-sm leading-relaxed text-muted">
                            Link your Instagram, X, or WhatsApp catalog so clients can verify
                            your past builds.
                        </p>
                    </div>

                    <SocialLinksForm />
                </section>
            </div>
        </div>
    );
}

function StatCard({ label, value, description, icon: Icon, badge, action }) {
    const badgeClasses =
        badge?.tone === "warning"
            ? "bg-warning-soft text-warning"
            : "bg-success-soft text-success";

    return (
        <article className="group relative overflow-hidden rounded-2xl border border-line bg-cream p-6 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-raised">
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                        {label}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                        <p className="break-words font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                            {value}
                        </p>
                        {action}
                    </div>
                </div>

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-copper/15 bg-copper/10 text-copper transition-colors group-hover:bg-copper/15">
                    <Icon size={20} strokeWidth={1.8} />
                </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-line/70 pt-3.5">
                <p className="text-xs leading-relaxed text-muted">{description}</p>
                {badge && (
                    <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${badgeClasses}`}
                    >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {badge.text}
          </span>
                )}
            </div>
        </article>
    );
}

function QuickLink({ to, children }) {
    return (
        <Link
            to={to}
            className="inline-flex min-h-10 items-center rounded-full border border-line bg-paper px-4 text-xs font-semibold text-ink no-underline transition-all hover:border-copper hover:bg-raised"
        >
            {children}
        </Link>
    );
}