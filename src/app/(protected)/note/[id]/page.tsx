"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import LeftAside from "@/components/LeftAside";
import MainPage from "@/components/MainPage";
import RightAside from "@/components/RightAside";
import NoteChromeHeader from "@/components/note/NoteChromeHeader";
import ExportDrawer from "@/components/note/ExportDrawer";
import type { PdfExportOptions } from "@/lib/pdf/exportOptions";
import BlockEditorModal from "@/components/EditorModal/BlockEditorModal";
import { useNoteStore } from "@/Context/DataStore";
import { EditorDataType } from "@/types/Editor";
import {
    INITIAL_JSON_CANVAS,
    INITIAL_JSON_EDITOR,
    INITIAL_JSON_HEADING,
} from "@/utils/UtilFunctions";
import MainPageSkeleton from "@/skeletons/MainPageSkeleton";
import { apiFetch } from "@/lib/api-client";
import { useUnsavedChangesWarning } from "@/hooks/useUnsavedChangesWarning";
import { toast } from "sonner";
import AiBlockGenerator from "@/components/note/AiBlockGenerator";
import { useQueryClient } from "@tanstack/react-query";
import { ALL_DIVIDERS } from "@/utils/Dividers";
import { makeInitialState } from "@/components/EditorModal/TableSection";
import { useGetBlocksByNoteId } from "@/hooks/custom/useBlocks";
import { useGetAllNotes, useGetNoteById } from "@/hooks/custom/useNotes";
import { useIsBreakpoint } from "@/hooks/use-is-breakpoint";

export default function NotePage() {
    const params = useParams();
    const router = useRouter();
    const noteId = params?.id as string;

    const noteRef = useRef<HTMLDivElement>(null);
    const sidebarLayoutRef = useRef<HTMLDivElement>(null);
    const isMobileSidebarLayout = useIsBreakpoint("max", 624);
    const [isLeftExpanded, setIsLeftExpanded] = useState(false);
    const [isExportOpen, setIsExportOpen] = useState(false);
    const [isRightExpanded, setIsRightExpanded] = useState(true);
    const [mobileSidebar, setMobileSidebar] = useState<"left" | "right" | null>(
        null,
    );

    const {
        addSaveBlock,
        loadNote,
        loadPublicNote,
        syncToDB,
        blocksToBeSynced,
        undo,
        redo,
        canUndo,
        canRedo,
        isReadOnly,

        isSyncing,
        isExporting,
        isPreviewMode,
        isEditorOpen,
        doSaveImmediately,
        setIsSyncing,
        setDoSaveImmediately,
        setIsExporting,
        setIsEditorOpen,
        setIsPreviewMode,
        setEditorDataState,
    } = useNoteStore();

    useEffect(() => {
        if (!isMobileSidebarLayout || !mobileSidebar || isPreviewMode) return;

        const closeSidebar = () => setMobileSidebar(null);
        const handleOutsideInteraction = (event: Event) => {
            const sidebar = sidebarLayoutRef.current?.querySelector(
                `[data-note-sidebar="${mobileSidebar}"]`,
            );

            if (
                event.target instanceof Node &&
                !sidebar?.contains(event.target)
            ) {
                closeSidebar();
            }
        };
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") closeSidebar();
        };

        document.addEventListener("pointerdown", handleOutsideInteraction, true);
        document.addEventListener("focusin", handleOutsideInteraction);
        document.addEventListener("keydown", handleEscape);
        window.addEventListener("blur", closeSidebar);

        return () => {
            document.removeEventListener(
                "pointerdown",
                handleOutsideInteraction,
                true,
            );
            document.removeEventListener("focusin", handleOutsideInteraction);
            document.removeEventListener("keydown", handleEscape);
            window.removeEventListener("blur", closeSidebar);
        };
    }, [isMobileSidebarLayout, mobileSidebar, isPreviewMode]);

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
    const isSyncingRef = useRef(isSyncing);
    const doSaveImmediatelyRef = useRef(doSaveImmediately);
    const isEditorOpenRef = useRef(isEditorOpen);

    // Resolve the open note exactly once: owner path when it's in the user's
    // own list, otherwise the viewer path (public link → read-only session).
    useEffect(() => {
        if (!noteId) return;
        // Wait until the owner's note list has settled before deciding.
        if (isCurrentNoteLoading || isFetchingBlocks) return;
        if (resolvedNoteIdRef.current === noteId) return;

        const sortedInitialBlocks = [...blocks].sort(
            (a, b) => a.order - b.order,
        );

        const owned = notes.find((n) => n.id === noteId);
        if (owned) {
            resolvedNoteIdRef.current = noteId;
            loadNote(owned, sortedInitialBlocks);
            return;
        }

        resolvedNoteIdRef.current = noteId;
        (() => {
            if (currentNoteData) {
                loadPublicNote(
                    currentNoteData.note,
                    currentNoteData.isOwner,
                    sortedInitialBlocks,
                );
            } else {
                toast.error(
                    "This note doesn't exist or hasn't been shared with you.",
                );
                router.push("/");
            }
        })();
    }, [noteId, isCurrentNoteLoading, notes, isFetchingBlocks]);

    // NOTE: We intentionally do NOT sync query data → Zustand after initial
    // load. The Zustand store is the single source of truth while editing.
    // Overwriting it on every query update (e.g. after save invalidation)
    // would clobber unsaved local changes made during the save.

    useEffect(() => {
        isSyncingRef.current = isSyncing;
        doSaveImmediatelyRef.current = doSaveImmediately;
        isEditorOpenRef.current = isEditorOpen;

        if (!isEditorOpen && doSaveImmediately && !isSyncing) {
            pendingSaveRef.current = true;
            void handleSaveRef.current();
            setDoSaveImmediately(false);
        }
    }, [isEditorOpen, doSaveImmediately, isSyncing]);

    useEffect(() => {
        savingTimerRef.current = setInterval(() => {
            if (isSyncingRef.current || doSaveImmediatelyRef.current) return;
            if (isEditorOpenRef.current) {
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

    const openBlockEditor = (data: EditorDataType) => {
        setMobileSidebar(null);
        setEditorDataState(data);
        setIsEditorOpen(true);
    };

    const closeBlockEditor = () => {
        setIsEditorOpen(false);
        setEditorDataState({
            title: "",
            content: INITIAL_JSON_EDITOR,
            type: "block",
            action: "add",
            id: "",
            colorOptionId: 1,
            order: "auto",
            designId: 1,
        });
    };

    // add or save a new block after editing.
    const handleSaveBlock = (data: EditorDataType) => {
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
            // Only invalidate the notes list (metadata like blocksCount/updatedAt).
            // Do NOT invalidate ["blocks", noteId] — the Zustand store is the
            // source of truth and already has the correct state after syncToDB.
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
            const commonData: Omit<EditorDataType, "content" | "type"> = {
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
                        content: INITIAL_JSON_EDITOR,
                        type: "block",
                    });
                    break;
                case "h":
                    event.preventDefault();
                    openBlockEditor({
                        ...commonData,
                        content: INITIAL_JSON_HEADING,
                        type: "heading",
                    });
                    break;
                case "w":
                    event.preventDefault();
                    openBlockEditor({
                        ...commonData,
                        content: INITIAL_JSON_CANVAS,
                        type: "canvas",
                    });
                    break;
                case "d":
                    event.preventDefault();
                    openBlockEditor({
                        ...commonData,
                        content: ALL_DIVIDERS[0].name,
                        type: "divider",
                    });
                    break;
                case "c":
                    event.preventDefault();
                    openBlockEditor({
                        ...commonData,
                        content: "// Do Something",
                        type: "code",
                        language: "javascript",
                    });
                    break;
                case "f":
                    event.preventDefault();
                    openBlockEditor({
                        ...commonData,
                        content: "E=mc^2",
                        type: "formula",
                    });
                    break;
                case "i":
                    event.preventDefault();
                    openBlockEditor({
                        ...commonData,
                        url: "",
                        type: "image",
                    });
                    break;
                case "t":
                    event.preventDefault();
                    openBlockEditor({
                        ...commonData,
                        content: makeInitialState(),
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
        setMobileSidebar(null);
        setIsPreviewMode(!isPreviewMode);
        if (!isPreviewMode) {
            toast.info("Preview mode — sidebars hidden", { duration: 2000 });
        }
    };

    const handleExport = async (options: PdfExportOptions) => {
        if (isExporting) return;
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
                            body: JSON.stringify({ noteId, options }),
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
                    setIsExportOpen(false);
                } catch (error) {
                    if (process.env.NODE_ENV === "development") {
                        console.error(error);
                    }

                    throw error;
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
                isLoading={isCurrentNoteLoading || isFetchingBlocks}
                onSave={() => {
                    pendingSaveRef.current = true;
                    void handleSave();
                }}
                onExport={() => setIsExportOpen(true)}
                onPreview={handlePreview}
                hasUnsaved={hasUnsaved}
            />

            <div
                ref={sidebarLayoutRef}
                className="relative flex min-h-0 flex-1 overflow-hidden"
            >
                {!isPreviewMode && !isReadOnly && (
                    <LeftAside
                        openBlockEditor={openBlockEditor}
                        isExpanded={
                            isMobileSidebarLayout
                                ? mobileSidebar === "left"
                                : isLeftExpanded
                        }
                        onExpandedChange={(expanded) => {
                            if (isMobileSidebarLayout) {
                                setMobileSidebar(expanded ? "left" : null);
                            } else {
                                setIsLeftExpanded(expanded);
                            }
                        }}
                    />
                )}
                {isFetchingBlocks || isCurrentNoteLoading ? (
                    <MainPageSkeleton />
                ) : (
                    <MainPage
                        noteRef={noteRef}
                        openBlockEditor={openBlockEditor}
                    />
                )}
                {!isPreviewMode && (
                    <RightAside
                        isExpanded={
                            isMobileSidebarLayout
                                ? mobileSidebar === "right"
                                : isRightExpanded
                        }
                        onExpandedChange={(expanded) => {
                            if (isMobileSidebarLayout) {
                                setMobileSidebar(expanded ? "right" : null);
                            } else {
                                setIsRightExpanded(expanded);
                            }
                        }}
                    />
                )}
            </div>

            {isEditorOpen && <BlockEditorModal onSave={handleSaveBlock} />}
            <ExportDrawer
                open={isExportOpen}
                onOpenChange={setIsExportOpen}
                isExporting={isExporting}
                onExport={(options) => void handleExport(options)}
            />

            <AiBlockGenerator />
        </div>
    );
}
