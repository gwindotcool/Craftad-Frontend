import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import {
    ArrowRight,
    Briefcase,
    Eye,
    EyeOff,
    Hammer,
    ShieldCheck,
} from "lucide-react";
import { SiteMark } from "../components/SiteMark";
import { craftad } from "../api";
import { useSession } from "../session";
import { FloatingThemeToggle } from "../components/FloatingThemeToggle";

const ROLE_OPTIONS = [
    {
        value: "customer",
        label: "Hire an artisan",
        hint: "Post jobs & pay via escrow",
        icon: Briefcase,
    },
    {
        value: "artisan",
        label: "Find work",
        hint: "Bid on jobs & get paid safely",
        icon: Hammer,
    },
];

export function Auth({ mode }) {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { signIn, token } = useSession();

    const queryRole = searchParams.get("role");
    const initialRole =
        queryRole === "artisan" || queryRole === "customer" ? queryRole : "customer";

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [role, setRole] = useState(initialRole);
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);

    // Sync role if user navigates between /register?role=customer and /register?role=artisan
    useEffect(() => {
        if (queryRole === "artisan" || queryRole === "customer") {
            setRole(queryRole);
        }
    }, [queryRole]);

    // Clear stale error messages when switching between login and register
    useEffect(() => {
        setError("");
    }, [mode]);

    const field =
        "mt-2 w-full rounded-2xl border border-line bg-cream px-4 py-3.5 text-sm text-ink outline-none transition placeholder:text-muted/70 focus:border-copper focus:ring-2 focus:ring-copper/15";

    if (token) return <Navigate to="/dashboard" replace />;

    async function onSubmit(e) {
        e.preventDefault();
        setError("");
        setBusy(true);

        try {
            if (mode === "register") {
                await craftad.register({
                    fullName: fullName.trim(),
                    email: email.trim(),
                    password,
                    role,
                });
            }

            const data = await craftad.login({ email: email.trim(), password });
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
            {/* Left Hero Photo & Branding Side (explicit dark palette so dark-mode tokens don't invert it) */}
            <div className="relative hidden overflow-hidden bg-[#141311] lg:block">
                <img
                    src="/photos/hero.jpg"
                    alt="Craftad workspace"
                    className="absolute inset-0 h-full w-full object-cover opacity-55"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141311] via-[#141311]/45 to-transparent" />

                <div className="relative flex h-full flex-col justify-between p-12 text-[#FAF6EF]">
                    <div className="w-fit">
                        <SiteMark light />
                    </div>

                    <div className="max-w-lg space-y-4">
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#E07A4F] backdrop-blur-md">
                            <ShieldCheck size={14} />
                            Escrow-Protected Workspace
                        </div>
                        <p className="font-display text-4xl font-semibold leading-tight sm:text-5xl">
                            The job, the chat, and the payment stay in one place.
                        </p>
                        <p className="text-sm leading-relaxed text-[#FAF6EF]/75">
                            Connect directly with verified artisans and customers through a unified escrow ecosystem.
                        </p>
                    </div>

                    <div className="text-xs text-[#FAF6EF]/55">
                        © {new Date().getFullYear()} Craftad Marketplace. All rights reserved.
                    </div>
                </div>
            </div>

            {/* Right Form Container Side */}
            <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16">
                <div className="mx-auto w-full max-w-md space-y-6">
                    <div className="mb-2 lg:hidden">
                        <SiteMark />
                    </div>

                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-copper">
                            {mode === "login" ? "Welcome Back" : "Get Started"}
                        </p>
                        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                            {mode === "login" ? "Sign in to Craftad" : "Create your account"}
                        </h1>
                        <p className="mt-1.5 text-sm text-muted">
                            {mode === "login"
                                ? "Enter your credentials to access your workspace."
                                : "Choose how you want to use Craftad and get started in under a minute."}
                        </p>
                    </div>

                    <form onSubmit={onSubmit} className="space-y-4 pt-1">
                        {error && (
                            <div
                                role="alert"
                                className="rounded-2xl border border-danger/30 bg-danger-soft px-4 py-3.5 text-sm font-medium text-danger"
                            >
                                {error}
                            </div>
                        )}

                        {mode === "register" && (
                            <>
                                <div>
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted">
                    I want to
                  </span>
                                    <div className="grid grid-cols-2 gap-3">
                                        {ROLE_OPTIONS.map((option) => {
                                            const Icon = option.icon;
                                            const selected = role === option.value;
                                            return (
                                                <button
                                                    key={option.value}
                                                    type="button"
                                                    aria-pressed={selected}
                                                    onClick={() => setRole(option.value)}
                                                    className={`flex flex-col items-start rounded-2xl border p-3.5 text-left transition-all ${
                                                        selected
                                                            ? "border-copper bg-copper/10 text-ink ring-2 ring-copper/20"
                                                            : "border-line bg-cream text-muted hover:border-copper/50 hover:text-ink"
                                                    }`}
                                                >
                                                    <div
                                                        className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                                                            selected
                                                                ? "bg-copper text-white"
                                                                : "bg-paper text-muted"
                                                        }`}
                                                    >
                                                        <Icon size={15} />
                                                    </div>
                                                    <span className="mt-2.5 text-xs font-semibold text-ink">
                            {option.label}
                          </span>
                                                    <span className="mt-0.5 text-[11px] leading-snug text-muted">
                            {option.hint}
                          </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <label className="block text-xs font-semibold text-ink">
                                    Full name
                                    <input
                                        required
                                        autoComplete="name"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="e.g. Godwin Ukpabi"
                                        className={field}
                                    />
                                </label>
                            </>
                        )}

                        <label className="block text-xs font-semibold text-ink">
                            Email address
                            <input
                                required
                                type="email"
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                className={field}
                            />
                        </label>

                        <div className="block">
                            <label
                                htmlFor="auth-password"
                                className="block text-xs font-semibold text-ink"
                            >
                                Password
                            </label>
                            <div className="relative mt-2">
                                <input
                                    id="auth-password"
                                    required
                                    minLength={6}
                                    type={showPassword ? "text" : "password"}
                                    autoComplete={
                                        mode === "login" ? "current-password" : "new-password"
                                    }
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="•••••••• (min 6 characters)"
                                    className="w-full rounded-2xl border border-line bg-cream py-3.5 pl-4 pr-11 text-sm text-ink outline-none transition placeholder:text-muted/70 focus:border-copper focus:ring-2 focus:ring-copper/15"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-muted transition hover:text-ink"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={busy}
                                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-copper px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-copper-deep disabled:cursor-not-allowed disabled:opacity-60"
                            >
                <span>
                  {busy
                      ? "Please wait..."
                      : mode === "login"
                          ? "Sign in to workspace"
                          : `Create ${role} account`}
                </span>
                                {!busy && <ArrowRight size={16} />}
                            </button>
                        </div>
                    </form>

                    <div className="border-t border-line pt-4 text-center sm:text-left">
                        <p className="text-sm text-muted">
                            {mode === "login" ? (
                                <>
                                    Don&apos;t have an account yet?{" "}
                                    <Link
                                        to="/register"
                                        className="font-semibold text-ink transition-colors hover:text-copper"
                                    >
                                        Create an account
                                    </Link>
                                </>
                            ) : (
                                <>
                                    Already have an account?{" "}
                                    <Link
                                        to="/login"
                                        className="font-semibold text-ink transition-colors hover:text-copper"
                                    >
                                        Sign in here
                                    </Link>
                                </>
                            )}
                        </p>
                    </div>
                </div>
            </div>

            <FloatingThemeToggle />
        </div>
    );
}