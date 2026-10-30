
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { craftad, listOf } from "../api";
import { useSession } from "../session";
import { loadSocial, saveSocial } from "../components/ShareBar";

export function Dashboard() {
    const { token, user } = useSession();

    const [jobs, setJobs] = useState([]);
    const [balance, setBalance] = useState(null);
    const [note, setNote] = useState("");

    const [skills, setSkills] = useState("");
    const [years, setYears] = useState("1");
    const [bio, setBio] = useState("");
    const [profileNote, setProfileNote] = useState("");

    const [social, setSocial] = useState({});
    const [socialNote, setSocialNote] = useState("");

    useEffect(() => {
        if (!token || !user) return;

        const load =
            user.role === "artisan"
                ? craftad.openJobs(token)
                : craftad.myJobs(token);

        load
            .then((data) => setJobs(listOf(data, ["jobs"])))
            .catch((err) => setNote(err.message));

        craftad
            .wallet(token)
            .then((data) => setBalance(data.wallet?.balance ?? null))
            .catch(() => setBalance(null));

        setSocial(loadSocial());
    }, [token, user]);

    return (
        <div className="space-y-8">

            {/* Welcome panel and dashboard statistics */}
            <div className="space-y-6">
                <div className="relative overflow-hidden rounded-[1.75rem] bg-ink p-7 text-cream shadow-sm sm:p-9">
                    <div className="absolute -right-12 -top-16 h-56 w-56 rounded-full border border-cream/10" />
                    <div className="absolute -right-5 -top-9 h-40 w-40 rounded-full border border-cream/10" />

                    <div className="relative">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-copper">
                            YOUR CRAFTAD SPACE
                        </p>

                        <p className="mt-5 text-sm capitalize text-cream/65">
                            {user?.role} dashboard
                        </p>

                        <h1 className="mt-2 font-display text-3xl leading-tight sm:text-5xl">
                            Good to see you, {user?.fullName?.split(" ")[0] || "there"}.
                        </h1>

                        <p className="mt-3 max-w-lg text-sm leading-relaxed text-cream/70">
                            {user?.role === "artisan"
                                ? "Find new opportunities, manage your work, and keep your business moving."
                                : "Manage your jobs, connect with skilled artisans, and keep track of your projects."}
                        </p>
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                    <Stat
                        label={user?.role === "artisan" ? "Open jobs" : "Your jobs"}
                        value={String(jobs.length)}
                        description="Available in your workspace"
                    />

                    <Stat
                        label="Wallet balance"
                        value={
                            balance === null
                                ? "—"
                                : `₦${balance.toLocaleString()}`
                        }
                        description="Your current wallet balance"
                    />

                    <Stat
                        label="Your next step"
                        value={user?.role === "customer" ? "Post a job" : "Apply for work"}
                        description={
                            user?.role === "customer"
                                ? "Find the right person for the job"
                                : "Explore opportunities on Craftad"
                        }
                    />
                </div>
            </div>

            {note && (
                <p className="rounded-2xl border border-line bg-cream px-4 py-3 text-sm text-copper-deep">
                    {note}
                </p>
            )}

            {/* Dashboard actions */}
            <div className="flex flex-wrap gap-3">
                {user?.role === "customer" && (
                    <Link
                        to="/jobs/new"
                        className="inline-flex min-h-11 items-center rounded-full bg-copper px-5 text-sm font-semibold text-cream no-underline transition-colors hover:bg-copper-deep"
                    >
                        Post a job
                    </Link>
                )}

                <Link
                    to="/jobs?view=all"
                    className="inline-flex min-h-11 items-center rounded-full border border-line bg-cream px-5 text-sm font-medium text-ink no-underline transition-colors hover:border-copper"
                >
                    All jobs
                </Link>

                <Link
                    to="/jobs?view=assigned"
                    className="inline-flex min-h-11 items-center rounded-full border border-line bg-cream px-5 text-sm font-medium text-ink no-underline transition-colors hover:border-copper"
                >
                    Assigned jobs
                </Link>
            </div>

            {/* Artisan profile */}
            {user?.role === "artisan" && (
                <form
                    className="grid gap-4 rounded-[1.5rem] border border-line bg-cream p-6 shadow-sm sm:p-8"
                    onSubmit={async (e) => {
                        e.preventDefault();
                        setProfileNote("");

                        const body = {
                            skills: skills
                                .split(",")
                                .map((item) => item.trim())
                                .filter(Boolean),
                            yearsOfExperience: Number(years),
                            bio,
                            location: {
                                type: "Point",
                                coordinates: [3.3792, 6.5244],
                            },
                        };

                        try {
                            try {
                                await craftad.updateArtisan(token, body);
                            } catch {
                                await craftad.createArtisan(token, body);
                            }

                            setProfileNote("Artisan profile saved.");
                        } catch (err) {
                            setProfileNote(
                                err instanceof Error
                                    ? err.message
                                    : "Could not save the profile"
                            );
                        }
                    }}
                >
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-copper">
                            YOUR PROFESSIONAL DETAILS
                        </p>

                        <h2 className="mt-2 font-display text-2xl text-ink sm:text-3xl">
                            Artisan profile
                        </h2>

                        <p className="mt-2 text-sm leading-relaxed text-muted">
                            Tell customers about your skills and experience.
                        </p>
                    </div>

                    <input
                        value={skills}
                        onChange={(e) => setSkills(e.target.value)}
                        placeholder="Skills, separated by commas"
                        className="min-h-12 rounded-xl border border-line bg-paper px-4 outline-none transition focus:border-copper"
                        required
                    />

                    <input
                        type="number"
                        min={0}
                        value={years}
                        onChange={(e) => setYears(e.target.value)}
                        placeholder="Years of experience"
                        className="min-h-12 rounded-xl border border-line bg-paper px-4 outline-none transition focus:border-copper"
                        required
                    />

                    <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows={4}
                        placeholder="Write a short introduction about your work..."
                        className="rounded-xl border border-line bg-paper px-4 py-3 outline-none transition focus:border-copper"
                    />

                    <button className="min-h-11 w-fit rounded-full bg-ink px-6 text-sm font-semibold text-cream transition-colors hover:bg-copper">
                        Save profile
                    </button>

                    {profileNote && (
                        <p className="text-sm text-muted">{profileNote}</p>
                    )}
                </form>
            )}

            {/* Social links */}
            <form
                className="grid gap-4 rounded-[1.5rem] border border-line bg-cream p-6 shadow-sm sm:grid-cols-2 sm:p-8"
                onSubmit={(e) => {
                    e.preventDefault();
                    saveSocial(social);
                    setSocialNote("Social links saved on this device.");
                }}
            >
                <div className="sm:col-span-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-copper">
                        STAY CONNECTED
                    </p>

                    <h2 className="mt-2 font-display text-2xl text-ink sm:text-3xl">
                        Social links
                    </h2>

                    <p className="mt-2 text-sm text-muted">
                        Add your social accounts so people can connect with you.
                    </p>
                </div>

                <input
                    value={social.whatsapp || ""}
                    onChange={(e) =>
                        setSocial({ ...social, whatsapp: e.target.value })
                    }
                    placeholder="WhatsApp number"
                    className="min-h-12 rounded-xl border border-line bg-paper px-4 outline-none transition focus:border-copper"
                />

                <input
                    value={social.instagram || ""}
                    onChange={(e) =>
                        setSocial({ ...social, instagram: e.target.value })
                    }
                    placeholder="Instagram username"
                    className="min-h-12 rounded-xl border border-line bg-paper px-4 outline-none transition focus:border-copper"
                />

                <input
                    value={social.facebook || ""}
                    onChange={(e) =>
                        setSocial({ ...social, facebook: e.target.value })
                    }
                    placeholder="Facebook page or profile"
                    className="min-h-12 rounded-xl border border-line bg-paper px-4 outline-none transition focus:border-copper"
                />

                <input
                    value={social.x || ""}
                    onChange={(e) =>
                        setSocial({ ...social, x: e.target.value })
                    }
                    placeholder="X username"
                    className="min-h-12 rounded-xl border border-line bg-paper px-4 outline-none transition focus:border-copper"
                />

                <div className="flex flex-wrap gap-4 sm:col-span-2">
                    {social.whatsapp && (
                        <a
                            className="text-sm font-medium text-copper hover:underline"
                            href={`https://wa.me/${social.whatsapp.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noreferrer"
                        >
                            WhatsApp
                        </a>
                    )}

                    {social.instagram && (
                        <a
                            className="text-sm font-medium text-copper hover:underline"
                            href={`https://instagram.com/${social.instagram.replace("@", "")}`}
                            target="_blank"
                            rel="noreferrer"
                        >
                            Instagram
                        </a>
                    )}

                    {social.facebook && (
                        <a
                            className="text-sm font-medium text-copper hover:underline"
                            href={
                                social.facebook.startsWith("http")
                                    ? social.facebook
                                    : `https://facebook.com/${social.facebook}`
                            }
                            target="_blank"
                            rel="noreferrer"
                        >
                            Facebook
                        </a>
                    )}

                    {social.x && (
                        <a
                            className="text-sm font-medium text-copper hover:underline"
                            href={`https://x.com/${social.x.replace("@", "")}`}
                            target="_blank"
                            rel="noreferrer"
                        >
                            X
                        </a>
                    )}
                </div>

                <button className="min-h-11 w-fit rounded-full bg-ink px-6 text-sm font-semibold text-cream transition-colors hover:bg-copper sm:col-span-2">
                    Save social links
                </button>

                {socialNote && (
                    <p className="text-sm text-muted sm:col-span-2">
                        {socialNote}
                    </p>
                )}
            </form>

            {/* Recent jobs */}
            <section className="space-y-4">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-copper">
                        YOUR ACTIVITY
                    </p>

                    <h2 className="mt-2 font-display text-2xl text-ink sm:text-3xl">
                        Recent jobs
                    </h2>

                    <p className="mt-2 text-sm text-muted">
                        Keep track of the work happening on Craftad.
                    </p>
                </div>

                <div className="grid gap-3">
                    {jobs.slice(0, 4).map((job) => (
                        <Link
                            key={job._id}
                            to={`/jobs/${job._id}`}
                            className="group rounded-[1.25rem] border border-line bg-cream p-5 no-underline transition-all hover:-translate-y-0.5 hover:border-copper/40 hover:shadow-md"
                        >
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <h3 className="font-semibold text-ink transition-colors group-hover:text-copper">
                                    {job.title}
                                </h3>

                                <span className="rounded-full bg-paper px-3 py-1 text-xs capitalize text-muted">
                  {job.status?.replaceAll("_", " ")}
                </span>
                            </div>

                            <p className="mt-2 text-sm text-muted">
                                {job.location} · ₦{(job.budget || 0).toLocaleString()} · {job.category}
                            </p>
                        </Link>
                    ))}

                    {jobs.length === 0 && (
                        <div className="rounded-[1.25rem] border border-dashed border-line bg-cream p-8 text-center">
                            <p className="font-display text-xl text-ink">
                                Nothing here yet.
                            </p>

                            <p className="mt-2 text-sm text-muted">
                                Your job activity will appear here when you get started.
                            </p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}

function Stat({ label, value, description }) {
    return (
        <div className="rounded-[1.25rem] border border-line bg-cream p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md sm:p-6">
            <p className="text-sm font-medium text-muted">{label}</p>

            <p className="mt-3 break-words font-display text-2xl text-ink sm:text-3xl">
                {value}
            </p>

            <p className="mt-2 text-xs leading-relaxed text-muted">
                {description}
            </p>
        </div>
    );
}
