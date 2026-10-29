import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { SiteMark } from "../components/SiteMark";
import { craftad } from "../api";
import { useSession } from "../session";

export function Auth({ mode }) {
  const navigate = useNavigate();
  const { signIn, token } = useSession();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("customer");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const field = "mt-1.5 w-full rounded-2xl border border-line bg-cream px-4 py-3 text-ink outline-none focus:border-copper";

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
      <div className="relative hidden lg:block">
        <img src="/photos/hero.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-ink/55" />
        <div className="relative flex h-full flex-col justify-between p-10 text-cream">
          <SiteMark light />
          <p className="font-display text-4xl leading-tight">The job, the chat, and the payment stay in one place.</p>
        </div>
      </div>
      <div className="flex flex-col justify-center px-6 py-10">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 lg:hidden"><SiteMark /></div>
          <h1 className="font-display text-4xl">{mode === "login" ? "Welcome back" : "Create your account"}</h1>
          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            {error && <p className="rounded-2xl border border-line bg-cream px-4 py-3 text-sm text-copper-deep">{error}</p>}
            {mode === "register" && (
              <>
                <label className="block text-sm font-medium">Full name<input required value={fullName} onChange={(e) => setFullName(e.target.value)} className={field} /></label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    ["customer", "Hire someone"],
                    ["artisan", "Find work"],
                  ].map(([value, label]) => (
                    <button key={value} type="button" onClick={() => setRole(value)} className={`min-h-12 rounded-2xl border px-3 text-sm font-medium ${role === value ? "border-ink bg-ink text-cream" : "border-line bg-cream"}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </>
            )}
            <label className="block text-sm font-medium">Email<input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={field} /></label>
            <label className="block text-sm font-medium">Password<input required minLength={6} type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={field} /></label>
            <button disabled={busy} className="min-h-12 w-full rounded-full bg-copper text-sm font-semibold text-cream disabled:opacity-60">
              {busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
            </button>
          </form>
          <p className="mt-6 text-sm text-muted">
            {mode === "login" ? <Link to="/register" className="font-medium text-ink">Create an account</Link> : <Link to="/login" className="font-medium text-ink">Sign in</Link>}
          </p>
        </div>
      </div>
    </div>
  );
}
