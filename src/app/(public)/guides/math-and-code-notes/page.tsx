import PublicDocument, { type DocumentSection } from "@/components/public/PublicDocument";
import { GUIDES } from "@/lib/guides";
import { publicMetadata } from "@/lib/seo";
import styles from "@/components/public/public.module.css";

const guide = GUIDES.mathAndCode;
export const metadata = publicMetadata({ ...guide, article: true });

const sections: DocumentSection[] = [
    {
        id: "explanation", title: "Put the explanation before the notation",
        content: <>
            <p>A page of equations or code can be technically correct and still be difficult to revise. Begin with the question the notation answers, then keep the definition, formula, example, and interpretation in separate blocks.</p>
            <p>For Newton’s second law, explain that net force relates mass to acceleration before introducing the symbols. State the assumptions of the example—for instance, a constant mass and a net force in one direction—so a reader knows when the relationship is being used.</p>
        </>,
    },
    {
        id: "latex", title: "Add a formula block or math inside text",
        content: <>
            <p>Add a formula block and enter the LaTeX expression in its <strong>Formula</strong> field. Use the formula preview to catch missing braces or unsupported notation before saving the block. A dedicated formula field takes the expression itself, for example:</p>
            <pre role="region" aria-label="LaTeX formula example" tabIndex={0}><code>{String.raw`F = ma, \qquad a = \frac{F}{m}`}</code></pre>
            <p>When the equation belongs inside a rich-text explanation, the editor supports notation enclosed with <code>$$…$$</code>, such as <code>{String.raw`$$a = \frac{F}{m}$$`}</code>. Check the rendered result; copying from another tool can introduce mismatched delimiters or characters.</p>
            <p>Define every symbol and keep units visible. Formula rendering makes notation readable; it does not check your physics, solve the equation, or verify a derivation.</p>
        </>,
    },
    {
        id: "example", title: "Work through one complete example",
        content: <>
            <p>Suppose the net force is 20 N and the mass is 4 kg. Write the known values, the relationship, and the substitution: 20 N ÷ 4 kg = 5 m/s². Then explain what the result means—the object accelerates at 5 m/s² in the direction of the net force.</p>
            <p>A small table can keep symbols, meanings, and units together:</p>
            <div className={styles.tableWrap} role="region" aria-label="Example physics symbol table" tabIndex={0}>
                <table>
                    <caption>Symbols in the example</caption>
                    <thead><tr><th scope="col">Symbol</th><th scope="col">Meaning</th><th scope="col">SI unit</th></tr></thead>
                    <tbody>
                        <tr><th scope="row">F</th><td>Net force</td><td>newton (N)</td></tr>
                        <tr><th scope="row">m</th><td>Mass</td><td>kilogram (kg)</td></tr>
                        <tr><th scope="row">a</th><td>Acceleration</td><td>metres per second squared (m/s²)</td></tr>
                    </tbody>
                </table>
            </div>
            <p className={styles.tableHint}>Scroll the example table sideways if it does not fit your screen.</p>
        </>,
    },
    {
        id: "code", title: "Use a code block for the smallest useful program",
        content: <>
            <p>Add a code block, choose the matching language, and keep the example focused on one idea. This Python example expresses the same calculation and rejects a non-positive mass:</p>
            <pre role="region" aria-label="Python acceleration example" tabIndex={0}><code>{'def acceleration(force_n, mass_kg):\n    if mass_kg <= 0:\n        raise ValueError("Mass must be positive")\n    return force_n / mass_kg\n\nacceleration(20, 4)  # 5.0, in m/s²'}</code></pre>
            <p>Explain the inputs and expected output in an adjacent text block. Eton Note provides editing and syntax highlighting, not a promise that code is executed or tested in the notebook. Run an example in the appropriate environment before treating it as verified.</p>
        </>,
    },
    {
        id: "diagrams", title: "Draw relationships that text cannot show clearly",
        content: <>
            <p>Use the drawing panel for a force diagram, circuit, flowchart, or annotated sketch. Label the important parts and keep the diagram next to its explanation. A drawing should answer a question, not simply fill an empty area.</p>
            <p>For the force example, show the object, the direction of the net force, and the direction of acceleration. For an algorithm, show the decision or repeated step that the code is illustrating.</p>
            <p>You can also upload a reference image, but only when you have permission to use it. Current Cloudinary URLs are not confidential storage; do not upload an image that needs private, access-controlled delivery.</p>
        </>,
    },
    {
        id: "review", title: "Check the technical content and the saved result",
        content: <>
            <ul>
                <li>Read the explanation without the equation. Is the relationship still understandable?</li>
                <li>Check symbols, units, assumptions, and any cited source.</li>
                <li>Verify code independently, including a meaningful boundary case.</li>
                <li>Inspect formula and drawing previews for clarity, then confirm the note has saved.</li>
                <li>If you used AI, check its output against reliable sources rather than accepting its formatting as proof.</li>
            </ul>
            <p>Use <a href="/guides/export-and-share-notes">the export and sharing guide</a> to review how the finished page appears in a PDF, or return to <a href="/guides/create-study-notes">organizing notes for revision</a>.</p>
        </>,
    },
];

export default function MathAndCodeGuide() {
    return <PublicDocument {...guide} sections={sections} schemaType="Article"
        breadcrumbs={[{ href: "/", label: "Home" }, { href: "/guides", label: "Study guides" }]}
        related={[{ href: GUIDES.studyNotes.path, label: "Organize study notes" }, { href: GUIDES.exportAndShare.path, label: "PDFs and sharing" }]} />;
}
