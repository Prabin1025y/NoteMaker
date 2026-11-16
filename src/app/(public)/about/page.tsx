import PublicDocument, { type DocumentSection } from "@/components/public/PublicDocument";
import { LEGAL_DETAILS } from "@/lib/legal";
import { publicMetadata } from "@/lib/seo";

const description = "Eton Note is a learning-focused, block-based notebook that brings explanations, equations, code, images, and diagrams into one study page.";
export const metadata = publicMetadata({ title: "About Eton Note", description, path: "/about" });

const sections: DocumentSection[] = [
    {
        id: "purpose", title: "Less formatting, more understanding",
        content: <>
            <p>Study material rarely comes in one format. A lecture might need an explanation, a formula, a diagram, and a worked example. Eton Note brings those pieces together without asking every idea to fit into the same kind of text box.</p>
            <p>The goal is a note you can return to and understand—not simply a page that looks finished. Each piece remains editable and movable as you learn more about the topic.</p>
        </>,
    },
    {
        id: "learners", title: "Built around the learner’s notebook",
        content: <>
            <p>Eton Note is for students and self-directed learners capturing course material, organizing it by subject, and revisiting it for revision. Text, LaTeX, code, tables, images, and drawings can live in a single note.</p>
            <p>Presets support readable presentation. Subjects, search, favorites, and pinned notes support finding things again. AI assistance and PDF export serve that notebook workflow rather than replacing your judgment.</p>
            <p><a href="/features">Explore the implemented features</a> or <a href="/guides">start with a practical study-note guide</a>.</p>
        </>,
    },
    {
        id: "control", title: "You choose what to write and share",
        content: <>
            <p>Notes are private by default. Sharing is an explicit owner choice, and shared viewing is read-only and currently requires sign-in. An AI result is a draft for you to check and edit, not a guaranteed answer.</p>
            <p>The current setup has no optional analytics or advertising tracking. The draft policies explain authentication, provider processing, uploaded image URLs, and the current limits of deletion and recovery.</p>
        </>,
    },
    {
        id: "status", title: "What is available, and what is still being prepared",
        content: <>
            <p>Google sign-in, mixed-content notes, subject organization, prompt-based AI generation, and PDF export are part of the current application. Eton Note is free to start; that is not a promise about every future feature or plan.</p>
            <p>Account deletion from Settings is planned before production release but is not currently available. There are no application-managed backups at present. The <a href="/faq">FAQ</a> distinguishes current functionality from planned behavior.</p>
            <p>The confirmed jurisdiction is {LEGAL_DETAILS.country}. Operator identity and real contact details are being finalized; see the <a href="/contact">Contact page</a>. Legal policies remain clearly marked as drafts until those details and legal review are complete.</p>
        </>,
    },
];

export default function AboutPage() {
    return <PublicDocument title="About Eton Note" description={description} path="/about" sections={sections} schemaType="AboutPage" />;
}
