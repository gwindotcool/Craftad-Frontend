import { Navigate } from "react-router-dom";
import { AppShell } from "./AppShell";
import { useSession } from "../session";

export function RequireAuth({ children }) {
  const { token, ready } = useSession();
  if (!ready) {
    return <div className="grid min-h-screen place-items-center bg-paper text-muted">Opening your workspace…</div>;
  }
  if (!token) return <Navigate to="/login" replace />;
  return <AppShell>{children}</AppShell>;
}
