import { useEffect, useState } from "react";
import { ShieldCheck, AlertTriangle, RefreshCw, Lock, DollarSign, CheckCircle2 } from "lucide-react";
import { useAdminSession } from "./AdminSession";

const API_BASE = "https://craftad-lite-2.onrender.com";

export function AdminEscrowPage() {
    const { token } = useAdminSession();
    const [escrows, setEscrows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [actionId, setActionId] = useState("");

    async function fetchEscrows() {
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`${API_BASE}/api/admin/escrows`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.message || "Failed to fetch escrow records");
            }
            setEscrows(data.escrows || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Could not load escrow data");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (token) fetchEscrows();
    }, [token]);

    async function handleAdminAction(escrowId, actionType) {
        setActionId(escrowId);
        setError("");
        setSuccess("");
        try {
            const res = await fetch(`${API_BASE}/api/admin/escrows/${escrowId}/${actionType}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.message || `Failed to ${actionType} escrow`);
            }
            setSuccess(data.message || `Escrow successfully ${actionType}d.`);
            await fetchEscrows();
        } catch (err) {
            setError(err.message);
        } finally {
            setActionId("");
        }
    }

    // Calculate aggregate metrics
    const totalLocked = escrows
        .filter(e => e.status === "funded")
        .reduce((sum, e) => sum + (e.amount || 0), 0);

    const totalFeesEarned = escrows
        .filter(e => ["funded", "released", "completed"].includes(e.status))
        .reduce((sum, e) => sum + (e.platformFee || 0), 0);

    const activeCount = escrows.filter(e => e.status === "funded").length;
    const disputedCount = escrows.filter(e => e.status === "disputed").length;

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-copper">ADMINISTRATION</p>
                    <h1 className="mt-1 font-display text-3xl tracking-tight text-ink">Escrow & Platform Revenue</h1>
                    <p className="mt-1 text-sm text-muted">Monitor locked project funds, platform fee collections, and resolve payment disputes.</p>
                </div>
                <button
                    onClick={fetchEscrows}
                    disabled={loading}
                    className="inline-flex items-center gap-2 self-start rounded-full border border-line bg-cream px-5 py-2.5 text-sm font-medium text-ink transition hover:border-copper disabled:opacity-50 shadow-sm"
                >
                    <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                    <span>Refresh Escrows</span>
                </button>
            </div>

            {error && (
                <div className="flex items-center gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-5 py-4 text-sm text-rose-800">
                    <AlertTriangle size={18} className="shrink-0 text-rose-600" />
                    <span>{error}</span>
                </div>
            )}

            {success && (
                <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-800">
                    <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
                    <span>{success}</span>
                </div>
            )}

            {/* Metrics Overview */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-3xl border border-line bg-cream p-6 shadow-sm">
                    <div className="flex items-center justify-between text-muted">
                        <span className="text-xs font-semibold uppercase tracking-wider">Locked Escrow</span>
                        <Lock size={18} className="text-copper" />
                    </div>
                    <p className="mt-3 font-display text-3xl font-semibold">₦{totalLocked.toLocaleString()}</p>
                    <p className="mt-1 text-xs text-muted">Currently held in escrow</p>
                </div>

                <div className="rounded-3xl border border-line bg-cream p-6 shadow-sm">
                    <div className="flex items-center justify-between text-muted">
                        <span className="text-xs font-semibold uppercase tracking-wider">Platform Fees Earned</span>
                        <DollarSign size={18} className="text-emerald-600" />
                    </div>
                    <p className="mt-3 font-display text-3xl font-semibold text-emerald-700">₦{totalFeesEarned.toLocaleString()}</p>
                    <p className="mt-1 text-xs text-muted">Total 5% commission revenue</p>
                </div>

                <div className="rounded-3xl border border-line bg-cream p-6 shadow-sm">
                    <div className="flex items-center justify-between text-muted">
                        <span className="text-xs font-semibold uppercase tracking-wider">Active Escrows</span>
                        <ShieldCheck size={18} className="text-ink" />
                    </div>
                    <p className="mt-3 font-display text-3xl font-semibold">{activeCount}</p>
                    <p className="mt-1 text-xs text-muted">Jobs in progress</p>
                </div>

                <div className="rounded-3xl border border-line bg-cream p-6 shadow-sm">
                    <div className="flex items-center justify-between text-muted">
                        <span className="text-xs font-semibold uppercase tracking-wider">Disputed Jobs</span>
                        <AlertTriangle size={18} className="text-rose-600" />
                    </div>
                    <p className="mt-3 font-display text-3xl font-semibold text-rose-700">{disputedCount}</p>
                    <p className="mt-1 text-xs text-muted">Requiring admin attention</p>
                </div>
            </div>

            {/* Escrow Table */}
            <div className="overflow-hidden rounded-[2rem] border border-line bg-cream shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                        <tr className="border-b border-line bg-paper/50 text-xs font-semibold uppercase tracking-wider text-muted">
                            <th className="px-6 py-4">Reference / Job</th>
                            <th className="px-6 py-4">Customer & Artisan</th>
                            <th className="px-6 py-4">Amount & Fee</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Admin Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-line text-sm">
                        {loading && escrows.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center text-muted">
                                    Loading escrow contracts from database...
                                </td>
                            </tr>
                        ) : escrows.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center text-muted">
                                    No escrow contracts found.
                                </td>
                            </tr>
                        ) : (
                            escrows.map((escrow) => {
                                const isBusy = actionId === escrow._id;
                                const isFunded = escrow.status === "funded";
                                const isDisputed = escrow.status === "disputed";

                                return (
                                    <tr key={escrow._id} className="transition-colors hover:bg-paper/40">
                                        <td className="px-6 py-4">
                                            <div className="font-mono text-xs font-semibold text-ink">{escrow.reference}</div>
                                            <div className="text-xs text-muted mt-0.5">{escrow.job?.title || "Project Contract"}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-xs">
                                                <span className="font-medium text-ink">Cust:</span> {escrow.customer?.name || "Client"}
                                            </div>
                                            <div className="text-xs mt-0.5">
                                                <span className="font-medium text-ink">Art:</span> {escrow.artisan?.name || "Artisan"}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-display font-bold text-ink">₦{(escrow.amount || 0).toLocaleString()}</div>
                                            <div className="text-xs text-emerald-600 font-medium">Fee: ₦{(escrow.platformFee || 0).toLocaleString()}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
                                                    isFunded ? "bg-emerald-500/10 text-emerald-700" :
                                                        isDisputed ? "bg-rose-500/10 text-rose-700" :
                                                            "bg-paper text-muted"
                                                }`}>
                                                    {escrow.status}
                                                </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {isFunded && (
                                                    <button
                                                        disabled={isBusy}
                                                        onClick={() => handleAdminAction(escrow._id, "force-release")}
                                                        className="rounded-full bg-ink px-3 py-1.5 text-xs font-semibold text-cream hover:opacity-90 disabled:opacity-50"
                                                    >
                                                        {isBusy ? "Processing..." : "Force Release"}
                                                    </button>
                                                )}
                                                {(isFunded || isDisputed) && (
                                                    <button
                                                        disabled={isBusy}
                                                        onClick={() => handleAdminAction(escrow._id, "refund")}
                                                        className="rounded-full border border-rose-500/30 bg-rose-500/5 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-500/10 disabled:opacity-50"
                                                    >
                                                        {isBusy ? "Processing..." : "Refund Customer"}
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}