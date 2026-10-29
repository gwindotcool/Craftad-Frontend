import { useState, useEffect } from "react";
import { C } from "../../theme";
import { api } from "../../api";
import { Btn, Spinner, Empty, Toast } from "../../components/ui";
import JobCard from "../../components/JobCard";

export default function ActiveJobs({ token }) {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);

    const loadJobs = async () => {
        try {
            setLoading(true);

            const res = await api.get(
                "/api/job/my-jobs",
                token
            );

            const artisanJobs = (res.jobs || []).filter(
                (job) =>
                    ["assigned", "in_progress"].includes(job.status)
            );

            setJobs(artisanJobs);

        } catch (e) {
            console.error("Active jobs:", e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadJobs();
    }, [token]);

    const startJob = async (jobId) => {
        try {
            await api.patch(
                `/api/job/${jobId}/start`,
                {},
                token
            );

            setToast({
                msg: "Job started successfully!",
                type: "success"
            });

            await loadJobs();

        } catch (e) {
            setToast({
                msg: e.message,
                type: "error"
            });
        }
    };

    const completeJob = async (jobId) => {
        try {
            await api.patch(
                `/api/job/${jobId}/complete`,
                {},
                token
            );

            setToast({
                msg: "Job completed successfully!",
                type: "success"
            });

            await loadJobs();

        } catch (e) {
            setToast({
                msg: e.message,
                type: "error"
            });
        }
    };

    if (loading) {
        return <Spinner />;
    }

    return (
        <div>
            <h2
                style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: C.text,
                    marginBottom: 22
                }}
            >
                Active Jobs
            </h2>

            {jobs.length === 0 ? (
                <Empty
                    msg="No active jobs."
                    icon="⚡"
                />
            ) : (
                jobs.map((job) => (
                    <JobCard
                        key={job._id}
                        job={job}
                        actions={[
                            job.status === "assigned" && (
                                <Btn
                                    key="start"
                                    size="sm"
                                    onClick={() =>
                                        startJob(job._id)
                                    }
                                >
                                    ▶ Start Job
                                </Btn>
                            ),

                            job.status === "in_progress" && (
                                <Btn
                                    key="complete"
                                    variant="success"
                                    size="sm"
                                    onClick={() =>
                                        completeJob(job._id)
                                    }
                                >
                                    ✅ Mark Complete
                                </Btn>
                            )
                        ]}
                    />
                ))
            )}

            <Toast
                msg={toast?.msg}
                type={toast?.type}
                onClose={() => setToast(null)}
            />
        </div>
    );
}