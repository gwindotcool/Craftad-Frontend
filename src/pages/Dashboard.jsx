import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { craftad, listOf } from "../api";
import { useSession } from "../session";

export function Dashboard() {
  const { token, user } = useSession();
  const [jobs, setJobs] = useState([]);
  const [balance, setBalance] = useState(null);
  const [note, setNote] = useState("");
  const [skills, setSkills] = useState("");
  const [years, setYears] = useState("1");
  const [bio, setBio] = useState("");
  const [profileNote, setProfileNote] = useState("");

  useEffect(() => {
    if (!token || !user) return;
    const load = user.role === "artisan" ? craftad.openJobs(token) : craftad.myJobs(token);
    load.then((data) => setJobs(listOf(data, ["jobs"]))).catch((err) => setNote(err.message));
    craftad.wallet(token).then((data) => setBalance(data.wallet?.balance ?? null)).catch(() => setBalance(null));
  }, [token, user]);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm capitalize text-muted">{user?.role}</p>
        <h1 className="font-display text-4xl">Good to see you, {user?.fullName?.split(" ")[0] || "there"}.</h1>
      </div>
      {note && <p className="rounded-2xl border border-line bg-cream px-4 py-3 text-sm text-copper-deep">{note}</p>}
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label={user?.role === "artisan" ? "Open jobs" : "Your jobs"} value={String(jobs.length)} />
        <Stat label="Wallet" value={balance === null ? "—" : `₦${balance.toLocaleString()}`} />
        <Stat label="Next step" value={user?.role === "customer" ? "Post" : "Apply"} />
      </div>
      <div className="flex flex-wrap gap-3">
        {user?.role === "customer" && <Link to="/jobs/new" className="inline-flex min-h-11 items-center rounded-full bg-copper px-4 text-sm font-medium text-cream no-underline">Post a job</Link>}
        <Link to="/jobs?view=all" className="inline-flex min-h-11 items-center rounded-full border border-line bg-cream px-4 text-sm font-medium no-underline">All jobs</Link>
        <Link to="/jobs?view=assigned" className="inline-flex min-h-11 items-center rounded-full border border-line bg-cream px-4 text-sm font-medium no-underline">Assigned jobs</Link>
      </div>
      {user?.role === "artisan" && (
        <form
          className="grid gap-3 rounded-card border border-line bg-cream p-5"
          onSubmit={async (e) => {
            e.preventDefault();
            setProfileNote("");
            const body = {
              skills: skills.split(",").map((item) => item.trim()).filter(Boolean),
              yearsOfExperience: Number(years),
              bio,
              location: { type: "Point", coordinates: [3.3792, 6.5244] },
            };
            try {
              try {
                await craftad.updateArtisan(token, body);
              } catch {
                await craftad.createArtisan(token, body);
              }
              setProfileNote("Artisan profile saved.");
            } catch (err) {
              setProfileNote(err instanceof Error ? err.message : "Could not save the profile");
            }
          }}
        >
          <h2 className="font-display text-2xl">Artisan profile</h2>
          <input value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="Skills, separated by commas" className="min-h-12 rounded-2xl border border-line px-4" required />
          <input type="number" min={0} value={years} onChange={(e) => setYears(e.target.value)} placeholder="Years of experience" className="min-h-12 rounded-2xl border border-line px-4" required />
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} placeholder="Short bio" className="rounded-2xl border border-line px-4 py-3" />
          <button className="min-h-11 w-fit rounded-full bg-ink px-4 text-sm font-medium text-cream">Save profile</button>
          {profileNote && <p className="text-sm text-muted">{profileNote}</p>}
        </form>
      )}
      <section className="grid gap-3">
        {jobs.slice(0, 4).map((job) => (
          <Link key={job._id} to={`/jobs/${job._id}`} className="rounded-card border border-line bg-cream p-4 no-underline">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-medium text-ink">{job.title}</h3>
              <span className="text-sm capitalize text-muted">{job.status?.replaceAll("_", " ")}</span>
            </div>
            <p className="mt-1 text-sm text-muted">{job.location} · ₦{(job.budget || 0).toLocaleString()} · {job.category}</p>
          </Link>
        ))}
        {jobs.length === 0 && <p className="text-sm text-muted">Nothing here yet.</p>}
      </section>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-card border border-line bg-cream p-5">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 font-display text-3xl">{value}</p>
    </div>
  );
}
