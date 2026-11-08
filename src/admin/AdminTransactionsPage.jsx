import { useEffect, useState } from "react";
import { RefreshCw, ArrowUpRight, ArrowDownLeft, Search, Filter, AlertTriangle } from "lucide-react";
import { useAdminSession } from "./AdminSession";

const API_BASE = "https://craftad-lite-2.onrender.com";

export function AdminTransactionsPage() {
    const { token } = useAdminSession();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Filtering and Search State
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState("all"); // "all", "credit", "debit"

    async function fetchTransactions() {
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`${API_BASE}/api/admin/transactions`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.message || "Failed to fetch transactions");
            }
            setTransactions(data.transactions || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Could not load transactions");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (token) fetchTransactions();
    }, [token]);

    // Filter transactions based on search query and type
    const filteredTransactions = transactions.filter((tx) => {
        const matchesSearch =
            tx.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tx.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tx.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tx.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesType = typeFilter === "all" || tx.type === typeFilter;

        return matchesSearch && matchesType;
    });

    const totalVolume = filteredTransactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-copper">ADMINISTRATION</p>
                    <h1 className="mt-1 font-display text-3xl tracking-tight text-ink">Marketplace Transactions</h1>
                    <p className="mt-1 text-sm text-muted">Inspect platform financial ledger, wallet movements, and funding logs.</p>
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
                    <AlertTriangle size={18} className="shrink-0 text-rose-600" />
                    <span>{error}</span>
                </div>
            )}

            {/* Filter & Search Bar */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-3xl border border-line bg-cream p-5 shadow-sm">
                <div className="relative flex-1 max-w-md">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                    <input
                        type="text"
                        placeholder="Search by reference, description, or user..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full rounded-full border border-line bg-paper py-2.5 pl-11 pr-4 text-sm text-ink placeholder:text-muted focus:border-copper focus:outline-none"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <Filter size={16} className="text-muted ml-1" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted mr-1">Type:</span>
                    {["all", "credit", "debit"].map((type) => (
                        <button
                            key={type}
                            onClick={() => setTypeFilter(type)}
                            className={`rounded-full px-4 py-1.5 text-xs font-semibold capitalize transition ${
                                typeFilter === type
                                    ? "bg-ink text-cream shadow-sm"
                                    : "border border-line bg-paper text-muted hover:text-ink"
                            }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            {/* Summary Bar */}
            <div className="flex items-center justify-between rounded-2xl border border-line bg-cream px-6 py-4 text-sm shadow-sm">
                <span className="text-muted">Showing <strong className="text-ink">{filteredTransactions.length}</strong> transactions</span>
                <span className="text-muted">Filtered Volume: <strong className="font-display text-ink text-base">₦{totalVolume.toLocaleString()}</strong></span>
            </div>

            {/* Transactions Table */}
            <div className="overflow-hidden rounded-[2rem] border border-line bg-cream shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                        <tr className="border-b border-line bg-paper/50 text-xs font-semibold uppercase tracking-wider text-muted">
                            <th className="px-6 py-4">Reference & Description</th>
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Type</th>
                            <th className="px-6 py-4">Amount</th>
                            <th className="px-6 py-4 text-right">Date</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-line text-sm">
                        {loading && transactions.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center text-muted">
                                    Loading ledger entries from database...
                                </td>
                            </tr>
                        ) : filteredTransactions.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center text-muted">
                                    No matching transactions found.
                                </td>
                            </tr>
                        ) : (
                            filteredTransactions.map((tx) => {
                                const isCredit = tx.type === "credit";

                                return (
                                    <tr key={tx._id} className="transition-colors hover:bg-paper/40">
                                        <td className="px-6 py-4">
                                            <div className="font-mono text-xs font-semibold text-ink">{tx.reference}</div>
                                            <div className="text-xs text-muted mt-0.5">{tx.description || "Platform transaction"}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-xs font-medium text-ink">{tx.user?.name || tx.user?.fullName || "User"}</div>
                                            <div className="text-xs text-muted mt-0.5">{tx.user?.email || "No email"}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
                                                    isCredit ? "bg-emerald-500/10 text-emerald-700" : "bg-rose-500/10 text-rose-700"
                                                }`}>
                                                    {isCredit ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />}
                                                    {tx.type}
                                                </span>
                                        </td>
                                        <td className="px-6 py-4 font-display font-bold text-ink">
                                            ₦{(tx.amount || 0).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-right text-xs text-muted">
                                            {new Date(tx.createdAt).toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit"
                                            })}
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