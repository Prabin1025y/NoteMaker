"use client";
import { useEffect, useState } from "react";
import LeftAside from "@/Pages/LeftAside";
import MainPage from "@/Pages/MainPage";
import RightAside from "@/Pages/RightAside";
import BlockEditorModal from "@/components/BlockEditorModal";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { blockTypeOptions, useNoteStore } from "@/Context/DataStore";

export default function NotePage() {
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editorData, setEditorData] = useState<{
        title: string;
        content: string;
        type: blockTypeOptions;
    }>({
        title: "",
        content: "",
        type: "text",
    });

    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            TextAlign.configure({
                types: ["heading", "paragraph"],
            }),
        ],
        content: "",
    });

    useEffect(() => {
        if (isEditorOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }

        return () => {
            document.body.style.overflow = "";
        };
    }, [isEditorOpen]);

    const { addBlock } = useNoteStore();

    const openBlockEditor = (
        title: string = "",
        content: string = "",
        type: blockTypeOptions = "text",
    ) => {
        console.log("page.tsx", type);
        setEditorData({ title, content, type });
        setIsEditorOpen(true);
    };

    const closeBlockEditor = () => {
        setIsEditorOpen(false);
        setEditorData({ title: "", content: "", type: "text" });
    };

    const handleSaveBlock = (
        title: string,
        content: string,
        type: blockTypeOptions,
    ) => {
        console.log("Saving block:", { title, content, type });
        addBlock(type, content, title);
        // TODO: Add block to your store/context
        closeBlockEditor();
    };

    return (
        <div className={`min-h-screen min-w-screen bg-orange-50 px-10 py-10 `}>
            <div className="flex min-h-[calc(100vh-80px)] gap-6">
                <LeftAside openBlockEditor={openBlockEditor} />
                <MainPage openBlockEditor={openBlockEditor} />
                <RightAside />
            </div>

            <BlockEditorModal
                isOpen={isEditorOpen}
                onClose={closeBlockEditor}
                onSave={handleSaveBlock}
                initialTitle={editorData.title}
                initialContent={editorData.content}
                initialType={editorData.type}
            />
        </div>
    );
}
