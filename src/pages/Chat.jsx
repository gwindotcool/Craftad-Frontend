import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { craftad, listOf } from "../api";
import { useSession } from "../session";

export function Chat() {
  const { jobId } = useParams();
  const { token, user } = useSession();
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState("");
  const me = user?.id || user?._id || "";

  useEffect(() => {
    if (!token) return;
    let stop = false;
    const pull = () =>
      craftad.chat(token, jobId).then((data) => {
        if (!stop) setMessages(listOf(data, ["messages"]));
      }).catch((err) => {
        if (!stop) setError(err.message);
      });
    pull();
    const timer = window.setInterval(pull, 12000);
    return () => {
      stop = true;
      window.clearInterval(timer);
    };
  }, [token, jobId]);

  return (
    <div className="mx-auto flex h-[calc(100vh-9rem)] max-w-2xl flex-col">
      <Link to={`/jobs/${jobId}`} className="text-sm text-muted no-underline">Back to the job</Link>
      <h1 className="font-display text-3xl">Job chat</h1>
      <p className="mb-4 text-sm text-muted">History for this job. The send box is ready for a future POST.</p>
      <div className="flex-1 space-y-3 overflow-y-auto rounded-card border border-line bg-cream p-4">
        {error && <p className="text-sm text-copper-deep">{error}</p>}
        {!error && messages.length === 0 && <p className="text-sm text-muted">No messages yet.</p>}
        {messages.map((msg) => {
          const mine = msg.sender === me;
          return (
            <div key={msg._id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${mine ? "bg-ink text-cream" : "bg-paper text-ink"}`}>
                <p>{msg.text}</p>
                <p className={`mt-1 text-xs ${mine ? "text-line" : "text-muted"}`}>{msg.createdAt ? new Date(msg.createdAt).toLocaleString() : ""}</p>
              </div>
            </div>
          );
        })}
      </div>
      <form
        className="mt-3 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!draft.trim()) return;
          setError("The live API can show chat history, but it doesn’t accept new messages yet.");
        }}
      >
        <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Write a message" className="min-h-12 flex-1 rounded-full border border-line bg-cream px-4 outline-none" />
        <button className="min-h-12 rounded-full bg-copper px-5 text-sm font-medium text-cream">Send</button>
      </form>
    </div>
  );
}
