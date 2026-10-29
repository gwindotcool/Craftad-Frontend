import { useEffect, useState } from "react";
import { craftad } from "../api";
import { useSession } from "../session";

export function WalletPage() {
  const { token } = useSession();
  const [balance, setBalance] = useState(null);
  const [txs, setTxs] = useState([]);
  const [amount, setAmount] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [bankCode, setBankCode] = useState("");
  const [accountName, setAccountName] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

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
    try {
      const value = Number(amount);
      if (kind === "fund") await craftad.fund(token, value);
      else await craftad.withdraw(token, value);
      setNote(kind === "fund" ? "Money added to the wallet." : "Withdrawal requested.");
      setAmount("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update the wallet");
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="font-display text-4xl">Wallet</h1>
      {error && <p className="text-sm text-copper-deep">{error}</p>}
      {note && <p className="text-sm text-pine">{note}</p>}
      <div className="rounded-card bg-ink p-6 text-cream">
        <p className="text-sm text-line">Available</p>
        <p className="font-display text-5xl">{balance === null ? "—" : `₦${balance.toLocaleString()}`}</p>
      </div>
      <div className="flex flex-col gap-3 rounded-card border border-line bg-cream p-5 sm:flex-row">
        <input type="number" min={1} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount in naira" className="min-h-12 flex-1 rounded-2xl border border-line px-4" />
        <button className="min-h-12 rounded-full bg-copper px-4 text-sm font-medium text-cream" onClick={() => act("fund")}>Add funds</button>
        <button className="min-h-12 rounded-full border border-line px-4 text-sm" onClick={() => act("withdraw")}>Withdraw</button>
      </div>
      <form
        className="grid gap-3 rounded-card border border-line bg-cream p-5 sm:grid-cols-2"
        onSubmit={async (e) => {
          e.preventDefault();
          setError("");
          setNote("");
          try {
            const checked = await craftad.resolveBank(token, accountNumber, bankCode);
            const name = checked.data?.accountName || accountName;
            if (!name) throw new Error("The bank did not return an account name");
            setAccountName(name);
            await craftad.addBank(token, { accountName: name, accountNumber, bankCode });
            setNote(`Withdrawal account saved for ${name}.`);
          } catch (err) {
            setError(err instanceof Error ? err.message : "Could not save the bank account");
          }
        }}
      >
        <h2 className="font-display text-2xl sm:col-span-2">Withdrawal bank</h2>
        <input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} placeholder="Account number" className="min-h-12 rounded-2xl border border-line px-4" required />
        <input value={bankCode} onChange={(e) => setBankCode(e.target.value)} placeholder="Bank code" className="min-h-12 rounded-2xl border border-line px-4" required />
        <p className="text-sm text-muted sm:col-span-2">{accountName ? `Verified as ${accountName}` : "We check the account, then save it for withdrawals."}</p>
        <button className="min-h-12 rounded-full bg-ink px-4 text-sm font-medium text-cream sm:col-span-2 sm:w-fit">Verify and save</button>
      </form>
      <ul className="divide-y divide-line rounded-card border border-line bg-cream">
        {txs.length === 0 && <li className="p-5 text-sm text-muted">No transactions yet.</li>}
        {txs.map((tx) => (
          <li key={tx._id} className="flex items-center justify-between px-5 py-3 text-sm">
            <span className="capitalize">{tx.type} · {tx.status}</span>
            <span className="font-medium">{tx.type === "credit" ? "+" : "−"}₦{(tx.amount || 0).toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
