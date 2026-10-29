import { C } from "../../theme";
import { Btn } from "../../components/ui";

export default function Navbar({ onLogin }) {
    return (
        <header
            style={{
                position: "sticky",
                top: 0,
                zIndex: 1000,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "18px 8%",
                background: "#0F172A",
                borderBottom: "1px solid rgba(255,255,255,.08)",
                backdropFilter: "blur(12px)"
            }}
        >
            {/* Logo */}
            <a
                href="#home"
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    textDecoration: "none"
                }}
            >
                <div
                    style={{
                        width: 42,
                        height: 42,
                        borderRadius: 12,
                        background: C.accent,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        fontSize: 22
                    }}
                >
                    🛠️
                </div>

                <div>
                    <h2
                        style={{
                            color: "#fff",
                            margin: 0,
                            fontWeight: 800
                        }}
                    >
                        Craftad
                    </h2>

                    <small
                        style={{
                            color: "rgba(255,255,255,.6)"
                        }}
                    >
                        Trusted Handymen
                    </small>
                </div>
            </a>

            {/* Navigation */}
            <nav
                style={{
                    display: "flex",
                    gap: 35
                }}
            >
                <a href="#home" style={linkStyle}>Home</a>
                <a href="#services" style={linkStyle}>Services</a>
                <a href="#about" style={linkStyle}>About</a>
                <a href="#how" style={linkStyle}>How It Works</a>
                <a href="#contact" style={linkStyle}>Contact</a>
            </nav>

            {/* Buttons */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 15
                }}
            >
                <button
                    onClick={onLogin}
                    style={{
                        background: "transparent",
                        border: "none",
                        color: "#fff",
                        fontWeight: 600,
                        cursor: "pointer",
                        fontSize: 15
                    }}
                >
                    Login
                </button>

                <Btn onClick={onLogin}>
                    Get Started
                </Btn>
            </div>
        </header>
    );
}

const linkStyle = {
    color: "#fff",
    textDecoration: "none",
    fontWeight: 600,
    fontSize: 15,
    transition: "0.3s",
    opacity: 0.9
};