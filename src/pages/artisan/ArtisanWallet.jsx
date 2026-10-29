import { useEffect, useState } from "react";
import { C, fmtMoney } from "../../theme";
import { api } from "../../api";
import { Card, Spinner, Empty, Btn, Inp } from "../../components/ui";

export default function ArtisanWallet({ token }) {
    const [wallet, setWallet] = useState(null);
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(true);
    const [funding, setFunding] = useState(false);
    const [message, setMessage] = useState("");

    const loadWallet = async () => {
        try {
            setLoading(true);

            const res = await api.get(
                "/api/wallet/me",
                token
            );

            setWallet(res.wallet);

        } catch (error) {
            console.error(
                "Wallet error:",
                error.message
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadWallet();
    }, [token]);

    const fundWallet = async () => {
        if (!amount || Number(amount) <= 0) {
            setMessage("Enter a valid amount.");
            return;
        }

        try {
            setFunding(true);
            setMessage("");

            const res = await api.post(
                "/api/wallet/fund",
                {
                    amount: Number(amount)
                },
                token
            );

            setWallet(res.wallet);
            setAmount("");
            setMessage("Wallet funded successfully.");

        } catch (error) {
            setMessage(error.message);
        } finally {
            setFunding(false);
        }
    };

    if (loading) {
        return <Spinner />;
    }

    return (
        <div>
            <h2
                style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: C.text,
                    marginBottom: 22
                }}
            >
                Artisan Wallet
            </h2>

            <Card
                style={{
                    background: C.sidebar,
                    color: "#fff",
                    marginBottom: 20
                }}
            >
                <p
                    style={{
                        margin: 0,
                        opacity: 0.6,
                        fontSize: 13
                    }}
                >
                    Available Balance
                </p>

                <h1
                    style={{
                        margin: "8px 0 0",
                        fontSize: 34
                    }}
                >
                    {fmtMoney(wallet?.balance || 0)}
                </h1>
            </Card>

            <Card>
                <h3
                    style={{
                        marginTop: 0,
                        marginBottom: 16
                    }}
                >
                    Fund Wallet
                </h3>

                <Inp
                    label="Amount (₦)"
                    type="number"
                    placeholder="e.g. 10000"
                    value={amount}
                    onChange={(e) =>
                        setAmount(e.target.value)
                    }
                />

                <Btn
                    onClick={fundWallet}
                    disabled={
                        funding ||
                        !amount ||
                        Number(amount) <= 0
                    }
                >
                    {funding
                        ? "Funding..."
                        : "💰 Fund Wallet"}
                </Btn>

                {message && (
                    <p
                        style={{
                            marginTop: 12,
                            color: C.text,
                            fontSize: 14
                        }}
                    >
                        {message}
                    </p>
                )}
            </Card>
        </div>
    );
}