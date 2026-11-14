import Image from "next/image";
import { redirect } from "next/navigation";
import {
    ArrowRight,
    ArrowUpRight,
    Check,
    CloudCheck,
    Copy,
    FileDown,
    FolderOpen,
    GripVertical,
    ListPlus,
    LockKeyhole,
    Search,
} from "lucide-react";
import { auth } from "@/auth";
import { SignInButton } from "@/components/auth/sign-in-button";
import {
    LANDING_ASSETS,
    type LandingAsset,
} from "@/components/landing/assets";
import ThemeToggle from "@/components/ThemeToggle";
import PublicFooter from "@/components/public/PublicFooter";
import JsonLd from "@/components/seo/JsonLd";
import { publicMetadata, SITE_DESCRIPTION, SITE_SCHEMA } from "@/lib/seo";
import styles from "./landing.module.css";

export const metadata = publicMetadata({
    title: "Beautiful study notes, less busywork",
    description: SITE_DESCRIPTION,
    path: "/",
});

const NAV_LINKS = [
    { href: "#features", label: "Features" },
    { href: "#designs", label: "Designs" },
    { href: "#ai", label: "AI generation" },
    { href: "#how", label: "How it works" },
];

const BLOCK_TOOLS = [
    {
        icon: GripVertical,
        title: "Rearrange freely",
        body: "Move blocks into the order that makes sense.",
    },
    {
        icon: Copy,
        title: "Reuse what works",
        body: "Duplicate a block, or copy and paste it into another note.",
    },
    {
        icon: ListPlus,
        title: "Add anywhere",
        body: "Insert between blocks. Edit or delete whenever you need.",
    },
    {
        icon: Search,
        title: "Find the right piece",
        body: "Search a block’s title or content instead of scrolling.",
    },
];

const WORKFLOW = [
    {
        icon: FolderOpen,
        title: "Give every subject a home",
        body: "Create a note, give it a title, and choose a subject—or create a new subject on the spot. Jump between notes in the same subject right from the editor.",
        detail: "Favorites and pinned notes keep the essentials close.",
    },
    {
        icon: CloudCheck,
        title: "Keep creating. Stay saved.",
        body: "Autosave takes care of your changes as you work. Undo and redo give you room to rethink, and the outline and preview help you return to the big picture.",
        detail: "Your focus belongs on the topic, not the save button.",
    },
    {
        icon: FileDown,
        title: "Revise wherever you are",
        body: "Export a PDF that keeps your note’s designed structure. Download it for offline revision, print it, or send it to your classmates.",
        detail: "From your screen to your study desk, still neatly organized.",
    },
];

function ProductPreview({
    asset,
    sizes,
}: {
    asset: LandingAsset;
    sizes: string;
}) {
    return (
        <figure className={styles.productPreview}>
            <div className={styles.previewFrame}>
                <Image
                    src={asset.src}
                    alt={asset.alt}
                    width={asset.width}
                    height={asset.height}
                    sizes={sizes}
                    className={styles.productImage}
                />
            </div>
            <figcaption className={styles.previewCaption}>
                {asset.caption}
            </figcaption>
        </figure>
    );
}

export default async function LandingPage() {
    const session = await auth();
    if (session) redirect("/dashboard");

    return (
        <div className={styles.page}>
            <JsonLd data={SITE_SCHEMA} />
            <a href="#main-content" className={styles.skipLink}>
                Skip to content
            </a>

            <header className={styles.header}>
                <div className={`${styles.container} ${styles.headerInner}`}>
                    <a href="#top" className={styles.brand} aria-label="Eton Note home">
                        <Image src="/logo.png" width={34} height={33} alt="" />
                        <span>Eton Note</span>
                    </a>
                    <nav aria-label="Main navigation" className={styles.headerNav}>
                        {NAV_LINKS.map((link) => (
                            <a key={link.href} href={link.href}>
                                {link.label}
                            </a>
                        ))}
                    </nav>
                    <div className={styles.headerActions}>
                        <ThemeToggle className={styles.themeToggle} />
                        <SignInButton
                            label="Sign in"
                            size="sm"
                            variant="outline"
                            className={styles.headerSignIn}
                        />
                    </div>
                </div>
            </header>

            <main id="main-content" tabIndex={-1}>
                <section id="top" className={styles.hero} aria-labelledby="hero-title">
                    <div className={`${styles.container} ${styles.heroGrid}`}>
                        <div className={styles.heroCopy}>
                            <h1 id="hero-title" className={styles.heroTitle}>
                                Beautiful notes.
                                <br />
                                <span>Less busywork.</span>
                            </h1>
                            <p className={styles.heroLead}>
                                Create clear, structured study notes with text,
                                equations, code, tables, and drawings. Pick a
                                design, make it yours, and get back to learning.
                            </p>
                            <div className={styles.heroActions}>
                                <SignInButton
                                    label="Start for free"
                                    size="lg"
                                    className={styles.primaryButton}
                                />
                                <a href="#features" className={styles.textLink}>
                                    Explore the editor
                                    <ArrowRight size={17} aria-hidden="true" />
                                </a>
                            </div>
                            <p className={styles.reassurance}>
                                <Check size={15} aria-hidden="true" />
                                Free to start
                                <span aria-hidden="true">·</span>
                                Continue with Google
                            </p>
                        </div>

                        <figure className={styles.heroNote}>
                            <a
                                href={LANDING_ASSETS.note.src}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.noteLink}
                                aria-label="View the sample physics note at full size (opens in a new tab)"
                            >
                                <Image
                                    src={LANDING_ASSETS.note.src}
                                    alt={LANDING_ASSETS.note.alt}
                                    width={LANDING_ASSETS.note.width}
                                    height={LANDING_ASSETS.note.height}
                                    sizes="(max-width: 719px) calc(100vw - 48px), (max-width: 1199px) 34vw, 384px"
                                    loading="eager"
                                    fetchPriority="high"
                                    className={styles.noteImage}
                                />
                            </a>
                            <figcaption className={styles.noteCaption}>
                                <span>{LANDING_ASSETS.note.caption}</span>
                                <a
                                    href={LANDING_ASSETS.note.src}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="View the sample note at full size (opens in a new tab)"
                                >
                                    View full size
                                    <ArrowUpRight size={14} aria-hidden="true" />
                                </a>
                            </figcaption>
                        </figure>
                    </div>
                </section>

                <section id="features" className={styles.section} aria-labelledby="features-title">
                    <div className={styles.container}>
                        <div className={styles.sectionIntro}>
                            <h2 id="features-title">One page. Every kind of idea.</h2>
                            <p>
                                A definition, a diagram, a worked example. Give
                                each part its own block, and bring it all together
                                in a note that makes sense when you come back to it.
                            </p>
                        </div>
                        <div className={styles.editorGrid}>
                            <ProductPreview
                                asset={LANDING_ASSETS.editor}
                                sizes="(max-width: 899px) calc(100vw - 48px), (max-width: 1199px) 60vw, 704px"
                            />
                            <div className={styles.blockGroups}>
                                <div>
                                    <h3>Text, definitions &amp; examples</h3>
                                    <p>
                                        Write rich text or paste from ChatGPT and
                                        other sources, keeping supported formatting.
                                        Give definitions and examples their own
                                        styled blocks.
                                    </p>
                                    <p className={styles.smallCopy}>
                                        Bold, italic, underline, highlights,
                                        alignment, and lists. Add headings and
                                        dividers for a clear structure.
                                    </p>
                                </div>
                                <div>
                                    <h3>Math, code &amp; comparisons</h3>
                                    <p>
                                        Render LaTeX inside text with <code>$$…$$</code>,
                                        or use a dedicated formula block. Add
                                        syntax-highlighted code and tables for
                                        side-by-side comparisons.
                                    </p>
                                </div>
                                <div>
                                    <h3>Images, drawings &amp; diagrams</h3>
                                    <p>
                                        Upload an image or place one inside your
                                        text. Sketch flowcharts, circuit diagrams,
                                        and freehand explanations in the integrated
                                        drawing panel.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className={styles.blockManagement}>
                            <div>
                                <h3>Your ideas can move.</h3>
                                <p>Change the order without starting over.</p>
                            </div>
                            <ul className={styles.blockTools}>
                                {BLOCK_TOOLS.map((tool) => (
                                    <li key={tool.title}>
                                        <tool.icon size={19} aria-hidden="true" />
                                        <div>
                                            <h4>{tool.title}</h4>
                                            <p>{tool.body}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <a href="/features" className={styles.textLink}>
                            See all study-note features
                            <ArrowRight size={17} aria-hidden="true" />
                        </a>
                    </div>
                </section>

                <section id="designs" className={`${styles.section} ${styles.softSection}`} aria-labelledby="designs-title">
                    <div className={`${styles.container} ${styles.featureGrid}`}>
                        <div className={styles.featureCopy}>
                            <h2 id="designs-title">
                                Good design, without designing everything.
                            </h2>
                            <p>
                                Choose a preset for your block, then customize
                                its colors. Make definitions, examples, headings,
                                and formulas stand out without styling every
                                detail by hand.
                            </p>
                            <ul className={styles.simpleList}>
                                <li><Check size={16} aria-hidden="true" />Ready-made block designs</li>
                                <li><Check size={16} aria-hidden="true" />Color choices to make them yours</li>
                            </ul>
                            <p className={styles.supportingCopy}>
                                Your workspace has its own themes, too—including
                                light and dark. A comfortable editor and a
                                beautiful note belong together.
                            </p>
                        </div>
                        <ProductPreview
                            asset={LANDING_ASSETS.designs}
                            sizes="(max-width: 899px) calc(100vw - 48px), (max-width: 1199px) 48vw, 576px"
                        />
                    </div>
                </section>

                <section id="ai" className={styles.section} aria-labelledby="ai-title">
                    <div className={`${styles.container} ${styles.featureGrid} ${styles.reverseGrid}`}>
                        <div className={styles.featureCopy}>
                            <h2 id="ai-title">
                                Bring the topic. Let AI help with the first draft.
                            </h2>
                            <p>
                                Describe what you’re studying and the content
                                you need. AI generates structured blocks you can
                                review, edit, rearrange, and style just like any
                                other part of your note.
                            </p>
                            <blockquote className={styles.prompt}>
                                “Create study notes on Newton’s laws of motion.
                                Include definitions, formulas, and worked examples.”
                            </blockquote>
                            <p className={styles.supportingCopy}>
                                A useful starting point, with you in control.
                                Review your draft against your textbooks and
                                course materials.
                            </p>
                        </div>
                        <ProductPreview
                            asset={LANDING_ASSETS.ai}
                            sizes="(max-width: 899px) calc(100vw - 48px), (max-width: 1199px) 48vw, 576px"
                        />
                    </div>
                </section>

                <section id="how" className={`${styles.section} ${styles.softSection}`} aria-labelledby="how-title">
                    <div className={styles.container}>
                        <div className={styles.sectionIntro}>
                            <h2 id="how-title">Made for the whole study routine.</h2>
                            <p>
                                Start with a subject. Build your understanding.
                                Leave with something worth revising from.
                            </p>
                        </div>
                        <ol className={styles.workflow}>
                            {WORKFLOW.map((step) => (
                                <li key={step.title}>
                                    <step.icon size={23} aria-hidden="true" />
                                    <h3>{step.title}</h3>
                                    <p>{step.body}</p>
                                    <p className={styles.smallCopy}>{step.detail}</p>
                                </li>
                            ))}
                        </ol>
                        <p className={styles.privacyNote}>
                            <LockKeyhole size={16} aria-hidden="true" />
                            Private by default. Choose a public, read-only link
                            when you want to share. Viewers sign in to read it.
                        </p>
                        <a href="/guides" className={styles.textLink}>
                            Read the step-by-step study guides
                            <ArrowRight size={17} aria-hidden="true" />
                        </a>
                    </div>
                </section>

                <section id="about" className={`${styles.section} ${styles.closing}`} aria-labelledby="about-title">
                    <div className={`${styles.container} ${styles.closingGrid}`}>
                        <div>
                            <h2 id="about-title">
                                Less time formatting.
                                <br />
                                More time understanding.
                            </h2>
                            <p>
                                Eton Note started with a simple frustration:
                                academic notes took too much time to format.
                                Now writing, diagrams, design, and AI assistance
                                come together—so you can focus on learning.
                            </p>
                        </div>
                        <div className={styles.closingAction}>
                            <SignInButton
                                label="Create your first note"
                                size="lg"
                                className={styles.primaryButton}
                            />
                            <p>Free to start. Continue with Google.</p>
                        </div>
                    </div>
                </section>
            </main>

            <PublicFooter homeHref="#top" />
        </div>
    );
}
