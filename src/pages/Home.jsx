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
        <div className="min-h-screen bg-paper text-ink transition-colors duration-200">

            {/* Top Header Navigation */}
            <header className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
                <Link to="/" className="flex items-center no-underline transition-opacity hover:opacity-80">
                    <SiteMark />
                </Link>
                <nav className="flex items-center gap-4 text-sm font-medium">
                    <a href="#how" className="hidden min-h-11 items-center px-3 text-muted no-underline sm:inline-flex hover:text-ink transition-colors">How it works</a>
                    <Link to="/login" className="inline-flex min-h-11 items-center px-4 font-medium text-ink no-underline hover:text-copper transition-colors">Sign in</Link>
                    <Link to="/register" className="inline-flex min-h-11 items-center rounded-full bg-copper px-5 font-semibold text-white no-underline transition-all hover:bg-copper-deep shadow-sm">Get started</Link>
                </nav>
            </header>

            {/* Hero Section */}
            <section className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-20 pt-8 sm:px-6 lg:grid-cols-2 lg:px-8 lg:pb-28">
                <div className="space-y-6">
                    <div className="inline-flex items-center gap-2 rounded-full bg-copper/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-copper border border-copper/20">
                        <span>Verified artisan marketplace</span>
                    </div>

                    <h1 className="max-w-xl font-display text-4xl leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl text-ink">
                        Real trades. Clear prices.
                    </h1>

                    <p className="max-w-lg text-base leading-relaxed text-muted sm:text-lg">
                        Craftad brings customers and skilled artisans together. Describe the work, compare applications, agree on the price, and keep conversation and payment tied securely to the job.
                    </p>

                    <div className="flex flex-wrap gap-4 pt-2">
                        <Link to="/register" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-copper px-7 font-semibold text-white no-underline transition-all hover:bg-copper-deep shadow-md">
                            <span>I need work done</span> <ArrowRight size={18} />
                        </Link>
                        <Link to="/register" className="inline-flex min-h-12 items-center rounded-full border border-line bg-cream px-7 font-semibold text-ink no-underline transition-all hover:border-copper hover:bg-paper shadow-sm">
                            I’m an artisan
                        </Link>
                    </div>
                </div>

                <figure className="relative isolate overflow-hidden rounded-[2.5rem] border border-line bg-cream shadow-2xl">
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

                    <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-gradient-to-t from-[#0f0d0b]/90 via-[#0f0d0b]/40 to-transparent px-6 pb-6 pt-16 text-sm text-[#f4efe6]">
                        <span className="font-medium">
                            On the job, not a directory listing
                        </span>
                        <span className="shrink-0 rounded-full border border-white/20 bg-black/40 px-3.5 py-1.5 text-xs backdrop-blur-md text-white">
                            Customer’s home
                        </span>
                    </figcaption>
                </figure>
            </section>

            {/* Trust Badges Bar */}
            <section className="border-y border-line bg-cream transition-colors duration-200">
                <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-3 sm:px-6 lg:px-8">
                    {[
                        { icon: ShieldCheck, title: "Escrow, not a handshake", copy: "Money is held securely until the customer confirms the work is finished." },
                        { icon: MessageSquare, title: "One thread per job", copy: "Customer and assigned artisan share an isolated chat history for that job only." },
                        { icon: Star, title: "Reviews after the work", copy: "Completed jobs can be rated so the next hire is completely transparent." },
                    ].map(({ icon: Icon, title, copy }) => (
                        <div key={title} className="flex gap-4">
                            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-paper text-copper border border-line shadow-sm">
                                <Icon size={22} />
                            </span>
                            <div>
                                <h2 className="font-display text-lg text-ink">{title}</h2>
                                <p className="mt-1 text-sm leading-relaxed text-muted">{copy}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how" className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
                <div className="max-w-xl">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-copper">
                        SIMPLE FROM START TO FINISH
                    </p>

                    <h2 className="mt-2 font-display text-3xl tracking-tight sm:text-5xl text-ink">
                        How a job moves
                    </h2>

                    <p className="mt-3 text-base leading-relaxed text-muted">
                        A clear, transparent process keeps customers and artisans completely aligned, from the initial service request to final escrow payout.
                    </p>
                </div>

                <ol className="mt-12 grid gap-6 md:grid-cols-3">
                    {steps.map((step, index) => (
                        <li
                            key={step.n}
                            className="group relative overflow-hidden rounded-[2rem] border border-line bg-cream p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                        >
                            <div className="flex items-center justify-between">
                                <span className="font-display text-5xl text-copper/30">
                                    {step.n}
                                </span>
                                <span className="grid h-10 w-10 place-items-center rounded-full border border-line text-xs font-bold text-muted transition-colors group-hover:border-copper group-hover:bg-copper group-hover:text-white">
                                    {index + 1}
                                </span>
                            </div>

                            <div className="mt-8 h-1 w-12 rounded-full bg-copper transition-all duration-300 group-hover:w-20" />

                            <h3 className="mt-6 font-display text-2xl text-ink">
                                {step.title}
                            </h3>

                            <p className="mt-2.5 text-sm leading-relaxed text-muted">
                                {step.copy}
                            </p>
                        </li>
                    ))}
                </ol>
            </section>

            {/* Trades Showcase */}
            <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-copper">
                            FIND YOUR TRADE
                        </p>
                        <h2 className="mt-2 font-display text-3xl tracking-tight sm:text-4xl text-ink">
                            Trades on Craftad
                        </h2>
                    </div>

                    <p className="max-w-sm text-sm leading-relaxed text-muted">
                        From everyday home repairs to specialized craftsmanship, find verified professionals for the job.
                    </p>
                </div>

                <div className="mt-10 grid gap-6 md:grid-cols-3">
                    {trades.map((trade) => (
                        <article
                            key={trade.name}
                            className="group overflow-hidden rounded-[2rem] border border-line bg-cream transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                        >
                            <div className="overflow-hidden bg-paper">
                                <img
                                    src={trade.img}
                                    alt={`${trade.name} services on Craftad`}
                                    loading="lazy"
                                    className="aspect-[16/11] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                            </div>

                            <div className="p-7">
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-copper">
                                    Skilled professionals
                                </p>

                                <h3 className="mt-2 font-display text-2xl text-ink">
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

            {/* Customer & Artisan Role Cards */}
            <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
                <div className="grid gap-6 md:grid-cols-2">

                    {/* Customer Card (Static Dark Accent Banner) */}
                    <div className="group relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#1a1714] via-[#241d17] to-copper-deep p-8 text-[#f4efe6] sm:p-10 shadow-xl">
                        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full border border-white/10 bg-white/5 blur-2xl" />
                        <div className="absolute -right-5 -top-5 h-32 w-32 rounded-full border border-white/10" />

                        <div className="relative">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-copper">
                                For customers
                            </p>

                            <h2 className="mt-4 max-w-md font-display text-3xl leading-tight sm:text-4xl text-white">
                                Post once. Compare offers. Stay in the loop.
                            </h2>

                            <p className="mt-3 max-w-sm text-sm leading-relaxed text-[#f4efe6]/80">
                                Describe what needs fixing, evaluate artisan applications, and choose the right verified professional for your project.
                            </p>

                            <Link
                                to="/register"
                                className="mt-8 inline-flex min-h-12 items-center rounded-full bg-white px-7 text-sm font-semibold text-ink no-underline transition-all hover:bg-copper hover:text-white shadow-md"
                            >
                                Create a customer account
                            </Link>
                        </div>
                    </div>

                    {/* Artisan Card */}
                    <div className="group relative overflow-hidden rounded-[2rem] border border-line bg-cream p-8 sm:p-10 shadow-sm transition-colors duration-200">
                        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full border border-copper/10 bg-copper/5 blur-xl" />

                        <div className="relative">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-copper">
                                For artisans
                            </p>

                            <h2 className="mt-4 max-w-md font-display text-3xl leading-tight text-ink sm:text-4xl">
                                Open jobs, your price, your wallet.
                            </h2>

                            <p className="mt-3 flex items-center gap-2 text-sm leading-relaxed text-muted">
                                <Wallet size={18} className="shrink-0 text-copper" />
                                Withdraw directly when the customer confirms completion.
                            </p>

                            <Link
                                to="/register"
                                className="mt-8 inline-flex min-h-12 items-center rounded-full bg-copper px-7 text-sm font-semibold text-white no-underline transition-all hover:bg-copper-deep shadow-md"
                            >
                                Join as an artisan
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Share Section */}
            <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
                <div className="relative overflow-hidden rounded-[2rem] border border-line bg-cream p-8 sm:p-12 shadow-sm transition-colors duration-200">
                    <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full border border-copper/10" />
                    <div className="absolute -right-8 -top-12 h-48 w-48 rounded-full border border-copper/10" />

                    <div className="relative grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
                        <div className="max-w-xl">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-copper">
                                GOOD WORK TRAVELS
                            </p>

                            <h2 className="mt-2 font-display text-3xl tracking-tight text-ink sm:text-4xl">
                                Pass it on.
                            </h2>

                            <p className="mt-2.5 max-w-lg text-sm leading-relaxed text-muted sm:text-base">
                                Send Craftad to someone who needs a plumber, carpenter, or reliable day-to-day work. A trusted connection makes everyone's day easier.
                            </p>
                        </div>

                        <div className="relative rounded-2xl border border-line bg-paper p-6 shadow-sm">
                            <ShareBar
                                title="Share on social"
                                text="Find a trusted artisan on Craftad. Post a job, compare quotes, and pay safely when work is finished."
                            />
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
}