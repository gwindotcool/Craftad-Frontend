import { useState } from "react";
import { C, SKILLS } from "../../theme";
import { api } from "../../api";
import { Btn, Inp, Sel, Tex, Card, Toast } from "../../components/ui";

export default function PostJob({ token, onPost }) {
    const [f, setF] = useState({
        title: "",
        category: "",
        description: "",
        budget: "",
        location: ""
    });

    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);

    const upd = (key) => (e) => {
        setF((prev) => ({
            ...prev,
            [key]: e.target.value
        }));
    };

    const submit = async () => {
        if (
            !f.title ||
            !f.category ||
            !f.description ||
            !f.budget ||
            !f.location
        ) {
            setToast({
                msg: "All fields are required.",
                type: "error"
            });
            return;
        }

        if (Number(f.budget) <= 0) {
            setToast({
                msg: "Budget must be greater than 0.",
                type: "error"
            });
            return;
        }

        setLoading(true);

        try {
            await api.post(
                "/api/job/create-job",
                {
                    title: f.title,
                    category: f.category,
                    description: f.description,
                    budget: Number(f.budget),
                    location: f.location
                },
                token
            );

            setToast({
                msg: "Job posted successfully!",
                type: "success"
            });

            setF({
                title: "",
                category: "",
                description: "",
                budget: "",
                location: ""
            });

            setTimeout(() => {
                onPost?.();
            }, 800);

        } catch (e) {
            setToast({
                msg: e.message,
                type: "error"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: 580 }}>
            <h2
                style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: C.text,
                    marginBottom: 6
                }}
            >
                Post a New Job
            </h2>

            <p
                style={{
                    color: C.muted,
                    marginBottom: 24,
                    fontSize: 14
                }}
            >
                Describe your need and get matched with skilled artisans.
            </p>

            <Card>
                <Inp
                    label="Job Title"
                    placeholder="e.g. Fix leaking kitchen sink"
                    value={f.title}
                    onChange={upd("title")}
                />

                <Sel
                    label="Service Category"
                    value={f.category}
                    onChange={upd("category")}
                >
                    <option value="">Select a category...</option>

                    {SKILLS
                        .filter((category) =>
                            [
                                "electrician",
                                "plumber",
                                "carpenter",
                                "mechanic",
                                "welder",
                                "painter",
                                "cleaner"
                            ].includes(category)
                        )
                        .map((category) => (
                            <option key={category} value={category}>
                                {category.charAt(0).toUpperCase() +
                                    category.slice(1)}
                            </option>
                        ))}
                </Sel>

                <Tex
                    label="Job Description"
                    placeholder="Describe the work in detail..."
                    value={f.description}
                    onChange={upd("description")}
                />

                <Inp
                    label="Budget (₦)"
                    type="number"
                    placeholder="e.g. 20000"
                    value={f.budget}
                    onChange={upd("budget")}
                />

                <Inp
                    label="Location"
                    placeholder="e.g. Lagos"
                    value={f.location}
                    onChange={upd("location")}
                />

                <Btn
                    onClick={submit}
                    disabled={
                        loading ||
                        !f.title ||
                        !f.category ||
                        !f.description ||
                        !f.budget ||
                        !f.location
                    }
                >
                    {loading ? "Posting..." : "🚀 Post Job"}
                </Btn>
            </Card>

            <Toast
                msg={toast?.msg}
                type={toast?.type}
                onClose={() => setToast(null)}
            />
        </div>
    );
}