import { createContext, useContext, useState } from "react";

const AdminSessionContext = createContext(null);

const ADMIN_TOKEN_KEY = "craftad_admin_token";
const ADMIN_PROFILE_KEY = "craftad_admin_profile";

function loadAdminSession() {
    const token = localStorage.getItem(ADMIN_TOKEN_KEY);

    let admin = null;

    try {
        admin = JSON.parse(localStorage.getItem(ADMIN_PROFILE_KEY) || "null");
    } catch {
        admin = null;
    }

    if (!token || token === "undefined" || token === "null") {
        return { token: null, admin: null };
    }

    return { token, admin };
}

export function AdminSessionProvider({ children }) {
    const [session, setSession] = useState(loadAdminSession);

    function signIn(token, admin) {
        localStorage.setItem(ADMIN_TOKEN_KEY, token);
        localStorage.setItem(ADMIN_PROFILE_KEY, JSON.stringify(admin));

        setSession({ token, admin });
    }

    function signOut() {
        localStorage.removeItem(ADMIN_TOKEN_KEY);
        localStorage.removeItem(ADMIN_PROFILE_KEY);

        setSession({ token: null, admin: null });
    }

    return (
        <AdminSessionContext.Provider
            value={{
                token: session.token,
                admin: session.admin,
                signIn,
                signOut,
            }}
        >
            {children}
        </AdminSessionContext.Provider>
    );
}

export function useAdminSession() {
    const context = useContext(AdminSessionContext);

    if (!context) {
        throw new Error(
            "useAdminSession must be used inside AdminSessionProvider"
        );
    }

    return context;
}