import { lazy, Suspense } from "react";
import { Toaster } from "react-hot-toast";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { LoaderCircle } from "lucide-react";

import { RequireAuth } from "./components/RequireAuth";
import { AppShell } from "./components/AppShell";
import { SessionProvider } from "./session";
import { SocketProvider } from "./socket";
import { AdminSessionProvider } from "./admin/AdminSession";
import { RequireAdmin } from "./admin/RequireAdmin";

// Eager public entry routes for instant first paint
import { Home } from "./pages/Home";
import { Auth } from "./pages/Auth";

// Lazy-loaded authenticated workspace pages (keeps entry bundle lean)
const Dashboard = lazy(() =>
    import("./pages/Dashboard").then((m) => ({ default: m.Dashboard }))
);
const Jobs = lazy(() =>
    import("./pages/Jobs").then((m) => ({ default: m.Jobs }))
);
const NewJob = lazy(() =>
    import("./pages/NewJob").then((m) => ({ default: m.NewJob }))
);
const JobDetail = lazy(() =>
    import("./pages/JobDetail").then((m) => ({ default: m.JobDetail }))
);
const ChatInbox = lazy(() =>
    import("./pages/ChatInbox").then((m) => ({ default: m.ChatInbox }))
);
const Chat = lazy(() =>
    import("./pages/Chat").then((m) => ({ default: m.Chat }))
);
const WalletPage = lazy(() =>
    import("./pages/WalletPage").then((m) => ({ default: m.WalletPage }))
);
const Notifications = lazy(() =>
    import("./pages/Notifications").then((m) => ({ default: m.Notifications }))
);

// Lazy-loaded Admin bundle so regular users never download admin code
const AdminLogin = lazy(() =>
    import("./admin/AdminLogin").then((m) => ({ default: m.AdminLogin }))
);
const AdminRegister = lazy(() =>
    import("./admin/AdminRegister").then((m) => ({ default: m.AdminRegister }))
);
const AdminLayout = lazy(() =>
    import("./admin/AdminLayout").then((m) => ({ default: m.AdminLayout }))
);
const AdminDashboard = lazy(() =>
    import("./admin/AdminDashboard").then((m) => ({ default: m.AdminDashboard }))
);
const AdminUsers = lazy(() =>
    import("./admin/AdminUsers").then((m) => ({ default: m.AdminUsers }))
);
const AdminTransactionsPage = lazy(() =>
    import("./admin/AdminTransactionsPage").then((m) => ({
        default: m.AdminTransactionsPage,
    }))
);
const AdminEscrowPage = lazy(() =>
    import("./admin/AdminEscrowPage").then((m) => ({
        default: m.AdminEscrowPage,
    }))
);

function RouteFallback({ fullScreen = false }) {
    return (
        <div
            className={`flex items-center justify-center gap-2.5 bg-paper text-sm text-muted ${
                fullScreen ? "min-h-screen" : "min-h-[50vh]"
            }`}
        >
            <LoaderCircle size={18} className="animate-spin text-copper" />
            <span>Loading Craftad...</span>
        </div>
    );
}

function ProtectedAppShell() {
    return (
        <RequireAuth>
            <AppShell>
                <Suspense fallback={<RouteFallback />}>
                    <Outlet />
                </Suspense>
            </AppShell>
        </RequireAuth>
    );
}

export default function App() {
    return (
        <SessionProvider>
            <SocketProvider>
                <AdminSessionProvider>
                    <div className="min-h-screen bg-paper text-ink transition-colors duration-200">
                        <Toaster
                            position="top-right"
                            toastOptions={{
                                duration: 3500,
                                style: {
                                    background: "var(--surface-raised)",
                                    color: "var(--text-primary)",
                                    border: "1px solid var(--border-default)",
                                    boxShadow: "var(--shadow-raised)",
                                    borderRadius: "0.875rem",
                                    fontSize: "0.875rem",
                                },
                                success: {
                                    iconTheme: {
                                        primary: "var(--status-success)",
                                        secondary: "var(--surface-raised)",
                                    },
                                },
                                error: {
                                    iconTheme: {
                                        primary: "var(--status-danger)",
                                        secondary: "var(--surface-raised)",
                                    },
                                },
                            }}
                        />

                        <Suspense fallback={<RouteFallback fullScreen />}>
                            <Routes>
                                {/* Public pages */}
                                <Route path="/" element={<Home />} />
                                <Route path="/login" element={<Auth mode="login" />} />
                                <Route path="/register" element={<Auth mode="register" />} />

                                {/* Persistent Authenticated App Shell */}
                                <Route element={<ProtectedAppShell />}>
                                    <Route path="/dashboard" element={<Dashboard />} />
                                    <Route path="/jobs" element={<Jobs />} />
                                    <Route path="/jobs/new" element={<NewJob />} />
                                    <Route path="/jobs/:jobId" element={<JobDetail />} />
                                    <Route path="/chat" element={<ChatInbox />} />
                                    <Route path="/chat/:applicationId" element={<Chat />} />
                                    <Route path="/wallet" element={<WalletPage />} />
                                    <Route path="/notifications" element={<Notifications />} />
                                </Route>

                                {/* Administrator routes */}
                                <Route path="/admin/login" element={<AdminLogin />} />
                                <Route
                                    path="/admin"
                                    element={
                                        <RequireAdmin>
                                            <AdminLayout />
                                        </RequireAdmin>
                                    }
                                >
                                    <Route
                                        index
                                        element={<Navigate to="/admin/dashboard" replace />}
                                    />
                                    <Route path="dashboard" element={<AdminDashboard />} />
                                    <Route path="users" element={<AdminUsers />} />
                                    <Route
                                        path="transactions"
                                        element={<AdminTransactionsPage />}
                                    />
                                    <Route path="escrows" element={<AdminEscrowPage />} />
                                    <Route path="register" element={<AdminRegister />} />
                                </Route>

                                {/* Fallback */}
                                <Route path="*" element={<Navigate to="/" replace />} />
                            </Routes>
                        </Suspense>
                    </div>
                </AdminSessionProvider>
            </SocketProvider>
        </SessionProvider>
    );
}