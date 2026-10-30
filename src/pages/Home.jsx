import { Link, Navigate } from "react-router-dom";
import { ArrowRight, MessageSquare, ShieldCheck, Star, Wallet } from "lucide-react";
import { SiteMark } from "../components/SiteMark";
import { ShareBar } from "../components/ShareBar";
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
            <h1 className="mt-3 max-w-xl font-display text-5xl leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">
                Real trades. Clear prices.
            </h1>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted">
              Craftad brings customers and skilled artisans together. Describe the work,
              compare applications, agree on the price, and keep the conversation and
              payment connected to the job.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/register" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-copper px-5 font-medium text-cream no-underline">
              I need work done <ArrowRight size={18} />
            </Link>
            <Link to="/register" className="inline-flex min-h-12 items-center rounded-full border border-line bg-cream px-5 font-medium text-ink no-underline">I’m an artisan</Link>
          </div>
        </div>

          <figure className="relative isolate overflow-hidden rounded-[2rem] border border-line bg-ink shadow-xl">
              <video
                  className="aspect-[4/3] w-full object-cover motion-reduce:hidden"
                  autoPlay
                  muted
                  loop
                  playsInline
                  poster="/photos/hero.jpg"
                  aria-label="A plumber in work clothes repairing a sink in a customer's kitchen"
              >
                  <source src="/photos/hero.mp4" type="video/mp4" />
              </video>

              <img
                  src="/photos/hero.jpg"
                  alt="A plumber in work clothes repairing a sink in a customer's kitchen"
                  className="hidden aspect-[4/3] w-full object-cover motion-reduce:block"
              />

              <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-gradient-to-t from-ink/90 via-ink/40 to-transparent px-5 pb-5 pt-16 text-sm text-cream">
    <span className="font-medium">
      On the job, not a directory listing
    </span>
                  <span className="shrink-0 rounded-full border border-cream/40 bg-ink/30 px-3 py-1.5 text-xs">
      Customer’s home
    </span>
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
        <section id="how" className="mx-auto max-w-6xl px-4 py-20">
            <div className="max-w-xl">
                <p className="text-sm font-medium tracking-wide text-copper">
                    SIMPLE FROM START TO FINISH
                </p>

                <h2 className="mt-2 font-display text-4xl tracking-tight sm:text-5xl">
                    How a job moves
                </h2>

                <p className="mt-4 text-base leading-relaxed text-muted">
                    A clear process keeps customers and artisans on the same page,
                    from the first request to the final payment.
                </p>
            </div>

            <ol className="mt-10 grid gap-5 md:grid-cols-3">
                {steps.map((step, index) => (
                    <li
                        key={step.n}
                        className="group relative overflow-hidden rounded-[1.5rem] border border-line bg-cream p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                    >
                        <div className="flex items-center justify-between">
          <span className="font-display text-5xl text-copper/25">
            {step.n}
          </span>

                            <span className="grid h-10 w-10 place-items-center rounded-full border border-line text-sm font-medium text-muted transition-colors group-hover:border-copper group-hover:bg-copper group-hover:text-cream">
            {index + 1}
          </span>
                        </div>

                        <div className="mt-8 h-1 w-12 rounded-full bg-copper transition-all duration-300 group-hover:w-20" />

                        <h3 className="mt-5 font-display text-2xl">
                            {step.title}
                        </h3>

                        <p className="mt-3 text-sm leading-relaxed text-muted">
                            {step.copy}
                        </p>
                    </li>
                ))}
            </ol>
        </section>
        <section className="mx-auto max-w-6xl px-4 pb-20">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                <div>
                    <p className="text-sm font-medium tracking-wide text-copper">
                        FIND YOUR TRADE
                    </p>
                    <h2 className="mt-2 font-display text-4xl tracking-tight">
                        Trades on Craftad
                    </h2>
                </div>

                <p className="max-w-sm text-sm leading-relaxed text-muted">
                    From everyday repairs to skilled craftsmanship, find the right person
                    for the work.
                </p>
            </div>

            <div className="mt-8 grid gap-5 md:grid-cols-3">
                {trades.map((trade) => (
                    <article
                        key={trade.name}
                        className="group overflow-hidden rounded-[1.5rem] border border-line bg-cream transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                    >
                        <div className="overflow-hidden bg-paper">
                            <img
                                src={trade.img}
                                alt={`${trade.name} services on Craftad`}
                                loading="lazy"
                                className="aspect-[5/4] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                        </div>

                        <div className="p-6">
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-copper">
                                Skilled professionals
                            </p>

                            <h3 className="mt-2 font-display text-2xl">
                                {trade.name}
                            </h3>

                            <p className="mt-2 text-sm leading-relaxed text-muted">
                                {trade.copy}
                            </p>
                        </div>
                    </article>
                ))}
            </div>
        </section>
        <section className="mx-auto max-w-6xl px-4 pb-20">
            <div className="grid gap-5 md:grid-cols-2">
                {/* Customer card */}
                <div className="group relative overflow-hidden rounded-[1.75rem] bg-ink p-8 text-cream sm:p-10">
                    <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full border border-cream/10 transition-transform duration-500 group-hover:scale-125" />
                    <div className="absolute -right-5 -top-5 h-32 w-32 rounded-full border border-cream/10" />

                    <div className="relative">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-copper">
                            For customers
                        </p>

                        <h2 className="mt-5 max-w-md font-display text-3xl leading-tight sm:text-4xl">
                            Post once. Compare offers. Stay in the loop.
                        </h2>

                        <p className="mt-4 max-w-sm text-sm leading-relaxed text-cream/70">
                            Describe what needs fixing, hear from artisans, and choose the right
                            person for the job.
                        </p>

                        <Link
                            to="/register"
                            className="mt-8 inline-flex min-h-12 items-center rounded-full bg-cream px-6 text-sm font-semibold text-ink no-underline transition-colors hover:bg-copper hover:text-cream"
                        >
                            Create a customer account
                        </Link>
                    </div>
                </div>

                {/* Artisan card */}
                <div className="group relative overflow-hidden rounded-[1.75rem] border border-line bg-cream p-8 sm:p-10">
                    <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full border border-copper/10 transition-transform duration-500 group-hover:scale-125" />
                    <div className="absolute -right-5 -top-5 h-32 w-32 rounded-full border border-copper/10" />

                    <div className="relative">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-copper">
                            For artisans
                        </p>

                        <h2 className="mt-5 max-w-md font-display text-3xl leading-tight text-ink sm:text-4xl">
                            Open jobs, your price, your wallet.
                        </h2>

                        <p className="mt-4 flex items-center gap-2 text-sm leading-relaxed text-muted">
                            <Wallet size={18} className="shrink-0 text-copper" />
                            Withdraw when the customer confirms.
                        </p>

                        <Link
                            to="/register"
                            className="mt-8 inline-flex min-h-12 items-center rounded-full bg-copper px-6 text-sm font-semibold text-cream no-underline transition-colors hover:bg-copper-deep"
                        >
                            Join as an artisan
                        </Link>
                    </div>
                </div>
            </div>
        </section>
        <section className="mx-auto max-w-6xl px-4 pb-20">
            <div className="relative overflow-hidden rounded-[1.75rem] border border-line bg-[#eee5d8] p-8 sm:p-10">
                <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full border border-copper/10" />
                <div className="absolute -right-8 -top-12 h-48 w-48 rounded-full border border-copper/10" />

                <div className="relative grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
                    <div className="max-w-xl">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-copper">
                            GOOD WORK TRAVELS
                        </p>

                        <h2 className="mt-3 font-display text-3xl tracking-tight text-ink sm:text-4xl">
                            Pass it on.
                        </h2>

                        <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted sm:text-base">
                            Send Craftad to someone who needs a plumber, a carpenter, or a day’s
                            work. A good connection can make someone's day easier.
                        </p>
                    </div>

                    <div className="relative rounded-2xl border border-white/70 bg-cream p-5 shadow-sm">
                        <ShareBar
                            title="Share on social"
                            text="Find a trusted artisan on Craftad. Post a job, compare prices, and pay when the work is done."
                        />
                    </div>
                </div>
            </div>
        </section>
    </div>
  );
}
