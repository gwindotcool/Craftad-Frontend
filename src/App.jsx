import { Navigate, Route, Routes } from "react-router-dom";
import { RequireAuth } from "./components/RequireAuth";
import { SessionProvider } from "./session";
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
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Auth mode="login" />} />
        <Route path="/register" element={<Auth mode="register" />} />
        <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
        <Route path="/jobs" element={<RequireAuth><Jobs /></RequireAuth>} />
        <Route path="/jobs/new" element={<RequireAuth><NewJob /></RequireAuth>} />
        <Route path="/jobs/:jobId" element={<RequireAuth><JobDetail /></RequireAuth>} />
        <Route path="/chat" element={<RequireAuth><ChatInbox /></RequireAuth>} />
        <Route path="/chat/:jobId" element={<RequireAuth><Chat /></RequireAuth>} />
        <Route path="/wallet" element={<RequireAuth><WalletPage /></RequireAuth>} />
        <Route path="/notifications" element={<RequireAuth><Notifications /></RequireAuth>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </SessionProvider>
  );
}
