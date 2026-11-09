import { useEffect, useState } from "react";
import { Users, ShieldCheck, Wallet } from "lucide-react";
import { craftad } from "../api";
import { useAdminSession } from "./AdminSession.jsx";

export function AdminStatsHeader() {
    const { token } = useAdminSession();
    const [stats, setStats] = useState({ totalUsers: 0, activeEscrows: 0, totalVolume: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) return;
        craftad.adminStats(token)
            .then((res) => {
                const data = res.stats || res.data || res;
                setStats({
                    totalUsers: data.totalUsers || 0,
                    activeEscrows: data.activeEscrows || 0,
                    totalVolume: data.totalVolume || 0
                });
            })
            .catch((err) => console.error("Failed to load admin stats:", err))
            .finally(() => setLoading(false));
    }, [token]);

    return (
        <div className="mb-8 grid gap-5 sm:grid-cols-3">
            <div className="rounded-[1.75rem] border border-line bg-cream p-6 shadow-sm">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted">Total Users</p>
                        <p className="mt-2 font-display text-3xl font-bold text-ink">
                            {loading ? "—" : stats.totalUsers.toLocaleString()}
                        </p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-paper border border-line text-copper">
                        <Users size={22} />
                    </div>
                </div>
            </div>

            <div className="rounded-[1.75rem] border border-line bg-cream p-6 shadow-sm">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted">Active Escrows</p>
                        <p className="mt-2 font-display text-3xl font-bold text-ink">
                            {loading ? "—" : stats.activeEscrows.toLocaleString()}
                        </p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-paper border border-line text-copper">
                        <ShieldCheck size={22} />
                    </div>
                </div>
            </div>

            <div className="rounded-[1.75rem] border border-line bg-cream p-6 shadow-sm">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted">Platform Volume</p>
                        <p className="mt-2 font-display text-3xl font-bold text-ink">
                            {loading ? "—" : `₦${stats.totalVolume.toLocaleString()}`}
                        </p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-paper border border-line text-copper">
                        <Wallet size={22} />
                    </div>
                </div>
            </div>
        </div>
    );
}