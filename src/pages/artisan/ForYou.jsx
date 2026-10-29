import { useState, useEffect } from "react";
import { C } from "../../theme";
import { api } from "../../api";
import { Btn, Spinner, Empty, Toast, Modal, Inp, Tex } from "../../components/ui";
import JobCard from "../../components/JobCard";

export default function ForYou({ token }) {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);

    const [selectedJob, setSelectedJob] = useState(null);
    const [message, setMessage] = useState("");
    const [proposedPrice, setProposedPrice] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        api.get("/api/job/open-jobs", token)
            .then((res) => {
                setJobs(res.jobs || []);
            })
            .catch((e) => {
                console.error("Open jobs:", e.message);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [token]);

    const apply = async () => {
        if (!selectedJob) return;

        if (!message.trim() || !proposedPrice) {
            setToast({
                msg: "Message and proposed price are required.",
                type: "error"
            });
            return;
        }

        if (Number(proposedPrice) <= 0) {
            setToast({
                msg: "Proposed price must be greater than 0.",
                type: "error"
            });
            return;
        }

        try {
            setSubmitting(true);

            await api.post(
                `/api/applications/apply/${selectedJob._id}`,
                {
                    message: message.trim(),
                    proposedPrice: Number(proposedPrice)
                },
                token
            );

            setJobs((current) =>
                current.filter((job) => job._id !== selectedJob._id)
            );

            setToast({
                msg: "Application submitted successfully!",
                type: "success"
            });

            setSelectedJob(null);
            setMessage("");
            setProposedPrice("");

        } catch (e) {
            setToast({
                msg: e.message,
                type: "error"
            });
        } finally {
            setSubmitting(false);
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
                    marginBottom: 6
                }}
            >
                Jobs Near You
            </h2>

            <p
                style={{
                    color: C.muted,
                    marginBottom: 20,
                    fontSize: 14
                }}
            >
                Browse available jobs and submit applications.
            </p>

            {jobs.length === 0 ? (
                <Empty
                    msg="No open jobs available."
                    icon="🔍"
                />
            ) : (
                jobs.map((job) => (
                    <JobCard
                        key={job._id}
                        job={job}
                        actions={[
                            <Btn
                                key="apply"
                                size="sm"
                                onClick={() => setSelectedJob(job)}
                            >
                                Apply Now
                            </Btn>
                        ]}
                    />
                ))
            )}

            <Modal
                open={!!selectedJob}
                onClose={() => setSelectedJob(null)}
                title="Apply for Job"
            >
                <p
                    style={{
                        marginBottom: 16,
                        color: C.muted,
                        fontSize: 14
                    }}
                >
                    {selectedJob?.title}
                </p>

                <Tex
                    label="Application Message"
                    placeholder="Explain why you're suitable for this job..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />

                <Inp
                    label="Proposed Price (₦)"
                    type="number"
                    placeholder="20000"
                    value={proposedPrice}
                    onChange={(e) => setProposedPrice(e.target.value)}
                />

                <Btn
                    onClick={apply}
                    disabled={
                        submitting ||
                        !message.trim() ||
                        !proposedPrice
                    }
                >
                    {submitting ? "Submitting..." : "Submit Application"}
                </Btn>
            </Modal>

            <Toast
                msg={toast?.msg}
                type={toast?.type}
                onClose={() => setToast(null)}
            />
        </div>
    );
}