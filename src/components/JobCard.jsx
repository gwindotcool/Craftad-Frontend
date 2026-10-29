import { C } from "../theme";
import { fmtMoney, fmtDate } from "../theme";
import { Badge } from "./ui";

export default function JobCard({ job, onClick, actions }) {
    const displayPrice = job.agreedPrice ?? job.budget;

    return (
        <div
            onClick={onClick}
            style={{
                background: "#fff",
                borderRadius: 12,
                padding: 18,
                marginBottom: 10,
                border: `1px solid ${C.border}`,
                cursor: onClick ? "pointer" : "default",
                transition: "box-shadow .15s"
            }}
            onMouseEnter={(e) =>
                onClick &&
                (e.currentTarget.style.boxShadow =
                    "0 4px 16px rgba(0,0,0,0.08)")
            }
            onMouseLeave={(e) =>
                (e.currentTarget.style.boxShadow = "none")
            }
        >
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 6
                }}
            >
                <div>
                    <div
                        style={{
                            fontWeight: 700,
                            fontSize: 15,
                            color: C.text
                        }}
                    >
                        {job.title || job.category || "Untitled Job"}
                    </div>

                    <div
                        style={{
                            fontSize: 12,
                            color: C.muted,
                            marginTop: 2
                        }}
                    >
                        🔧 {job.category} &nbsp;·&nbsp; 📍{" "}
                        {job.location?.address || job.location || "Location set"}
                    </div>
                </div>

                <Badge status={job.status || "pending"} />
            </div>

            <p
                style={{
                    fontSize: 13,
                    color: "#374151",
                    lineHeight: 1.5,
                    margin: "8px 0"
                }}
            >
                {(job.description || "").slice(0, 110)}
                {(job.description || "").length > 110 ? "…" : ""}
            </p>

            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: 10
                }}
            >
                <div>
                    <div
                        style={{
                            fontSize: 11,
                            color: C.muted,
                            marginBottom: 2
                        }}
                    >
                        {job.agreedPrice != null
                            ? "Agreed Price"
                            : "Budget"}
                    </div>

                    <span
                        style={{
                            fontWeight: 800,
                            color: C.accent,
                            fontSize: 15
                        }}
                    >
                        {displayPrice != null
                            ? fmtMoney(displayPrice)
                            : "Budget TBD"}
                    </span>
                </div>

                <span
                    style={{
                        fontSize: 12,
                        color: C.muted
                    }}
                >
                    {fmtDate(job.createdAt)}
                </span>
            </div>

            {actions?.filter(Boolean).length > 0 && (
                <div
                    style={{
                        display: "flex",
                        gap: 8,
                        marginTop: 12
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {actions}
                </div>
            )}
        </div>
    );
}
