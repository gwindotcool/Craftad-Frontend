import { useEffect, useState } from "react";
import { useNavigate, useLocation, Link, NavLink } from "react-router-dom";
import {
    Bell,
    Briefcase,
    LayoutDashboard,
    LogOut,
    Mail,
    Moon,
    Plus,
    Sun,
    Wallet,
} from "lucide-react";
import { useSession } from "../session";
import { SiteMark } from "./SiteMark";
import { useTheme } from "../theme";
import { ChatLauncher } from "./ChatLauncher";
import { craftad } from "../api";

const NAV_LINKS = [
    { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { to: "/jobs", label: "Jobs", icon: Briefcase },
    { to: "/wallet", label: "Wallet", icon: Wallet },
    { to: "/notifications", label: "Alerts", icon: Bell },
];

export function AppShell({ children }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, token, signOut } = useSession();
    const { darkMode, toggleTheme } = useTheme();

    const [unreadCount, setUnreadCount] = useState(0);
    const isCustomer = user?.role === "customer";

    useEffect(() => {
        if (!token) {
            setUnreadCount(0);
            return;
        }

        let active = true;

        const fetchUnreadCount = async () => {
            try {
                const response = await craftad.unreadCount(token);
                if (active) {
                    setUnreadCount(Number(response.unreadCount) || 0);
                }
            } catch {
                // Keep previous count if temporary request fails
            }
        };

        fetchUnreadCount();
        const intervalId = window.setInterval(fetchUnreadCount, 30000);

        return () => {
            active = false;
            window.clearInterval(intervalId);
        };
    }, [token, location.pathname]);

    useEffect(() => {
        const handleUnauthorized = () => {
            signOut();
            navigate("/login", { replace: true });
        };

        window.addEventListener("craftad:unauthorized", handleUnauthorized);
        return () =>
            window.removeEventListener("craftad:unauthorized", handleUnauthorized);
    }, [navigate, signOut]);

    const handleSignOut = () => {
        signOut();
        navigate("/login", { replace: true });
    };

    return (
        <div className="flex min-h-screen flex-col bg-paper text-ink transition-colors duration-200">
            {/* Sticky Top Header */}
            <header className="sticky top-0 z-30 border-b border-line bg-cream/85 backdrop-blur-md">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    {/* Brand Logo & Desktop Navigation */}
                    <div className="flex items-center gap-8">
                        <SiteMark to={user ? "/dashboard" : "/"} />

                        {user && (
                            <nav
                                aria-label="Primary navigation"
                                className="hidden items-center gap-1.5 md:flex"
                            >
                                {NAV_LINKS.map(({ to, label, icon: Icon }) => (
                                    <NavLink
                                        key={to}
                                        to={to}
                                        className={({ isActive }) =>
                                            `inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium no-underline transition-all ${
                                                isActive
                                                    ? "bg-copper/12 font-semibold text-copper"
                                                    : "text-muted hover:bg-subtle hover:text-ink"
                                            }`
                                        }
                                    >
                                        <Icon size={16} />
                                        <span>{label}</span>
                                    </NavLink>
                                ))}
                            </nav>
                        )}
                    </div>

                    {/* Right Utility Cluster */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        {user ? (
                            <>
                                {isCustomer && (
                                    <Link
                                        to="/jobs/new"
                                        className="hidden min-h-9 items-center gap-1.5 rounded-full bg-copper px-4 text-xs font-semibold text-white no-underline shadow-sm transition-colors hover:bg-copper-deep sm:inline-flex"
                                    >
                                        <Plus size={15} />
                                        <span>Post a Job</span>
                                    </Link>
                                )}

                                <button
                                    type="button"
                                    onClick={toggleTheme}
                                    aria-label={
                                        darkMode ? "Switch to light mode" : "Switch to dark mode"
                                    }
                                    title={
                                        darkMode ? "Switch to light mode" : "Switch to dark mode"
                                    }
                                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line bg-raised text-muted transition-colors hover:border-line-strong hover:text-ink"
                                >
                                    {darkMode ? <Sun size={17} /> : <Moon size={17} />}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => navigate("/chat")}
                                    aria-label={
                                        unreadCount > 0
                                            ? `Open messages, ${unreadCount} unread`
                                            : "Open messages"
                                    }
                                    title="Messages"
                                    className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors ${
                                        location.pathname.startsWith("/chat")
                                            ? "border-copper/40 bg-copper/12 text-copper"
                                            : "border-line bg-raised text-muted hover:border-line-strong hover:text-ink"
                                    }`}
                                >
                                    <Mail size={17} />

                                    {unreadCount > 0 && (
                                        <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold leading-none text-white shadow-sm">
                                            {unreadCount > 99 ? "99+" : unreadCount}
                                        </span>
                                    )}
                                </button>

                                {/* User Identity + Sign Out */}
                                <div className="flex items-center gap-2.5 border-l border-line pl-2.5 sm:pl-3">
                                    <div className="hidden text-right leading-tight lg:block">
                                        <p className="max-w-[130px] truncate text-xs font-semibold text-ink">
                                            {user.fullName || user.name || "Account"}
                                        </p>
                                        <p className="text-[11px] capitalize text-muted">
                                            {user.role}
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleSignOut}
                                        title="Sign out"
                                        className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line bg-raised px-3 text-xs font-semibold text-ink transition-colors hover:border-danger/40 hover:bg-danger-soft hover:text-danger"
                                    >
                                        <LogOut size={14} />
                                        <span className="hidden sm:inline">Sign out</span>
                                    </button>
                                </div>
                            </>
                        ) : (
                            <Link
                                to="/login"
                                className="inline-flex min-h-9 items-center rounded-full bg-copper px-5 text-sm font-semibold text-white no-underline shadow-sm transition-colors hover:bg-copper-deep"
                            >
                                Sign in
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Page Content (extra bottom padding on mobile for tab bar) */}
            <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-24 pt-6 sm:px-6 sm:py-8 md:pb-10 lg:px-8">
                {children}
            </main>

            {/* Mobile Bottom Tab Navigation */}
            {user && (
                <nav
                    aria-label="Mobile navigation"
                    className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-cream/95 px-2 py-1.5 backdrop-blur-md md:hidden"
                >
                    <div className="mx-auto flex max-w-md items-center justify-around">
                        {NAV_LINKS.map(({ to, label, icon: Icon }) => (
                            <NavLink
                                key={to}
                                to={to}
                                className={({ isActive }) =>
                                    `flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-[11px] font-medium no-underline transition-colors ${
                                        isActive
                                            ? "font-semibold text-copper"
                                            : "text-muted hover:text-ink"
                                    }`
                                }
                            >
                                <Icon size={18} />
                                <span>{label}</span>
                            </NavLink>
                        ))}
                    </div>
                </nav>
            )}

            {!location.pathname.startsWith("/chat") && <ChatLauncher />}
        </div>
    );
}