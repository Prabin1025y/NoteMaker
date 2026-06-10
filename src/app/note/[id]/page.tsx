"use client";
import { useEffect, useState } from "react";
import LeftAside from "@/Pages/LeftAside";
import MainPage from "@/Pages/MainPage";
import RightAside from "@/Pages/RightAside";
import BlockEditorModal from "@/components/EditorModal/BlockEditorModal";
import { useNoteStore } from "@/Context/DataStore";
import { EditorData } from "@/types/Editor";

export default function NotePage() {
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editorData, setEditorData] = useState<EditorData>({
        id: "",
        designId: 1,
        colorOptionId: 1,
        title: "",
        content: `{"type":"doc","content":[{"type":"paragraph","attrs":{"textAlign":null},"content":[{"type":"text","text":" "}]}]}`,
        type: "unset",
        action: "add",
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

    const { addSaveBlock } = useNoteStore();

    const openBlockEditor = (editorData: EditorData) => {
        setEditorData(editorData);
        setIsEditorOpen(true);
    };

    const closeBlockEditor = () => {
        setIsEditorOpen(false);
        setEditorData({
            title: "",
            content: `{"type":"doc","content":[{"type":"paragraph","attrs":{"textAlign":null},"content":[{"type":"text","text":" "}]}]}`,
            type: "unset",
            action: "add",
            id: "",
            colorOptionId: 1,
            designId: 1,
        });
    };

    const handleSaveBlock = (editorData: EditorData) => {
        addSaveBlock(editorData);
        closeBlockEditor();
    };

    return (
        <div className={`min-h-screen min-w-screen bg-orange-50 px-10 py-5 `}>
            <div className="flex min-h-[calc(100vh-80px)] gap-6">
                <LeftAside openBlockEditor={openBlockEditor} />
                <MainPage openBlockEditor={openBlockEditor} />
                <RightAside />
            </div>

            <BlockEditorModal
                isOpen={isEditorOpen}
                onClose={closeBlockEditor}
                onSave={handleSaveBlock}
                editorData={editorData}
            />
        </div>
    );
}
