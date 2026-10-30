
import { Navigate, Route, Routes } from "react-router-dom";

import { RequireAuth } from "./components/RequireAuth";
import { SessionProvider } from "./session";

import { AdminSessionProvider } from "./admin/AdminSession";
import { AdminLogin } from "./admin/AdminLogin";
import { RequireAdmin } from "./admin/RequireAdmin";
import { AdminLayout } from "./admin/AdminLayout";
import { AdminDashboard } from "./admin/AdminDashboard";
import { AdminUsers } from "./admin/AdminUsers";

import { Auth } from "./pages/Auth";
import { Chat } from "./pages/Chat";
import { ChatInbox } from "./pages/ChatInbox";
import { Dashboard } from "./pages/Dashboard";
import { Home } from "./pages/Home";
import { JobDetail } from "./pages/JobDetail";
import { Jobs } from "./pages/Jobs";
import { NewJob } from "./pages/NewJob";
import { Notifications } from "./pages/Notifications";
import { WalletPage } from "./pages/WalletPage";

export default function App() {
    return (
        <SessionProvider>
            <AdminSessionProvider>
                <Routes>
                    {/* Public pages */}
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Auth mode="login" />} />
                    <Route path="/register" element={<Auth mode="register" />} />

                    {/* Customer and artisan pages */}
                    <Route
                        path="/dashboard"
                        element={
                            <RequireAuth>
                                <Dashboard />
                            </RequireAuth>
                        }
                    />

                    <Route
                        path="/jobs"
                        element={
                            <RequireAuth>
                                <Jobs />
                            </RequireAuth>
                        }
                    />

                    <Route
                        path="/jobs/new"
                        element={
                            <RequireAuth>
                                <NewJob />
                            </RequireAuth>
                        }
                    />

                    <Route
                        path="/jobs/:jobId"
                        element={
                            <RequireAuth>
                                <JobDetail />
                            </RequireAuth>
                        }
                    />

                    <Route
                        path="/chat"
                        element={
                            <RequireAuth>
                                <ChatInbox />
                            </RequireAuth>
                        }
                    />

                    <Route
                        path="/chat/:jobId"
                        element={
                            <RequireAuth>
                                <Chat />
                            </RequireAuth>
                        }
                    />

                    <Route
                        path="/wallet"
                        element={
                            <RequireAuth>
                                <WalletPage />
                            </RequireAuth>
                        }
                    />

                    <Route
                        path="/notifications"
                        element={
                            <RequireAuth>
                                <Notifications />
                            </RequireAuth>
                        }
                    />

                    {/* Administrator login */}
                    <Route path="/admin/login" element={<AdminLogin />} />

                    {/* Protected administrator pages */}
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
                    </Route>

                    {/* Unknown routes */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </AdminSessionProvider>
        </SessionProvider>
    );
}
