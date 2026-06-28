"use client";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import LeftAside from "@/Pages/LeftAside";
import MainPage from "@/Pages/MainPage";
import RightAside from "@/Pages/RightAside";
import BlockEditorModal from "@/components/EditorModal/BlockEditorModal";
import { useNoteStore } from "@/Context/DataStore";
import { EditorData } from "@/types/Editor";
import { initialJsonForEditor } from "@/utils/UtilFunctions";
import { ArrowLeft, Save, UploadIcon } from "lucide-react";
import { exportElementToPDF } from "@/utils/PDFCreator";
import MainPageSkeleton from "@/skeletons/MainPageSkeleton";

export default function NotePage() {
    const params = useParams();
    const router = useRouter();
    const noteId = params?.id as string;

    const noteRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);

    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editorData, setEditorData] = useState<EditorData>({
        id: "",
        designId: 1,
        colorOptionId: 1,
        title: "",
        content: initialJsonForEditor,
        type: "block",
        action: "add",
    });

    const {
        addSaveBlock,
        loadNote,
        syncToDB,
        blocksToBeSynced,
        title,
        blocks,
    } = useNoteStore();

    useEffect(() => {
        (async () => {
            setIsLoading(true);
            if (noteId) await loadNote(noteId);
            setIsLoading(false);
        })();
    }, [noteId, loadNote]);

    useEffect(() => {
        document.body.style.overflow = isEditorOpen ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [isEditorOpen]);

    const openBlockEditor = (data: EditorData) => {
        setEditorData(data);
        setIsEditorOpen(true);
    };

    const closeBlockEditor = () => {
        setIsEditorOpen(false);
        setEditorData({
            title: "",
            content: initialJsonForEditor,
            type: "block",
            action: "add",
            id: "",
            colorOptionId: 1,
            designId: 1,
        });
    };

    const handleSaveBlock = (data: EditorData) => {
        addSaveBlock(data);
        closeBlockEditor();
    };

    const hasUnsaved = blocksToBeSynced.length > 0;

    return (
        <div
            className="h-screen w-screen flex flex-col overflow-hidden bg-[#faf9f7]"
            style={{ fontFamily: "'Inter', sans-serif" }}
        >
            {/* Top bar */}
            <header className="flex-shrink-0 flex items-center justify-between px-5 py-2.5 bg-white border-b border-[#e8e5e0]">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.push("/")}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#faf9f7] border border-[#e2e0dc] rounded-lg text-[12px] font-medium text-[#5a5550] hover:bg-[#f0ede8] transition-colors"
                    >
                        <ArrowLeft size={13} />
                        Home
                    </button>
                    <span className="text-[#e2e0dc]">·</span>
                    <span className="text-[14px] font-semibold text-[#1a1714] tracking-tight truncate max-w-[280px]">
                        {title || "Untitled"}
                    </span>
                    <span className="text-[12px] text-[#b8b3ac]">
                        — {blocks?.length ?? 0}{" "}
                        {(blocks?.length ?? 0) === 1 ? "block" : "blocks"}
                    </span>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={async () => {
                            setIsSyncing(true);
                            await syncToDB();
                            setIsSyncing(false);
                        }}
                        disabled={isSyncing}
                        className={`${isSyncing && "opacity-80 cursor-not-allowed"} relative flex items-center gap-1.5 px-4 py-1.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg text-[12px] font-medium transition-colors`}
                    >
                        <Save size={13} />
                        {isSyncing ? "Saving..." : "Save"}
                        {hasUnsaved && (
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                        )}
                    </button>
                    <button
                        onClick={() => {
                            if (noteRef.current) {
                                exportElementToPDF(noteRef.current);
                            }
                        }}
                        className="relative flex items-center gap-1.5 px-4 py-1.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg text-[12px] font-medium transition-colors"
                    >
                        <UploadIcon size={13} />
                        Export
                    </button>
                </div>
            </header>

            {/* Editor body */}
            <div className="flex flex-1 overflow-hidden">
                <LeftAside openBlockEditor={openBlockEditor} />
                {isLoading ? (
                    <MainPageSkeleton />
                ) : (
                    <MainPage
                        noteRef={noteRef}
                        openBlockEditor={openBlockEditor}
                    />
                )}
                <RightAside />
            </div>

            {isEditorOpen && (
                <BlockEditorModal
                    onClose={closeBlockEditor}
                    onSave={handleSaveBlock}
                    editorData={editorData}
                />
            )}
        </div>
    );
}
