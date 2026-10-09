"use client";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import LeftAside from "@/components/LeftAside";
import MainPage from "@/components/MainPage";
import RightAside from "@/components/RightAside";
import NoteChromeHeader from "@/components/note/NoteChromeHeader";
import BlockEditorModal from "@/components/EditorModal/BlockEditorModal";
import { useNoteStore } from "@/Context/DataStore";
import { EditorData } from "@/types/Editor";
import {
    initialHeadingJsonContent,
    initialJsonForEditor,
} from "@/utils/UtilFunctions";
import MainPageSkeleton from "@/skeletons/MainPageSkeleton";
import { apiFetch } from "@/lib/api-client";
import { useUnsavedChangesWarning } from "@/hooks/useUnsavedChangesWarning";
import { toast } from "sonner";
import AiBlockGenerator from "@/components/note/AiBlockGenerator";
import { useQueryClient } from "@tanstack/react-query";
import { allBlocks } from "@/utils/BlocksInfo";
import { ALL_DIVIDERS } from "@/utils/Dividers";
import { makeInitialState } from "@/components/EditorModal/TableSection";
import { useGetBlocksByNoteId } from "@/hooks/custom/useBlocks";
import { useGetAllNotes, useGetNoteById } from "@/hooks/custom/useNotes";

export default function NotePage() {
    const params = useParams();
    const router = useRouter();
    const noteId = params?.id as string;

    const noteRef = useRef<HTMLDivElement>(null);

    const {
        addSaveBlock,
        loadNote,
        loadPublicNote,
        syncToDB,
        blocksToBeSynced,
        setBlocks,
        undo,
        redo,
        canUndo,
        canRedo,
        isReadOnly,

        isSyncing,
        isPreviewMode,
        isEditorOpen,
        doSaveImmediately,
        setIsSyncing,
        setDoSaveImmediately,
        setIsExporting,
        setIsEditorOpen,
        setIsPreviewMode,
        setEditorData,
    } = useNoteStore();

    const queryClient = useQueryClient();

    const { data: currentNoteData, isLoading: isCurrentNoteLoading } =
        useGetNoteById(noteId);
    const { data: notes = [] } = useGetAllNotes();

    const currentNote = currentNoteData?.note;

    const { data: blocks = [], isLoading: isFetchingBlocks } =
        useGetBlocksByNoteId(noteId, {
            staleTime: 60 * 60 * 1000,
            enabled: !!currentNote && currentNote.id === noteId,
        });

    // Tracks which note id we've already resolved, so churn in `notes`
    // (e.g. syncLocally bumping blocksCount while editing) never re-runs
    // loadNote and wipes unsaved sync/history state.
    const resolvedNoteIdRef = useRef<string | null>(null);
    const pendingSaveRef = useRef(false);
    const savingRef = useRef(false);
    const handleSaveRef = useRef<() => Promise<void>>(() => Promise.resolve());
    const savingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Resolve the open note exactly once: owner path when it's in the user's
    // own list, otherwise the viewer path (public link → read-only session).
    useEffect(() => {
        if (!noteId) return;
        // Wait until the owner's note list has settled before deciding.
        if (isCurrentNoteLoading || isFetchingBlocks) return;
        if (resolvedNoteIdRef.current === noteId) return;

        const owned = notes.find((n) => n.id === noteId);
        if (owned) {
            
            resolvedNoteIdRef.current = noteId;
            loadNote(owned, blocks);
            return;
        }

        resolvedNoteIdRef.current = noteId;
        (() => {
            if (currentNoteData) {
                loadPublicNote(
                    currentNoteData.note,
                    currentNoteData.isOwner,
                    blocks,
                );
            } else {
                toast.error(
                    "This note doesn't exist or hasn't been shared with you.",
                );
                router.push("/");
            }
        })();
    }, [noteId, isCurrentNoteLoading, notes, isFetchingBlocks]);

    const sortedBlocks = useMemo(() => {
        if (!!!blocks || !Array.isArray(blocks)) return [];

        return blocks.sort((a, b) => a.order - b.order);
    }, [blocks]);

    useEffect(() => {
        if (!blocks) return;

        setBlocks(sortedBlocks);
    }, [blocks]);

    useEffect(() => {
        if (!isEditorOpen && doSaveImmediately && !isSyncing) {
            pendingSaveRef.current = true;
            void handleSaveRef.current();
            setDoSaveImmediately(false);
        }
    }, [isEditorOpen, doSaveImmediately, isSyncing]);

    useEffect(() => {
        savingTimerRef.current = setInterval(() => {
            if (isSyncing || doSaveImmediately) return;
            if (isEditorOpen) {
                setDoSaveImmediately(true);
                return;
            }
            pendingSaveRef.current = true;
            void handleSaveRef.current();
        }, 30_000);

        return () => {
            if (savingTimerRef.current) {
                clearInterval(savingTimerRef.current);
            }
        };
    }, []);

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

    // add or save a new block after editing.
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
        if (
            blocksToBeSynced.length === 0 ||
            !pendingSaveRef.current ||
            savingRef.current
        )
            return;

        savingRef.current = true;
        pendingSaveRef.current = false;

        try {
            setIsSyncing(true);
            await syncToDB();
            queryClient.invalidateQueries({
                queryKey: ["blocks", noteId],
            });
            queryClient.invalidateQueries({
                queryKey: ["notes"],
            });
            setIsSyncing(false);
        } catch (error) {
            if (process.env.NODE_ENV === "development") {
                console.error(error);
            }

            pendingSaveRef.current = true;

            alert(
                error instanceof Error ? error.message : "Error while Saving!",
            );
        } finally {
            savingRef.current = false;

            if (pendingSaveRef.current) handleSave();
            setIsSyncing(false);
        }
    }, [syncToDB, blocksToBeSynced, pendingSaveRef.current]);

    handleSaveRef.current = handleSave;

    // Shortcuts for undo redo and save
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const isModifierPressed = event.metaKey || event.ctrlKey;
            if (!isModifierPressed || isEditorOpen) return;

            const key = event.key.toLowerCase();

            if (key === "s") {
                event.preventDefault();
                if (!isSyncing) {
                    pendingSaveRef.current = true;
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

    // Shortcuts to add blocks
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const isAltPressed = event.altKey;
            if (!isAltPressed || isEditorOpen) return;

            const key = event.key.toLowerCase();
            const commonData: Omit<EditorData, "content" | "type"> = {
                id: "",
                designId: 0,
                colorOptionId: 1,
                action: "add",
                title: "",
                order: "auto",
            };

            switch (key) {
                case "b":
                    event.preventDefault();
                    openBlockEditor({
                        ...commonData,
                        content:
                            allBlocks.find((b) => b.type === "block")
                                ?.defaultContent || initialJsonForEditor,
                        type: "block",
                    });
                    break;
                case "h":
                    event.preventDefault();
                    openBlockEditor({
                        ...commonData,
                        content:
                            allBlocks.find((b) => b.type === "heading")
                                ?.defaultContent || initialHeadingJsonContent,
                        type: "heading",
                    });
                    break;
                case "w":
                    event.preventDefault();
                    openBlockEditor({
                        ...commonData,
                        content:
                            allBlocks.find((b) => b.type === "canvas")
                                ?.defaultContent || "",
                        type: "canvas",
                    });
                    break;
                case "d":
                    event.preventDefault();
                    openBlockEditor({
                        ...commonData,
                        content:
                            allBlocks.find((b) => b.type === "divider")
                                ?.defaultContent || ALL_DIVIDERS[0].name,
                        type: "divider",
                    });
                    break;
                case "c":
                    event.preventDefault();
                    openBlockEditor({
                        ...commonData,
                        content:
                            allBlocks.find((b) => b.type === "code")
                                ?.defaultContent || "// Do Something",
                        type: "code",
                    });
                    break;
                case "f":
                    event.preventDefault();
                    openBlockEditor({
                        ...commonData,
                        content:
                            allBlocks.find((b) => b.type === "formula")
                                ?.defaultContent || "E=mc^2",
                        type: "formula",
                    });
                    break;
                case "i":
                    event.preventDefault();
                    openBlockEditor({
                        ...commonData,
                        content:
                            allBlocks.find((b) => b.type === "image")
                                ?.defaultContent || "",
                        type: "image",
                    });
                    break;
                case "t":
                    event.preventDefault();
                    openBlockEditor({
                        ...commonData,
                        content:
                            allBlocks.find((b) => b.type === "table")
                                ?.defaultContent ||
                            JSON.stringify(makeInitialState()),
                        type: "table",
                    });
                    break;

                default:
                    break;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isEditorOpen]);

    const handlePreview = () => {
        setIsPreviewMode(!isPreviewMode);
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
        <div className="h-screen w-screen flex flex-col overflow-hidden bg-background">
            <NoteChromeHeader
                onHomeClick={handleHomeClick}
                onSave={() => {
                    pendingSaveRef.current = true;
                    void handleSave();
                }}
                onExport={() => void handleExport()}
                onPreview={handlePreview}
                hasUnsaved={hasUnsaved}
            />

            <div className="flex flex-1 overflow-hidden">
                {!isPreviewMode && !isReadOnly && (
                    <LeftAside openBlockEditor={openBlockEditor} />
                )}
                {isFetchingBlocks || isCurrentNoteLoading ? (
                    <MainPageSkeleton />
                ) : (
                    <MainPage
                        noteRef={noteRef}
                        openBlockEditor={openBlockEditor}
                    />
                )}
                {!isPreviewMode && <RightAside />}
            </div>

            {isEditorOpen && <BlockEditorModal onSave={handleSaveBlock} />}

            <AiBlockGenerator />
        </div>
    );
}
