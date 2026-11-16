import { useState } from "react";
import { ChevronDown, ExternalLink, Film, Image as ImageIcon } from "lucide-react";

export function JobMediaGallery({ media }) {
    const [open, setOpen] = useState(true);

    if (!Array.isArray(media) || media.length === 0) return null;

    const photoCount = media.filter((m) =>
        (m.mimeType || "").startsWith("image/")
    ).length;
    const videoCount = media.filter((m) =>
        (m.mimeType || "").startsWith("video/")
    ).length;

    return (
        <section
            id="job-attachments"
            className="overflow-hidden rounded-3xl border border-line bg-cream shadow-card"
        >
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                aria-expanded={open}
                aria-controls="job-attachments-content"
                className="flex w-full items-center justify-between gap-4 p-6 text-left transition-colors hover:bg-subtle/40 sm:p-7"
            >
                <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-copper">
                        Job Attachments
                    </p>
                    <h2 className="mt-1 font-display text-2xl font-semibold text-ink">
                        Photos & Videos
                    </h2>
                    <p className="mt-1 text-sm text-muted">
                        Reference media uploaded by the customer to show site conditions.
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                        {photoCount > 0 && (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper px-3 py-1 text-xs font-medium text-ink">
                <ImageIcon size={13} className="text-copper" />
                                {photoCount} {photoCount === 1 ? "photo" : "photos"}
              </span>
                        )}
                        {videoCount > 0 && (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper px-3 py-1 text-xs font-medium text-ink">
                <Film size={13} className="text-copper" />
                                {videoCount} {videoCount === 1 ? "video" : "videos"}
              </span>
                        )}
                    </div>
                </div>

                <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-paper text-muted transition-transform duration-200 ${
                        open ? "rotate-180" : ""
                    }`}
                >
          <ChevronDown size={18} />
        </span>
            </button>

            {open && (
                <div
                    id="job-attachments-content"
                    className="border-t border-line p-6 sm:p-7"
                >
                    <div className="grid gap-4 sm:grid-cols-2">
                        {media.map((item) => {
                            const mime = item.mimeType || "";
                            const url = item.url || "";
                            const isVideo = mime.startsWith("video/");
                            const isImage = mime.startsWith("image/");
                            const key = item._id || item.key || url;

                            return (
                                <div
                                    key={key}
                                    className="group overflow-hidden rounded-2xl border border-line bg-paper"
                                >
                                    {isImage && (
                                        <a
                                            href={url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="relative block overflow-hidden"
                                        >
                                            <img
                                                src={url}
                                                alt={item.originalName || "Customer-uploaded job photo"}
                                                loading="lazy"
                                                className="h-60 w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                                            />
                                            <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/55 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                        <ExternalLink size={14} />
                      </span>
                                        </a>
                                    )}

                                    {isVideo && (
                                        <video
                                            controls
                                            preload="metadata"
                                            playsInline
                                            className="max-h-72 w-full bg-black"
                                        >
                                            <source src={url} type={mime} />
                                            Your browser does not support video playback.
                                        </video>
                                    )}

                                    {!isImage && !isVideo && (
                                        <div className="p-5">
                                            <a
                                                href={url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 text-sm font-semibold text-copper underline"
                                            >
                                                <span>Open uploaded file</span>
                                                <ExternalLink size={14} />
                                            </a>
                                        </div>
                                    )}

                                    <p className="truncate border-t border-line/60 px-4 py-2.5 text-xs font-medium text-muted">
                                        {item.originalName || "Job attachment"}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </section>
    );
}