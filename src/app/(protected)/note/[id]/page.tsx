"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Inter } from "next/font/google";
import LeftAside from "@/components/LeftAside";
import MainPage from "@/components/MainPage";
import RightAside from "@/components/RightAside";
import NoteChromeHeader from "@/components/note/NoteChromeHeader";
import BlockEditorModal from "@/components/EditorModal/BlockEditorModal";
import { useNoteStore } from "@/Context/DataStore";
import { EditorData } from "@/types/Editor";
import { initialJsonForEditor } from "@/utils/UtilFunctions";
import MainPageSkeleton from "@/skeletons/MainPageSkeleton";
import { apiFetch } from "@/lib/api-client";
import { useUnsavedChangesWarning } from "@/hooks/useUnsavedChangesWarning";
import { toast } from "sonner";
import AiBlockGenerator from "@/components/note/AiBlockGenerator";

const inter = Inter({
    subsets: ["latin"],
    display: "swap",
});

export default function NotePage() {
    const params = useParams();
    const router = useRouter();
    const noteId = params?.id as string;

    const noteRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const [isAiOpen, setIsAiOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
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
        undo,
        redo,
        canUndo,
        canRedo,
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

    const handleSave = useCallback(async () => {
        setIsSyncing(true);
        await syncToDB();
        setIsSyncing(false);
    }, [syncToDB]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const isModifierPressed = event.metaKey || event.ctrlKey;
            if (!isModifierPressed || isEditorOpen) return;

            const key = event.key.toLowerCase();

            if (key === "s") {
                event.preventDefault();
                if (!isSyncing) {
                    void handleSave();
                }
                return;
            }

            if (key === "z" && !event.shiftKey) {
                event.preventDefault();
                if (canUndo()) undo();
                return;
            }

            if (key === "y" || (key === "z" && event.shiftKey)) {
                event.preventDefault();
                if (canRedo()) redo();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [canRedo, canUndo, handleSave, isEditorOpen, isSyncing, redo, undo]);

    const handlePreview = () => {
        setIsPreviewMode((prev) => !prev);
        if (!isPreviewMode) {
            toast.info("Preview mode — sidebars hidden", { duration: 2000 });
        }
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
                        `${process.env.NEXT_PUBLIC_WEBSITE_URL}/api/pdf`,
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
                success: () => `${currentNote.title} Pdf has been exported.`,
                error: "Error",
                toasterId: "promise",
            },
        );
    };

    const hasUnsaved = blocksToBeSynced.length > 0;

    return (
        <div
            className={`${inter.className} h-screen w-screen flex flex-col overflow-hidden bg-white`}
        >
            <NoteChromeHeader
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onHomeClick={handleHomeClick}
                onSave={() => void handleSave()}
                onExport={() => void handleExport()}
                onPreview={handlePreview}
                isSyncing={isSyncing}
                isExporting={isExporting}
                hasUnsaved={hasUnsaved}
                isPreviewMode={isPreviewMode}
            />

            <div className="flex flex-1 overflow-hidden">
                {!isPreviewMode && (
                    <LeftAside
                        openBlockEditor={openBlockEditor}
                        isGenerating={isGenerating}
                        openAiModel={() => setIsAiOpen(true)}
                    />
                )}
                {isLoading ? (
                    <MainPageSkeleton />
                ) : (
                    <MainPage
                        isGenerating={isGenerating}
                        openAiModel={() => setIsAiOpen(true)}
                        noteRef={noteRef}
                        openBlockEditor={openBlockEditor}
                    />
                )}
                {!isPreviewMode && <RightAside searchQuery={searchQuery} />}
            </div>

            {isEditorOpen && (
                <BlockEditorModal
                    onClose={closeBlockEditor}
                    onSave={handleSaveBlock}
                    editorData={editorData}
                />
            )}

            <AiBlockGenerator
                isOpen={isAiOpen}
                setIsGenerating={setIsGenerating}
                onClose={() => setIsAiOpen(false)}
            />
        </div>
    );
}
