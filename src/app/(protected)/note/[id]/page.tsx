"use client";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import LeftAside from "@/pages/LeftAside";
import MainPage from "@/pages/MainPage";
import RightAside from "@/pages/RightAside";
import BlockEditorModal from "@/components/EditorModal/BlockEditorModal";
import { useNoteStore } from "@/Context/DataStore";
import { EditorData } from "@/types/Editor";
import { initialJsonForEditor } from "@/utils/UtilFunctions";
import { ArrowLeft, Loader2, Save, UploadIcon } from "lucide-react";
import MainPageSkeleton from "@/skeletons/MainPageSkeleton";
import { apiFetch } from "@/lib/api-client";
import { useUnsavedChangesWarning } from "@/hooks/useUnsavedChangesWarning";
import { toast } from "sonner";

export default function NotePage() {
    const params = useParams();
    const router = useRouter();
    const noteId = params?.id as string;

    const noteRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editorData, setEditorData] = useState<EditorData>({
        id: "",
        designId: 1,
        order: "auto",
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
        currentNote,
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

    useUnsavedChangesWarning(blocksToBeSynced.length !== 0);

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
            order: "auto",
            designId: 1,
        });
    };

    const handleSaveBlock = (data: EditorData) => {
        addSaveBlock(data);
        closeBlockEditor();
    };

    const handleHomeClick = () => {
        if (blocksToBeSynced.length != 0) {
            const leave = window.confirm(
                "You have unsaved changes. Are you sure you want to leave?",
            );

            if (!leave) return;
        }

        router.push("/");
    };

    const handleExport = async () => {
        if (!currentNote) {
            toast.warning("Please wait for note to be loaded.");
            return;
        }
        toast.info("Your Pdf will be exported.", {
            description: "Worst case 1 minute due to free deployment.",
            toasterId: "normal",
        });
        toast.promise(
            async () => {
                try {
                    setIsExporting(true);
                    await syncToDB();

                    const res = await apiFetch(
                        `${process.env.NEXT_PUBLIC_PDF_API_URL}`,
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({ noteId }),
                        },
                    );

                    if (!res.ok) {
                        throw new Error("Error occurred while exporting.");
                    }

                    const disposition = res.headers.get("Content-Disposition");
                    const filename =
                        disposition?.match(/filename="?(.+?)"?$/)?.[1] ??
                        `${currentNote.title}.pdf`;

                    const blob = await res.blob();

                    const url = URL.createObjectURL(blob);

                    const a = document.createElement("a");

                    a.href = url;
                    a.download = filename;

                    document.body.appendChild(a);

                    a.click();

                    a.remove();

                    URL.revokeObjectURL(url);
                } catch (error) {
                    if (process.env.NODE_ENV === "development") {
                        console.error(error);
                    }

                    alert(
                        error instanceof Error
                            ? error.message
                            : "Error while exporting!",
                    );
                } finally {
                    setIsExporting(false);
                }
            },
            {
                loading: `Exporting ${currentNote.title}...`,
                success: (data) =>
                    `${currentNote.title} Pdf has been exported.`,
                error: "Error",
                toasterId: "promise",
            },
        );
    };

    const hasUnsaved = blocksToBeSynced.length > 0;

    return (
        <div
            className="h-screen w-screen flex flex-col overflow-hidden bg-[#faf9f7]"
            style={{ fontFamily: "'Inter', sans-serif" }}
        >
            {/* {exporting && (
                <div className="bg-white opacity-80 absolute inset-0 flex gap-3 items-center justify-center z-100 backdrop-blur-2xl">
                    <Loader2 className="animate-spin" />
                    <p>Exporting...</p>
                </div>
            )} */}
            {/* Top bar */}
            <header className="shrink-0 flex items-center justify-between px-5 py-2.5 bg-white border-b border-[#e8e5e0]">
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleHomeClick}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#faf9f7] border border-[#e2e0dc] rounded-lg text-[12px] font-medium text-[#5a5550] hover:bg-[#f0ede8] transition-colors"
                    >
                        <ArrowLeft size={13} />
                        Home
                    </button>
                    <span className="text-[#e2e0dc]">·</span>
                    <span className="text-[14px] font-semibold text-[#1a1714] tracking-tight truncate max-w-70">
                        {currentNote?.title || "Untitled"}
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
                        disabled={isSyncing || isExporting}
                        className={`${isSyncing && "opacity-80 cursor-not-allowed"} relative flex items-center gap-1.5 px-4 py-1.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg text-[12px] font-medium transition-colors`}
                    >
                        <Save size={13} />
                        {isSyncing ? "Saving..." : "Save"}
                        {hasUnsaved && (
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                        )}
                    </button>
                    <button
                        onClick={handleExport}
                        disabled={isExporting}
                        className={` ${isExporting && "opacity-80 cursor-not-allowed"} relative flex items-center gap-1.5 px-4 py-1.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg text-[12px] font-medium transition-colors`}
                    >
                        <UploadIcon size={13} />
                        {isExporting ? "Exporting..." : "Export"}
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
