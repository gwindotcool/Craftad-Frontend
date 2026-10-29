import { useEffect, useState } from "react";
import { craftad } from "../api";
import { useSession } from "../session";

export function Notifications() {
  const { token } = useSession();
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    craftad.notifications(token).then((data) => setItems(data.notifications || [])).catch((err) => setError(err.message));
  }, [token]);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-4xl">Alerts</h1>
        <button
          className="min-h-11 rounded-full border border-line bg-cream px-4 text-sm"
          onClick={() => craftad.markAllRead(token).then(() => setItems((list) => list.map((n) => ({ ...n, isRead: true })))).catch((err) => setError(err.message))}
        >
          Mark all read
        </button>
      </div>
      {error && <p className="mt-4 text-sm text-copper-deep">{error}</p>}
      <ul className="mt-6 divide-y divide-line overflow-hidden rounded-card border border-line bg-cream">
        {items.length === 0 && <li className="p-6 text-sm text-muted">You’re caught up.</li>}
        {items.map((item) => (
          <li key={item._id} className={`px-5 py-4 ${item.isRead ? "" : "bg-paper"}`}>
            <p className="font-medium">{item.title || "Update"}</p>
            <p className="mt-1 text-sm text-muted">{item.message}</p>
            {!item.isRead && (
              <button
                className="mt-3 min-h-10 rounded-full border border-line px-3 text-sm"
                onClick={() =>
                  craftad
                    .markRead(token, item._id)
                    .then(() => setItems((list) => list.map((n) => (n._id === item._id ? { ...n, isRead: true } : n))))
                    .catch((err) => setError(err.message))
                }
              >
                Mark read
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
