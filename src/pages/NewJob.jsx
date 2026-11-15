
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    PlusCircle,
    ImagePlus,
    X,
    Image as ImageIcon,
    Video,
    UploadCloud
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
    "cleaner"
];

const MAX_FILES = 5;
const MAX_FILE_SIZE = 50 * 1024 * 1024;

const ALLOWED_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "video/mp4",
    "video/quicktime",
    "video/webm"
];

export function NewJob() {
    const { token } = useSession();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        title: "",
        description: "",
        category: "plumber",
        budget: "",
        location: ""
    });

    const [files, setFiles] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);

    const field =
        "mt-2 w-full rounded-2xl border border-line bg-paper px-4 py-3.5 text-sm text-ink outline-none transition focus:border-copper focus:ring-2 focus:ring-copper/10 shadow-sm";

    // Generate previews and release browser memory when files change.
    useEffect(() => {
        const nextPreviews = files.map((file) => ({
            file,
            url: URL.createObjectURL(file)
        }));

        setPreviews(nextPreviews);

        return () => {
            nextPreviews.forEach((preview) => {
                URL.revokeObjectURL(preview.url);
            });
        };
    }, [files]);

    function updateField(e) {
        const { name, value } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: value
        }));
    }

    function handleFileSelection(e) {
        const selectedFiles = Array.from(e.target.files || []);

        // Allow selecting the same file again after removing it.
        e.target.value = "";

        if (!selectedFiles.length) return;

        setError("");

        const remainingSlots = MAX_FILES - files.length;

        if (selectedFiles.length > remainingSlots) {
            setError(
                `You can upload a maximum of ${MAX_FILES} files. You currently have ${files.length}.`
            );
            return;
        }

        const invalidFile = selectedFiles.find((file) => {
            return !ALLOWED_TYPES.includes(file.type);
        });

        if (invalidFile) {
            setError(
                `${invalidFile.name} has an unsupported format. Use JPEG, PNG, WebP, MP4, MOV, or WebM.`
            );
            return;
        }

        const oversizedFile = selectedFiles.find((file) => {
            return file.size > MAX_FILE_SIZE;
        });

        if (oversizedFile) {
            setError(
                `${oversizedFile.name} is larger than the 50 MB limit.`
            );
            return;
        }

        setFiles((previous) => [...previous, ...selectedFiles]);
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

        if (!form.title.trim() || !form.description.trim() || !form.location.trim()) {
            setError("Please complete the required job details.");
            return;
        }

        if (
            form.budget.trim() !== "" &&
            (!Number.isFinite(Number(form.budget)) || Number(form.budget) < 5000)
        ) {
            setError("If provided, your budget must be at least ₦5,000.");
            return;
        }

        const formData = new FormData();

        formData.append("title", form.title.trim());
        formData.append("description", form.description.trim());
        formData.append("category", form.category);
        formData.append("location", form.location.trim());

        // Budget is optional. The artisan will propose the initial price.
        if (form.budget.trim() !== "") {
            formData.append("budget", form.budget);
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
                err instanceof Error
                    ? err.message
                    : "Could not publish your job.";

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

                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-copper">
                    CUSTOMER WORKSPACE
                </p>

                <h1 className="mt-1 font-display text-3xl tracking-tight text-ink sm:text-4xl">
                    Post a new job
                </h1>

                <p className="mt-1 text-sm text-muted">
                    Show artisans exactly what needs fixing so they can understand
                    the work and propose an appropriate price.
                </p>
            </div>

            <form
                onSubmit={onSubmit}
                className="grid gap-6 rounded-[2rem] border border-line bg-cream p-8 shadow-sm sm:p-10"
            >
                {error && (
                    <div
                        role="alert"
                        className="rounded-2xl border border-copper/30 bg-copper/5 px-5 py-4 text-sm text-copper-deep shadow-sm"
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

                <div className="grid gap-6 sm:grid-cols-2">
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
                        Your budget (₦)

                        <input
                            type="number"
                            name="budget"
                            min={5000}
                            step="1"
                            value={form.budget}
                            onChange={updateField}
                            placeholder="Optional"
                            className={field}
                        />

                        <span className="mt-1 block text-xs font-normal text-muted">
                            Optional guidance. Artisans propose the initial price.
                        </span>
                    </label>
                </div>

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

                {/* Job photos and videos */}
                <section className="space-y-3">
                    <div>
                        <h2 className="text-sm font-semibold text-ink">
                            Photos and videos of the work
                        </h2>

                        <p className="mt-1 text-xs text-muted">
                            Help artisans understand the job before they quote.
                            You can upload up to 5 files, maximum 50 MB each.
                        </p>
                    </div>

                    <label className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-line bg-paper px-5 py-7 text-center transition hover:border-copper hover:bg-copper/5">
                        <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-copper/10 text-copper">
                            <UploadCloud size={24} />
                        </span>

                        <span className="text-sm font-semibold text-ink">
                            Select photos or videos
                        </span>

                        <span className="mt-1 text-xs text-muted">
                            JPEG, PNG, WebP, MP4, MOV or WebM
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

                        <span>
                            {MAX_FILES - files.length} remaining
                        </span>
                    </div>

                    {previews.length > 0 && (
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                            {previews.map((preview, index) => {
                                const isVideo = preview.file.type.startsWith("video/");

                                return (
                                    <div
                                        key={`${preview.file.name}-${index}`}
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

                                        <div className="flex items-center gap-1.5 px-2 py-2">
                                            {isVideo ? (
                                                <Video size={13} className="shrink-0 text-copper" />
                                            ) : (
                                                <ImageIcon size={13} className="shrink-0 text-copper" />
                                            )}

                                            <span className="min-w-0 flex-1 truncate text-xs text-muted">
                                                {preview.file.name}
                                            </span>

                                            <button
                                                type="button"
                                                onClick={() => removeFile(index)}
                                                disabled={busy}
                                                aria-label={`Remove ${preview.file.name}`}
                                                className="rounded-full p-1 text-muted transition hover:bg-copper/10 hover:text-copper disabled:opacity-50"
                                            >
                                                <X size={15} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <p className="text-xs text-muted">
                        Clear photos and short videos help artisans assess the work
                        and negotiate a fair price.
                    </p>
                </section>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={busy}
                        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-copper px-8 text-sm font-semibold text-cream shadow-md transition-all hover:bg-copper-deep disabled:cursor-not-allowed disabled:opacity-60"
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
