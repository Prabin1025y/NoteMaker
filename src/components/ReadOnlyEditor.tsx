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
import { ImageUploadNode } from "./tiptap-node/image-upload-node";
import { handleImageUpload, MAX_FILE_SIZE } from "@/lib/tiptap-utils";

export default function ReadOnlyEditor({ content }: { content: string }) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                horizontalRule: false,
                link: {
                    openOnClick: false,
                    enableClickSelection: true,
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
            ImageUploadNode.configure({
                accept: "image/*",
                maxSize: MAX_FILE_SIZE,
                limit: 3,
                upload: handleImageUpload,
                onError: (error) => console.error("Upload failed:", error),
            }),
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
        <div className="py-5">
            <EditorContent editor={editor} />
        </div>
    );
}
