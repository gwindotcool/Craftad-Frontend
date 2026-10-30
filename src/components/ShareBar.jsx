import { useEffect, useState } from "react";

const SOCIAL_KEY = "craftad_social";

export function loadSocial() {
  try {
    return JSON.parse(localStorage.getItem(SOCIAL_KEY) || "{}");
  } catch {
    return {};
  }
}

export function saveSocial(value) {
  localStorage.setItem(SOCIAL_KEY, JSON.stringify(value));
}

function shareLinks(text, url) {
  const message = encodeURIComponent(`${text} ${url}`.trim());
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(text);
  return {
    WhatsApp: `https://wa.me/?text=${message}`,
    Facebook: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
    X: `https://twitter.com/intent/tweet?text=${t}&url=${u}`,
    Telegram: `https://t.me/share/url?url=${u}&text=${t}`,
  };
}

export function ShareBar({ title = "Share", text, url }) {
  const [copied, setCopied] = useState(false);
  const [href, setHref] = useState(url || "");
  const [canNative, setCanNative] = useState(false);

  useEffect(() => {
    const origin = window.location.origin;
    const next = !url ? window.location.href : url.startsWith("http") ? url : `${origin}${url.startsWith("/") ? url : `/${url}`}`;
    setHref(next);
    setCanNative(typeof navigator.share === "function");
  }, [url]);

  const links = href ? shareLinks(text, href) : {};

  async function copy() {
    try {
      await navigator.clipboard.writeText(href);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div>
      <p className="text-sm text-muted">{title}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {canNative && (
          <button
            type="button"
            className="min-h-10 rounded-full bg-ink px-4 text-sm text-cream"
            onClick={() => navigator.share({ title, text, url: href }).catch(() => {})}
          >
            Share
          </button>
        )}
        {Object.entries(links).map(([name, link]) => (
          <a key={name} href={link} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center rounded-full border border-line bg-cream px-4 text-sm text-ink no-underline">
            {name}
          </a>
        ))}
        <button type="button" className="min-h-10 rounded-full border border-line px-4 text-sm" onClick={copy}>
          {copied ? "Copied" : "Copy link"}
        </button>
      </div>
    </div>
  );
}
