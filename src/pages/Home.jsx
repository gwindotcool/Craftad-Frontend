import { Link, Navigate } from "react-router-dom";
import { ArrowRight, MessageSquare, ShieldCheck, Star, Wallet } from "lucide-react";
import { SiteMark } from "../components/SiteMark";
import { useSession } from "../session";

const trades = [
  { name: "Electrical", copy: "Wiring, fittings, and repairs done by people who know the code.", img: "/photos/electrician.jpg" },
  { name: "Carpentry", copy: "Furniture, doors, and joinery from a workshop you can actually talk to.", img: "/photos/carpenter.jpg" },
  { name: "Painting", copy: "Rooms finished cleanly, on a price you agreed before anyone starts.", img: "/photos/painter.jpg" },
];

const steps = [
  { n: "01", title: "Describe the job", copy: "Title, trade, budget, and where the work is. Artisans nearby can see it immediately." },
  { n: "02", title: "Choose who shows up", copy: "Compare notes and prices, accept one application, then chat on that job." },
  { n: "03", title: "Pay when it’s done", copy: "Funds sit in escrow. You confirm the work, then the artisan is paid." },
];

export function Home() {
  const { token } = useSession();
  if (token) return <Navigate to="/dashboard" replace />;
  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <SiteMark />
        <nav className="flex items-center gap-2 text-sm">
          <a href="#how" className="hidden min-h-11 items-center px-3 text-muted no-underline sm:inline-flex">How it works</a>
          <Link to="/login" className="inline-flex min-h-11 items-center px-3 font-medium text-ink no-underline">Sign in</Link>
          <Link to="/register" className="inline-flex min-h-11 items-center rounded-full bg-ink px-4 font-medium text-cream no-underline">Get started</Link>
        </nav>
      </header>
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-6 lg:grid-cols-2">
        <div>
          <p className="text-sm font-medium tracking-wide text-copper">Artisan marketplace</p>
          <h1 className="mt-3 font-display text-5xl leading-tight sm:text-6xl">Real trades. Clear prices. Work you can talk through.</h1>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted">
            Craftad connects people who need a job done with artisans who do that work for a living. Post the brief, pick an applicant, chat on the job, and release payment when you are happy.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/register" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-copper px-5 font-medium text-cream no-underline">
              I need work done <ArrowRight size={18} />
            </Link>
            <Link to="/register" className="inline-flex min-h-12 items-center rounded-full border border-line bg-cream px-5 font-medium text-ink no-underline">I’m an artisan</Link>
          </div>
        </div>
        <figure className="overflow-hidden rounded-card border border-line bg-cream shadow-sm">
          <video className="aspect-[4/3] w-full object-cover motion-reduce:hidden" autoPlay muted loop playsInline poster="/photos/hero.jpg" aria-label="A plumber in work clothes repairing a sink in a customer's kitchen">
            <source src="/photos/hero.mp4" type="video/mp4" />
          </video>
          <img src="/photos/hero.jpg" alt="A plumber in work clothes repairing a sink in a customer's kitchen" className="hidden aspect-[4/3] w-full object-cover motion-reduce:block" />
          <figcaption className="flex items-center justify-between px-4 py-3 text-sm text-muted">
            <span>On the job, not a directory listing</span>
            <span className="text-ink">Customer’s home</span>
          </figcaption>
        </figure>
      </section>
      <section className="border-y border-line bg-cream">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:grid-cols-3">
          {[
            { icon: ShieldCheck, title: "Escrow, not a handshake", copy: "Money is held until the customer confirms the work is finished." },
            { icon: MessageSquare, title: "One thread per job", copy: "Customer and assigned artisan share a chat history for that job only." },
            { icon: Star, title: "Reviews after the work", copy: "Completed jobs can be rated so the next hire is less of a guess." },
          ].map(({ icon: Icon, title, copy }) => (
            <div key={title} className="flex gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-paper text-copper"><Icon size={20} /></span>
              <div>
                <h2 className="font-display text-lg">{title}</h2>
                <p className="mt-1 text-sm leading-relaxed text-muted">{copy}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section id="how" className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="font-display text-4xl">How a job moves</h2>
        <ol className="mt-8 grid gap-4 md:grid-cols-3">
          {steps.map((step) => (
            <li key={step.n} className="rounded-card border border-line bg-cream p-6">
              <p className="font-display text-copper">{step.n}</p>
              <h3 className="mt-3 font-display text-2xl">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{step.copy}</p>
            </li>
          ))}
        </ol>
      </section>
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <h2 className="font-display text-4xl">Trades on Craftad</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {trades.map((trade) => (
            <article key={trade.name} className="overflow-hidden rounded-card border border-line bg-cream">
              <img src={trade.img} alt="" className="aspect-square w-full object-cover" />
              <div className="p-5">
                <h3 className="font-display text-2xl">{trade.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{trade.copy}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="mx-auto grid max-w-6xl gap-4 px-4 pb-16 md:grid-cols-2">
        <div className="rounded-card bg-ink p-8 text-cream">
          <p className="text-sm text-line">For customers</p>
          <h2 className="mt-2 font-display text-3xl">Post once. Compare offers. Stay in the loop.</h2>
          <Link to="/register" className="mt-6 inline-flex min-h-11 items-center rounded-full bg-cream px-4 text-sm font-medium text-ink no-underline">Create a customer account</Link>
        </div>
        <div className="rounded-card border border-line bg-cream p-8">
          <p className="text-sm text-copper">For artisans</p>
          <h2 className="mt-2 font-display text-3xl">Open jobs, your price, your wallet.</h2>
          <p className="mt-3 flex items-center gap-2 text-sm text-muted"><Wallet size={16} /> Withdraw when the customer confirms.</p>
          <Link to="/register" className="mt-6 inline-flex min-h-11 items-center rounded-full bg-copper px-4 text-sm font-medium text-cream no-underline">Join as an artisan</Link>
        </div>
      </section>
    </div>
  );
}
