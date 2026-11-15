import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useSession } from '../session';
import { SiteMark } from './SiteMark';
import { Mail, Moon, Sun } from 'lucide-react';
import { useTheme } from '../theme';
import { ChatLauncher } from './ChatLauncher';
import { craftad } from '../api';

export function AppShell({ children }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, token, signOut } = useSession();
    const { darkMode, toggleTheme } = useTheme();

    const [unreadCount, setUnreadCount] = useState(0);

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
            } catch (error) {
                // Keep the previous count if a temporary request fails.
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
            // Automatically redirect when the 401 interceptor fires in api.js
            signOut();
            navigate('/auth', { replace: true });
        };

        window.addEventListener("craftad:unauthorized", handleUnauthorized);
        return () => window.removeEventListener("craftad:unauthorized", handleUnauthorized);
    }, [navigate, signOut]);

    const handleSignOut = () => {
        signOut();
        navigate("/auth", { replace: true });
    };

    return (
        <div className="min-h-screen bg-[#FDFBF7] text-ink">
            {/* Top Navigation Header Bar */}
            <header className="sticky top-0 z-30 border-b border-line bg-cream/80 backdrop-blur-md">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

                    {/* Brand Logo (acting as Home button) & Nav Links */}
                    {/* Brand Logo (acting as Home button) & Nav Links */}
                    <div className="flex items-center gap-8">
                        <SiteMark />

                        {user && (
                            <nav className="hidden items-center gap-6 text-sm font-medium text-muted md:flex">
                                <Link to="/dashboard" className="transition-colors hover:text-ink no-underline">
                                    Home
                                </Link>
                                <Link to="/jobs" className="transition-colors hover:text-ink no-underline">
                                    Jobs
                                </Link>
                                <Link to="/wallet" className="transition-colors hover:text-ink no-underline">
                                    Wallet
                                </Link>
                                <Link to="/notifications" className="transition-colors hover:text-ink no-underline">
                                    Alerts
                                </Link>
                            </nav>
                        )}
                    </div>

                    {/* User Profile & Sign Out */}
                    <div className="flex items-center gap-4">
                        {user ? (
                            <div className="flex items-center gap-3">
                                <div className="hidden text-right sm:block">
                                    <p className="text-sm font-semibold text-ink">
                                        {user.fullName || user.name || "User"}
                                    </p>
                                    <p className="text-xs capitalize text-muted">
                                        {user.role}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={toggleTheme}
                                    aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                                    title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ink transition hover:bg-[#F3EEE5]"
                                >
                                    {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => navigate('/chat')}
                                    aria-label={
                                        unreadCount > 0
                                            ? `Open messages, ${unreadCount} unread`
                                            : "Open messages"
                                    }
                                    title="Messages"
                                    className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ink transition hover:bg-[#F3EEE5]"
                                >
                                    <Mail size={21} />

                                    {unreadCount > 0 && (
                                        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold leading-none text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
        </span>
                                    )}
                                </button>
                                <button
                                    onClick={handleSignOut}
                                    className="inline-flex items-center rounded-full border border-line bg-paper px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-copper hover:text-copper"
                                >
                                    Sign out
                                </button>

                            </div>
                        ) : (
                            <Link
                                to="/auth"
                                className="inline-flex items-center rounded-full bg-copper px-5 py-2 text-sm font-semibold text-cream no-underline transition-colors hover:bg-copper-deep"
                            >
                                Sign in
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Page Content */}
            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {children}
            </main>
            {!location.pathname.startsWith("/chat") && <ChatLauncher />}
        </div>
    );
}