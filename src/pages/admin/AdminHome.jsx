import { useState, useEffect } from "react";
import { C, arr, extract, fmtMoney } from "../../theme";
import { api } from "../../api";
import { Stat, Spinner } from "../../components/ui";
import JobCard from "../../components/JobCard";

export default function AdminHome({ token }) {
    const [stats, setStats]     = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("/api/admin/dashboard", token)
            .then((d) => setStats(extract(d, "stats", "data", d)))
            .catch((e) => console.error(e.message))
            .finally(() => setLoading(false));
    }, [token]);

    if (loading) return <Spinner />;
    return (
        <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 22 }}>Platform Overview</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14, marginBottom: 20 }}>
                <Stat icon="👥" label="Total Users"      value={stats?.totalUsers    || 0} color={C.info}    />
                <Stat icon="🔧" label="Total Artisans"   value={stats?.totalArtisans || 0} color={C.success} />
                <Stat icon="📋" label="Total Jobs"       value={stats?.totalJobs     || 0} color={C.accent}  />
                <Stat icon="💹" label="Platform Revenue" value={fmtMoney(stats?.totalEarnings || 0)} color={C.purple} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 20 }}>
                <Stat icon="⏳" label="Pending Jobs"   value={stats?.pendingJobs   || 0} color={C.accent}  />
                <Stat icon="✅" label="Completed Jobs" value={stats?.completedJobs || 0} color={C.success} />
                <Stat icon="❌" label="Cancelled Jobs" value={stats?.cancelledJobs || 0} color={C.danger}  />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14 }}>
                <div style={{ background: "#fff", borderRadius: 12, padding: 22, border: `1px solid ${C.border}` }}>
                    <div style={{ fontWeight: 700, marginBottom: 4, color: C.text }}>💰 Total Earnings</div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: C.purple }}>{fmtMoney(stats?.totalEarnings || 0)}</div>
                </div>
                <div style={{ background: "#fff", borderRadius: 12, padding: 22, border: `1px solid ${C.border}` }}>
                    <div style={{ fontWeight: 700, marginBottom: 4, color: C.text }}>🏦 Available Balance</div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: C.success }}>{fmtMoney(stats?.availableBalance || 0)}</div>
                </div>
            </div>
            {arr(stats?.recentJobs).length > 0 && (<>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: "24px 0 14px", color: C.text }}>Recent Jobs</h3>
                {arr(stats.recentJobs).slice(0, 5).map((j) => <JobCard key={j._id} job={j} />)}
            </>)}
        </div>
    );
}
