import {
    Blocks,
    Sparkles,
    Sigma,
    FolderOpen,
    PenLine,
    FileDown,
    ArrowRight,
    Star,
} from "lucide-react";
import { SignInButton } from "@/components/auth/sign-in-button";
import { Reveal } from "@/components/landing/Reveal";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

const FEATURES = [
    {
        icon: Blocks,
        title: "Build with blocks",
        body: "Headings, code, tables, highlights — drop them in and reorder any time.",
    },
    {
        icon: Sparkles,
        title: "Summarize with AI",
        body: "Turn a dense page into a tight recap with a single click.",
    },
    {
        icon: Sigma,
        title: "Math & code, native",
        body: "LaTeX formulas and syntax-highlighted snippets that stay readable.",
    },
    {
        icon: FolderOpen,
        title: "Organized by subject",
        body: "Group notes into folders and star the ones you open most.",
    },
    {
        icon: PenLine,
        title: "Sketch by hand",
        body: "Draw diagrams and annotate freehand, right inside a note.",
    },
    {
        icon: FileDown,
        title: "Export clean PDFs",
        body: "Print or hand in a tidy PDF that keeps every block in place.",
    },
];

const STEPS = [
    {
        n: "01",
        title: "Add your blocks",
        body: "Start typing, or pick a block — heading, code, formula, table, or a canvas to draw on.",
    },
    {
        n: "02",
        title: "Let AI tighten it up",
        body: "Generate a summary that pulls the key points from across the whole page.",
    },
    {
        n: "03",
        title: "Export and share",
        body: "Download a clean PDF, ready for revision or submission.",
    },
];

/** Signature illustration: a student note that assembles itself, block by block. */
function HeroArt() {
    return (
        <div
            className="relative mx-auto w-full max-w-[440px]"
            aria-hidden="true"
        >
            {/* warm ambient glow */}
            <div
                className="pointer-events-none absolute -inset-8 rounded-[2.5rem]"
                style={{
                    background:
                        "radial-gradient(58% 58% at 72% 18%, rgba(217,154,43,0.20), transparent 70%)",
                }}
            />

            {/* the note page */}
            <div className="relative rounded-2xl border border-hairline bg-surface p-5 shadow-xl shadow-black/[0.06]">
                {/* window bar */}
                <div className="mb-4 flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-strong" />
                    <span className="h-2.5 w-2.5 rounded-full bg-strong" />
                    <span className="h-2.5 w-2.5 rounded-full bg-strong" />
                    <span className="ml-2 font-mono text-[11px] text-faint">
                        photosynthesis.md
                    </span>
                </div>

                <div className="space-y-3">
                    {/* heading block */}
                    <div
                        className="hero-block"
                        style={{ animationDelay: "120ms" }}
                    >
                        <div className="text-[15px] font-bold tracking-tight text-ink">
                            Photosynthesis
                        </div>
                        <div className="mt-1.5 h-1 w-24 rounded-full bg-brand-cta" />
                    </div>

                    {/* paragraph block */}
                    <div
                        className="hero-block space-y-1.5"
                        style={{ animationDelay: "240ms" }}
                    >
                        <div className="h-2 w-full rounded-full bg-hairline" />
                        <div className="h-2 w-11/12 rounded-full bg-hairline" />
                        <div className="h-2 w-3/5 rounded-full bg-hairline" />
                    </div>

                    {/* formula block */}
                    <div
                        className="hero-block rounded-lg border border-hairline bg-tint px-3 py-2.5"
                        style={{ animationDelay: "360ms" }}
                    >
                        <span className="font-mono text-[12px] leading-none text-ink">
                            6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂
                        </span>
                    </div>

                    {/* canvas / handwriting block */}
                    <div
                        className="hero-block rounded-lg border border-dashed border-strong bg-canvas px-3 py-2.5"
                        style={{ animationDelay: "480ms" }}
                    >
                        <svg
                            viewBox="0 0 200 34"
                            className="h-8 w-full"
                            fill="none"
                        >
                            <path
                                className="draw-path"
                                d="M6 24 C 38 4, 68 4, 94 20 S 150 34, 194 10"
                                stroke="var(--ds-accent-cta)"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                style={{ animationDelay: "760ms" }}
                            />
                        </svg>
                    </div>
                </div>
            </div>

            {/* floating: AI summary chip */}
            <div
                className="hero-block float-slow absolute -right-3 -top-3 flex items-center gap-1.5 rounded-full border border-hairline bg-elevated px-3 py-1.5 shadow-lg shadow-black/[0.08]"
                style={{ animationDelay: "820ms" }}
            >
                <Sparkles className="h-3.5 w-3.5 text-brand-cta" />
                <span className="text-[11px] font-medium text-ink">
                    Summary ready
                </span>
            </div>

            {/* floating: pinned chip */}
            <div
                className="hero-block absolute -bottom-3 -left-3 flex items-center gap-1.5 rounded-full border border-hairline bg-elevated px-3 py-1.5 shadow-lg shadow-black/[0.08]"
                style={{ animationDelay: "940ms" }}
            >
                <Star className="h-3.5 w-3.5 fill-current text-brand-cta" />
                <span className="text-[11px] font-medium text-ink">Pinned</span>
            </div>
        </div>
    );
}

export default async function LandingPage() {
    const session = await auth();
    if (session) redirect("/dashboard");

    return (
        <div className="min-h-screen w-full bg-canvas text-ink">
            <style>{`
                .hero-fade { opacity: 0; animation: heroFadeUp var(--ds-motion-enter) var(--ds-ease-out) both; }
                .hero-block { opacity: 0; animation: heroPop var(--ds-motion-enter) var(--ds-ease-out) both; }
                @keyframes heroFadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
                @keyframes heroPop { from { opacity: 0; transform: translateY(10px) scale(0.97); } to { opacity: 1; transform: none; } }
                .reveal { opacity: 0; transform: translateY(16px); transition: opacity 560ms var(--ds-ease-out), transform 560ms var(--ds-ease-out); }
                .reveal[data-shown="true"] { opacity: 1; transform: none; }
                .draw-path { stroke-dasharray: 260; stroke-dashoffset: 260; animation: ds-draw 1s var(--ds-ease-out) forwards; }
                .float-slow { animation: ds-float 6s ease-in-out infinite; }
                @media (prefers-reduced-motion: reduce) {
                    .hero-fade, .hero-block { animation: none !important; opacity: 1 !important; transform: none !important; }
                    .reveal { opacity: 1 !important; transform: none !important; transition: none !important; }
                    .draw-path { animation: none !important; stroke-dashoffset: 0 !important; }
                    .float-slow { animation: none !important; }
                }
            `}</style>

            {/* NAV */}
            <header className="sticky top-0 z-50 border-b border-hairline bg-canvas/80 backdrop-blur-md">
                <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
                    <a
                        href="#top"
                        className="flex items-center gap-2.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ds-focus-ring)]"
                    >
                        <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-cta text-[color:var(--ds-accent-contrast)]">
                            <Blocks className="h-[18px] w-[18px]" />
                        </span>
                        <span className="text-[15px] font-semibold tracking-tight">
                            Eton Note
                        </span>
                    </a>

                    <nav className="hidden items-center gap-1 md:flex">
                        <a
                            href="#features"
                            className="rounded-lg px-3 py-2 text-[13px] font-medium text-body outline-none transition-colors duration-150 hover:text-ink focus-visible:ring-2 focus-visible:ring-[color:var(--ds-focus-ring)]"
                        >
                            Features
                        </a>
                        <a
                            href="#how"
                            className="rounded-lg px-3 py-2 text-[13px] font-medium text-body outline-none transition-colors duration-150 hover:text-ink focus-visible:ring-2 focus-visible:ring-[color:var(--ds-focus-ring)]"
                        >
                            How it works
                        </a>
                        <a
                            href="#about"
                            className="rounded-lg px-3 py-2 text-[13px] font-medium text-body outline-none transition-colors duration-150 hover:text-ink focus-visible:ring-2 focus-visible:ring-[color:var(--ds-focus-ring)]"
                        >
                            About
                        </a>
                    </nav>

                    <SignInButton
                        label="Sign in"
                        size="sm"
                        variant="outline"
                        className="h-9 px-3.5 text-[13px]"
                    />
                </div>
            </header>

            {/* HERO */}
            <section
                id="top"
                className="relative overflow-hidden"
            >
                <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 pb-20 pt-16 md:grid-cols-2 md:gap-8 md:pb-28 md:pt-24">
                    <div>
                        <p
                            className="hero-fade font-mono text-[12px] font-medium uppercase tracking-[0.18em] text-brand-cta"
                            style={{ animationDelay: "40ms" }}
                        >
                            Built for students
                        </p>
                        <h1
                            className="hero-fade mt-4 text-[2.5rem] font-extrabold leading-[1.05] tracking-tight md:text-[3.4rem]"
                            style={{ animationDelay: "120ms" }}
                        >
                            Notes that build
                            <br className="hidden sm:block" /> themselves,{" "}
                            <span className="text-brand-cta">block by block.</span>
                        </h1>
                        <p
                            className="hero-fade mt-5 max-w-md text-[15px] leading-relaxed text-body md:text-base"
                            style={{ animationDelay: "200ms" }}
                        >
                            Mix headings, code, math, tables, and freehand
                            sketches into one page. Summarize it with AI, then
                            export a clean PDF — before class ends.
                        </p>
                        <div
                            className="hero-fade mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center"
                            style={{ animationDelay: "280ms" }}
                        >
                            <SignInButton label="Start for free" size="lg" />
                            <a
                                href="#features"
                                className="inline-flex h-11 items-center gap-1.5 rounded-lg px-4 text-[14px] font-medium text-body outline-none transition-colors duration-150 hover:bg-paper hover:text-ink focus-visible:ring-2 focus-visible:ring-[color:var(--ds-focus-ring)]"
                            >
                                See how it works
                                <ArrowRight className="h-4 w-4" />
                            </a>
                        </div>
                        <p
                            className="hero-fade mt-5 text-[12px] text-faint"
                            style={{ animationDelay: "360ms" }}
                        >
                            Free to start · Sign in with Google · Your notes stay
                            yours.
                        </p>
                    </div>

                    <div
                        className="hero-fade"
                        style={{ animationDelay: "240ms" }}
                    >
                        <HeroArt />
                    </div>
                </div>
            </section>

            {/* FEATURES */}
            <section
                id="features"
                className="border-t border-hairline bg-paper/60 py-20 md:py-28"
            >
                <div className="mx-auto max-w-6xl px-6">
                    <Reveal className="max-w-2xl">
                        <p className="font-mono text-[12px] font-medium uppercase tracking-[0.18em] text-brand-cta">
                            Everything in one page
                        </p>
                        <h2 className="mt-3 text-[1.75rem] font-bold tracking-tight md:text-[2.25rem]">
                            Every kind of note, without the mess.
                        </h2>
                        <p className="mt-4 text-[15px] leading-relaxed text-body">
                            Eton Note gives each idea its own block, so a single
                            page can hold a definition, a diagram, a proof, and a
                            snippet of code — and still read cleanly.
                        </p>
                    </Reveal>

                    <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {FEATURES.map((feature, i) => {
                            const Icon = feature.icon;
                            return (
                                <Reveal
                                    key={feature.title}
                                    delay={i * 60}
                                    className="group h-full rounded-xl border border-hairline bg-surface p-5 transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/[0.05]"
                                >
                                    <span className="grid h-10 w-10 place-items-center rounded-lg bg-tint text-brand-cta transition-colors duration-150 group-hover:bg-brand-soft">
                                        <Icon className="h-5 w-5" />
                                    </span>
                                    <h3 className="mt-4 text-[15px] font-semibold tracking-tight text-ink">
                                        {feature.title}
                                    </h3>
                                    <p className="mt-1.5 text-[13.5px] leading-relaxed text-body">
                                        {feature.body}
                                    </p>
                                </Reveal>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* HOW IT WORKS */}
            <section
                id="how"
                className="py-20 md:py-28"
            >
                <div className="mx-auto max-w-6xl px-6">
                    <Reveal className="max-w-2xl">
                        <p className="font-mono text-[12px] font-medium uppercase tracking-[0.18em] text-brand-cta">
                            From blank page to done
                        </p>
                        <h2 className="mt-3 text-[1.75rem] font-bold tracking-tight md:text-[2.25rem]">
                            Three steps, start to submit.
                        </h2>
                    </Reveal>

                    <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-6">
                        {STEPS.map((step, i) => (
                            <Reveal
                                key={step.n}
                                delay={i * 80}
                                className="relative"
                            >
                                <div className="font-mono text-[13px] font-semibold text-brand-cta">
                                    {step.n}
                                </div>
                                <div className="mt-3 h-px w-full bg-hairline" />
                                <h3 className="mt-4 text-[17px] font-semibold tracking-tight text-ink">
                                    {step.title}
                                </h3>
                                <p className="mt-2 text-[14px] leading-relaxed text-body">
                                    {step.body}
                                </p>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ABOUT */}
            <section
                id="about"
                className="border-t border-hairline bg-paper/60 py-20 md:py-28"
            >
                <div className="mx-auto max-w-3xl px-6">
                    <Reveal>
                        <p className="font-mono text-[12px] font-medium uppercase tracking-[0.18em] text-brand-cta">
                            About
                        </p>
                        <h2 className="mt-3 text-[1.75rem] font-bold tracking-tight md:text-[2.25rem]">
                            The notebook that keeps up with the lecture.
                        </h2>
                        <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-body">
                            <p>
                                Eton Note is a note-taking app for students who
                                think in pieces. Instead of one long text box,
                                every note is built from blocks — headings, code,
                                math, tables, images, and freehand sketches — that
                                you can rearrange, summarize with AI, and export
                                as a clean PDF when it&apos;s time to hand
                                something in.
                            </p>
                            <p>
                                It started as a tool for getting messy lecture
                                notes into a shape worth revising from. The goal
                                is simple: capture ideas the way they actually
                                arrive, then leave with something tidy enough to
                                study.
                            </p>
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 md:py-28">
                <div className="mx-auto max-w-6xl px-6">
                    <Reveal className="relative overflow-hidden rounded-2xl border border-hairline bg-surface px-6 py-14 text-center shadow-sm md:px-10">
                        <div
                            className="pointer-events-none absolute inset-0"
                            style={{
                                background:
                                    "radial-gradient(50% 80% at 50% 0%, rgba(217,154,43,0.12), transparent 70%)",
                            }}
                        />
                        <div className="relative">
                            <p className="font-mono text-[12px] font-medium uppercase tracking-[0.18em] text-brand-cta">
                                Ready when you are
                            </p>
                            <h2 className="mx-auto mt-3 max-w-xl text-[1.75rem] font-bold tracking-tight md:text-[2.4rem]">
                                Start your first note.
                            </h2>
                            <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-body">
                                Sign in and build a page in the next two minutes.
                            </p>
                            <div className="mt-8 flex justify-center">
                                <SignInButton label="Start for free" size="lg" />
                            </div>
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="border-t border-hairline">
                <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-2.5">
                        <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-cta text-[color:var(--ds-accent-contrast)]">
                            <Blocks className="h-[18px] w-[18px]" />
                        </span>
                        <div>
                            <div className="text-[14px] font-semibold tracking-tight text-ink">
                                Eton Note
                            </div>
                            <div className="text-[12px] text-muted-ink">
                                Notes that build themselves, block by block.
                            </div>
                        </div>
                    </div>

                    <nav className="flex items-center gap-5 text-[13px] text-body">
                        <a
                            href="#features"
                            className="rounded outline-none transition-colors duration-150 hover:text-ink focus-visible:ring-2 focus-visible:ring-[color:var(--ds-focus-ring)]"
                        >
                            Features
                        </a>
                        <a
                            href="#how"
                            className="rounded outline-none transition-colors duration-150 hover:text-ink focus-visible:ring-2 focus-visible:ring-[color:var(--ds-focus-ring)]"
                        >
                            How it works
                        </a>
                        <a
                            href="#about"
                            className="rounded outline-none transition-colors duration-150 hover:text-ink focus-visible:ring-2 focus-visible:ring-[color:var(--ds-focus-ring)]"
                        >
                            About
                        </a>
                    </nav>

                    <p className="text-[12px] text-faint">© 2026 Eton Note</p>
                </div>
            </footer>
        </div>
    );
}
