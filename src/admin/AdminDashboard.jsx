import { useEffect, useState } from "react";
import { TrendingUp, ShieldCheck, Users, DollarSign, RefreshCw } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useAdminSession } from "./AdminSession";

const API_BASE = "https://craftad-lite-2.onrender.com";

export function AdminDashboard() {
    const { token } = useAdminSession();
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeEscrowsCount: 0,
        totalVolume: 0,
        totalFees: 0,
        chartData: []
    });
    const [loading, setLoading] = useState(true);

    async function fetchDashboardStats() {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/admin/dashboard-stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setStats(data.stats);
            }
        } catch (err) {
            console.error("Failed to load dashboard stats", err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (token) fetchDashboardStats();
    }, [token]);

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-copper">ADMINISTRATION</p>
                    <h1 className="mt-1 font-display text-3xl tracking-tight text-ink">Dashboard Overview</h1>
                    <p className="mt-1 text-sm text-muted">Real-time telemetry of Craftad marketplace activity, escrow vaults, and revenue.</p>
                </div>
                <button
                    onClick={fetchDashboardStats}
                    disabled={loading}
                    className="inline-flex items-center gap-2 self-start rounded-full border border-line bg-cream px-5 py-2.5 text-sm font-medium text-ink transition hover:border-copper disabled:opacity-50 shadow-sm"
                >
                    <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                    <span>Refresh Stats</span>
                </button>
            </div>

            {/* Top Metric Cards */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-3xl border border-line bg-cream p-6 shadow-sm">
                    <div className="flex items-center justify-between text-muted">
                        <span className="text-xs font-semibold uppercase tracking-wider">Total Users</span>
                        <Users size={18} className="text-copper" />
                    </div>
                    <p className="mt-3 font-display text-3xl font-semibold">{stats.totalUsers || 0}</p>
                    <p className="mt-1 text-xs text-muted">Registered clients & artisans</p>
                </div>

                <div className="rounded-3xl border border-line bg-cream p-6 shadow-sm">
                    <div className="flex items-center justify-between text-muted">
                        <span className="text-xs font-semibold uppercase tracking-wider">Active Escrows</span>
                        <ShieldCheck size={18} className="text-ink" />
                    </div>
                    <p className="mt-3 font-display text-3xl font-semibold">{stats.activeEscrowsCount || 0}</p>
                    <p className="mt-1 text-xs text-muted">Funds currently locked in vault</p>
                </div>

                <div className="rounded-3xl border border-line bg-cream p-6 shadow-sm">
                    <div className="flex items-center justify-between text-muted">
                        <span className="text-xs font-semibold uppercase tracking-wider">Escrow Volume</span>
                        <TrendingUp size={18} className="text-copper" />
                    </div>
                    <p className="mt-3 font-display text-3xl font-semibold">₦{(stats.totalVolume || 0).toLocaleString()}</p>
                    <p className="mt-1 text-xs text-muted">Total platform project value</p>
                </div>

                <div className="rounded-3xl border border-line bg-cream p-6 shadow-sm">
                    <div className="flex items-center justify-between text-muted">
                        <span className="text-xs font-semibold uppercase tracking-wider">Commission Revenue</span>
                        <DollarSign size={18} className="text-emerald-600" />
                    </div>
                    <p className="mt-3 font-display text-3xl font-semibold text-emerald-700">₦{(stats.totalFees || 0).toLocaleString()}</p>
                    <p className="mt-1 text-xs text-muted">5% platform fee earnings</p>
                </div>
            </div>

            {/* Advanced Recharts Area Chart with Live MongoDB Aggregation */}
            <div className="rounded-[2rem] border border-line bg-cream p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="font-display text-xl font-semibold text-ink">Platform Financial Inflows</h2>
                        <p className="text-xs text-muted">Live MongoDB aggregation of escrow volume and commission revenue over time.</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-semibold">
                        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-copper inline-block"></span> Escrow Volume</span>
                        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-emerald-600 inline-block"></span> Commission Fees</span>
                    </div>
                </div>

                <div className="h-72 w-full pt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={stats.chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#b45309" stopOpacity={0.4}/>
                                    <stop offset="95%" stopColor="#b45309" stopOpacity={0.0}/>
                                </linearGradient>
                                <linearGradient id="colorFees" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#059669" stopOpacity={0.4}/>
                                    <stop offset="95%" stopColor="#059669" stopOpacity={0.0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                            <XAxis dataKey="month" stroke="#6b7280" fontSize={12} tickLine={false} />
                            <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip
                                contentStyle={{ backgroundColor: "#1c1917", borderRadius: "1rem", color: "#f5f5f4", border: "none" }}
                                formatter={(value) => [`₦${value.toLocaleString()}`, ""]}
                            />
                            <Area type="monotone" dataKey="volume" name="Escrow Volume" stroke="#b45309" strokeWidth={3} fillOpacity={1} fill="url(#colorVolume)" />
                            <Area type="monotone" dataKey="fees" name="Commission Fees" stroke="#059669" strokeWidth={3} fillOpacity={1} fill="url(#colorFees)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}