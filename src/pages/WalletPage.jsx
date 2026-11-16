import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    ArrowDownRight,
    ArrowLeft,
    ArrowUpRight,
    Building2,
    CheckCircle2,
    Eye,
    EyeOff,
    LoaderCircle,
    RefreshCw,
    ShieldCheck,
    Wallet,
} from "lucide-react";
import { craftad, listOf } from "../api";
import { useSession } from "../session";

const QUICK_AMOUNTS = [5000, 10000, 25000, 50000];

const NIGERIAN_BANKS = [
    { code: "044", name: "Access Bank" },
    { code: "058", name: "Guaranty Trust Bank (GTBank)" },
    { code: "057", name: "Zenith Bank" },
    { code: "011", name: "First Bank of Nigeria" },
    { code: "033", name: "United Bank for Africa (UBA)" },
    { code: "50211", name: "Kuda Microfinance Bank" },
    { code: "999992", name: "OPay Digital Services" },
    { code: "999991", name: "PalmPay" },
    { code: "50515", name: "Moniepoint MFB" },
    { code: "070", name: "Fidelity Bank" },
    { code: "214", name: "First City Monument Bank (FCMB)" },
    { code: "221", name: "Stanbic IBTC Bank" },
    { code: "232", name: "Sterling Bank" },
    { code: "032", name: "Union Bank of Nigeria" },
    { code: "035", name: "Wema Bank" },
    { code: "CUSTOM", name: "Other bank (enter CBN code)..." },
];

function formatNaira(amount) {
    const value = Number(amount);
    if (!Number.isFinite(value)) return "—";
    return `₦${value.toLocaleString("en-NG", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    })}`;
}

function formatTransactionDate(date) {
    if (!date) return "Date unavailable";

    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) {
        return "Date unavailable";
    }

    return parsedDate.toLocaleString("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
}

function getTxStatusBadge(status) {
    const normalized = String(status || "completed").toLowerCase();
    if (["completed", "success", "successful", "paid"].includes(normalized)) {
        return "bg-success-soft text-success";
    }
    if (["failed", "rejected", "cancelled"].includes(normalized)) {
        return "bg-danger-soft text-danger";
    }
    return "bg-warning-soft text-warning";
}

export function WalletPage() {
    const { token, user } = useSession();

    const [balance, setBalance] = useState(null);
    const [txs, setTxs] = useState([]);
    const [loadingLedger, setLoadingLedger] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [amount, setAmount] = useState("");
    const [balanceVisible, setBalanceVisible] = useState(true);
    const [txFilter, setTxFilter] = useState("all");

    const [accountNumber, setAccountNumber] = useState("");
    const [selectedBank, setSelectedBank] = useState("058");
    const [customBankCode, setCustomBankCode] = useState("");
    const [accountName, setAccountName] = useState("");

    const [note, setNote] = useState("");
    const [error, setError] = useState("");
    const [loadingAction, setLoadingAction] = useState("");

    const effectiveBankCode =
        selectedBank === "CUSTOM" ? customBankCode.trim() : selectedBank;

    const load = useCallback(
        async (isManual = false) => {
            if (!token) return;
            if (isManual) {
                setRefreshing(true);
            } else {
                setLoadingLedger(true);
            }

            try {
                const [walletRes, historyRes] = await Promise.all([
                    craftad.wallet(token),
                    craftad
                        .transactions(token)
                        .catch(() => craftad.myTransactions(token).catch(() => [])),
                ]);

                setBalance(walletRes?.wallet?.balance ?? 0);
                setTxs(listOf(historyRes, ["transactions", "data", "results"]));
            } finally {
                setLoadingLedger(false);
                setRefreshing(false);
            }
        },
        [token]
    );

    useEffect(() => {
        load(false).catch((err) =>
            setError(err instanceof Error ? err.message : "Unable to load wallet.")
        );
    }, [load]);

    const filteredTxs = useMemo(() => {
        if (txFilter === "all") return txs;
        return txs.filter(
            (tx) => String(tx.type || "").toLowerCase() === txFilter
        );
    }, [txs, txFilter]);

    async function act(kind) {
        if (loadingAction) return;
        setError("");
        setNote("");

        const value = Number(amount);
        if (!Number.isFinite(value) || value < 100) {
            setError("Please enter a valid amount of at least ₦100.");
            return;
        }

        if (kind === "withdraw" && balance !== null && value > balance) {
            setError(
                `Insufficient balance. Your available balance is ${formatNaira(balance)}.`
            );
            return;
        }

        setLoadingAction(kind);

        try {
            if (kind === "fund") {
                const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
                if (!publicKey) {
                    throw new Error(
                        "Paystack public key is missing from environment variables."
                    );
                }

                if (!window.PaystackPop) {
                    throw new Error(
                        "Paystack SDK failed to load. Please check your internet connection and refresh."
                    );
                }

                const handler = window.PaystackPop.setup({
                    key: publicKey,
                    email: user?.email || "customer@craftad.ng",
                    amount: Math.round(value * 100), // Convert Naira to integer Kobo
                    currency: "NGN",
                    metadata: {
                        userId: user?._id || user?.id,
                        custom_fields: [
                            {
                                display_name: "Wallet Funding",
                                variable_name: "wallet_funding",
                                value,
                            },
                        ],
                    },
                    onClose: function () {
                        setLoadingAction("");
                        setNote("Payment window closed.");
                    },
                    callback: function (response) {
                        setNote(
                            `Payment received (Ref: ${response.reference}). Syncing your wallet balance...`
                        );

                        (async () => {
                            try {
                                await craftad.fund(token, value, response.reference);
                                setAmount("");
                                await load(true);
                                setNote(
                                    `${formatNaira(value)} has been credited to your Craftad wallet.`
                                );
                            } catch (err) {
                                setError(
                                    `Payment succeeded, but wallet sync failed: ${
                                        err instanceof Error ? err.message : String(err)
                                    }`
                                );
                            } finally {
                                setLoadingAction("");
                            }
                        })();
                    },
                });

                handler.openIframe();
            } else {
                await craftad.withdraw(token, value);
                setNote(
                    `Withdrawal request for ${formatNaira(value)} submitted successfully.`
                );
                setAmount("");
                await load(true);
                setLoadingAction("");
            }
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Could not update the wallet."
            );
            setLoadingAction("");
        }
    }

    async function handleBankVerify(e) {
        e.preventDefault();
        if (loadingAction) return;

        setError("");
        setNote("");

        if (accountNumber.length !== 10) {
            setError("Please enter a valid 10-digit NUBAN account number.");
            return;
        }

        if (!effectiveBankCode) {
            setError("Please select your bank or enter a valid CBN bank code.");
            return;
        }

        setLoadingAction("verify-bank");
        try {
            const checked = await craftad.resolveBank(
                token,
                accountNumber,
                effectiveBankCode
            );
            const name =
                checked?.data?.accountName ||
                checked?.accountName ||
                checked?.data?.account_name ||
                accountName;

            if (!name) {
                throw new Error(
                    "Bank verification did not return an account name. Check the account number and bank."
                );
            }

            setAccountName(name);
            await craftad.addBank(token, {
                accountName: name,
                accountNumber,
                bankCode: effectiveBankCode,
            });
            setNote(`Withdrawal account verified and saved for ${name}.`);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Could not verify or save the bank account."
            );
        } finally {
            setLoadingAction("");
        }
    }

    return (
        <div className="mx-auto max-w-3xl space-y-8 pb-12">
            {/* Header Section */}
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <Link
                        to="/dashboard"
                        className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold text-muted no-underline transition hover:text-copper"
                    >
                        <ArrowLeft size={15} />
                        <span>Back to overview</span>
                    </Link>

                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-copper">
                        Financial Ledger
                    </p>
                    <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                        Wallet & Payouts
                    </h1>
                    <p className="mt-1 text-sm text-muted">
                        Manage your available balance, fund escrow hires, and link your
                        payout bank account.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => load(true)}
                    disabled={loadingLedger || refreshing}
                    aria-label="Refresh wallet and transactions"
                    className="inline-flex min-h-10 items-center gap-2 rounded-full border border-line bg-cream px-4 text-xs font-semibold text-ink transition hover:border-copper hover:text-copper disabled:opacity-50"
                >
                    <RefreshCw
                        size={14}
                        className={refreshing ? "animate-spin text-copper" : ""}
                    />
                    <span>Refresh</span>
                </button>
            </div>

            {/* Error & Success Notification Banners */}
            {error && (
                <div
                    role="alert"
                    className="rounded-2xl border border-danger/30 bg-danger-soft px-5 py-4 text-sm font-medium text-danger"
                >
                    {error}
                </div>
            )}

            {note && (
                <div
                    role="status"
                    className="flex items-center gap-2.5 rounded-2xl border border-success/30 bg-success-soft px-5 py-4 text-sm font-medium text-success"
                >
                    <CheckCircle2 size={17} className="shrink-0" />
                    <span>{note}</span>
                </div>
            )}

            {/* Balance Display Card (Explicit dark espresso/copper card so dark mode never inverts it) */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1A1714] via-[#241D17] to-[#853C22] p-7 text-[#FAF6EF] shadow-raised sm:p-10">
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full border border-white/10 bg-white/5 blur-2xl"
                />
                <div className="relative z-10 flex items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#F29C77]">
                                Available Liquidity
                            </p>
                            {balance !== null && (
                                <button
                                    type="button"
                                    onClick={() => setBalanceVisible((prev) => !prev)}
                                    aria-label={
                                        balanceVisible ? "Hide balance" : "Show balance"
                                    }
                                    className="rounded-full p-1 text-[#FAF6EF]/70 transition hover:bg-white/10 hover:text-white"
                                >
                                    {balanceVisible ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            )}
                        </div>

                        <p className="mt-2 font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                            {balance === null
                                ? "—"
                                : balanceVisible
                                    ? formatNaira(balance)
                                    : "₦ ••••••"}
                        </p>

                        <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-[#FAF6EF]/75">
                            <ShieldCheck size={14} className="text-[#7AC7A4]" />
                            <span>Secured escrow & withdrawal-ready funds</span>
                        </p>
                    </div>

                    <div className="hidden h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-[#F29C77] backdrop-blur-md sm:flex">
                        <Wallet size={30} />
                    </div>
                </div>
            </div>

            {/* Funding & Withdrawal Action Box */}
            <div className="grid gap-5 rounded-3xl border border-line bg-cream p-6 shadow-card sm:p-8">
                <div>
                    <h2 className="font-display text-2xl font-semibold text-ink">
                        Quick transactions
                    </h2>
                    <p className="mt-0.5 text-xs text-muted">
                        Top up instantly via Paystack or withdraw available funds to your
                        linked bank account.
                    </p>
                </div>

                {/* Preset Top-up Pills */}
                <div className="flex flex-wrap items-center gap-2">
                    {QUICK_AMOUNTS.map((preset) => (
                        <button
                            key={preset}
                            type="button"
                            onClick={() => setAmount(String(preset))}
                            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                                Number(amount) === preset
                                    ? "bg-copper text-white shadow-sm"
                                    : "border border-line bg-paper text-muted hover:border-copper/50 hover:text-ink"
                            }`}
                        >
                            +{formatNaira(preset)}
                        </button>
                    ))}
                </div>

                <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                    <input
                        type="number"
                        min={100}
                        step="1"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Enter amount in Naira (e.g. 5000)"
                        className="min-h-12 w-full flex-1 rounded-2xl border border-line bg-paper px-4 text-sm text-ink outline-none transition placeholder:text-muted/70 focus:border-copper focus:ring-2 focus:ring-copper/15"
                    />

                    <div className="flex w-full gap-3 sm:w-auto">
                        <button
                            type="button"
                            disabled={Boolean(loadingAction) || !amount}
                            onClick={() => act("fund")}
                            className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-copper px-6 text-sm font-semibold text-white shadow-sm transition-all hover:bg-copper-deep disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
                        >
                            {loadingAction === "fund" && (
                                <LoaderCircle size={15} className="animate-spin" />
                            )}
                            <span>
                {loadingAction === "fund" ? "Opening Paystack..." : "Add funds"}
              </span>
                        </button>

                        <button
                            type="button"
                            disabled={Boolean(loadingAction) || !amount}
                            onClick={() => act("withdraw")}
                            className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full border border-line bg-paper px-6 text-sm font-semibold text-ink shadow-sm transition-all hover:border-copper hover:text-copper disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
                        >
                            {loadingAction === "withdraw" && (
                                <LoaderCircle size={15} className="animate-spin" />
                            )}
                            <span>
                {loadingAction === "withdraw" ? "Processing..." : "Withdraw"}
              </span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Bank Account Verification Form */}
            <form
                onSubmit={handleBankVerify}
                className="grid gap-5 rounded-3xl border border-line bg-cream p-6 shadow-card sm:grid-cols-2 sm:p-8"
            >
                <div className="flex items-start justify-between gap-4 sm:col-span-2">
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-copper">
                            Bank Settings
                        </p>
                        <h2 className="mt-1 font-display text-2xl font-semibold text-ink">
                            Withdrawal bank account
                        </h2>
                        <p className="mt-0.5 text-xs text-muted">
                            Verified automatically via NIBSS name enquiry before payouts.
                        </p>
                    </div>
                    <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-copper/15 bg-copper/10 text-copper sm:flex">
                        <Building2 size={20} />
                    </div>
                </div>

                <label className="block text-xs font-semibold text-ink">
                    10-Digit Account Number (NUBAN)
                    <input
                        type="text"
                        inputMode="numeric"
                        maxLength={10}
                        value={accountNumber}
                        onChange={(e) => {
                            setAccountNumber(e.target.value.replace(/\D/g, "").slice(0, 10));
                            setAccountName("");
                        }}
                        placeholder="0123456789"
                        className="mt-2 min-h-12 w-full rounded-2xl border border-line bg-paper px-4 text-sm text-ink outline-none transition placeholder:text-muted/70 focus:border-copper focus:ring-2 focus:ring-copper/15"
                        required
                    />
                </label>

                <label className="block text-xs font-semibold text-ink">
                    Select Bank
                    <select
                        value={selectedBank}
                        onChange={(e) => {
                            setSelectedBank(e.target.value);
                            setAccountName("");
                        }}
                        className="mt-2 min-h-12 w-full rounded-2xl border border-line bg-paper px-4 text-sm text-ink outline-none transition focus:border-copper focus:ring-2 focus:ring-copper/15"
                    >
                        {NIGERIAN_BANKS.map((bank) => (
                            <option key={bank.code} value={bank.code}>
                                {bank.name}
                            </option>
                        ))}
                    </select>
                </label>

                {selectedBank === "CUSTOM" && (
                    <label className="block text-xs font-semibold text-ink sm:col-span-2">
                        Custom CBN Bank Code
                        <input
                            type="text"
                            value={customBankCode}
                            onChange={(e) => {
                                setCustomBankCode(e.target.value.trim());
                                setAccountName("");
                            }}
                            placeholder="e.g. 058"
                            className="mt-2 min-h-12 w-full rounded-2xl border border-line bg-paper px-4 text-sm text-ink outline-none transition placeholder:text-muted/70 focus:border-copper focus:ring-2 focus:ring-copper/15"
                            required
                        />
                    </label>
                )}

                <div
                    className={`rounded-2xl border p-4 sm:col-span-2 ${
                        accountName
                            ? "border-success/30 bg-success-soft text-success"
                            : "border-line bg-paper text-muted"
                    }`}
                >
                    <p className="text-sm font-medium">
                        {accountName
                            ? `✓ Verified account name: ${accountName}`
                            : "Enter your 10-digit NUBAN account number and bank to verify via NIBSS."}
                    </p>
                </div>

                <button
                    type="submit"
                    disabled={Boolean(loadingAction)}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-copper px-7 text-sm font-semibold text-white shadow-sm transition-all hover:bg-copper-deep disabled:cursor-not-allowed disabled:opacity-50 sm:col-span-2 sm:w-fit"
                >
                    {loadingAction === "verify-bank" && (
                        <LoaderCircle size={15} className="animate-spin" />
                    )}
                    <span>
            {loadingAction === "verify-bank"
                ? "Verifying with NIBSS..."
                : "Verify and save account"}
          </span>
                </button>
            </form>

            {/* Transaction History Ledger */}
            <section className="space-y-4">
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <h2 className="font-display text-2xl font-semibold text-ink">
                            Transaction history
                        </h2>
                        <p className="mt-0.5 text-xs text-muted">
                            Chronological record of your wallet credits, escrow locks, and
                            payouts.
                        </p>
                    </div>

                    {txs.length > 0 && (
                        <div className="flex gap-1.5">
                            {[
                                ["all", "All"],
                                ["credit", "Credits"],
                                ["debit", "Debits"],
                            ].map(([value, label]) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => setTxFilter(value)}
                                    className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                                        txFilter === value
                                            ? "bg-ink text-paper shadow-sm"
                                            : "border border-line bg-cream text-muted hover:border-line-strong hover:text-ink"
                                    }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="overflow-hidden rounded-3xl border border-line bg-cream shadow-card">
                    {loadingLedger ? (
                        <div className="space-y-3 p-6">
                            {Array.from({ length: 3 }).map((_, idx) => (
                                <div
                                    key={idx}
                                    className="h-16 animate-pulse rounded-2xl bg-paper"
                                />
                            ))}
                        </div>
                    ) : filteredTxs.length === 0 ? (
                        <div className="p-10 text-center text-sm text-muted">
                            {txs.length === 0
                                ? "No transactions found in your ledger yet."
                                : `No ${txFilter} transactions found.`}
                        </div>
                    ) : (
                        <ul className="divide-y divide-line">
                            {filteredTxs.map((tx, index) => {
                                const isCredit =
                                    String(tx.type || "").toLowerCase() === "credit";
                                const title =
                                    tx.description ||
                                    tx.narration ||
                                    `${tx.type || "Wallet"} transaction`;

                                return (
                                    <li
                                        key={tx._id || tx.id || tx.reference || index}
                                        className="flex items-center justify-between gap-4 px-5 py-4 text-sm transition-colors hover:bg-paper/60 sm:px-6"
                                    >
                                        <div className="flex min-w-0 items-center gap-3.5">
                                            <div
                                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${
                                                    isCredit
                                                        ? "border-success/25 bg-success-soft text-success"
                                                        : "border-line bg-paper text-muted"
                                                }`}
                                            >
                                                {isCredit ? (
                                                    <ArrowDownRight size={17} />
                                                ) : (
                                                    <ArrowUpRight size={17} />
                                                )}
                                            </div>

                                            <div className="min-w-0">
                                                <p className="truncate font-semibold capitalize text-ink">
                                                    {title}
                                                </p>

                                                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
                          <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${getTxStatusBadge(
                                  tx.status
                              )}`}
                          >
                            {tx.status || "Completed"}
                          </span>

                                                    <span>{formatTransactionDate(tx.createdAt)}</span>

                                                    {tx.reference && (
                                                        <span className="hidden truncate font-mono text-[11px] text-muted/80 sm:inline">
                              · {tx.reference}
                            </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="shrink-0 text-right">
                      <span
                          className={`font-display text-base font-semibold sm:text-lg ${
                              isCredit ? "text-success" : "text-ink"
                          }`}
                      >
                        {isCredit ? "+" : "−"}
                          {formatNaira(tx.amount ?? 0)}
                      </span>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </section>
        </div>
    );
}