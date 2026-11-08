import { useEffect, useState } from "react";
import { Wallet, ArrowDownRight, ArrowUpRight, ShieldCheck, AlertCircle, RefreshCw } from "lucide-react";
import { useAdminSession } from "./AdminSession.jsx";

const API_BASE = "https://craftad-lite-2.onrender.com";

export function AdminTransactionsPage() {
    const { token } = useAdminSession();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filterType, setFilterType] = useState("");

    async function fetchTransactions() {
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`${API_BASE}/api/admin/transactions`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(data.message || "Failed to fetch platform transactions");
            }

            setTransactions(data.transactions || data.data || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Could not load transactions ledger");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (token) {
            fetchTransactions();
        }
    }, [token]);

    const filteredTransactions = transactions.filter(tx => {
        if (!filterType) return true;
        return tx.type === filterType;
    });

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-copper">FINANCIAL OVERSIGHT</p>
                    <h1 className="mt-1 font-display text-3xl tracking-tight text-ink">Transactions & Escrow</h1>
                    <p className="mt-1 text-sm text-muted">Monitor marketplace liquidity flows, escrow lock-ins, and user ledger activity.</p>
                </div>
                <button
                    onClick={fetchTransactions}
                    disabled={loading}
                    className="inline-flex items-center gap-2 self-start rounded-full border border-line bg-cream px-5 py-2.5 text-sm font-medium text-ink transition hover:border-copper disabled:opacity-50 shadow-sm"
                >
                    <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                    <span>Refresh Ledger</span>
                </button>
            </div>

            {error && (
                <div className="flex items-center gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-5 py-4 text-sm text-rose-800">
                    <AlertCircle size={18} className="shrink-0 text-rose-600" />
                    <span>{error}</span>
                </div>
            )}

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-3 rounded-3xl border border-line bg-cream p-4 shadow-sm">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted px-2">Filter Ledger:</span>
                <button
                    onClick={() => setFilterType("")}
                    className={`rounded-full px-4 py-2 text-xs font-semibold transition ${!filterType ? "bg-ink text-cream" : "bg-paper text-muted hover:text-ink"}`}
                >
                    All Transactions
                </button>
                <button
                    onClick={() => setFilterType("credit")}
                    className={`rounded-full px-4 py-2 text-xs font-semibold transition ${filterType === "credit" ? "bg-ink text-cream" : "bg-paper text-muted hover:text-ink"}`}
                >
                    Credits (Funding)
                </button>
                <button
                    onClick={() => setFilterType("debit")}
                    className={`rounded-full px-4 py-2 text-xs font-semibold transition ${filterType === "debit" ? "bg-ink text-cream" : "bg-paper text-muted hover:text-ink"}`}
                >
                    Debits (Withdrawals/Escrow)
                </button>
            </div>

            {/* Transactions Table */}
            <div className="overflow-hidden rounded-[2rem] border border-line bg-cream shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                        <tr className="border-b border-line bg-paper/50 text-xs font-semibold uppercase tracking-wider text-muted">
                            <th className="px-6 py-4">Transaction ID / Ref</th>
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Type</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Amount</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-line text-sm">
                        {loading && transactions.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center text-muted">
                                    Loading ledger records from database...
                                </td>
                            </tr>
                        ) : filteredTransactions.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center text-muted">
                                    No transaction records found matching your filter.
                                </td>
                            </tr>
                        ) : (
                            filteredTransactions.map((tx) => {
                                const isCredit = tx.type === "credit";
                                return (
                                    <tr key={tx._id || tx.reference} className="transition-colors hover:bg-paper/40">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-ink font-mono text-xs">{tx.reference || tx._id}</div>
                                            <div className="text-xs text-muted mt-0.5">
                                                {tx.createdAt ? new Date(tx.createdAt).toLocaleString() : "Recent"}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-ink">{tx.user?.name || tx.user?.email || "Marketplace User"}</div>
                                            <div className="text-xs text-muted">{tx.user?.role || "user"}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className={`flex h-7 w-7 items-center justify-center rounded-full border border-line ${isCredit ? "bg-emerald-500/10 text-emerald-600" : "bg-paper text-muted"}`}>
                                                    {isCredit ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
                                                </div>
                                                <span className="capitalize font-medium text-ink">{tx.type}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700">
                                                    <ShieldCheck size={12} />
                                                    {tx.status || "Completed"}
                                                </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                                <span className={`font-display font-bold text-base ${isCredit ? "text-emerald-600" : "text-ink"}`}>
                                                    {isCredit ? "+" : "−"}₦{(tx.amount || 0).toLocaleString()}
                                                </span>
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

