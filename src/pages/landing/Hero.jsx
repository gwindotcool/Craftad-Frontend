import { C } from "../../theme";
import { Btn } from "../../components/ui";

export default function Hero({ onLogin }) {
    return (
        <section
            style={{
                minHeight: "100vh",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 70,
                padding: "80px 8%",
                background:
                    "linear-gradient(135deg,#0F172A 0%,#1E3A8A 60%,#0EA5E9 100%)",
                color: "#fff",
                overflow: "hidden",
                position: "relative"
            }}
        >
            {/* LEFT */}
            <div
                style={{
                    flex: 1,
                    minWidth: 340,
                    maxWidth: 650
                }}
            >
                <div
                    style={{
                        display: "inline-block",
                        padding: "8px 18px",
                        background: "rgba(255,255,255,.12)",
                        border: "1px solid rgba(255,255,255,.15)",
                        borderRadius: 50,
                        fontSize: 14,
                        marginBottom: 25
                    }}
                >
                    ⭐ Trusted by Thousands of Customers
                </div>

                <h1
                    style={{
                        fontSize: 60,
                        lineHeight: 1.1,
                        fontWeight: 900,
                        marginBottom: 25
                    }}
                >
                    Hire Trusted
                    <br />
                    Artisans Near You
                </h1>

                <p
                    style={{
                        fontSize: 19,
                        lineHeight: 1.8,
                        opacity: .9,
                        maxWidth: 560
                    }}
                >
                    Connect with verified plumbers, eectricians,
                    mechanics, painters, cleaners, technicians and
                    skilled professionals around your location.
                    Post your job in minutes and receive offers from
                    trusted artisans nearby.
                </p>

                {/* Features */}
                <div
                    style={{
                        marginTop: 30,
                        display: "grid",
                        gap: 12,
                        fontSize: 16
                    }}
                >
                    <div>✔ Verified Professionals</div>
                    <div>✔ Secure Escrow Payments</div>
                    <div>✔ Fast Response Time</div>
                    <div>✔ Reviews & Ratings</div>
                </div>

                {/* Buttons */}
                <div
                    style={{
                        display: "flex",
                        gap: 20,
                        marginTop: 40,
                        flexWrap: "wrap"
                    }}
                >
                    <Btn onClick={onLogin}>
                        🚀 Hire an Artisan
                    </Btn>

                    <button
                        style={{
                            padding: "14px 28px",
                            borderRadius: 12,
                            border: "1px solid rgba(255,255,255,.4)",
                            background: "transparent",
                            color: "#fff",
                            fontWeight: 600,
                            cursor: "pointer"
                        }}
                    >
                        👷 Become an Artisan
                    </button>
                </div>

                {/* Stats */}
                <div
                    style={{
                        display: "flex",
                        gap: 40,
                        marginTop: 60,
                        flexWrap: "wrap"
                    }}
                >
                    <div>
                        <h2 style={{ margin: 0, fontSize: 34 }}>500+</h2>
                        <small>Verified Artisans</small>
                    </div>

                    <div>
                        <h2 style={{ margin: 0, fontSize: 34 }}>2,000+</h2>
                        <small>Jobs Completed</small>
                    </div>

                    <div>
                        <h2 style={{ margin: 0, fontSize: 34 }}>4.9★</h2>
                        <small>Customer Rating</small>
                    </div>
                </div>
            </div>

            {/* RIGHT */}
            <div
                style={{
                    flex: 1,
                    minWidth: 340,
                    display: "flex",
                    justifyContent: "center",
                    position: "relative"
                }}
            >
                {/* Floating Card */}
                <div
                    style={{
                        position: "absolute",
                        top: 40,
                        left: 20,
                        background: "#fff",
                        color: "#111",
                        padding: "15px 20px",
                        borderRadius: 16,
                        boxShadow: "0 20px 40px rgba(0,0,0,.25)",
                        zIndex: 2
                    }}
                >
                    <div style={{ fontWeight: 700 }}>
                        ⭐ 4.9 Rating
                    </div>

                    <small>
                        Trusted Professionals
                    </small>
                </div>

                {/* Hero Card */}
                <div
                    style={{
                        width: 460,
                        height: 460,
                        borderRadius: 35,
                        background:
                            "rgba(255,255,255,.08)",
                        backdropFilter: "blur(10px)",
                        border:
                            "1px solid rgba(255,255,255,.12)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        boxShadow:
                            "0 25px 60px rgba(0,0,0,.35)"
                    }}
                >
                    <img
                        src="/images/hero-artisan.jpeg"
                        alt="Craftad Hero"
                        style={{
                            width: "100%",
                            maxWidth: 500,
                            objectFit: "contain"
                        }}
                    />
                </div>

                {/* Floating Card */}
                <div
                    style={{
                        position: "absolute",
                        bottom: 30,
                        right: 20,
                        background: "#fff",
                        color: "#111",
                        padding: "15px 20px",
                        borderRadius: 16,
                        boxShadow: "0 20px 40px rgba(0,0,0,.25)"
                    }}
                >
                    <div
                        style={{
                            fontWeight: 700
                        }}
                    >
                        💼 2,000+ Jobs
                    </div>

                    <small>
                        Successfully Completed
                    </small>
                </div>
            </div>
        </section>
    );
}