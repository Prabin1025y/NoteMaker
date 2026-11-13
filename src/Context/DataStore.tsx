import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import { devtools } from "zustand/middleware";
import { EditorDataType } from "@/types/Editor";
import { apiFetch } from "@/lib/api-client";
import { isEqual } from "lodash";
import {
    AddBlockType,
    BlockSyncType,
    BlockType,
    EditBlockType,
} from "@/types/dataSotoreTypes";
import { NoteType } from "@/types/custom/notes";
import {
    INITIAL_EDITOR_DATA,
    randomBetweenExclusive,
} from "@/utils/UtilFunctions";
import { queryClient } from "@/lib/query-client";
import { notesKeys } from "@/hooks/custom/useNotes";

const BLOCK_SYNC_COMPARE_KEYS = [
    "order",
    "designId",
    "colorOptionId",
    "content",
    "title",
    "language",
    "type",
] as const;

export type CopiedBlockType = Pick<
    BlockType,
    "type" | "content" | "title" | "language" | "designId" | "colorOptionId"
>;

const getBlockSyncDiffData = (
    previousBlock: BlockType,
    nextBlock: BlockType,
): EditBlockType => {
    const diff: EditBlockType = {};

    for (const key of BLOCK_SYNC_COMPARE_KEYS) {
        if (!isEqual(previousBlock[key], nextBlock[key])) {
            (diff as Record<string, unknown>)[key] = nextBlock[key];
        }
    }

    return diff;
};

const createAddSyncBlock = (block: BlockType): AddBlockType => ({
    publicId: block.publicId,
    noteId: block.noteId,
    createdAt: block.createdAt,
    designId: block.designId,
    colorOptionId: block.colorOptionId,
    type: block.type,
    content: block.content,
    order: block.order,
    title: block.title,
    language: block.language,
});

const getStoredContent = (editorData: EditorDataType): string => {
    switch (editorData.type) {
        case "image":
            return editorData.url;
        case "block":
        case "heading":
        case "canvas":
        case "table":
            return JSON.stringify(editorData.content);
        case "code":
        case "divider":
        case "formula":
            return editorData.content;
    }
};

const buildBlockSyncDiff = (
    previousBlocks: BlockType[],
    nextBlocks: BlockType[],
): BlockSyncType[] => {
    const previousMap = new Map(
        previousBlocks.map((block) => [block.id, block]),
    );
    const nextMap = new Map(nextBlocks.map((block) => [block.id, block]));
    const syncDiffs: BlockSyncType[] = [];

    for (const previousBlock of previousBlocks) {
        const nextBlock = nextMap.get(previousBlock.id);

        if (!nextBlock) {
            syncDiffs.push({ id: previousBlock.id, action: "delete" });
            continue;
        }

        const data = getBlockSyncDiffData(previousBlock, nextBlock);
        if (Object.keys(data).length > 0) {
            syncDiffs.push({
                id: previousBlock.id,
                action: "edit",
                data,
            });
        }
    }

    for (const nextBlock of nextBlocks) {
        if (!previousMap.has(nextBlock.id)) {
            syncDiffs.push({
                id: nextBlock.id,
                action: "add",
                block: createAddSyncBlock(nextBlock),
            });
        }
    }

    return syncDiffs;
};

type Store = {
    blocks: BlockType[];
    syncedBlocks: BlockType[];
    title: string;
    draggingBlockId: string | null;
    activeBlockId: string | null;
    copiedContent: CopiedBlockType | null;
    blocksToBeSynced: BlockSyncType[];
    historyPast: BlockType[][];
    historyFuture: BlockType[][];
    searchQuery: string;
    editorDataState: EditorDataType;

    isReadOnly: boolean;
    isSyncing: boolean;
    isExporting: boolean;
    isPreviewMode: boolean;
    doSaveImmediately: boolean;
    isAiOpen: boolean;
    isGenerating: boolean;
    isEditorOpen: boolean;
    currentNote: NoteType | null;

    setTitle: (title: string) => void;
    setBlocks: (blocks: BlockType[], recordHistory?: boolean) => void;
    setDraggingBlockId: (id: string | null) => void;
    setActiveBlockId: (id: string | null) => void;
    setCopiedContent: (content: CopiedBlockType | null) => void;
    setSearchQuery: (query: string) => void;
    setEditorDataState: (data: EditorDataType) => void;

    setReadOnly: (value: boolean) => void;
    setIsSyncing: (value: boolean) => void;
    setIsExporting: (value: boolean) => void;
    setIsPreviewMode: (value: boolean) => void;
    setDoSaveImmediately: (value: boolean) => void;
    setIsAiOpen: (value: boolean) => void;
    setIsGenerating: (value: boolean) => void;
    setIsEditorOpen: (value: boolean) => void;

    loadNote: (ownedNote: NoteType, blocks: BlockType[]) => Promise<void>;
    loadPublicNote: (
        note: NoteType,
        isOwner: boolean,
        blocks: BlockType[],
    ) => void;
    initializeSyncedBlocks: () => void;

    addSaveBlock: (editorData: EditorDataType) => void;
    addCopiedBlock: (
        content: CopiedBlockType,
        order: number | "auto",
    ) => void;
    duplicateBlock: (id: string) => void;
    deleteBlock: (id: string) => void;

    pushToBlocksToBeSynced: (data: BlockSyncType) => void;
    syncToDB: () => Promise<void>;

    undo: () => void;
    redo: () => void;
    canUndo: () => boolean;
    canRedo: () => boolean;
    snapshotHistory: () => void;
};

export const useNoteStore = create<Store>()(
    devtools((set, get) => ({
        blocks: [],
        title: "Untitled Note",
        draggingBlockId: null,
        activeBlockId: null,
        copiedContent: null,
        blocksToBeSynced: [],
        historyPast: [],
        historyFuture: [],
        syncedBlocks: [],
        currentNote: null,

        isReadOnly: true,
        isSyncing: false,
        isExporting: false,
        isPreviewMode: false,
        isAiOpen: false,
        isGenerating: false,
        isEditorOpen: false,
        doSaveImmediately: false,
        searchQuery: "",
        editorDataState: INITIAL_EDITOR_DATA,

        setIsSyncing: (value) => set({ isSyncing: value }),
        setIsExporting: (value) => set({ isExporting: value }),
        setIsPreviewMode: (value) => set({ isPreviewMode: value }),
        setDoSaveImmediately: (value) => set({ doSaveImmediately: value }),
        setIsAiOpen: (value) => set({ isAiOpen: value }),
        setIsGenerating: (value) => set({ isGenerating: value }),
        setIsEditorOpen: (value) => set({ isEditorOpen: value }),
        setEditorDataState: (data) => set({ editorDataState: data }),
        setSearchQuery: (query) => set({ searchQuery: query }),

        setTitle: (title) => set({ title }),
        setBlocks: (blocks, recordHistory = true) => {
            // Setting blocks must work in read-only mode too (public viewers
            // receive fetched blocks); only history recording is skipped.
            if (isEqual(get().blocks, blocks)) return;
            if (!get().isReadOnly && recordHistory) get().snapshotHistory();
            set({ blocks });
        },
        setDraggingBlockId: (id) => set({ draggingBlockId: id }),
        setActiveBlockId: (id) => set({ activeBlockId: id }),
        setCopiedContent: (content) => set({ copiedContent: content }),
        setReadOnly: (value) => set({ isReadOnly: value }),

        initializeSyncedBlocks: () => set({ syncedBlocks: get().blocks }),

        snapshotHistory: () => {
            const current = get().blocks;
            set({
                historyPast: [
                    ...get().historyPast,
                    structuredClone(current),
                ].slice(-50),
                historyFuture: [],
            });
        },

        canUndo: () => get().historyPast.length > 0 && !get().isSyncing,
        canRedo: () => get().historyFuture.length > 0 && !get().isSyncing,

        undo: () => {
            if (get().isReadOnly || get().isSyncing) return;
            const past = get().historyPast;
            if (past.length === 0) return;

            const previous = past[past.length - 1];
            const currentBlocks = structuredClone(get().blocks);

            set({
                blocks: previous,
                historyPast: past.slice(0, -1),
                historyFuture: [currentBlocks, ...get().historyFuture],
            });

            for (const syncDiff of buildBlockSyncDiff(
                currentBlocks,
                previous,
            )) {
                get().pushToBlocksToBeSynced(syncDiff);
            }
        },

        redo: () => {
            if (get().isReadOnly || get().isSyncing) return;
            const future = get().historyFuture;
            if (future.length === 0) return;

            const next = future[0];
            const currentBlocks = structuredClone(get().blocks);

            set({
                blocks: next,
                historyFuture: future.slice(1),
                historyPast: [...get().historyPast, currentBlocks],
            });

            for (const syncDiff of buildBlockSyncDiff(currentBlocks, next)) {
                get().pushToBlocksToBeSynced(syncDiff);
            }
        },

        loadNote: async (ownedNote, blocks) => {
            const notes = queryClient.getQueryData<NoteType[]>(
                notesKeys.allList(),
            );
            set({
                title: ownedNote.title,
                isReadOnly: false,
                currentNote: ownedNote,
                blocks,
                syncedBlocks: blocks,
                blocksToBeSynced: [],
                historyPast: [],
                historyFuture: [],
            });
        },

        loadPublicNote: (note, isOwner, blocks) => {
            // Viewer path: the note isn't in the user's own list, so set it as
            // the current note directly. Non-owners get a read-only session.
            set({
                title: note.title,
                currentNote: note,
                isReadOnly: !isOwner,
                blocks,
                syncedBlocks: blocks,
                blocksToBeSynced: [],
                historyPast: [],
                historyFuture: [],
            });
        },

        addSaveBlock: (editorData) => {
            if (get().isReadOnly) return;
            const currentNote = get().currentNote;
            if (!currentNote) return;
            get().snapshotHistory();
            const content = getStoredContent(editorData);

            if (editorData.action === "add") {
                const lastBlockOrder = get().blocks.at(-1)?.order;
                const publicId = uuidv4();

                if (!currentNote)
                    return alert("No note is currently in session");

                const order =
                    editorData.order === "auto"
                        ? lastBlockOrder
                            ? lastBlockOrder + 1
                            : 1
                        : editorData.order;
                const block: BlockType = {
                    id: publicId,
                    publicId,
                    order,
                    designId: editorData.designId,
                    colorOptionId: editorData.colorOptionId,
                    content,
                    type: editorData.type,
                    title: editorData.title,
                    language:
                        editorData.type === "code"
                            ? editorData.language
                            : null,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    noteId: currentNote.id,
                };
                set({
                    blocks: [...get().blocks, block].sort(
                        (a, b) => a.order - b.order,
                    ),
                });

                const blockToSync: AddBlockType = {
                    publicId: block.publicId,
                    noteId: block.noteId,
                    createdAt: block.createdAt,
                    designId: block.designId,
                    colorOptionId: block.colorOptionId,
                    type: block.type,
                    content: block.content,
                    order: block.order,
                    title: block.title,
                    language: block.language,
                };

                get().pushToBlocksToBeSynced({
                    id: block.id,
                    action: "add",
                    block: blockToSync,
                });
            } else {
                const blockToBeChanged = get().blocks.find(
                    (b) => b.id === editorData.id,
                );
                if (!blockToBeChanged) return;

                const changedBlock: EditBlockType = {
                    ...(editorData.designId !== blockToBeChanged.designId && {
                        designId: editorData.designId,
                    }),
                    ...(editorData.colorOptionId !==
                        blockToBeChanged.colorOptionId && {
                        colorOptionId: editorData.colorOptionId,
                    }),
                    ...(content !== blockToBeChanged.content && { content }),
                    ...(editorData.title !== blockToBeChanged.title && {
                        title: editorData.title,
                    }),
                    ...(editorData.type !== blockToBeChanged.type && {
                        type: editorData.type,
                    }),
                    ...((editorData.type === "code"
                        ? editorData.language
                        : null) !== blockToBeChanged.language && {
                        language:
                            editorData.type === "code"
                                ? editorData.language
                                : null,
                    }),
                };

                set({
                    blocks: get().blocks.map((b) =>
                        b.id === editorData.id
                            ? {
                                  ...b,
                                  ...changedBlock,
                              }
                            : b,
                    ),
                });
                get().pushToBlocksToBeSynced({
                    id: editorData.id,
                    action: "edit",
                    data: changedBlock,
                });
            }
        },

        addCopiedBlock: (content, requestedOrder) => {
            if (get().isReadOnly) return;
            const currentNote = get().currentNote;
            if (!currentNote) return;

            const now = new Date();
            const publicId = uuidv4();
            const order =
                requestedOrder === "auto"
                    ? (get().blocks.at(-1)?.order ?? 0) + 1
                    : requestedOrder;
            const copiedBlock: BlockType = {
                ...content,
                id: publicId,
                publicId,
                order,
                createdAt: now,
                updatedAt: now,
                noteId: currentNote.id,
            };

            get().snapshotHistory();
            set({
                blocks: [...get().blocks, copiedBlock].sort(
                    (a, b) => a.order - b.order,
                ),
            });
            get().pushToBlocksToBeSynced({
                id: copiedBlock.id,
                action: "add",
                block: createAddSyncBlock(copiedBlock),
            });
        },

        duplicateBlock: (id) => {
            const currentBlocks = get().blocks;
            const blockIndex = currentBlocks.findIndex(
                (block) => block.id === id,
            );
            if (blockIndex === -1) return;

            const sourceBlock = currentBlocks[blockIndex];
            const nextBlock = currentBlocks[blockIndex + 1];
            const order = nextBlock
                ? randomBetweenExclusive(sourceBlock.order, nextBlock.order)
                : sourceBlock.order + 1;
            get().addCopiedBlock(
                {
                    type: sourceBlock.type,
                    content: sourceBlock.content,
                    title: sourceBlock.title,
                    language: sourceBlock.language,
                    designId: sourceBlock.designId,
                    colorOptionId: sourceBlock.colorOptionId,
                },
                order,
            );
        },

        deleteBlock: (id) => {
            if (get().isReadOnly) return;
            get().snapshotHistory();
            set({ blocks: get().blocks.filter((block) => block.id !== id) });
            get().pushToBlocksToBeSynced({ id, action: "delete" });
        },

        pushToBlocksToBeSynced: (data) => {
            if (isEqual(get().blocks, get().syncedBlocks)) {
                set({ blocksToBeSynced: [] });
                return;
            }

            const blocksToBeSynced = [...get().blocksToBeSynced];
            const existsIndex = blocksToBeSynced.findIndex(
                (item) => item.id === data.id,
            );

            if (existsIndex === -1) {
                set({ blocksToBeSynced: [...blocksToBeSynced, data] });
                return;
            }

            const exists = blocksToBeSynced[existsIndex];

            if (exists.action === "delete") {
                if (data.action === "add") {
                    blocksToBeSynced.splice(existsIndex, 1, data);
                    set({ blocksToBeSynced });
                    return;
                }

                return;
            }

            if (exists.action === "add") {
                if (data.action === "delete") {
                    blocksToBeSynced.splice(existsIndex, 1);
                    set({ blocksToBeSynced });
                    return;
                }

                if (data.action !== "edit") return;

                const newAddData = { ...exists.block, ...data.data };
                blocksToBeSynced.splice(existsIndex, 1, {
                    ...exists,
                    block: newAddData,
                });
                set({ blocksToBeSynced });
                return;
            }

            if (data.action === "delete") {
                blocksToBeSynced.splice(existsIndex, 1, data);
                set({ blocksToBeSynced });
                return;
            }

            if (data.action !== "edit") return;

            const newEditData = { ...exists.data, ...data.data };
            blocksToBeSynced.splice(existsIndex, 1, {
                ...exists,
                data: newEditData,
            });
            set({ blocksToBeSynced });
        },

        syncToDB: async () => {
            if (get().isReadOnly) return;
            if (get().blocksToBeSynced.length === 0) return;

            const backupBlocksToBeSynced = structuredClone(
                get().blocksToBeSynced,
            );

            // Snapshot the blocks state representing what we are sending right now
            const blocksSnapshotAtSave = structuredClone(get().blocks);
            set({ blocksToBeSynced: [] });

            try {
                const res = await apiFetch(
                    `${process.env.NEXT_PUBLIC_WEBSITE_URL}/api/notes/save`,
                    {
                        method: "POST",
                        body: JSON.stringify(backupBlocksToBeSynced),
                    },
                );

                const data = await res.json();

                if (!res.ok) {
                    alert("Couldn't save!");
                    // Merge backup items back cleanly using pushToBlocksToBeSynced to avoid duplicate/conflicting entries
                    for (const item of backupBlocksToBeSynced) {
                        get().pushToBlocksToBeSynced(item);
                    }
                    return;
                }

                const addedData = data.addedData as
                    | Array<{ id: string; publicId: string }>
                    | undefined;

                if (
                    addedData &&
                    Array.isArray(addedData) &&
                    addedData.length > 0
                ) {
                    const idMap = new Map(
                        addedData.map((item) => [item.publicId, item.id]),
                    );

                    // 1. Update IDs in current live blocks
                    const updatedBlocks = get().blocks.map((block) => {
                        const newId = idMap.get(block.publicId);
                        return newId ? { ...block, id: newId } : block;
                    });

                    // 2. Update IDs in snapshot for syncedBlocks
                    const updatedSnapshot = blocksSnapshotAtSave.map(
                        (block) => {
                            const newId = idMap.get(block.publicId);
                            return newId ? { ...block, id: newId } : block;
                        },
                    );

                    // 3. Remap IDs in any actions that were added to blocksToBeSynced while saving
                    const updatedBlocksToBeSynced = get().blocksToBeSynced.map(
                        (item) => {
                            const newId = idMap.get(item.id);
                            return newId ? { ...item, id: newId } : item;
                        },
                    );

                    // 4. Remap IDs in historyPast and historyFuture so undo/redo doesn't resurrect stale client UUIDs
                    const remapHistory = (history: BlockType[][]) =>
                        history.map((snapshot) =>
                            snapshot.map((block) => {
                                const newId = idMap.get(block.publicId);
                                return newId ? { ...block, id: newId } : block;
                            }),
                        );

                    set({
                        blocks: updatedBlocks,
                        syncedBlocks: updatedSnapshot,
                        blocksToBeSynced: updatedBlocksToBeSynced,
                        historyPast: remapHistory(get().historyPast),
                        historyFuture: remapHistory(get().historyFuture),
                    });
                } else {
                    set({
                        syncedBlocks: blocksSnapshotAtSave,
                    });
                }
            } catch (error) {
                if (process.env.NODE_ENV === "development") console.log(error);

                for (const item of backupBlocksToBeSynced) {
                    get().pushToBlocksToBeSynced(item);
                }

                alert(
                    error instanceof Error
                        ? error.message
                        : "Error while saving document",
                );
            }
        },
    })),
);
