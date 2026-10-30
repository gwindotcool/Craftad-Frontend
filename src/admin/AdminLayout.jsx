import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAdminSession } from "./AdminSession";

export function AdminLayout() {
    const navigate = useNavigate();
    const { admin, signOut } = useAdminSession();

    const navItems = [
        {
            label: "Overview",
            path: "/admin/dashboard",
        },
        {
            label: "Users",
            path: "/admin/users",
        },
    ];

    function handleSignOut() {
        signOut();
        navigate("/admin/login", { replace: true });
    }

    return (
        <div className="min-h-screen bg-paper text-ink md:flex">
            <aside className="border-b border-line bg-cream p-5 md:min-h-screen md:w-64 md:border-b-0 md:border-r">
                <div className="mb-8">
                    <p className="font-display text-2xl font-semibold">
                        Craftad<span className="text-copper">.</span>
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted">
                        Administration
                    </p>
                </div>

                <nav className="flex gap-2 md:flex-col">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end
                            className={({ isActive }) =>
                                `rounded-xl px-4 py-3 text-sm font-medium transition ${
                                    isActive
                                        ? "bg-ink text-cream"
                                        : "text-muted hover:bg-paper hover:text-ink"
                                }`
                            }
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="mt-8 border-t border-line pt-5 md:mt-12">
                    <p className="text-xs text-muted">Signed in as</p>
                    <p className="mt-1 break-words text-sm font-semibold">
                        {admin?.name || admin?.email || "Administrator"}
                    </p>
                    <p className="mt-1 text-xs capitalize text-muted">
                        {admin?.role?.replace("_", " ") || "Admin"}
                    </p>

                    <button
                        type="button"
                        onClick={handleSignOut}
                        className="mt-5 w-full rounded-full border border-line px-4 py-2.5 text-sm font-medium hover:bg-paper"
                    >
                        Sign out
                    </button>
                </div>
            </aside>

            <main className="min-w-0 flex-1 p-5 sm:p-8">
                <Outlet />
            </main>
        </div>
    );
}