import PublicDocument, { type DocumentSection } from "@/components/public/PublicDocument";
import { FAQ_GROUPS } from "@/lib/faq";
import { publicMetadata } from "@/lib/seo";
import styles from "@/components/public/public.module.css";

const description = "Answers about Eton Note’s study-note editor, Google sign-in, autosave, AI prompts, LaTeX, PDF export, sharing, and current privacy controls.";
export const metadata = publicMetadata({ title: "Frequently asked questions", description, path: "/faq" });

const sections: DocumentSection[] = FAQ_GROUPS.map((group) => ({
    id: group.id,
    title: group.title,
    content: <div className={styles.faq}>
        {group.questions.map((question) => (
            <details key={question.question}>
                <summary>{question.question}</summary>
                <p>{question.answer}</p>
                {question.link && <p><a href={question.link.href}>{question.link.label}</a></p>}
            </details>
        ))}
    </div>,
}));

export default function FaqPage() {
    return <PublicDocument title="Frequently asked questions" description={description} path="/faq" sections={sections}
        schemaType="FAQPage" schema={{
            mainEntity: FAQ_GROUPS.flatMap((group) => group.questions.map((question) => ({
                "@type": "Question",
                name: question.question,
                acceptedAnswer: { "@type": "Answer", text: question.answer },
            }))),
        }} />;
}
