import { useState, useEffect } from "react";
import { C, extract, fmtMoney } from "../../theme";
import { api } from "../../api";
import { Btn, Inp, Card, Stat, Spinner, Toast } from "../../components/ui";

export default function AdminEarnings({ token }) {
    const [data, setData]       = useState(null);
    const [loading, setLoading] = useState(true);
    const [amount, setAmount]   = useState("");
    const [withdrawing, setWithdrawing] = useState(false);
    const [toast, setToast]     = useState(null);

    useEffect(() => {
        api.get("/api/payments/platform-earnings", token)
            .then((d) => setData(extract(d, "earnings", "data", d)))
            .catch((e) => console.error(e.message))
            .finally(() => setLoading(false));
    }, [token]);

    const withdraw = async () => {
        setWithdrawing(true);
        try {
            await api.post("/api/admin/withdraw", { amount: Number(amount) }, token);
            setToast({ msg: "Platform withdrawal submitted!", type: "success" });
            setAmount("");
        } catch (e) { setToast({ msg: e.message, type: "error" }); }
        finally { setWithdrawing(false); }
    };

    if (loading) return <Spinner />;
    return (
        <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 22 }}>Platform Earnings</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 22 }}>
                <Stat icon="💰" label="Total Earnings"    value={fmtMoney(data?.totalEarnings || 0)}                                               color={C.purple}  />
                <Stat icon="💸" label="Total Withdrawn"   value={fmtMoney(data?.totalWithdrawn || 0)}                                              color={C.danger}  />
                <Stat icon="🏦" label="Available Balance" value={fmtMoney(data?.availableBalance || (data?.totalEarnings - data?.totalWithdrawn) || 0)} color={C.success} />
            </div>
            <Card>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Withdraw Platform Earnings</h3>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
                    <div style={{ flex: 1 }}><Inp label="Amount (₦)" type="number" placeholder="Enter amount" value={amount} onChange={(e) => setAmount(e.target.value)} /></div>
                    <Btn onClick={withdraw} disabled={withdrawing || !amount} style={{ marginBottom: 14 }}>{withdrawing ? "Processing…" : "💸 Withdraw"}</Btn>
                </div>
            </Card>
            <Toast msg={toast?.msg} type={toast?.type} onClose={() => setToast(null)} />
        </div>
    );
}
