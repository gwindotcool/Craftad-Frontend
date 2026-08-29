import { useState, useEffect } from "react";
import { C, arr, extract } from "../../theme";
import { api } from "../../api";
import { Spinner, Empty } from "../../components/ui";
import JobCard from "../../components/JobCard";

export default function JobHistory({ token }) {
    const [jobs, setJobs]       = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch]   = useState("");

    useEffect(() => {
        api.get("/api/job/my-jobs", token)
            .then((res) => {
                const history = (res.jobs || []).filter(
                    (job) =>
                        ["completed", "customer_confirmed"].includes(
                            job.status
                        )
                );

                setJobs(history);
            })
            .catch((e) => {
                console.error("History:", e.message);
            })
            .finally(() => setLoading(false));
    }, [token]);

    if (loading) return <Spinner />;

    const filtered = jobs.filter((j) => !search.trim() || (j.title + j.category + j.description).toLowerCase().includes(search.toLowerCase()));

    return (
        <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 14 }}>Job History</h2>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="🔍 Search history…" style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1.5px solid ${C.border}`, fontSize: 14, outline: "none", marginBottom: 18, boxSizing: "border-box" }} />
            {filtered.length === 0 ? <Empty msg="No jobs found" icon="📖" /> : filtered.map((job) => <JobCard key={job._id} job={job} />)}
        </div>
    );
}
