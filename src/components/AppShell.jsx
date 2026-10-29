import { Link, useLocation, useNavigate } from "react-router-dom";
import { Bell, Briefcase, LayoutDashboard, LogOut, MessageSquare, Wallet } from "lucide-react";
import { SiteMark } from "./SiteMark";
import { useSession } from "../session";

const links = [
  { to: "/dashboard", label: "Home", icon: LayoutDashboard },
  { to: "/jobs", label: "Jobs", icon: Briefcase },
  { to: "/chat", label: "Chat", icon: MessageSquare },
  { to: "/wallet", label: "Wallet", icon: Wallet },
  { to: "/notifications", label: "Alerts", icon: Bell },
];

export function AppShell({ children }) {
  const { user, signOut } = useSession();
  const navigate = useNavigate();
  const path = useLocation().pathname;

  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="sticky top-0 z-20 border-b border-line bg-cream/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <SiteMark />
          <nav className="hidden items-center gap-1 md:flex">
            {links.map(({ to, label, icon: Icon }) => {
              const active = path === to || (to !== "/dashboard" && path.startsWith(to));
              return (
                <Link
                  key={to}
                  to={to}
                  className={`inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-medium no-underline ${
                    active ? "bg-ink text-cream" : "text-muted hover:bg-paper hover:text-ink"
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-2">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium leading-tight">{user?.fullName}</p>
              <p className="text-xs capitalize text-muted">{user?.role}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                signOut();
                navigate("/");
              }}
              className="inline-flex min-h-11 items-center gap-1 rounded-full border border-line bg-cream px-3 text-sm text-ink"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto border-t border-line px-3 py-2 md:hidden">
          {links.map(({ to, label }) => {
            const active = path === to || (to !== "/dashboard" && path.startsWith(to));
            return (
              <Link key={to} to={to} className={`shrink-0 rounded-full px-3 py-2 text-sm font-medium no-underline ${active ? "bg-ink text-cream" : "text-muted"}`}>
                {label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
