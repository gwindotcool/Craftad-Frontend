import { useEffect, useState } from "react";
import { Wallet, ArrowDownRight, ArrowUpRight, Building2, CheckCircle2 } from "lucide-react";
import { craftad } from "../api";
import { useSession } from "../session";

export function WalletPage() {
    const { token, user } = useSession();
    const [balance, setBalance] = useState(null);
    const [txs, setTxs] = useState([]);
    const [amount, setAmount] = useState("");
    const [accountNumber, setAccountNumber] = useState("");
    const [bankCode, setBankCode] = useState("");
    const [accountName, setAccountName] = useState("");
    const [note, setNote] = useState("");
    const [error, setError] = useState("");
    const [loadingAction, setLoadingAction] = useState("");

    async function load() {
        const wallet = await craftad.wallet(token);
        setBalance(wallet.wallet?.balance ?? 0);
        const history = await craftad.transactions(token).catch(() => craftad.myTransactions(token).catch(() => ({ transactions: [] })));
        setTxs(history.transactions || []);
    }

    useEffect(() => {
        if (!token) return;
        load().catch((err) => setError(err.message));
    }, [token]);

    async function act(kind) {
        setError("");
        setNote("");
        setLoadingAction(kind);

        const value = Number(amount);
        if (!value || value <= 0) {
            setError("Please enter a valid amount in Naira.");
            setLoadingAction("");
            return;
        }

        try {
            if (kind === "fund") {
                const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
                if (!publicKey) {
                    throw new Error("Paystack public key is missing from environment variables.");
                }

                if (!window.PaystackPop) {
                    throw new Error("Paystack SDK failed to load. Please check your internet connection or script tag.");
                }

                const handler = window.PaystackPop.setup({
                    key: publicKey,
                    email: user?.email || "customer@craftad.ng",
                    amount: value * 100, // Convert Naira to Kobo
                    currency: "NGN",
                    metadata: {
                        userId: user?._id || user?.id,
                        custom_fields: [
                            {
                                display_name: "Wallet Funding",
                                variable_name: "wallet_funding",
                                value: value
                            }
                        ]
                    },
                    onClose: function() {
                        setLoadingAction("");
                        setNote("Payment modal closed.");
                    },
                    callback: function(response) {
                        setLoadingAction("");
                        setNote(`Payment successful! Ref: ${response.reference}. Updating wallet balance...`);

                        (async () => {
                            try {
                                console.log("Calling craftad.fund with amount and reference:", value, response.reference);
                                const res = await craftad.fund(token, value, response.reference);
                                console.log("Fund response from server:", res);
                            } catch (err) {
                                console.error("Fund error details:", err);
                                setError("Payment succeeded, but local wallet sync failed: " + (err.message || err));
                            }
                            setAmount("");
                            setTimeout(load, 1500);
                        })();
                    }
                });

                handler.openIframe();
            } else {
                await craftad.withdraw(token, value);
                setNote("Withdrawal request submitted successfully.");
                setAmount("");
                await load();
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Could not update the wallet");
        } finally {
            setLoadingAction("");
        }
    }

    return (
        <div className="mx-auto max-w-3xl space-y-10 pb-12">

            {/* Header section */}
            <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-copper">FINANCIAL LEDGER</p>
                <h1 className="mt-1 font-display text-3xl tracking-tight sm:text-4xl text-ink">Wallet & Payouts</h1>
                <p className="mt-1 text-sm text-muted">Manage your available balance, fund your workspace, and configure withdrawal accounts.</p>
            </div>

            {/* Error & Success Notification Banners */}
            {error && (
                <div className="rounded-2xl border border-copper/30 bg-copper/5 px-5 py-4 text-sm text-copper-deep shadow-sm">
                    {error}
                </div>
            )}
            {note && (
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 px-5 py-4 text-sm text-emerald-800 shadow-sm flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    <span>{note}</span>
                </div>
            )}

            {/* Balance Display Card */}
            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-ink via-ink/95 to-copper-deep p-8 text-cream shadow-xl sm:p-10">
                <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full border border-cream/10 bg-white/5 blur-2xl" />
                <div className="relative z-10 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-copper">AVAILABLE LIQUIDITY</p>
                        <p className="mt-2 font-display text-4xl sm:text-5xl font-bold tracking-tight">
                            {balance === null ? "—" : `₦${balance.toLocaleString()}`}
                        </p>
                        <p className="mt-2 text-xs text-cream/70">Secured escrow & withdrawal-ready funds</p>
                    </div>
                    <div className="hidden sm:flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-copper">
                        <Wallet size={32} />
                    </div>
                </div>
            </div>

            {/* Funding & Withdrawal Action Box */}
            <div className="grid gap-6 rounded-[2rem] border border-line bg-cream p-6 shadow-sm sm:p-8">
                <div>
                    <h2 className="font-display text-2xl text-ink">Quick transactions</h2>
                    <p className="text-xs text-muted mt-0.5">Top up your wallet balance instantly via Paystack or request a payout.</p>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row items-center">
                    <input
                        type="number"
                        min={1}
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Enter amount in Naira (e.g. 5000)"
                        className="min-h-12 w-full flex-1 rounded-2xl border border-line bg-paper px-4 text-sm outline-none transition focus:border-copper focus:ring-2 focus:ring-copper/10"
                    />
                    <div className="flex w-full sm:w-auto gap-3">
                        <button
                            disabled={loadingAction === "fund" || !amount}
                            className="flex-1 sm:flex-none min-h-12 rounded-full bg-copper px-6 text-sm font-semibold text-cream transition-all hover:bg-copper-deep shadow-sm disabled:opacity-50"
                            onClick={() => act("fund")}
                        >
                            {loadingAction === "fund" ? "Initializing..." : "Add funds"}
                        </button>
                        <button
                            disabled={loadingAction === "withdraw" || !amount}
                            className="flex-1 sm:flex-none min-h-12 rounded-full border border-line bg-paper px-6 text-sm font-medium text-ink transition-all hover:border-copper hover:bg-cream shadow-sm disabled:opacity-50"
                            onClick={() => act("withdraw")}
                        >
                            {loadingAction === "withdraw" ? "Processing..." : "Withdraw"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Bank Account Verification Form */}
            <form
                className="grid gap-5 rounded-[2rem] border border-line bg-cream p-8 shadow-sm sm:grid-cols-2 sm:p-8"
                onSubmit={async (e) => {
                    e.preventDefault();
                    setError("");
                    setNote("");
                    setLoadingAction("verify-bank");
                    try {
                        const checked = await craftad.resolveBank(token, accountNumber, bankCode);
                        const name = checked?.data?.accountName || checked?.accountName || accountName;

                        if (!name) {
                            throw new Error("The bank verification service did not return an account name.");
                        }

                        setAccountName(name);
                        await craftad.addBank(token, { accountName: name, accountNumber, bankCode });
                        setNote(`Withdrawal account successfully verified and saved for ${name}.`);
                    } catch (err) {
                        setError(err instanceof Error ? err.message : "Could not verify or save the bank account.");
                    } finally {
                        setLoadingAction("");
                    }
                }}
            >
                <div className="sm:col-span-2 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-copper">BANK SETTINGS</p>
                        <h2 className="mt-1 font-display text-2xl text-ink">Withdrawal bank account</h2>
                        <p className="text-xs text-muted mt-0.5">Linked securely via automated NIBSS validation.</p>
                    </div>
                    <Building2 size={24} className="text-copper hidden sm:block" />
                </div>

                <input
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="Account number (e.g. 0123456789)"
                    className="min-h-12 rounded-2xl border border-line bg-paper px-4 text-sm outline-none transition focus:border-copper focus:ring-2 focus:ring-copper/10"
                    required
                />
                <input
                    value={bankCode}
                    onChange={(e) => setBankCode(e.target.value)}
                    placeholder="Bank code (e.g. 058 or 044)"
                    className="min-h-12 rounded-2xl border border-line bg-paper px-4 text-sm outline-none transition focus:border-copper focus:ring-2 focus:ring-copper/10"
                    required
                />

                <div className="sm:col-span-2 rounded-xl bg-paper p-4 border border-line">
                    <p className="text-sm font-medium text-copper-deep">
                        {accountName ? `✓ Verified account name: ${accountName}` : "Enter your NUBAN account number and bank code to verify via NIBSS."}
                    </p>
                </div>

                <button
                    disabled={loadingAction === "verify-bank"}
                    className="min-h-12 rounded-full bg-ink px-7 text-sm font-semibold text-cream transition-all hover:bg-copper shadow-sm sm:col-span-2 sm:w-fit disabled:opacity-50"
                >
                    {loadingAction === "verify-bank" ? "Verifying with NIBSS..." : "Verify and save account"}
                </button>
            </form>

            {/* Transaction History Ledger */}
            <section className="space-y-4">
                <div>
                    <h2 className="font-display text-2xl text-ink">Transaction history</h2>
                    <p className="text-xs text-muted mt-0.5">Chronological record of your credits and debits.</p>
                </div>

                <div className="overflow-hidden rounded-[1.75rem] border border-line bg-cream shadow-sm">
                    <ul className="divide-y divide-line">
                        {txs.length === 0 && (
                            <li className="p-8 text-center text-sm text-muted">
                                No transactions found in your ledger yet.
                            </li>
                        )}
                        {txs.map((tx) => (
                            <li key={tx._id} className="flex items-center justify-between px-6 py-4 text-sm transition-colors hover:bg-paper/50">
                                <div className="flex items-center gap-3.5">
                                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line ${tx.type === "credit" ? "bg-emerald-500/10 text-emerald-600" : "bg-paper text-muted"}`}>
                                        {tx.type === "credit" ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}
                                    </div>
                                    <div>
                                        <span className="capitalize font-semibold text-ink block">{tx.type} transaction</span>
                                        <span className="text-xs capitalize text-muted">Status: {tx.status || "Completed"}</span>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <span className={`font-display font-bold text-base ${tx.type === "credit" ? "text-emerald-600" : "text-ink"}`}>
                                        {tx.type === "credit" ? "+" : "−"}₦{(tx.amount || 0).toLocaleString()}
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

        </div>
    );
}