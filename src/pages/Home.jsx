import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import {
    ArrowRight,
    CheckCircle2,
    Menu,
    MessageSquare,
    ShieldCheck,
    Sparkles,
    Star,
    Wallet,
    X,
} from "lucide-react";
import { SiteMark } from "../components/SiteMark";
import { ShareBar } from "../components/ShareBar";
import { useSession } from "../session";
import { FloatingThemeToggle } from "../components/FloatingThemeToggle";

const FEATURED_TRADES = [
    {
        slug: "electrician",
        name: "Electrical",
        tag: "Certified wiring & panels",
        cta: "Book an electrician",
        copy: "Fault tracing, lighting, and safe installations done by artisans who know the code.",
        img: "/photos/electrician.jpg",
    },
    {
        slug: "carpenter",
        name: "Carpentry",
        tag: "Custom joinery & repairs",
        cta: "Book a carpenter",
        copy: "Doors, cabinetry, and structural woodwork built in a workshop you can actually talk to.",
        img: "/photos/carpenter.jpg",
    },
    {
        slug: "painter",
        name: "Painting & Finishing",
        tag: "Interior & exterior",
        cta: "Book a painter",
        copy: "Rooms prepped and finished cleanly on a fixed price agreed before a brush touches the wall.",
        img: "/photos/painter.jpg",
    },
];

const MORE_TRADES = [
    { slug: "plumber", label: "Plumbing & Pipework" },
    { slug: "mechanic", label: "Auto Diagnostics & Repair" },
    { slug: "welder", label: "Welding & Metal Fabrication" },
    { slug: "cleaner", label: "Residential & Office Cleaning" },
];

const STEPS = [
    {
        n: "01",
        title: "Describe the job",
        copy: "Set the scope, trade, budget, and location—with optional photos or video. Vetted artisans nearby see it immediately.",
    },
    {
        n: "02",
        title: "Negotiate & lock escrow",
        copy: "Compare quotes, message candidates directly, and agree on a fixed price before work begins.",
    },
    {
        n: "03",
        title: "Release pay when done",
        copy: "Your payment sits safely in escrow. Once you inspect and sign off on the work, the artisan gets paid.",
    },
];

const TRUST_PILLARS = [
    {
        icon: ShieldCheck,
        title: "Escrow, not a handshake",
        copy: "Funds stay locked until the customer confirms the work is completed as agreed.",
    },
    {
        icon: MessageSquare,
        title: "One thread per job",
        copy: "Customer and artisan share a dedicated negotiation and milestone chat tied directly to that job.",
    },
    {
        icon: Star,
        title: "Verified post-job reviews",
        copy: "Only completed, paid jobs can be rated—so every review reflects real fieldwork.",
    },
];

export function Home() {
    const { token } = useSession();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    if (token) return <Navigate to="/dashboard" replace />;

    return (
        <div className="min-h-screen bg-paper text-ink transition-colors duration-200">
            {/* Sticky Glass Header */}
            <header className="sticky top-0 z-30 border-b border-line/70 bg-paper/85 backdrop-blur-md">
                <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <SiteMark />

                    {/* Desktop Navigation */}
                    <nav
                        aria-label="Primary navigation"
                        className="hidden items-center gap-2 text-sm font-medium md:flex md:gap-5"
                    >
                        <a
                            href="#how"
                            className="inline-flex min-h-10 items-center px-3 text-muted no-underline transition-colors hover:text-ink"
                        >
                            How it works
                        </a>
                        <a
                            href="#trades"
                            className="inline-flex min-h-10 items-center px-3 text-muted no-underline transition-colors hover:text-ink"
                        >
                            Trades
                        </a>
                        <Link
                            to="/login"
                            className="inline-flex min-h-10 items-center rounded-full px-4 font-medium text-ink no-underline transition-colors hover:bg-subtle"
                        >
                            Sign in
                        </Link>
                        <Link
                            to="/register"
                            className="inline-flex min-h-10 items-center rounded-full bg-copper px-5 font-semibold text-white no-underline shadow-sm transition-all hover:bg-copper-deep"
                        >
                            Get started
                        </Link>
                    </nav>

                    {/* Mobile Menu Actions */}
                    <div className="flex items-center gap-2 md:hidden">
                        <Link
                            to="/register"
                            className="inline-flex min-h-9 items-center rounded-full bg-copper px-4 text-xs font-semibold text-white no-underline shadow-sm transition hover:bg-copper-deep"
                        >
                            Get started
                        </Link>
                        <button
                            type="button"
                            onClick={() => setMobileMenuOpen((prev) => !prev)}
                            aria-expanded={mobileMenuOpen}
                            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                            className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-cream text-ink transition hover:border-copper"
                        >
                            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Dropdown Drawer */}
                {mobileMenuOpen && (
                    <div className="border-t border-line bg-cream px-4 py-4 shadow-raised md:hidden">
                        <nav
                            aria-label="Mobile navigation"
                            className="flex flex-col space-y-2 text-sm font-medium"
                        >
                            <a
                                href="#how"
                                onClick={() => setMobileMenuOpen(false)}
                                className="rounded-xl px-3 py-2.5 text-ink no-underline transition hover:bg-subtle"
                            >
                                How it works
                            </a>
                            <a
                                href="#trades"
                                onClick={() => setMobileMenuOpen(false)}
                                className="rounded-xl px-3 py-2.5 text-ink no-underline transition hover:bg-subtle"
                            >
                                Trades
                            </a>
                            <Link
                                to="/login"
                                onClick={() => setMobileMenuOpen(false)}
                                className="rounded-xl px-3 py-2.5 text-ink no-underline transition hover:bg-subtle"
                            >
                                Sign in
                            </Link>
                        </nav>
                    </div>
                )}
            </header>

            <main>
                {/* Hero Section */}
                <section className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-20 pt-10 sm:px-6 lg:grid-cols-12 lg:px-8 lg:pb-28 lg:pt-14">
                    <div className="space-y-6 lg:col-span-6">
                        <div className="inline-flex items-center gap-2 rounded-full border border-copper/25 bg-copper/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-copper">
                            <Sparkles size={13} />
                            <span>Escrow-protected artisan marketplace</span>
                        </div>

                        <h1 className="max-w-xl font-display text-4xl font-semibold leading-[1.06] tracking-tight text-ink sm:text-6xl lg:text-[4.25rem]">
                            Real trades. <span className="text-copper">Clear prices.</span>
                        </h1>

                        <p className="max-w-lg text-base leading-relaxed text-muted sm:text-lg">
                            Post a repair or custom build, compare transparent quotes from
                            local artisans, and keep every message and naira tied securely to
                            the job.
                        </p>

                        <div className="flex flex-wrap items-center gap-3.5 pt-2">
                            <Link
                                to="/register?role=customer"
                                className="inline-flex min-h-12 items-center gap-2 rounded-full bg-copper px-7 text-sm font-semibold text-white no-underline shadow-card transition-all hover:-translate-y-0.5 hover:bg-copper-deep"
                            >
                                <span>I need work done</span>
                                <ArrowRight size={17} />
                            </Link>
                            <Link
                                to="/register?role=artisan"
                                className="inline-flex min-h-12 items-center rounded-full border border-line-strong bg-cream px-7 text-sm font-semibold text-ink no-underline shadow-card transition-all hover:border-copper hover:bg-raised"
                            >
                                I’m an artisan
                            </Link>
                        </div>

                        {/* Micro-reassurance strip */}
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-xs font-medium text-muted">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-success" />
                Free to post a job
              </span>
                            <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-success" />
                Escrow held until sign-off
              </span>
                        </div>
                    </div>

                    <figure className="relative isolate overflow-hidden rounded-3xl border border-line bg-cream shadow-raised lg:col-span-6">
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

                        <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-gradient-to-t from-[#14110F]/95 via-[#14110F]/55 to-transparent px-6 pb-6 pt-16 text-sm text-[#F5EFE7]">
                            <div>
                                <p className="font-semibold text-white">
                                    On the job, not a directory listing
                                </p>
                                <p className="text-xs text-[#F5EFE7]/75">
                                    Verified milestone &amp; escrow protection
                                </p>
                            </div>
                            <span className="shrink-0 rounded-full border border-white/20 bg-black/45 px-3.5 py-1.5 text-xs font-medium text-white backdrop-blur-md">
                Escrow Active
              </span>
                        </figcaption>
                    </figure>
                </section>

                {/* Trust Pillars Bar */}
                <section className="border-y border-line bg-cream">
                    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-3 sm:px-6 lg:px-8">
                        {TRUST_PILLARS.map(({ icon: Icon, title, copy }) => (
                            <div key={title} className="flex items-start gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-line bg-paper text-copper shadow-card">
                  <Icon size={21} />
                </span>
                                <div>
                                    <h2 className="text-base font-semibold text-ink">{title}</h2>
                                    <p className="mt-1 text-sm leading-relaxed text-muted">
                                        {copy}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* How It Works */}
                <section
                    id="how"
                    className="mx-auto max-w-7xl scroll-mt-20 px-4 py-24 sm:px-6 lg:px-8"
                >
                    <div className="max-w-xl">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-copper">
                            Simple from start to finish
                        </p>
                        <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink sm:text-5xl">
                            How a job moves
                        </h2>
                        <p className="mt-3 text-base leading-relaxed text-muted">
                            A structured workflow keeps customers and artisans aligned from
                            initial quote to final payout.
                        </p>
                    </div>

                    <ol className="mt-12 grid gap-6 md:grid-cols-3">
                        {STEPS.map((step, index) => (
                            <li
                                key={step.n}
                                className="group relative overflow-hidden rounded-3xl border border-line bg-cream p-8 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-line-strong hover:shadow-raised"
                            >
                                <div className="flex items-center justify-between">
                  <span className="font-display text-5xl font-semibold text-copper/25 transition-colors group-hover:text-copper/45">
                    {step.n}
                  </span>
                                    <span className="grid h-9 w-9 place-items-center rounded-full border border-line bg-paper text-xs font-bold text-muted transition-colors group-hover:border-copper group-hover:bg-copper group-hover:text-white">
                    {index + 1}
                  </span>
                                </div>

                                <div className="mt-7 h-1 w-10 rounded-full bg-copper transition-all duration-300 group-hover:w-16" />

                                <h3 className="mt-6 text-xl font-semibold text-ink">
                                    {step.title}
                                </h3>
                                <p className="mt-2 text-sm leading-relaxed text-muted">
                                    {step.copy}
                                </p>
                            </li>
                        ))}
                    </ol>
                </section>

                {/* Trades Showcase */}
                <section
                    id="trades"
                    className="mx-auto max-w-7xl scroll-mt-20 px-4 pb-24 sm:px-6 lg:px-8"
                >
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-copper">
                                Find your trade
                            </p>
                            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                                Trades on Craftad
                            </h2>
                        </div>
                        <p className="max-w-sm text-sm leading-relaxed text-muted">
                            From urgent home repairs to custom workshop fabrication, hire
                            specialists ready to work.
                        </p>
                    </div>

                    <div className="mt-10 grid gap-6 md:grid-cols-3">
                        {FEATURED_TRADES.map((trade) => (
                            <Link
                                key={trade.name}
                                to={`/register?role=customer&trade=${trade.slug}`}
                                className="group flex flex-col overflow-hidden rounded-3xl border border-line bg-cream no-underline shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-line-strong hover:shadow-raised"
                            >
                                <div className="overflow-hidden bg-subtle">
                                    <img
                                        src={trade.img}
                                        alt={`${trade.name} services on Craftad`}
                                        loading="lazy"
                                        decoding="async"
                                        className="aspect-[16/11] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                </div>

                                <div className="flex flex-1 flex-col justify-between p-7">
                                    <div>
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-copper">
                      {trade.tag}
                    </span>

                                        <h3 className="mt-2 text-xl font-semibold text-ink">
                                            {trade.name}
                                        </h3>
                                        <p className="mt-2 text-sm leading-relaxed text-muted">
                                            {trade.copy}
                                        </p>
                                    </div>

                                    <div className="mt-6 flex items-center justify-between border-t border-line/70 pt-4 text-xs font-semibold text-ink group-hover:text-copper">
                                        <span>{trade.cta}</span>
                                        <ArrowRight
                                            size={15}
                                            className="text-muted transition-transform group-hover:translate-x-1 group-hover:text-copper"
                                        />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Additional Trades Quick Strip */}
                    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-cream px-5 py-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">
              Also available:
            </span>
                        <div className="flex flex-wrap items-center gap-2">
                            {MORE_TRADES.map((item) => (
                                <Link
                                    key={item.slug}
                                    to={`/register?role=customer&trade=${item.slug}`}
                                    className="rounded-full border border-line bg-paper px-3.5 py-1.5 text-xs font-medium text-ink no-underline transition hover:border-copper hover:text-copper"
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Dual Role Split Cards (Espresso/Copper vs Deep Pine) */}
                <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Customer Card */}
                        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1D1815] via-[#2A201A] to-[#853C22] p-8 text-[#F5EFE7] shadow-raised sm:p-10">
                            <div
                                aria-hidden="true"
                                className="pointer-events-none absolute -right-14 -top-14 h-52 w-52 rounded-full border border-white/10 bg-white/5 blur-2xl"
                            />

                            <div className="relative flex h-full flex-col justify-between">
                                <div>
                  <span className="inline-block rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#F5EFE7]">
                    For customers
                  </span>

                                    <h2 className="mt-5 max-w-md font-display text-3xl font-semibold leading-tight text-white sm:text-4xl">
                                        Post once. Compare offers. Stay in control.
                                    </h2>

                                    <p className="mt-3 max-w-sm text-sm leading-relaxed text-[#F5EFE7]/80">
                                        Describe what needs fixing, review competing quotes, and
                                        release escrow only when you’re satisfied.
                                    </p>
                                </div>

                                <div className="pt-8">
                                    <Link
                                        to="/register?role=customer"
                                        className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[#FFFCF6] px-7 text-sm font-semibold text-[#211B17] no-underline shadow-md transition-all hover:-translate-y-0.5 hover:bg-white"
                                    >
                                        <span>Create a customer account</span>
                                        <ArrowRight size={16} />
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Artisan Card (Uses Brand Pine) */}
                        <div className="relative overflow-hidden rounded-3xl bg-[#243D32] p-8 text-[#F5EFE7] shadow-raised sm:p-10">
                            <div
                                aria-hidden="true"
                                className="pointer-events-none absolute -right-14 -top-14 h-52 w-52 rounded-full border border-white/10 bg-white/5 blur-2xl"
                            />

                            <div className="relative flex h-full flex-col justify-between">
                                <div>
                  <span className="inline-block rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#F5EFE7]">
                    For artisans
                  </span>

                                    <h2 className="mt-5 max-w-md font-display text-3xl font-semibold leading-tight text-white sm:text-4xl">
                                        Open jobs, your price, guaranteed payout.
                                    </h2>

                                    <p className="mt-3 flex max-w-sm items-start gap-2.5 text-sm leading-relaxed text-[#F5EFE7]/85">
                                        <Wallet
                                            size={18}
                                            className="mt-0.5 shrink-0 text-[#9CD3B9]"
                                        />
                                        <span>
                      Bid on local jobs and withdraw directly to your bank
                      account the moment the customer signs off.
                    </span>
                                    </p>
                                </div>

                                <div className="pt-8">
                                    <Link
                                        to="/register?role=artisan"
                                        className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[#FFFCF6] px-7 text-sm font-semibold text-[#211B17] no-underline shadow-md transition-all hover:-translate-y-0.5 hover:bg-white"
                                    >
                                        <span>Join as an artisan</span>
                                        <ArrowRight size={16} />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Share Section */}
                <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
                    <div className="relative overflow-hidden rounded-3xl border border-line bg-cream p-8 shadow-card sm:p-12">
                        <div className="relative grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
                            <div className="max-w-xl">
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-copper">
                                    Good work travels
                                </p>
                                <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                                    Pass it on.
                                </h2>
                                <p className="mt-2.5 max-w-lg text-sm leading-relaxed text-muted sm:text-base">
                                    Send Craftad to someone who needs a reliable plumber,
                                    electrician, or carpenter. A trusted connection makes
                                    everyone&apos;s day easier.
                                </p>
                            </div>

                            <div className="relative rounded-2xl border border-line bg-paper p-5 shadow-card">
                                <ShareBar
                                    title="Share on social"
                                    text="Find a trusted artisan on Craftad. Post a job, compare quotes, and pay safely when work is finished."
                                />
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Clean Minimal Footer */}
            <footer className="border-t border-line bg-cream/60">
                <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 text-xs text-muted sm:flex-row sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3">
                        <SiteMark />
                        <span>
              © {new Date().getFullYear()} Craftad. Built for real trades.
            </span>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-6">
                        <a href="#how" className="no-underline transition-colors hover:text-ink">
                            How it works
                        </a>
                        <a href="#trades" className="no-underline transition-colors hover:text-ink">
                            Trades
                        </a>
                        <Link to="/login" className="no-underline transition-colors hover:text-ink">
                            Sign in
                        </Link>
                        <Link to="/register" className="no-underline transition-colors hover:text-ink">
                            Create account
                        </Link>
                    </div>
                </div>
            </footer>

            <FloatingThemeToggle />
        </div>
    );
}