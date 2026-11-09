import { useCallback, useEffect, useState } from "react";
import { craftad, listOf } from "../api";
import { useAdminSession } from "./AdminSession";
import { AdminStatsHeader } from "./AdminStatsHeader.jsx";

export function AdminUsers() {
    const { token } = useAdminSession();

    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [role, setRole] = useState("");
    const [status, setStatus] = useState("");

    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const loadUsers = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const params = new URLSearchParams();
            if (search.trim()) params.set("search", search.trim());
            if (role) params.set("role", role);
            if (status) params.set("status", status);

            const queryStr = params.toString();
            const queryString = queryStr ? `?${queryStr}` : "";

            const res = await craftad.adminGetUsers(token, queryString);
            setUsers(listOf(res, ["users", "data", "results"]));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Could not load users");
        } finally {
            setLoading(false);
        }
    }, [token, search, role, status]);

    useEffect(() => {
        if (token) {
            loadUsers();
        }
    }, [token, loadUsers]);

    async function updateUser(userId, action, value) {
        try {
            setUpdatingId(userId);
            setError("");
            setSuccess("");

            let res;
            if (action === "status") {
                res = await craftad.adminUpdateUserStatus(token, userId, value);
            } else {
                res = await craftad.adminVerifyArtisan(token, userId, value);
            }

            setSuccess(res.message || "Account updated successfully");
            await loadUsers();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Could not update this account");
        } finally {
            setUpdatingId("");
        }
    }

    return (
        <div>
            <div className="mb-8">
                <p className="text-sm font-medium uppercase tracking-[0.15em] text-copper">
                    Administration
                </p>

                <h1 className="mt-2 font-display text-3xl sm:text-4xl text-ink">
                    User management
                </h1>

                <p className="mt-2 text-sm text-muted">
                    Search customer and artisan accounts, manage account status, and verify artisans.
                </p>
            </div>

            {/* Platform Analytics Summary Header */}
            <AdminStatsHeader />

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    loadUsers();
                }}
                className="mb-6 grid gap-3 rounded-3xl border border-line bg-cream p-4 sm:grid-cols-2 xl:grid-cols-4 transition-colors duration-200"
            >
                <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search name or email"
                    className="min-h-11 rounded-xl border border-line bg-paper text-ink px-3 text-sm outline-none focus:border-copper placeholder:text-muted"
                />

                <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="min-h-11 rounded-xl border border-line bg-paper text-ink px-3 text-sm outline-none focus:border-copper"
                >
                    <option value="">All roles</option>
                    <option value="customer">Customers</option>
                    <option value="artisan">Artisans</option>
                </select>

                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="min-h-11 rounded-xl border border-line bg-paper text-ink px-3 text-sm outline-none focus:border-copper"
                >
                    <option value="">All account statuses</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                </select>

                <button
                    type="submit"
                    disabled={loading}
                    className="min-h-11 rounded-full bg-copper text-white hover:bg-copper-deep px-5 text-sm font-semibold transition disabled:opacity-60"
                >
                    {loading ? "Loading..." : "Apply filters"}
                </button>
            </form>

            {error && (
                <div role="alert" className="mb-4 rounded-2xl border border-line bg-cream p-4 text-sm text-copper-deep">
                    {error}
                </div>
            )}

            {success && (
                <div role="status" className="mb-4 rounded-2xl border border-line bg-cream p-4 text-sm text-ink">
                    {success}
                </div>
            )}

            <div className="overflow-hidden rounded-3xl border border-line bg-cream transition-colors duration-200">
                <div className="flex items-center justify-between border-b border-line px-5 py-4">
                    <h2 className="font-display text-xl text-ink">Platform users</h2>
                    <span className="text-sm text-muted">
                        {loading ? "Loading..." : `${users.length} found`}
                    </span>
                </div>

                {loading ? (
                    <p className="p-6 text-sm text-muted">Loading users...</p>
                ) : users.length === 0 ? (
                    <p className="p-6 text-sm text-muted">
                        No users found. Try changing your search or filters.
                    </p>
                ) : (
                    <div className="divide-y divide-line">
                        {users.map((user) => {
                            const userId = user._id || user.id;
                            const isUpdating = updatingId === userId;

                            return (
                                <div key={userId} className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
                                    <div className="min-w-0">
                                        <p className="break-words font-semibold text-ink">
                                            {user.fullName || "Unnamed user"}
                                        </p>

                                        <p className="mt-1 break-all text-sm text-muted">
                                            {user.email}
                                        </p>

                                        <div className="mt-3 flex flex-wrap gap-2 text-xs">
                                            <span className="rounded-full bg-paper border border-line text-ink px-3 py-1 capitalize">
                                                {user.role || "Unknown role"}
                                            </span>

                                            <span className={`rounded-full px-3 py-1 font-medium ${
                                                user.isActive
                                                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                                                    : "bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20"
                                            }`}>
                                                {user.isActive ? "Active" : "Suspended"}
                                            </span>

                                            {user.role === "artisan" && (
                                                <span className="rounded-full bg-paper border border-line text-ink px-3 py-1">
                                                    {user.isVerified ? "Verified" : "Not verified"}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {user.role === "artisan" && (
                                            <button
                                                type="button"
                                                disabled={isUpdating}
                                                onClick={() => updateUser(userId, "verify", !user.isVerified)}
                                                className="rounded-full border border-line bg-paper text-ink px-4 py-2 text-xs font-semibold hover:border-copper disabled:opacity-50 transition"
                                            >
                                                {isUpdating ? "Updating..." : user.isVerified ? "Remove verification" : "Verify artisan"}
                                            </button>
                                        )}

                                        <button
                                            type="button"
                                            disabled={isUpdating}
                                            onClick={() => updateUser(userId, "status", !user.isActive)}
                                            className={`rounded-full px-4 py-2 text-xs font-semibold transition disabled:opacity-50 ${
                                                user.isActive
                                                    ? "border border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20"
                                                    : "bg-copper text-white hover:bg-copper-deep"
                                            }`}
                                        >
                                            {isUpdating ? "Updating..." : user.isActive ? "Suspend account" : "Reactivate account"}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}