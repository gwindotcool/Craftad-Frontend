
import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { SiteMark } from "../components/SiteMark";
import { useAdminSession } from "./AdminSession";

const API_BASE = "https://craftad-lite-2.onrender.com";

export function AdminLogin() {
    const navigate = useNavigate();
    const { token, signIn } = useAdminSession();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);

    const field =
        "mt-1.5 w-full rounded-2xl border border-line bg-cream px-4 py-3 text-ink outline-none focus:border-copper";

    if (token) {
        return <Navigate to="/admin/dashboard" replace />;
    }

    async function onSubmit(e) {
        e.preventDefault();
        setError("");
        setBusy(true);

        try {
            const response = await fetch(`${API_BASE}/api/admin/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(data.message || "Administrator login failed");
            }

            if (!data.token || !data.admin) {
                throw new Error("The server did not return the administrator session");
            }

            signIn(data.token, data.admin);
            navigate("/admin/dashboard", { replace: true });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Could not sign in");
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="grid min-h-screen bg-paper lg:grid-cols-2">
            <div className="relative hidden lg:block">
                <img
                    src="/photos/hero.jpg"
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-ink/65" />

                <div className="relative flex h-full flex-col justify-between p-10 text-cream">
                    <SiteMark light />

                    <div>
                        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-cream/75">
                            Craftad Administration
                        </p>
                        <h1 className="max-w-lg font-display text-5xl leading-tight">
                            Keep the marketplace trustworthy.
                        </h1>
                        <p className="mt-5 max-w-md text-cream/80">
                            Manage platform users and help maintain a reliable community of
                            customers and artisans.
                        </p>
                    </div>

                    <p className="text-xs text-cream/70">
                        Restricted access · Authorized administrators only
                    </p>
                </div>
            </div>

            <div className="flex flex-col justify-center px-6 py-10">
                <div className="mx-auto w-full max-w-md">
                    <div className="mb-8 lg:hidden">
                        <SiteMark />
                    </div>

                    <p className="mb-3 text-sm font-semibold uppercase tracking-[0.15em] text-copper">
                        Administrator portal
                    </p>

                    <h1 className="font-display text-4xl">
                        Admin sign in
                    </h1>

                    <p className="mt-3 text-sm text-muted">
                        Sign in with your authorized Craftad administrator account.
                    </p>

                    <form onSubmit={onSubmit} className="mt-8 space-y-5">
                        {error && (
                            <p
                                role="alert"
                                className="rounded-2xl border border-line bg-cream px-4 py-3 text-sm text-copper-deep"
                            >
                                {error}
                            </p>
                        )}

                        <label className="block text-sm font-medium">
                            Administrator email
                            <input
                                required
                                type="email"
                                autoComplete="username"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={field}
                                placeholder="admin@example.com"
                            />
                        </label>

                        <label className="block text-sm font-medium">
                            Password
                            <input
                                required
                                type="password"
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={field}
                                placeholder="Enter your password"
                            />
                        </label>

                        <button
                            disabled={busy}
                            className="min-h-12 w-full rounded-full bg-copper text-sm font-semibold text-cream disabled:opacity-60"
                        >
                            {busy ? "Signing in…" : "Sign in to admin"}
                        </button>
                    </form>

                    <p className="mt-7 text-sm text-muted">
                        Not an administrator?{" "}
                        <Link to="/" className="font-medium text-ink underline">
                            Return to Craftad
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
