"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import LeftAside from "@/Pages/LeftAside";
import MainPage from "@/Pages/MainPage";
import RightAside from "@/Pages/RightAside";
import BlockEditorModal from "@/components/EditorModal/BlockEditorModal";
import { useNoteStore } from "@/Context/DataStore";
import { EditorData } from "@/types/Editor";
import { initialJsonForEditor } from "@/utils/UtilFunctions";
import { ArrowLeft } from "lucide-react";

export default function NotePage() {
    const params = useParams();
    const router = useRouter();
    const noteId = params?.id as string;

    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editorData, setEditorData] = useState<EditorData>({
        id: "",
        designId: 1,
        colorOptionId: 1,
        title: "",
        content: initialJsonForEditor,
        type: "unset",
        action: "add",
    });

    const { addSaveBlock, loadNote, currentNote } = useNoteStore();

    // Load the note when component mounts
    useEffect(() => {
        if (noteId) {
            loadNote(noteId);
        }
    }, [noteId, loadNote]);

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

    const openBlockEditor = (editorData: EditorData) => {
        setEditorData(editorData);
        setIsEditorOpen(true);
    };

    const closeBlockEditor = () => {
        setIsEditorOpen(false);
        setEditorData({
            title: "",
            content: initialJsonForEditor,
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
        <div className="min-h-screen min-w-screen bg-orange-50 px-10 py-5 flex flex-col">
            {/* Back Button */}
            <div className="mb-4">
                <button
                    onClick={() => router.push("/")}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 shadow-sm"
                    title="Go back to home"
                >
                    <ArrowLeft size={18} className="text-slate-600" />
                    <span className="text-sm font-medium text-slate-600">
                        Home
                    </span>
                </button>
            </div>

            {/* Editor Layout */}
            <div className="flex min-h-[calc(100vh-120px)] gap-6 flex-1">
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
