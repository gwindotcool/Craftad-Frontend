import { CheckCircle2 } from "lucide-react";

const STAGES = [
    { key: "open", label: "Open", description: "Accepting artisan quotes" },
    { key: "assigned", label: "Assigned", description: "Artisan selected" },
    { key: "in_progress", label: "In Progress", description: "Work underway" },
    { key: "completed", label: "Completed", description: "Awaiting sign-off" },
    { key: "customer_confirmed", label: "Confirmed", description: "Escrow released" },
];

function getStageIndex(status) {
    if (status === "paid") return 4;
    return STAGES.findIndex((stage) => stage.key === status);
}

export function JobProgressTracker({ status, isCustomer }) {
    const stageIndex = getStageIndex(status);

    return (
        <section
            id="job-progress"
            className="rounded-3xl border border-line bg-cream p-6 shadow-card sm:p-7"
        >
            <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-copper">
                    Project Milestones
                </p>
                <h2 className="mt-1 font-display text-2xl font-semibold text-ink">
                    Job progress
                </h2>
                <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted">
                    {isCustomer
                        ? "Track your project from artisan assignment through final escrow release."
                        : "Keep the customer updated at each stage until final sign-off."}
                </p>
            </div>

            <ol className="mt-7 flex flex-col sm:flex-row sm:gap-2">
                {STAGES.map((stage, index) => {
                    const complete = stageIndex > index;
                    const current = stageIndex === index;
                    const hasNext = index < STAGES.length - 1;

                    return (
                        <li
                            key={stage.key}
                            className="relative flex gap-4 pb-6 last:pb-0 sm:flex-1 sm:flex-col sm:items-center sm:gap-3 sm:pb-0"
                        >
                            {hasNext && (
                                <span
                                    aria-hidden="true"
                                    className={`absolute left-[15px] top-9 h-[calc(100%-1.5rem)] w-0.5 sm:left-[calc(50%+1.25rem)] sm:top-[15px] sm:h-0.5 sm:w-[calc(100%-2.5rem)] ${
                                        complete ? "bg-success" : "bg-line"
                                    }`}
                                />
                            )}

                            <span
                                className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors ${
                                    current
                                        ? "border-copper bg-copper text-white shadow-sm"
                                        : complete
                                            ? "border-success bg-success text-white"
                                            : "border-line bg-paper text-muted"
                                }`}
                            >
                {complete ? <CheckCircle2 size={16} /> : index + 1}
              </span>

                            <div className="min-w-0 pt-0.5 sm:text-center">
                                <div className="flex flex-wrap items-center gap-1.5 sm:min-h-5 sm:justify-center">
                                    <h3
                                        className={`text-sm font-semibold ${
                                            current || complete ? "text-ink" : "text-muted"
                                        }`}
                                    >
                                        {stage.label}
                                    </h3>

                                    {current && (
                                        <span className="rounded-full bg-copper/12 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-copper">
                      Current
                    </span>
                                    )}

                                    {complete && (
                                        <span className="rounded-full bg-success-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-success">
                      Done
                    </span>
                                    )}
                                </div>

                                <p className="mt-1 max-w-[170px] text-xs leading-relaxed text-muted sm:mx-auto">
                                    {stage.description}
                                </p>
                            </div>
                        </li>
                    );
                })}
            </ol>

            {stageIndex === -1 && (
                <p className="mt-5 rounded-2xl border border-line bg-paper px-4 py-3 text-xs text-muted">
                    Status: <span className="font-semibold capitalize text-ink">{(status || "unknown").replaceAll("_", " ")}</span>
                </p>
            )}
        </section>
    );
}