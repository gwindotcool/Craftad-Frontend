import { Navigate } from "react-router-dom";
import { useAdminSession } from "./AdminSession";

export function RequireAdmin({ children }) {
    const { token } = useAdminSession();

    if (!token) {
        return <Navigate to="/admin/login" replace />;
    }

    return children;
}