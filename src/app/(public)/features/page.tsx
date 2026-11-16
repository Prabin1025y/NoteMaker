import Image from "next/image";
import PublicDocument, { type DocumentSection } from "@/components/public/PublicDocument";
import { LANDING_ASSETS, type LandingAsset } from "@/components/landing/assets";
import { publicMetadata } from "@/lib/seo";

const description = "Explore Eton Note’s block editor: rich text, LaTeX, code, tables, images, drawings, subject organization, AI drafts, and PDF export.";
export const metadata = publicMetadata({ title: "Study-note features", description, path: "/features" });

function Preview({ asset }: { asset: LandingAsset }) {
    return <figure>
        <Image src={asset.src} alt={asset.alt} width={asset.width} height={asset.height} sizes="(max-width: 719px) calc(100vw - 48px), 700px" />
        <figcaption>{asset.caption}</figcaption>
    </figure>;
}

const sections: DocumentSection[] = [
    {
        id: "blocks", title: "Keep different kinds of material together",
        content: <>
            <p>Build a study note from independently editable blocks. Separate a definition, a worked example, and a diagram so you can move or revise one without rebuilding the whole page.</p>
            <dl>
                <dt>Text, headings, and dividers</dt><dd>Write formatted explanations, lists, definitions, and examples. Supported formatting can be preserved when pasting from other sources.</dd>
                <dt>LaTeX, code, and tables</dt><dd>Use formula blocks or supported math notation inside text, syntax-highlighted code, and tables for comparisons.</dd>
                <dt>Images and freehand drawings</dt><dd>Upload reference images, add images inside text, or draw diagrams and sketches in the integrated canvas.</dd>
            </dl>
            <Preview asset={LANDING_ASSETS.editor} />
            <p><a href="/guides/math-and-code-notes">See a practical workflow for math and code notes</a>.</p>
        </>,
    },
    {
        id: "block-management", title: "Rearrange, reuse, and find your ideas",
        content: <>
            <p>Drag blocks into a useful order, duplicate a block, copy and paste it into another note, or insert new material between existing blocks. Edit or delete the pieces you no longer need.</p>
            <p>Search block titles or content, and use the outline to move to a particular part of your note. Undo, redo, and preview support the process of revising rather than treating your first arrangement as final.</p>
        </>,
    },
    {
        id: "design", title: "Use designs without formatting every detail",
        content: <>
            <p>Choose a preset design for a block, then adjust its color option. Use a consistent visual treatment for definitions, examples, headings, and formulas so their roles remain clear when you return to the note.</p>
            <p>Workspace themes, including light and dark appearances, are separate from the content of your note. Pick a comfortable editing view without making the design of the page do every job at once.</p>
            <Preview asset={LANDING_ASSETS.designs} />
        </>,
    },
    {
        id: "organization", title: "Give each subject a home",
        content: <>
            <p>Create a note within an existing subject/folder or create a subject as you make the note. Dashboard search, favorites, pinned notes, sorting, and grid/list views help you return to the material you need.</p>
            <p>The editor supports autosave and manual saving. Check the save status after changes; network availability still matters, and autosave is not a separate backup.</p>
            <p><a href="/guides/create-study-notes">Learn how to organize notes for revision</a>.</p>
        </>,
    },
    {
        id: "ai", title: "Start from an AI-generated draft",
        content: <>
            <p>Describe the topic and the kinds of blocks you need in AI Block Generator. The configured external AI endpoint can return structured blocks that you review, edit, rearrange, and style like other note content.</p>
            <p>The current integration sends the prompt you enter, not automatically the entire open note. Ask for a focused definition, example, or comparison, avoid confidential information, and verify the result against your textbooks or course materials.</p>
        </>,
    },
    {
        id: "export-sharing", title: "Take a PDF, or choose a read-only link",
        content: <>
            <p>Export the saved note through the configured PDF service for offline reading or printing. The export drawer controls subject name, note title, author name, and page numbers in the PDF’s headers and footers. The Eton Note watermark is always included.</p>
            <p>Notes stay private unless you explicitly enable public sharing. Shared links currently require viewers to sign in and provide read-only access. You can make the source note private again, but copies already downloaded or captured cannot be recalled.</p>
            <p>Uploaded image URLs are not private access-controlled storage. See the <a href="/privacy#sharing">sharing and image-URL details</a> before uploading sensitive material.</p>
            <p><a href="/guides/export-and-share-notes">Follow the PDF export and sharing guide</a>.</p>
        </>,
    },
];

export default function FeaturesPage() {
    return <PublicDocument title="Study-note features" description={description} path="/features" sections={sections} />;
}
