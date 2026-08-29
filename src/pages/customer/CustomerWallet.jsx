import { useState, useEffect } from "react";
import { C, fmtMoney, fmtDate } from "../../theme";
import { api } from "../../api";
import { Card, Badge, Spinner, Empty } from "../../components/ui";

export default function CustomerWallet({ token }) {
    const [wallet, setWallet] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadWallet = async () => {
            try {
                setLoading(true);

                const [walletRes, transactionRes] = await Promise.all([
                    api.get("/api/wallet/me", token),
                    api.get("/api/transactions/my", token)
                ]);

                setWallet(walletRes.wallet);
                setTransactions(transactionRes.transactions || []);
            } catch (error) {
                console.error("Wallet:", error.message);
            } finally {
                setLoading(false);
            }
        };

        loadWallet();
    }, [token]);

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
                Wallet
            </h2>

            <Card
                style={{
                    background: `linear-gradient(135deg, ${C.sidebar}, #1A3347)`,
                    marginBottom: 22
                }}
            >
                <div
                    style={{
                        color: "rgba(255,255,255,0.5)",
                        fontSize: 13,
                        marginBottom: 8
                    }}
                >
                    Available Balance
                </div>

                <div
                    style={{
                        color: "#fff",
                        fontSize: 34,
                        fontWeight: 800
                    }}
                >
                    {fmtMoney(wallet?.balance || 0)}
                </div>
            </Card>

            <h3
                style={{
                    fontSize: 16,
                    fontWeight: 700,
                    marginBottom: 14,
                    color: C.text
                }}
            >
                Transaction History
            </h3>

            {transactions.length === 0 ? (
                <Empty
                    msg="No transactions yet"
                    icon="💳"
                />
            ) : (
                transactions.map((transaction) => (
                    <div
                        key={transaction._id}
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "12px 0",
                            borderBottom: `1px solid ${C.border}`
                        }}
                    >
                        <div>
                            <div
                                style={{
                                    fontWeight: 600,
                                    fontSize: 14
                                }}
                            >
                                {transaction.description ||
                                    transaction.type}
                            </div>

                            <div
                                style={{
                                    fontSize: 12,
                                    color: C.muted,
                                    marginTop: 2
                                }}
                            >
                                {fmtDate(transaction.createdAt)}
                            </div>
                        </div>

                        <div style={{ textAlign: "right" }}>
                            <div
                                style={{
                                    fontWeight: 700,
                                    color: C.accent
                                }}
                            >
                                {fmtMoney(transaction.amount)}
                            </div>

                            <Badge status={transaction.status} />
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}