import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Image as ImageIcon,
    PlusCircle,
    UploadCloud,
    Video,
    X,
} from "lucide-react";
import toast from "react-hot-toast";

import { craftad } from "../api";
import { useSession } from "../session";

const CATEGORIES = [
    "electrician",
    "plumber",
    "carpenter",
    "mechanic",
    "welder",
    "painter",
    "cleaner",
];

const MAX_FILES = 5;
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

const ALLOWED_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "video/mp4",
    "video/quicktime",
    "video/webm",
];

function formatFileSize(bytes) {
    if (!Number.isFinite(bytes) || bytes <= 0) return "";
    if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function NewJob() {
    const { token, user } = useSession();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        title: "",
        description: "",
        category: "plumber",
        budgetType: "open",
        budget: "",
        location: "",
    });

    const [files, setFiles] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);

    const field =
        "mt-2 w-full rounded-2xl border border-line bg-paper px-4 py-3.5 text-sm text-ink outline-none transition placeholder:text-muted/70 focus:border-copper focus:ring-2 focus:ring-copper/15";

    // Generate object URLs for previews and release browser memory on cleanup.
    useEffect(() => {
        const nextPreviews = files.map((file) => ({
            file,
            url: URL.createObjectURL(file),
        }));

        setPreviews(nextPreviews);

        return () => {
            nextPreviews.forEach((preview) => {
                URL.revokeObjectURL(preview.url);
            });
        };
    }, [files]);

    // Only customers can post new jobs.
    if (user && user.role !== "customer") {
        return <Navigate to="/jobs" replace />;
    }

    function updateField(e) {
        const { name, value } = e.target;
        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    }

    function addSelectedFiles(incomingFiles) {
        const selectedFiles = Array.from(incomingFiles || []);
        if (!selectedFiles.length) return;

        setError("");

        const remainingSlots = MAX_FILES - files.length;

        if (selectedFiles.length > remainingSlots) {
            setError(
                `You can upload a maximum of ${MAX_FILES} files. You currently have ${files.length}.`
            );
            return;
        }

        const invalidFile = selectedFiles.find(
            (file) => !ALLOWED_TYPES.includes(file.type)
        );

        if (invalidFile) {
            setError(
                `${invalidFile.name} has an unsupported format. Use JPEG, PNG, WebP, MP4, MOV, or WebM.`
            );
            return;
        }

        const oversizedFile = selectedFiles.find(
            (file) => file.size > MAX_FILE_SIZE
        );

        if (oversizedFile) {
            setError(`${oversizedFile.name} is larger than the 50 MB limit.`);
            return;
        }

        setFiles((previous) => [...previous, ...selectedFiles]);
    }

    function handleFileSelection(e) {
        addSelectedFiles(e.target.files);
        // Allow re-selecting the same file after removing it.
        e.target.value = "";
    }

    function handleDrop(e) {
        e.preventDefault();
        setIsDragging(false);
        if (busy || files.length >= MAX_FILES) return;
        addSelectedFiles(e.dataTransfer?.files);
    }

    function removeFile(index) {
        setFiles((previous) =>
            previous.filter((_, fileIndex) => fileIndex !== index)
        );
    }

    async function onSubmit(e) {
        e.preventDefault();
        if (busy) return;

        setError("");

        if (
            !form.title.trim() ||
            !form.description.trim() ||
            !form.location.trim()
        ) {
            setError("Please complete all required job details.");
            return;
        }

        const parsedBudget = Number(form.budget);
        if (
            form.budgetType === "capped" &&
            (form.budget.trim() === "" ||
                !Number.isFinite(parsedBudget) ||
                parsedBudget < 5000)
        ) {
            setError("Please enter a capped budget of at least ₦5,000.");
            return;
        }

        const formData = new FormData();
        formData.append("title", form.title.trim());
        formData.append("description", form.description.trim());
        formData.append("category", form.category);
        formData.append("location", form.location.trim());

        if (form.budgetType === "capped") {
            formData.append("budget", String(parsedBudget));
        }

        files.forEach((file) => {
            formData.append("media", file);
        });

        setBusy(true);

        try {
            await craftad.createJob(token, formData);
            toast.success("Your job has been published successfully.");
            navigate("/jobs");
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Could not publish your job.";
            setError(message);
            toast.error(message);
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="mx-auto max-w-2xl space-y-8 pb-12">
            <div>
                <Link
                    to="/jobs"
                    className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted no-underline transition hover:text-copper"
                >
                    <ArrowLeft size={16} />
                    Back to jobs directory
                </Link>

                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-copper">
                    Customer Workspace
                </p>

                <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                    Post a new job
                </h1>

                <p className="mt-1.5 text-sm text-muted">
                    Show artisans exactly what needs fixing so they can understand the
                    scope and propose an accurate price.
                </p>
            </div>

            <form
                onSubmit={onSubmit}
                className="grid gap-6 rounded-3xl border border-line bg-cream p-6 shadow-card sm:p-9"
            >
                {error && (
                    <div
                        role="alert"
                        className="rounded-2xl border border-danger/30 bg-danger-soft px-4 py-3.5 text-sm font-medium text-danger"
                    >
                        {error}
                    </div>
                )}

                <label className="block text-sm font-semibold text-ink">
                    Project title
                    <input
                        required
                        maxLength={120}
                        name="title"
                        value={form.title}
                        onChange={updateField}
                        placeholder="e.g. Residential 3-phase wiring repair"
                        className={field}
                    />
                </label>

                <label className="block text-sm font-semibold text-ink">
                    What needs doing (Description)
                    <textarea
                        required
                        rows={4}
                        maxLength={5000}
                        name="description"
                        value={form.description}
                        onChange={updateField}
                        placeholder="Describe the problem, what needs fixing, and any important details..."
                        className={field}
                    />
                </label>

                {/* Trade Category & Location */}
                <div className="grid gap-5 sm:grid-cols-2">
                    <label className="block text-sm font-semibold text-ink">
                        Required trade category
                        <select
                            name="category"
                            value={form.category}
                            onChange={updateField}
                            className={`${field} capitalize`}
                        >
                            {CATEGORIES.map((category) => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="block text-sm font-semibold text-ink">
                        Service location / Address
                        <input
                            required
                            maxLength={300}
                            name="location"
                            value={form.location}
                            onChange={updateField}
                            placeholder="e.g. Ikeja, Lagos"
                            className={field}
                        />
                    </label>
                </div>

                {/* Budget Type Selection */}
                <div className="space-y-3 rounded-2xl border border-line/80 bg-paper/60 p-4 sm:p-5">
                    <div>
                        <p className="text-sm font-semibold text-ink">
                            How would you like to set your budget?
                        </p>
                        <p className="mt-0.5 text-xs text-muted">
                            Set a maximum spending cap or let artisans inspect and propose a
                            quote.
                        </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                        <label
                            className={`cursor-pointer rounded-2xl border p-4 transition ${
                                form.budgetType === "open"
                                    ? "border-copper bg-copper/10 ring-2 ring-copper/15"
                                    : "border-line bg-cream hover:border-line-strong"
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="budgetType"
                                    value="open"
                                    checked={form.budgetType === "open"}
                                    onChange={updateField}
                                    className="accent-copper"
                                />
                                <span className="text-sm font-semibold text-ink">
                  Open budget
                </span>
                            </div>
                            <span className="mt-1.5 block text-xs font-normal leading-relaxed text-muted">
                Let artisans assess the job and propose a fair price.
              </span>
                        </label>

                        <label
                            className={`cursor-pointer rounded-2xl border p-4 transition ${
                                form.budgetType === "capped"
                                    ? "border-copper bg-copper/10 ring-2 ring-copper/15"
                                    : "border-line bg-cream hover:border-line-strong"
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="budgetType"
                                    value="capped"
                                    checked={form.budgetType === "capped"}
                                    onChange={updateField}
                                    className="accent-copper"
                                />
                                <span className="text-sm font-semibold text-ink">
                  Capped budget
                </span>
                            </div>
                            <span className="mt-1.5 block text-xs font-normal leading-relaxed text-muted">
                Set the maximum amount you are willing to spend.
              </span>
                        </label>
                    </div>

                    {form.budgetType === "capped" && (
                        <label className="block pt-2 text-sm font-semibold text-ink">
                            Your maximum budget (₦)
                            <input
                                type="number"
                                name="budget"
                                min={5000}
                                step="1"
                                required
                                value={form.budget}
                                onChange={updateField}
                                placeholder="e.g. 50000"
                                className="mt-2 w-full rounded-2xl border border-line bg-cream px-4 py-3.5 text-sm text-ink outline-none transition placeholder:text-muted/70 focus:border-copper focus:ring-2 focus:ring-copper/15"
                            />
                            <span className="mt-1.5 block text-xs font-normal text-muted">
                Minimum capped budget: ₦5,000. Final escrow amount is locked
                after negotiation.
              </span>
                        </label>
                    )}
                </div>

                {/* Job Photos and Videos */}
                <section className="space-y-3">
                    <div>
                        <h2 className="text-sm font-semibold text-ink">
                            Photos and videos of the work
                        </h2>
                        <p className="mt-0.5 text-xs text-muted">
                            Optional — upload up to {MAX_FILES} files (max 50 MB each) to help
                            artisans quote accurately.
                        </p>
                    </div>

                    <label
                        onDragOver={(e) => {
                            e.preventDefault();
                            if (!busy && files.length < MAX_FILES) setIsDragging(true);
                        }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                        className={`flex min-h-36 flex-col items-center justify-center rounded-2xl border-2 border-dashed px-5 py-7 text-center transition ${
                            files.length >= MAX_FILES
                                ? "cursor-not-allowed border-line bg-paper/50 opacity-60"
                                : isDragging
                                    ? "cursor-pointer border-copper bg-copper/10"
                                    : "cursor-pointer border-line bg-paper hover:border-copper hover:bg-copper/5"
                        }`}
                    >
            <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-copper/10 text-copper">
              <UploadCloud size={24} />
            </span>

                        <span className="text-sm font-semibold text-ink">
              {files.length >= MAX_FILES
                  ? "Maximum files reached"
                  : "Click or drag photos and videos here"}
            </span>

                        <span className="mt-1 text-xs text-muted">
              JPEG, PNG, WebP, MP4, MOV, or WebM
            </span>

                        <input
                            type="file"
                            multiple
                            accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm"
                            onChange={handleFileSelection}
                            disabled={busy || files.length >= MAX_FILES}
                            className="sr-only"
                        />
                    </label>

                    <div className="flex items-center justify-between text-xs text-muted">
            <span>
              {files.length} of {MAX_FILES} files selected
            </span>
                        <span>{MAX_FILES - files.length} remaining</span>
                    </div>

                    {previews.length > 0 && (
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                            {previews.map((preview, index) => {
                                const isVideo = preview.file.type.startsWith("video/");

                                return (
                                    <div
                                        key={`${preview.file.name}-${preview.file.lastModified}-${index}`}
                                        className="group relative overflow-hidden rounded-2xl border border-line bg-paper"
                                    >
                                        {isVideo ? (
                                            <video
                                                src={preview.url}
                                                controls
                                                preload="metadata"
                                                className="h-32 w-full object-cover"
                                            />
                                        ) : (
                                            <img
                                                src={preview.url}
                                                alt={preview.file.name}
                                                className="h-32 w-full object-cover"
                                            />
                                        )}

                                        <div className="flex items-center gap-1.5 px-2.5 py-2">
                                            {isVideo ? (
                                                <Video size={13} className="shrink-0 text-copper" />
                                            ) : (
                                                <ImageIcon size={13} className="shrink-0 text-copper" />
                                            )}

                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-xs font-medium text-ink">
                                                    {preview.file.name}
                                                </p>
                                                <p className="text-[10px] text-muted">
                                                    {formatFileSize(preview.file.size)}
                                                </p>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => removeFile(index)}
                                                disabled={busy}
                                                aria-label={`Remove ${preview.file.name}`}
                                                className="rounded-full p-1 text-muted transition hover:bg-danger-soft hover:text-danger disabled:opacity-50"
                                            >
                                                <X size={15} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={busy}
                        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-copper px-8 text-sm font-semibold text-white shadow-sm transition hover:bg-copper-deep disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <PlusCircle size={18} />
                        <span>
              {busy
                  ? "Uploading and publishing..."
                  : "Publish job to marketplace"}
            </span>
                    </button>
                </div>
            </form>
        </div>
    );
}