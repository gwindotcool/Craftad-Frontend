import { useState } from "react";
import { api } from "../../api";
import { Btn, Inp, Sel, ErrBox } from "../ui";

export default function RegisterForm({ onAuth }) {
    const [f, setF] = useState({
        fullName: "",
        phone: "",
        email: "",
        password: "",
        role: "customer",
    });

    const [err, setErr] = useState("");
    const [loading, setLoading] = useState(false);

    const upd = (key) => (e) => {
        setF((prev) => ({
            ...prev,
            [key]: e.target.value,
        }));
    };

    const submit = async () => {
        if (!f.fullName || !f.phone || !f.email || !f.password) {
            setErr("All fields are required");
            return;
        }

        try {
            setLoading(true);
            setErr("");

            await api.post("/api/auth/register", f);

            const res = await api.post("/api/auth/login", {
                email: f.email,
                password: f.password,
            });

            if (!res.token || !res.user) {
                throw new Error("Invalid authentication response from server");
            }

            onAuth(res.token, res.user);
        } catch (e) {
            setErr(e.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Inp
                label="Full Name"
                value={f.fullName}
                onChange={upd("fullName")}
            />

            <Inp
                label="Phone"
                value={f.phone}
                onChange={upd("phone")}
            />

            <Sel
                label="Account Type"
                value={f.role}
                onChange={upd("role")}
            >
                <option value="customer">Hire Artisan</option>
                <option value="artisan">Provide Services</option>
            </Sel>

            <Inp
                label="Email"
                type="email"
                value={f.email}
                onChange={upd("email")}
            />

            <Inp
                label="Password"
                type="password"
                value={f.password}
                onChange={upd("password")}
            />

            <ErrBox msg={err} />

            <Btn full disabled={loading} onClick={submit}>
                {loading ? "Creating account..." : "Create Account →"}
            </Btn>
        </>
    );
}