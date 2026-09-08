import { useState, useEffect } from "react";
import { C, arr, extract, fmtMoney, fmtDate, greeting } from "../../theme";
import { api } from "../../api";
import { Btn, Card, Stat, Spinner, Empty, Modal, Badge, Sel, Tex, Toast } from "../../components/ui";
import JobCard from "../../components/JobCard";

export default function CustomerHome({ token, user }) {
    const [jobs, setJobs]         = useState([]);
    const [loading, setLoading]   = useState(true);
    const [search, setSearch]     = useState("");
    const [sel, setSel]           = useState(null);
    const [apps, setApps]         = useState([]);
    const [appsL, setAppsL]       = useState(false);
    const [reviewJob, setReviewJob]       = useState(null);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewMsg, setReviewMsg]       = useState("");
    const [toast, setToast] = useState(null);
    const toast$ = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };

    // ✅ Fixed: use /api/jobs/history (not /api/jobs which is artisan/admin only)
useEffect(() => {
    const loadJobs = async () => {
        try {
            const d = await api.get("/api/job/my-jobs", token);
            setJobs(arr(extract(d, "jobs", "data")));
        } catch (e) {
            console.error("Jobs:", e.message);
        } finally {
            setLoading(false);
        }
    };

    loadJobs();

    // Refresh jobs every 5 seconds
    const interval = setInterval(loadJobs, 5000);

    return () => clearInterval(interval);
}, [token]);


    const loadApps = (jobId) => {
        setAppsL(true);

        api.get(`/api/applications/job/${jobId}`, token)
            .then((d) => {
                setApps(d.applications || []);
            })
            .catch((e) => {
                console.error("Applications:", e.message);
                setApps([]);
            })
            .finally(() => {
                setAppsL(false);
            });
    };

    const assign = async (applicationId) => {
        try {
            // 1. Accept the artisan's application
            const response = await api.patch(
                `/api/applications/accept/${applicationId}`,
                {},
                token
            );

            // 2. Get the job ID
            const jobId = sel?._id;

            if (!jobId) {
                throw new Error("Job ID not found");
            }

            // 3. Fund the job's agreed price into escrow
            await api.post(
                `/api/payments/fund/${jobId}`,
                {},
                token
            );

            toast$("Artisan assigned and payment funded successfully!");

            // 4. Close the modal
            setSel(null);

            // 5. Refresh jobs from backend
            const jobsResponse = await api.get(
                "/api/job/my-jobs",
                token
            );

            setJobs(jobsResponse.jobs || []);

        } catch (e) {
            toast$(e.message, "error");
        }
    };

    const confirmJob = async (jobId) => {
        try {
            await api.patch(
                `/api/job/${jobId}/confirm`,
                {},
                token
            );

            toast$("Job completion confirmed!");

            setJobs((current) =>
                current.map((job) =>
                    job._id === jobId
                        ? { ...job, status: "customer_confirmed" }
                        : job
                )
            );

            if (sel?._id === jobId) {
                setSel((current) =>
                    current
                        ? { ...current, status: "customer_confirmed" }
                        : current
                );
            }

        } catch (e) {
            toast$(e.message, "error");
        }
    };

    const pay = async (jobId) => {
        if (!confirm("Release payment to artisan? This cannot be undone.")) return;
        try {
            await api.patch(`/api/payments/release/${jobId}`, {}, token)
            toast$("Payment released to artisan!");
            setJobs((j) => j.map((x) => x._id === jobId ? { ...x, status: "paid" } : x));
        } catch (e) { toast$(e.message, "error"); }
    };

    const submitReview = async () => {
        try {
            await api.post(`/api/reviews/${reviewJob}`, { rating: reviewRating, comment: reviewMsg }, token);
            toast$("Review submitted!");
            setReviewJob(null);
        } catch (e) { toast$(e.message, "error"); }
    };

    if (loading) return <Spinner />;

    const pending = jobs.filter((j) => j.status === "open");
    const active = jobs.filter((j) =>
        ["assigned", "in_progress"].includes(j.status)
    );
    const completed = jobs.filter((j) =>
        ["completed", "customer_confirmed","paid"].includes(j.status)
    );
    const filtered  = jobs.filter((j) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return j.title?.toLowerCase().includes(q) || j.category?.toLowerCase().includes(q) || j.description?.toLowerCase().includes(q);
    });

    return (
        <div>
            {/* Hero greeting */}
            <Card style={{ marginBottom: 24, background: "linear-gradient(135deg,#0A1628,#1F3A5F)", color: "white", padding: 28 }}>
                <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>{greeting()}, {user?.fullName?.split(" ")[0] || "Customer"} 👋</h1>
                <p style={{ marginTop: 8, opacity: 0.75, fontSize: 14 }}>Find trusted artisans around you and manage your jobs easily.</p>
                <div style={{ display: "flex", gap: 12, marginTop: 20, flexWrap: "wrap" }}>
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="🔍 Search your jobs..." style={{ flex: 1, minWidth: 220, padding: 12, borderRadius: 10, border: "none", outline: "none", fontSize: 14 }} />
                </div>
            </Card>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 14, marginBottom: 26 }}>
                <Stat icon="⏳" label="Pending"   value={pending.length}   color={C.accent}  />
                <Stat icon="⚡" label="Active"    value={active.length}    color={C.info}    />
                <Stat icon="✅" label="Completed" value={completed.length} color={C.success} />
                <Stat icon="💼" label="Total"     value={jobs.length}      color={C.purple}  />
            </div>

            {/* Jobs list */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: C.text }}>My Jobs</h2>
                <span style={{ color: C.muted, fontSize: 13 }}>{filtered.length} jobs</span>
            </div>

            {filtered.length === 0
                ? <Empty msg="No jobs found. Post a job to get started." icon="🛠️" />
                : filtered.map((job) => (
                    <JobCard key={job._id} job={job}
                        onClick={() => { setSel(job); loadApps(job._id); }}
                             actions={[
                                 job.status === "completed" &&
                                 <Btn
                                     key="confirm"
                                     variant="success"
                                     size="sm"
                                     onClick={() => confirmJob(job._id)}
                                 >
                                     ✅ Confirm Completion
                                 </Btn>,

                                 job.status === "customer_confirmed" &&
                                 <Btn
                                     key="p"
                                     variant="success"
                                     size="sm"
                                     onClick={() => pay(job._id)}
                                 >
                                     💳 Release Payment
                                 </Btn>,

                                 job.status === "paid" &&
                                 <Btn
                                     key="paid"
                                     variant="success"
                                     size="sm"
                                     disabled
                                 >
                                     ✓ Paid
                                 </Btn>,

                                 ["customer_confirmed", "paid"].includes(job.status) &&
                                 <Btn
                                     key="r"
                                     variant="purple"
                                     size="sm"
                                     onClick={() => setReviewJob(job._id)}
                                 >
                                     ⭐ Review
                                 </Btn>,
                             ]}
                    />
                ))
            }

            {/* Job detail modal */}
            <Modal open={!!sel} onClose={() => setSel(null)} title={sel?.title || "Job Details"} maxWidth={600}>
                {appsL ? (
                    <Spinner />
                ) : apps.length === 0 ? (
                    <Empty msg="No applicants yet" icon="👤" />
                ) : (
                    apps.map((a) => (
                        <div
                            key={a._id}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "12px 14px",
                                borderRadius: 10,
                                border: `1px solid ${C.border}`,
                                marginBottom: 8
                            }}
                        >
                            <div>
                                <div style={{ fontWeight: 600, fontSize: 14 }}>
                                    {a.artisan?.fullName || "Artisan"}
                                </div>

                                <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>
                                    {a.message || "No message"}
                                </div>

                                <div style={{ fontSize: 13, fontWeight: 700, marginTop: 6 }}>
                                    Proposed Price: {fmtMoney(a.proposedPrice)}
                                </div>
                            </div>

                            {sel.status === "open" && (
                                <Btn
                                    size="sm"
                                    onClick={() => assign(a._id)}
                                >
                                    Accept
                                </Btn>
                            )}
                        </div>
                    ))
                )}
            </Modal>

            {/* Review modal */}
            <Modal open={!!reviewJob} onClose={() => setReviewJob(null)} title="Leave a Review">
                <Sel label="Rating" value={reviewRating} onChange={(e) => setReviewRating(Number(e.target.value))}>
                    {[5,4,3,2,1].map((n) => <option key={n} value={n}>{"⭐".repeat(n)} — {["Excellent","Great","Good","Fair","Poor"][5-n]}</option>)}
                </Sel>
                <Tex label="Your review" placeholder="Share your experience…" value={reviewMsg} onChange={(e) => setReviewMsg(e.target.value)} />
                <Btn onClick={submitReview}>Submit Review</Btn>
            </Modal>

            <Toast msg={toast?.msg} type={toast?.type} onClose={() => setToast(null)} />
        </div>
    );
}
