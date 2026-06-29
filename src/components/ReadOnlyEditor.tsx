import { useEditor, EditorContent } from "@tiptap/react";
import { useEffect } from "react";
import { StarterKit } from "@tiptap/starter-kit";
import { Image } from "@tiptap/extension-image";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { TextAlign } from "@tiptap/extension-text-align";
import { Typography } from "@tiptap/extension-typography";
import { Highlight } from "@tiptap/extension-highlight";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { Selection } from "@tiptap/extensions";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import { handleImageUpload, MAX_FILE_SIZE } from "@/lib/tiptap-utils";
import Mathematics from "@tiptap/extension-mathematics";
import "katex/dist/katex.min.css";

export default function ReadOnlyEditor({
    content,
    className = "",
    hasTitle = true,
}: {
    content: string;
    className?: string;
    hasTitle?: boolean;
}) {
    const editor = useEditor({
        immediatelyRender: true,
        extensions: [
            StarterKit.configure({
                horizontalRule: false,
                link: {
                    openOnClick: false,
                    enableClickSelection: true,
                },
            }),
            Mathematics.configure({
                // You can pass any custom KaTeX options here
                katexOptions: {
                    macros: { "\\R": "\\mathbb{R}" },
                },
            }),
            HorizontalRule,
            TextAlign.configure({ types: ["heading", "paragraph"] }),
            TaskList,
            TaskItem.configure({ nested: true }),
            Highlight.configure({ multicolor: true }),
            Image,
            Typography,
            Superscript,
            Subscript,
            Selection,
        ],
        content: JSON.parse(content),
        editable: false,
    });

    // Update editor content when content prop changes
    useEffect(() => {
        if (editor && content) {
            editor.commands.setContent(JSON.parse(content));
        }
    }, [content, editor]);

    return (
        <div className={`${className} ${hasTitle ? "pt-2" : "pt-1"} pb-1`}>
            <EditorContent editor={editor} />
        </div>
    );
}
