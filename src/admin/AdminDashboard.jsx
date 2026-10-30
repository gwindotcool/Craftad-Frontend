
import { useEffect, useState } from "react";
import { useAdminSession } from "./AdminSession";

const API_BASE = "https://craftad-lite-2.onrender.com";

export function AdminDashboard() {
    const { token, admin } = useAdminSession();

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadUsers() {
            try {
                setLoading(true);
                setError("");

                const response = await fetch(`${API_BASE}/api/admin/users`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data = await response.json().catch(() => ({}));

                if (!response.ok) {
                    throw new Error(data.message || "Could not load platform users");
                }

                setUsers(Array.isArray(data.users) ? data.users : []);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Something went wrong");
            } finally {
                setLoading(false);
            }
        }

        if (token) {
            loadUsers();
        }
    }, [token]);

    const totalUsers = users.length;
    const customers = users.filter((user) => user.role === "customer").length;
    const artisans = users.filter((user) => user.role === "artisan").length;
    const activeUsers = users.filter((user) => user.isActive === true).length;
    const suspendedUsers = users.filter((user) => user.isActive === false).length;
    const verifiedArtisans = users.filter(
        (user) => user.role === "artisan" && user.isVerified === true
    ).length;

    const stats = [
        { label: "Total users", value: totalUsers },
        { label: "Customers", value: customers },
        { label: "Artisans", value: artisans },
        { label: "Active users", value: activeUsers },
        { label: "Suspended users", value: suspendedUsers },
        { label: "Verified artisans", value: verifiedArtisans },
    ];

    return (
        <div>
            <div className="mb-8">
                <p className="text-sm font-medium uppercase tracking-[0.15em] text-copper">
                    Platform overview
                </p>

                <h1 className="mt-2 font-display text-3xl sm:text-4xl">
                    Welcome back{admin?.name ? `, ${admin.name}` : ""}
                </h1>

                <p className="mt-2 text-sm text-muted">
                    Here's an overview of the customers and artisans on Craftad.
                </p>
            </div>

            {error && (
                <div
                    role="alert"
                    className="mb-6 rounded-2xl border border-line bg-cream p-4 text-sm text-copper-deep"
                >
                    {error}
                </div>
            )}

            {loading ? (
                <p className="text-sm text-muted">Loading platform overview...</p>
            ) : (
                <>
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {stats.map((stat) => (
                            <div
                                key={stat.label}
                                className="rounded-3xl border border-line bg-cream p-6"
                            >
                                <p className="text-sm text-muted">{stat.label}</p>
                                <p className="mt-3 font-display text-4xl font-semibold">
                                    {stat.value}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 rounded-3xl border border-line bg-cream p-6">
                        <h2 className="font-display text-xl">Marketplace summary</h2>

                        <p className="mt-2 text-sm leading-6 text-muted">
                            Craftad currently has {customers} customer
                            {customers === 1 ? "" : "s"} and {artisans} artisan
                            {artisans === 1 ? "" : "s"} registered.
                            {artisans > 0
                                ? ` ${verifiedArtisans} artisan${verifiedArtisans === 1 ? " is" : "s are"} verified.`
                                : " No artisans have registered yet."}
                        </p>
                    </div>
                </>
            )}
        </div>
    );
}
