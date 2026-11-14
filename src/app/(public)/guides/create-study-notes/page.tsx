import PublicDocument, { type DocumentSection } from "@/components/public/PublicDocument";
import { GUIDES } from "@/lib/guides";
import { publicMetadata } from "@/lib/seo";

const guide = GUIDES.studyNotes;
export const metadata = publicMetadata({ ...guide, article: true });

const sections: DocumentSection[] = [
    {
        id: "scope", title: "Start with one useful question",
        content: <>
            <p>Before creating a note, decide what it should help you understand. “How does Newton’s second law connect force, mass, and acceleration?” is a more useful scope than “All of physics.” A focused note is easier to name, revise, and find again.</p>
            <p>Choose a descriptive title such as “Newton’s second law: definitions and worked examples.” Use the description for context—a chapter, lecture date, or problem set—rather than repeating the title.</p>
        </>,
    },
    {
        id: "subject", title: "Create a note in the right subject folder",
        content: <>
            <ol>
                <li>Sign in with Google and open the dashboard.</li>
                <li>Open the note-creation control and enter your title and optional description.</li>
                <li>Choose an existing <strong>Folder</strong>, or select <strong>+ New folder</strong> and enter a subject name such as “Physics.”</li>
                <li>Select <strong>Create note</strong> to open the editor.</li>
            </ol>
            <p>Use folders for subjects or courses, not for every small idea. Separate notes can cover related topics within the same folder. Favorites and pinned notes are useful for material you are currently revising; they do not need to replace a clear subject structure.</p>
        </>,
    },
    {
        id: "structure", title: "Give explanations and examples their own blocks",
        content: <>
            <p>Build a small outline before spending time on presentation. Each block should have a job. For a science topic, a useful sequence might be:</p>
            <ul>
                <li><strong>Heading:</strong> name the concept or question.</li>
                <li><strong>Text:</strong> define the idea in your own words and record its source.</li>
                <li><strong>Formula:</strong> state the relationship and explain each symbol.</li>
                <li><strong>Example:</strong> show the given values, reasoning, and answer with units.</li>
                <li><strong>Drawing or table:</strong> clarify a relationship that is awkward to explain with text alone.</li>
                <li><strong>Revision questions:</strong> write a few questions you can answer later without looking at the explanation.</li>
            </ul>
            <p>You do not need every block type in every note. A literature note may need quotations and interpretation rather than code or a formula. A programming note may need a small runnable example and an explanation of why it works.</p>
        </>,
    },
    {
        id: "rearrange", title: "Arrange the note for someone learning it again",
        content: <>
            <p>After capturing the material, put prerequisites before the ideas that depend on them. Drag blocks into that order rather than rewriting the page. Keep a worked example close to the rule it demonstrates.</p>
            <p>Use the outline and block search to return to a particular section. Duplicate a useful block structure when it saves effort, but change the content to fit the next example. Remove repeated explanations that make the note longer without making it clearer.</p>
            <p>Choose a consistent design and color treatment for recurring roles, such as definitions and examples. Styling should help you recognize a role, not become a reason to delay finishing the explanation.</p>
        </>,
    },
    {
        id: "ai-draft", title: "Use AI for a focused draft, then verify it",
        content: <>
            <p>If you use AI Block Generator, name the topic and the content you want. For example:</p>
            <pre role="region" aria-label="Example AI prompt" tabIndex={0}><code>{"Create study notes on Newton’s second law.\nInclude a definition, the formula F = ma,\nand one worked example with units."}</code></pre>
            <p>The current integration sends your prompt to the configured AI endpoint, not automatically your entire open note. Avoid personal or confidential information in the prompt.</p>
            <p>Check generated definitions, equations, and examples against reliable course materials. Correct errors and record your real sources. A fluent explanation is not evidence that an answer is accurate.</p>
        </>,
    },
    {
        id: "revision", title: "Finish with a revision pass and a save check",
        content: <>
            <p>Read the note once from top to bottom. Can you explain why the formula or example belongs there? Are units, assumptions, and sources clear? Try answering your revision questions before uncovering the relevant explanation.</p>
            <p>Those questions are ordinary text you write yourself; the app is not claiming to run an automatic quiz or spaced-repetition schedule. Return to the note as part of your own revision routine and edit the parts that still confuse you.</p>
            <p>Confirm that changes have saved before leaving. Autosave depends on a successful connection and is not a backup. <a href="/guides/export-and-share-notes">Export a PDF</a> if you need an offline copy, or continue with the <a href="/guides/math-and-code-notes">math, code, and diagram guide</a> for more technical material.</p>
        </>,
    },
];

export default function StudyNotesGuide() {
    return <PublicDocument {...guide} sections={sections} schemaType="Article"
        breadcrumbs={[{ href: "/", label: "Home" }, { href: "/guides", label: "Study guides" }]}
        related={[{ href: GUIDES.mathAndCode.path, label: "Math and code notes" }, { href: GUIDES.exportAndShare.path, label: "PDFs and sharing" }]} />;
}
