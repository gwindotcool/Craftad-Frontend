import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { SiteMark } from "../components/SiteMark";
import { craftad } from "../api";
import { useSession } from "../session";
import { ArrowRight, Lock, Mail, User, ShieldCheck } from "lucide-react";

export function Auth({ mode }) {
    const navigate = useNavigate();
    const { signIn, token } = useSession();
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("customer");
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);

    const field = "mt-2 w-full rounded-2xl border border-line bg-paper px-4 py-3.5 text-sm text-ink outline-none transition focus:border-copper focus:ring-2 focus:ring-copper/10 shadow-sm";

    if (token) return <Navigate to="/dashboard" replace />;

    async function onSubmit(e) {
        e.preventDefault();
        setError("");
        setBusy(true);
        try {
            if (mode === "register") await craftad.register({ fullName, email, password, role });
            const data = await craftad.login({ email, password });
            const nextToken = data.token;
            if (!nextToken) throw new Error("Login did not return a token");
            const nextUser = data.user ?? (await craftad.profile(nextToken)).user;
            if (!nextUser) throw new Error("Login did not return your account");
            signIn(nextToken, nextUser);
            navigate("/dashboard");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Could not continue");
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="grid min-h-screen bg-paper lg:grid-cols-2">

            {/* Left Hero Photo & Branding Side */}
            <div className="relative hidden lg:block overflow-hidden bg-ink">
                <img src="/photos/hero.jpg" alt="Craftad workspace" className="absolute inset-0 h-full w-full object-cover opacity-60" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />

                <div className="relative flex h-full flex-col justify-between p-12 text-cream">
                    <Link to="/" className="w-fit transition-opacity hover:opacity-80">
                        <SiteMark light />
                    </Link>

                    <div className="space-y-4 max-w-lg">
                        <div className="inline-flex items-center gap-2 rounded-full bg-cream/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-copper backdrop-blur-md border border-cream/10">
                            <ShieldCheck size={14} /> Secure Workspace
                        </div>
                        <p className="font-display text-4xl leading-tight sm:text-5xl">
                            The job, the chat, and the payment stay in one place.
                        </p>
                        <p className="text-sm text-cream/75 leading-relaxed">
                            Connect directly with verified artisans and customers through a unified escrow ecosystem.
                        </p>
                    </div>

                    <div className="text-xs text-cream/60">
                        © Craftad Marketplace. All rights reserved.
                    </div>
                </div>
            </div>

            {/* Right Form Container Side */}
            <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16">
                <div className="mx-auto w-full max-w-md space-y-6">

                    <div className="mb-2 lg:hidden">
                        <Link to="/" className="inline-block">
                            <SiteMark />
                        </Link>
                    </div>

                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-copper">
                            {mode === "login" ? "WELCOME BACK" : "GET STARTED"}
                        </p>
                        <h1 className="mt-1 font-display text-3xl tracking-tight sm:text-4xl text-ink">
                            {mode === "login" ? "Sign in to Craftad" : "Create your account"}
                        </h1>
                        <p className="mt-1 text-sm text-muted">
                            {mode === "login" ? "Enter your credentials to access your dashboard." : "Choose your account type and join our marketplace."}
                        </p>
                    </div>

                    <form onSubmit={onSubmit} className="space-y-4 pt-2">

                        {error && (
                            <div className="rounded-2xl border border-copper/30 bg-copper/5 px-5 py-4 text-sm text-copper-deep shadow-sm">
                                {error}
                            </div>
                        )}

                        {mode === "register" && (
                            <>
                                <label className="block text-sm font-semibold text-ink">
                                    Full name
                                    <input
                                        required
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="e.g. Godwin Ukpabi"
                                        className={field}
                                    />
                                </label>

                                <div>
                                    <label className="block text-sm font-semibold text-ink mb-2">I want to:</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            ["customer", "Hire someone"],
                                            ["artisan", "Find work"],
                                        ].map(([value, label]) => (
                                            <button
                                                key={value}
                                                type="button"
                                                onClick={() => setRole(value)}
                                                className={`min-h-12 rounded-2xl border px-3 text-xs font-semibold uppercase tracking-wider transition-all ${
                                                    role === value
                                                        ? "border-ink bg-ink text-cream shadow-md"
                                                        : "border-line bg-cream text-muted hover:border-copper hover:text-ink"
                                                }`}
                                            >
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        <label className="block text-sm font-semibold text-ink">
                            Email address
                            <input
                                required
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                className={field}
                            />
                        </label>

                        <label className="block text-sm font-semibold text-ink">
                            Password
                            <input
                                required
                                minLength={6}
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="•••••••• (min 6 characters)"
                                className={field}
                            />
                        </label>

                        <div className="pt-2">
                            <button
                                disabled={busy}
                                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-copper text-sm font-semibold text-cream shadow-md transition-all hover:bg-copper-deep disabled:opacity-60"
                            >
                                <span>{busy ? "Please wait..." : mode === "login" ? "Sign in to workspace" : "Create account"}</span>
                                {!busy && <ArrowRight size={16} />}
                            </button>
                        </div>
                    </form>

                    <div className="pt-4 border-t border-line text-center sm:text-left">
                        <p className="text-sm text-muted">
                            {mode === "login" ? (
                                <>
                                    Don't have an account yet?{" "}
                                    <Link to="/register" className="font-semibold text-ink hover:text-copper transition-colors">
                                        Create an account
                                    </Link>
                                </>
                            ) : (
                                <>
                                    Already have an account?{" "}
                                    <Link to="/login" className="font-semibold text-ink hover:text-copper transition-colors">
                                        Sign in here
                                    </Link>
                                </>
                            )}
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
}