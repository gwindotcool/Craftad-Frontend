import { createContext, useContext, useState } from "react";
import { clearSession, loadSession, saveSession } from "./api";

const SessionContext = createContext(null);

export function SessionProvider({ children }) {
  const saved = typeof window === "undefined" ? { token: null, user: null } : loadSession();
  const [token, setToken] = useState(saved.token);
  const [user, setUser] = useState(saved.user);
  const [ready, setReady] = useState(true);

  const value = {
    token,
    user,
    ready,
    signIn(nextToken, nextUser) {
      saveSession(nextToken, nextUser);
      setToken(nextToken);
      setUser(nextUser);
    },
    signOut() {
      clearSession();
      setToken(null);
      setUser(null);
    },
  };

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const value = useContext(SessionContext);
  if (!value) throw new Error("useSession must be used inside SessionProvider");
  return value;
}
