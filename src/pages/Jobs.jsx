import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
    ArrowLeft,
    ArrowUpDown,
    ArrowUpRight,
    Briefcase,
    Clock,
    MapPin,
    Plus,
    RefreshCw,
    Search,
    Users,
    X,
} from "lucide-react";
import { craftad, listOf } from "../api";
import { useSession } from "../session";

const STATUS_FILTERS = [
    { value: "ALL", label: "All statuses" },
    { value: "open", label: "Open" },
    { value: "active", label: "In progress" },
    { value: "completed", label: "Completed" },
];

const SORT_OPTIONS = [
    { value: "newest", label: "Newest first" },
    { value: "budget_desc", label: "Highest budget" },
    { value: "budget_asc", label: "Lowest budget" },
];

function formatNaira(amount) {
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) return "—";
    return `₦${value.toLocaleString("en-NG", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    })}`;
}


function getJobPriceInfo(job, isArtisan) {
    const agreed = Number(job.agreedPrice);
    const budget = Number(job.budget);

    const validBudget = Number.isFinite(budget) && budget > 0;

    if (Number.isFinite(agreed) && agreed > 0) {
        return {
            label: "Agreed Price",
            value: formatNaira(agreed),
            detail: "",
            secondary: validBudget
                ? `Original budget: ${formatNaira(budget)}`
                : "",
            sortAmount: agreed,
        };
    }

    let latestOffer = null;

    if (isArtisan) {
        const offer = job.myApplication?.currentOffer;

        if (offer?.status === "pending") {
            latestOffer = offer;
        }
    } else {
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
        const amount = Number(latestOffer.amount);
        const proposerName = latestOffer.proposedBy?.fullName;

        return {
            label: isArtisan ? "Latest Offer on Your Application" : "Latest Offer",
            value: formatNaira(amount),
            detail: proposerName
                ? `Proposed by ${proposerName}`
                : "Pending negotiation",
            secondary: validBudget
                ? `Customer budget: ${formatNaira(budget)}`
                : "",
            sortAmount: amount,
        };
    }

    if (validBudget) {
        return {
            label: "Budget",
            value: formatNaira(budget),
            detail: "",
            secondary: "",
            sortAmount: budget,
        };
    }

    return {
        label: "Budget",
        value: "Open to quotes",
        detail: "",
        secondary: "",
        sortAmount: 0,
    };
}

function getEffectiveAmount(job, isArtisan) {
    return getJobPriceInfo(job, isArtisan).sortAmount;
}

function getJobAmountDisplay(job, isArtisan) {
    return getJobPriceInfo(job, isArtisan);
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

function formatRelativeDate(dateString) {
    if (!dateString) return null;
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return null;

    const diffMs = Date.now() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `Posted ${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "Posted yesterday";
    if (diffDays < 30) return `Posted ${diffDays}d ago`;

    return date.toLocaleDateString("en-NG", { month: "short", day: "numeric" });
}

export function Jobs() {
    const { token, user } = useSession();
    const [params, setParams] = useSearchParams();

    const rawView = params.get("view");
    const view =
        rawView === "assigned" ? "assigned" : rawView === "all" ? "all" : "board";

    const [jobs, setJobs] = useState([]);
    const [q, setQ] = useState("");
    const deferredQuery = useDeferredValue(q);
    const [selectedCategory, setSelectedCategory] = useState("ALL");
    const [selectedStatus, setSelectedStatus] = useState("ALL");
    const [sortBy, setSortBy] = useState("newest");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const isArtisan = user?.role === "artisan";

    const fetchJobs = useCallback(
        async (isManualRefresh = false) => {
            if (!token || !user) return;
            if (isManualRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }
            setError("");

            try {
                let fetched = [];

                if (view === "all") {
                    const results = await Promise.allSettled([
                        craftad.myJobs(token),
                        craftad.openJobs(token),
                    ]);
                    const merged = results.flatMap((result) =>
                        result.status === "fulfilled" ? listOf(result.value, ["jobs"]) : []
                    );
                    const seen = new Set();
                    fetched = merged.filter((job) => {
                        const id = job?._id || job?.id;
                        if (!id || seen.has(id)) return false;
                        seen.add(id);
                        return true;
                    });
                } else {
                    const endpoint =
                        view === "assigned" || user.role !== "artisan"
                            ? craftad.myJobs(token)
                            : craftad.openJobs(token);
                    const data = await endpoint;
                    fetched = listOf(data, ["jobs"]);
                }

                setJobs(fetched);
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : "Unable to load jobs right now."
                );
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        [token, user, view]
    );

    useEffect(() => {
        fetchJobs(false);
    }, [fetchJobs]);

    // Pre-index normalized search fields once per fetch for instant filtering
    const indexedJobs = useMemo(
        () =>
            jobs.map((job) => ({
                ...job,
                _id: job._id || job.id,
                _amount: getEffectiveAmount(job, isArtisan),
                _createdTs: job.createdAt ? new Date(job.createdAt).getTime() || 0 : 0,
                _searchBlob: [job.title, job.description, job.location, job.category]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase(),
            })),
        [jobs]
    );

    // Extract unique trade categories dynamically
    const categories = useMemo(() => {
        const unique = new Set(
            indexedJobs.map((j) => j.category?.trim()).filter(Boolean)
        );
        return ["ALL", ...Array.from(unique).sort((a, b) => a.localeCompare(b))];
    }, [indexedJobs]);

    const shown = useMemo(() => {
        let base =
            view === "assigned"
                ? indexedJobs.filter((job) => job.status && job.status !== "open")
                : indexedJobs;

        if (selectedCategory !== "ALL") {
            const targetCat = selectedCategory.toLowerCase();
            base = base.filter(
                (job) => job.category?.trim().toLowerCase() === targetCat
            );
        }

        if (selectedStatus !== "ALL") {
            base = base.filter((job) => {
                const s = job.status || "open";
                if (selectedStatus === "open") return s === "open";
                if (selectedStatus === "active")
                    return s === "assigned" || s === "in_progress";
                if (selectedStatus === "completed")
                    return (
                        s === "completed" || s === "customer_confirmed" || s === "paid"
                    );
                return true;
            });
        }

        const needle = deferredQuery.trim().toLowerCase();
        if (needle) {
            base = base.filter((job) => job._searchBlob.includes(needle));
        }

        const sorted = [...base];
        if (sortBy === "budget_desc") {
            sorted.sort((a, b) => b._amount - a._amount);
        } else if (sortBy === "budget_asc") {
            sorted.sort((a, b) => a._amount - b._amount);
        } else {
            sorted.sort((a, b) => b._createdTs - a._createdTs);
        }

        return sorted;
    }, [
        indexedJobs,
        view,
        selectedCategory,
        selectedStatus,
        deferredQuery,
        sortBy,
    ]);

    const hasActiveFilters =
        Boolean(q.trim()) ||
        selectedCategory !== "ALL" ||
        selectedStatus !== "ALL";

    const resetFilters = () => {
        setQ("");
        setSelectedCategory("ALL");
        setSelectedStatus("ALL");
    };

    const handleSwitchView = (nextParams) => {
        setSelectedCategory("ALL");
        setSelectedStatus("ALL");
        setParams(nextParams);
    };

    const title =
        view === "all"
            ? "All Marketplace Jobs"
            : view === "assigned"
                ? "Assigned Contracts"
                : isArtisan
                    ? "Open Opportunities"
                    : "Your Posted Jobs";

    const tabClass = (active) =>
        `inline-flex min-h-10 items-center rounded-full px-4 text-xs font-semibold transition-all ${
            active
                ? "bg-ink text-paper shadow-sm"
                : "border border-line bg-cream text-muted hover:border-line-strong hover:text-ink"
        }`;

    return (
        <div className="space-y-7 pb-12">
            {/* Header & View Switcher */}
            <div className="flex flex-col justify-between gap-5 border-b border-line pb-6 lg:flex-row lg:items-end">
                <div>
                    <Link
                        to="/dashboard"
                        className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold text-muted no-underline transition hover:text-copper"
                    >
                        <ArrowLeft size={15} />
                        <span>Back to overview</span>
                    </Link>

                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                            {title}
                        </h1>
                        {!loading && (
                            <span className="rounded-full border border-line bg-cream px-3 py-1 text-xs font-semibold text-muted">
                {shown.length} {shown.length === 1 ? "job" : "jobs"}
              </span>
                        )}
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        className={tabClass(view === "board")}
                        onClick={() => handleSwitchView({})}
                    >
                        {isArtisan ? "Open Jobs" : "Your Jobs"}
                    </button>

                    <button
                        type="button"
                        className={tabClass(view === "all")}
                        onClick={() => handleSwitchView({ view: "all" })}
                    >
                        All Jobs
                    </button>

                    <button
                        type="button"
                        className={tabClass(view === "assigned")}
                        onClick={() => handleSwitchView({ view: "assigned" })}
                    >
                        Assigned
                    </button>

                    <button
                        type="button"
                        onClick={() => fetchJobs(true)}
                        disabled={loading || refreshing}
                        aria-label="Refresh jobs list"
                        title="Refresh jobs"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-cream text-muted transition hover:border-line-strong hover:text-ink disabled:opacity-50"
                    >
                        <RefreshCw
                            size={15}
                            className={refreshing ? "animate-spin text-copper" : ""}
                        />
                    </button>

                    {!isArtisan && (
                        <Link
                            to="/jobs/new"
                            className="ml-1 inline-flex min-h-10 items-center gap-1.5 rounded-full bg-copper px-5 text-xs font-semibold text-white no-underline shadow-sm transition hover:bg-copper-deep"
                        >
                            <Plus size={15} />
                            <span>Post a Job</span>
                        </Link>
                    )}
                </div>
            </div>

            {/* Search, Sort & Filter Controls */}
            <div className="space-y-3">
                <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="relative flex-1">
                        <Search
                            size={18}
                            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                        />
                        <input
                            type="search"
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="Search by trade, location, or project title..."
                            className="min-h-12 w-full rounded-2xl border border-line bg-cream py-3 pl-11 pr-10 text-sm text-ink shadow-card outline-none transition placeholder:text-muted/70 focus:border-copper focus:ring-2 focus:ring-copper/15"
                        />
                        {q && (
                            <button
                                type="button"
                                onClick={() => setQ("")}
                                aria-label="Clear search"
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted hover:bg-subtle hover:text-ink"
                            >
                                <X size={15} />
                            </button>
                        )}
                    </div>

                    <div className="relative sm:w-52">
                        <ArrowUpDown
                            size={15}
                            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
                        />
                        <select
                            aria-label="Sort jobs"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="min-h-12 w-full appearance-none rounded-2xl border border-line bg-cream pl-10 pr-8 text-xs font-semibold text-ink shadow-card outline-none transition focus:border-copper focus:ring-2 focus:ring-copper/15"
                        >
                            {SORT_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Status Filter Pills (shown when viewing all or customer jobs) */}
                {!loading && view !== "assigned" && indexedJobs.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 pt-0.5">
                        {STATUS_FILTERS.map((item) => {
                            const active = selectedStatus === item.value;
                            return (
                                <button
                                    key={item.value}
                                    type="button"
                                    onClick={() => setSelectedStatus(item.value)}
                                    className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                                        active
                                            ? "bg-ink text-paper shadow-sm"
                                            : "border border-line bg-paper text-muted hover:border-line-strong hover:text-ink"
                                    }`}
                                >
                                    {item.label}
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Dynamic Trade Chips */}
                {!loading && categories.length > 2 && (
                    <div className="flex flex-wrap items-center gap-2 pt-0.5">
                        {categories.map((cat) => {
                            const active = selectedCategory === cat;
                            return (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                                        active
                                            ? "bg-copper text-white shadow-sm"
                                            : "border border-line bg-cream text-muted hover:border-copper/50 hover:text-ink"
                                    }`}
                                >
                                    {cat === "ALL" ? "All Trades" : cat}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Error State Banner */}
            {error && (
                <div
                    role="alert"
                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-danger/25 bg-danger-soft px-5 py-4 text-sm font-medium text-danger"
                >
                    <span>{error}</span>
                    <button
                        type="button"
                        onClick={() => fetchJobs(false)}
                        className="rounded-full bg-danger px-3.5 py-1.5 text-xs font-semibold text-white transition hover:opacity-90"
                    >
                        Try again
                    </button>
                </div>
            )}

            {/* Jobs Feed */}
            {loading ? (
                <div className="grid gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-40 animate-pulse rounded-3xl border border-line bg-cream/70 p-6"
                        />
                    ))}
                </div>
            ) : shown.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-line-strong bg-cream px-6 py-16 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-subtle text-copper">
                        <Briefcase size={22} />
                    </div>
                    <h2 className="font-display text-2xl font-semibold text-ink">
                        No matching jobs found
                    </h2>
                    <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted">
                        {hasActiveFilters
                            ? "Clear your search or filter selections to see all available jobs in this view."
                            : isArtisan
                                ? "There are no open jobs in this tab right now. Check back shortly or refresh."
                                : "You haven't posted any jobs in this view yet."}
                    </p>

                    <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                        {hasActiveFilters && (
                            <button
                                type="button"
                                onClick={resetFilters}
                                className="inline-flex min-h-10 items-center rounded-full border border-line bg-paper px-5 text-xs font-semibold text-ink transition hover:border-copper"
                            >
                                Reset filters
                            </button>
                        )}

                        {!isArtisan && !hasActiveFilters && (
                            <Link
                                to="/jobs/new"
                                className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-copper px-5 text-xs font-semibold text-white no-underline shadow-sm transition hover:bg-copper-deep"
                            >
                                <Plus size={15} />
                                <span>Post your first job</span>
                            </Link>
                        )}
                    </div>
                </div>
            ) : (
                <ul className="grid gap-4">
                    {shown.map((job) => {
                        const postedLabel = formatRelativeDate(job.createdAt);
                        const amount = getJobAmountDisplay(job, isArtisan);
                        const applicantsCount =
                            job.applicationsCount ??
                            (Array.isArray(job.applications) ? job.applications.length : null);

                        return (
                            <li key={job._id}>
                                <Link
                                    to={`/jobs/${job._id}`}
                                    className="group block rounded-3xl border border-line bg-cream p-6 no-underline shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-raised sm:p-7"
                                >
                                    {/* Top Row: Category + Status on Left, Price Anchor on Right */}
                                    <div className="flex flex-wrap items-start justify-between gap-4">
                                        <div className="min-w-0 flex-1 space-y-2">
                                            <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-line bg-subtle px-3 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-ink">
                          {job.category || "General"}
                        </span>

                                                <span
                                                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${getStatusBadgeStyle(
                                                        job.status
                                                    )}`}
                                                >
                          {(job.status || "open").replaceAll("_", " ")}
                        </span>
                                            </div>

                                            <h2 className="break-words font-display text-xl font-semibold text-ink transition-colors group-hover:text-copper sm:text-2xl">
                                                {job.title}
                                            </h2>
                                        </div>


                                        <div className="shrink-0 text-left sm:text-right">
                                            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                                                {amount.label}
                                            </p>

                                            <p className="font-display text-xl font-semibold text-ink sm:text-2xl">
                                                {amount.value}
                                            </p>

                                            {amount.detail && (
                                                <p className="mt-1 text-[11px] text-muted">
                                                    {amount.detail}
                                                </p>
                                            )}

                                            {amount.secondary && (
                                                <p className="mt-1 text-[11px] text-muted">
                                                    {amount.secondary}
                                                </p>
                                            )}
                                        </div>

                                    </div>

                                    {/* Description Excerpt */}
                                    <p className="mt-3 line-clamp-2 max-w-3xl text-sm leading-relaxed text-muted">
                                        {job.description || "No description provided."}
                                    </p>

                                    {/* Clean Metadata & Action Footer */}
                                    <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-line/70 pt-4 text-xs text-muted">
                                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                      <span className="inline-flex items-center gap-1.5 font-medium text-ink">
                        <MapPin size={14} className="shrink-0 text-copper" />
                          {job.location || "Location not specified"}
                      </span>

                                            {postedLabel && (
                                                <span className="inline-flex items-center gap-1.5">
                          <Clock size={14} className="shrink-0" />
                                                    {postedLabel}
                        </span>
                                            )}

                                            {applicantsCount !== null && (
                                                <span className="inline-flex items-center gap-1.5">
                          <Users size={14} className="shrink-0" />
                                                    {applicantsCount}{" "}
                                                    {applicantsCount === 1 ? "quote" : "quotes"}
                        </span>
                                            )}
                                        </div>

                                        <span className="inline-flex items-center gap-1 font-semibold text-copper transition-transform group-hover:translate-x-0.5">
                      <span>
                        {isArtisan && job.status === "open"
                            ? "Review & Bid"
                            : "Open Workspace"}
                      </span>
                      <ArrowUpRight size={15} />
                    </span>
                                    </div>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}