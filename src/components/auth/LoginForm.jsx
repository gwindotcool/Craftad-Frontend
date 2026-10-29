import { useState } from "react";
import { api } from "../../api";
import { Btn, Inp, ErrBox } from "../ui";

export default function LoginForm({ onAuth }) {
    const [f, setF] = useState({
        email: "",
        password: "",
    });

    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");

    const upd = (key) => (e) => {
        setF((prev) => ({
            ...prev,
            [key]: e.target.value,
        }));
    };

    const submit = async () => {
        if (!f.email || !f.password) {
            setErr("Email and password are required");
            return;
        }

        try {
            setLoading(true);
            setErr("");

            const res = await api.post("/api/auth/login", f);

            if (!res.token || !res.user) {
                throw new Error("Invalid login response from server");
            }

            onAuth(res.token, res.user);
        } catch (e) {
            setErr(e.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Inp
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={f.email}
                onChange={upd("email")}
            />

            <Inp
                label="Password"
                type="password"
                placeholder="Password"
                value={f.password}
                onChange={upd("password")}
            />

            <ErrBox msg={err} />

            <Btn full disabled={loading} onClick={submit}>
                {loading ? "Signing in..." : "Sign In →"}
            </Btn>
        </>
    );
}