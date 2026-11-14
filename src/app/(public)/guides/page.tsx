import PublicDocument, { type DocumentSection } from "@/components/public/PublicDocument";
import { GUIDES } from "@/lib/guides";
import { publicMetadata } from "@/lib/seo";
import styles from "@/components/public/public.module.css";

const description = "Practical guides to organizing study notes, combining LaTeX and code with explanations, and exporting or sharing a finished Eton Note page.";
export const metadata = publicMetadata({ title: "Study-note guides", description, path: "/guides" });

const sections: DocumentSection[] = [
    {
        id: "choose-a-guide", title: "Choose your next step",
        content: <ul className={styles.guideList}>
            {Object.values(GUIDES).map((guide) => (
                <li key={guide.path}>
                    <h3><a href={guide.path}>{guide.title}</a></h3>
                    <p>{guide.description}</p>
                </li>
            ))}
        </ul>,
    },
    {
        id: "routine", title: "A notebook workflow worth repeating",
        content: <>
            <p>Start with one topic you need to understand. Separate explanations from examples, connect equations or code to their meaning, and finish with questions you can return to during revision.</p>
            <p>The guides use Eton Note’s existing editor, folders, block designs, and export controls. They do not assume a built-in quiz system, automatic fact-checking, or offline editing.</p>
        </>,
    },
    {
        id: "help", title: "Looking for a specific feature?",
        content: <>
            <p>See <a href="/features">all study-note features</a> for what the editor can do. The <a href="/faq">FAQ</a> explains sign-in, autosave, AI prompts, private notes, and current deletion limits.</p>
            <p>Before putting sensitive information in a prompt, image, or sharing link, read the <a href="/privacy">draft Privacy Policy</a>.</p>
        </>,
    },
];

export default function GuidesPage() {
    return <PublicDocument title="Study-note guides" description={description} path="/guides" sections={sections} schemaType="CollectionPage" />;
}
