
import { useCallback, useEffect, useState } from "react";
import { useAdminSession } from "./AdminSession";

const API_BASE = "https://craftad-lite-2.onrender.com";

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

            const query = params.toString();
            const url = `${API_BASE}/api/admin/users${query ? `?${query}` : ""}`;

            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(data.message || "Could not load users");
            }

            setUsers(Array.isArray(data.users) ? data.users : []);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
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

            const endpoint =
                action === "status"
                    ? `/api/admin/users/${userId}/status`
                    : `/api/admin/users/${userId}/verify`;

            const body =
                action === "status"
                    ? { isActive: value }
                    : { isVerified: value };

            const response = await fetch(`${API_BASE}${endpoint}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(data.message || "Could not update this account");
            }

            setSuccess(data.message || "Account updated successfully");

            await loadUsers();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
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

                <h1 className="mt-2 font-display text-3xl sm:text-4xl">
                    User management
                </h1>

                <p className="mt-2 text-sm text-muted">
                    Search customer and artisan accounts, manage account status, and
                    verify artisans.
                </p>
            </div>

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    loadUsers();
                }}
                className="mb-6 grid gap-3 rounded-3xl border border-line bg-cream p-4 sm:grid-cols-2 xl:grid-cols-4"
            >
                <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search name or email"
                    className="min-h-11 rounded-xl border border-line bg-white px-3 text-sm outline-none focus:border-copper"
                />

                <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="min-h-11 rounded-xl border border-line bg-white px-3 text-sm outline-none focus:border-copper"
                >
                    <option value="">All roles</option>
                    <option value="customer">Customers</option>
                    <option value="artisan">Artisans</option>
                </select>

                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="min-h-11 rounded-xl border border-line bg-white px-3 text-sm outline-none focus:border-copper"
                >
                    <option value="">All account statuses</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                </select>

                <button
                    type="submit"
                    disabled={loading}
                    className="min-h-11 rounded-full bg-ink px-5 text-sm font-semibold text-cream disabled:opacity-60"
                >
                    {loading ? "Loading..." : "Apply filters"}
                </button>
            </form>

            {error && (
                <div
                    role="alert"
                    className="mb-4 rounded-2xl border border-line bg-cream p-4 text-sm text-copper-deep"
                >
                    {error}
                </div>
            )}

            {success && (
                <div
                    role="status"
                    className="mb-4 rounded-2xl border border-line bg-cream p-4 text-sm text-ink"
                >
                    {success}
                </div>
            )}

            <div className="overflow-hidden rounded-3xl border border-line bg-cream">
                <div className="flex items-center justify-between border-b border-line px-5 py-4">
                    <h2 className="font-display text-xl">Platform users</h2>
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
                                <div
                                    key={userId}
                                    className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between"
                                >
                                    <div className="min-w-0">
                                        <p className="break-words font-semibold">
                                            {user.fullName || "Unnamed user"}
                                        </p>

                                        <p className="mt-1 break-all text-sm text-muted">
                                            {user.email}
                                        </p>

                                        <div className="mt-3 flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full bg-paper px-3 py-1 capitalize">
                        {user.role || "Unknown role"}
                      </span>

                                            <span
                                                className={`rounded-full px-3 py-1 ${
                                                    user.isActive
                                                        ? "bg-emerald-50 text-emerald-800"
                                                        : "bg-red-50 text-red-800"
                                                }`}
                                            >
                        {user.isActive ? "Active" : "Suspended"}
                      </span>

                                            {user.role === "artisan" && (
                                                <span className="rounded-full bg-paper px-3 py-1">
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
                                                onClick={() =>
                                                    updateUser(
                                                        userId,
                                                        "verify",
                                                        !user.isVerified
                                                    )
                                                }
                                                className="rounded-full border border-line px-4 py-2 text-xs font-semibold hover:bg-paper disabled:opacity-50"
                                            >
                                                {isUpdating
                                                    ? "Updating..."
                                                    : user.isVerified
                                                        ? "Remove verification"
                                                        : "Verify artisan"}
                                            </button>
                                        )}

                                        <button
                                            type="button"
                                            disabled={isUpdating}
                                            onClick={() =>
                                                updateUser(userId, "status", !user.isActive)
                                            }
                                            className={`rounded-full px-4 py-2 text-xs font-semibold disabled:opacity-50 ${
                                                user.isActive
                                                    ? "bg-red-50 text-red-800 hover:bg-red-100"
                                                    : "bg-ink text-cream hover:opacity-90"
                                            }`}
                                        >
                                            {isUpdating
                                                ? "Updating..."
                                                : user.isActive
                                                    ? "Suspend account"
                                                    : "Reactivate account"}
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
