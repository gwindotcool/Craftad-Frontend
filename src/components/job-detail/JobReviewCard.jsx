import { useState } from "react";
import toast from "react-hot-toast";
import { CheckCircle2, Star } from "lucide-react";
import { craftad } from "../../api";

const RATING_LABELS = {
    5: "Excellent — exceeded expectations",
    4: "Very good — solid workmanship",
    3: "Average — met basic expectations",
    2: "Below expectations",
    1: "Poor experience",
};

export function JobReviewCard({ token, jobId, onReviewed }) {
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    if (submitted) {
        return (
            <section
                id="review"
                className="rounded-3xl border border-line bg-cream p-7 text-center shadow-card sm:p-10"
            >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-success-soft text-success">
                    <CheckCircle2 size={28} />
                </div>
                <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-success">
                    Feedback Received
                </p>
                <h2 className="mt-1.5 font-display text-2xl font-semibold text-ink sm:text-3xl">
                    Thank you for your review
                </h2>
                <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">
                    Your rating helps other homeowners hire with confidence and rewards dependable artisans on Craftad.
                </p>
            </section>
        );
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (submitting) return;
        setSubmitting(true);

        try {
            await craftad.review(token, jobId, {
                rating: Number(rating),
                comment: comment.trim(),
            });
            setSubmitted(true);
            setComment("");
            toast.success("Review submitted.");
            await onReviewed?.();
        } catch (err) {
            toast.error(
                err instanceof Error ? err.message : "Could not submit your review."
            );
        } finally {
            setSubmitting(false);
        }
    }

    const activeRating = hoverRating || rating;

    return (
        <section
            id="review"
            className="rounded-3xl border border-line bg-cream p-6 shadow-card sm:p-8"
        >
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-copper">
                Verified Feedback
            </p>
            <h2 className="mt-1 font-display text-2xl font-semibold text-ink sm:text-3xl">
                Rate the completed work
            </h2>
            <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted">
                Share how the job went so future customers know what to expect.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                <div>
                    <div
                        className="flex items-center gap-2"
                        onMouseLeave={() => setHoverRating(0)}
                    >
                        {[1, 2, 3, 4, 5].map((star) => {
                            const filled = star <= activeRating;
                            return (
                                <button
                                    key={star}
                                    type="button"
                                    aria-label={`${star} ${star === 1 ? "star" : "stars"}`}
                                    aria-pressed={rating === star}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onClick={() => setRating(star)}
                                    className={`flex h-11 w-11 items-center justify-center rounded-xl border transition-all ${
                                        filled
                                            ? "border-copper/40 bg-copper/12 text-copper scale-105"
                                            : "border-line bg-paper text-muted hover:border-copper/40 hover:text-copper"
                                    }`}
                                >
                                    <Star size={20} className={filled ? "fill-current" : ""} />
                                </button>
                            );
                        })}
                    </div>
                    <p className="mt-2 text-xs font-semibold text-copper">
                        {RATING_LABELS[activeRating]}
                    </p>
                </div>

                <div className="space-y-1.5">
                    <label htmlFor="review-comment" className="text-xs font-semibold text-ink">
                        Written Review (optional)
                    </label>
                    <textarea
                        id="review-comment"
                        rows={3}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Comment on punctuality, workmanship, and communication..."
                        className="w-full resize-y rounded-2xl border border-line bg-paper p-3.5 text-sm text-ink outline-none transition placeholder:text-muted/75 focus:border-copper focus:ring-2 focus:ring-copper/15"
                    />
                </div>

                <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex min-h-11 items-center justify-center rounded-full bg-copper px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-copper-deep disabled:opacity-60"
                >
                    {submitting ? "Submitting..." : "Submit Review"}
                </button>
            </form>
        </section>
    );
}