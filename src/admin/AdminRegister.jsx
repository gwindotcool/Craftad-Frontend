import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SiteMark } from "../components/SiteMark";
import { useAdminSession } from "./AdminSession";

const API_BASE = "https://craftad-lite-2.onrender.com";

export function AdminRegister() {
    const navigate = useNavigate();
    const { token } = useAdminSession();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("admin");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [busy, setBusy] = useState(false);

    const field =
        "mt-1.5 w-full rounded-2xl border border-line bg-cream px-4 py-3 text-ink outline-none focus:border-copper";

    async function onSubmit(e) {
        e.preventDefault();
        setError("");
        setSuccess("");
        setBusy(true);

        try {
            const headers = {
                "Content-Type": "application/json",
            };

            // If an admin token exists, attach it for authorized registration
            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
            }

            const response = await fetch(`${API_BASE}/api/admin/auth/register`, {
                method: "POST",
                headers,
                body: JSON.stringify({ name, email, password, role }),
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(data.message || "Failed to register administrator account");
            }

            setSuccess(`Administrator ${name} (${role}) created successfully!`);
            setName("");
            setEmail("");
            setPassword("");
            setRole("admin");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Could not register administrator");
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
                            Expand your moderation team.
                        </h1>
                        <p className="mt-5 max-w-md text-cream/80">
                            Provision elevated administrative access securely across your platform management infrastructure.
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
                        Team management
                    </p>

                    <h1 className="font-display text-4xl">
                        Register administrator
                    </h1>

                    <p className="mt-3 text-sm text-muted">
                        Create a new admin or super admin account.
                    </p>

                    <form onSubmit={onSubmit} className="mt-8 space-y-5">
                        {error && (
                            <p
                                role="alert"
                                className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-800"
                            >
                                {error}
                            </p>
                        )}

                        {success && (
                            <p
                                role="status"
                                className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-800"
                            >
                                {success}
                            </p>
                        )}

                        <label className="block text-sm font-medium">
                            Full name
                            <input
                                required
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className={field}
                                placeholder="Jane Doe"
                            />
                        </label>

                        <label className="block text-sm font-medium">
                            Administrator email
                            <input
                                required
                                type="email"
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={field}
                                placeholder="admin@craftad.ng"
                            />
                        </label>

                        <label className="block text-sm font-medium">
                            Password
                            <input
                                required
                                type="password"
                                autoComplete="new-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={field}
                                placeholder="Create a secure password"
                            />
                        </label>

                        <label className="block text-sm font-medium">
                            Privilege role
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className={field}
                            >
                                <option value="admin">Admin (Moderation)</option>
                                <option value="super_admin">Super Admin (Full Access)</option>
                            </select>
                        </label>

                        <button
                            disabled={busy}
                            className="min-h-12 w-full rounded-full bg-copper text-sm font-semibold text-cream transition hover:bg-copper-deep disabled:opacity-60 shadow-sm"
                        >
                            {busy ? "Registering account..." : "Create administrator"}
                        </button>
                    </form>

                    <div className="mt-7 flex items-center justify-between text-sm">
                        <Link to="/admin/dashboard" className="font-medium text-ink underline">
                            ← Return to Dashboard
                        </Link>
                        <Link to="/admin/login" className="text-muted hover:text-ink">
                            Sign in page
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}