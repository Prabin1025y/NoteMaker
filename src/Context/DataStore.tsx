import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import { devtools } from "zustand/middleware";
import { EditorData } from "@/types/Editor";
import { apiFetch } from "@/lib/api-client";
import { isEqual, isSymbol } from "lodash";
import {
    AddBlockType,
    BlockSyncType,
    BlockType,
    EditBlockType,
} from "@/types/dataSotoreTypes";
import { NoteType } from "@/types/custom/notes";
import { initialJsonForEditor } from "@/utils/UtilFunctions";

const BLOCK_SYNC_COMPARE_KEYS = [
    "order",
    "designId",
    "colorOptionId",
    "content",
    "title",
    "type",
] as const;

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
});

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
    notes: NoteType[];
    draggingBlockId: string | null;
    activeBlockId: string | null;
    blocksToBeSynced: BlockSyncType[];
    historyPast: BlockType[][];
    historyFuture: BlockType[][];
    searchQuery: string;
    editorData: EditorData;

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
    setNotes: (notes: NoteType[]) => void;
    setSearchQuery: (query: string) => void;
    setEditorData: (data: EditorData) => void;

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

    addSaveBlock: (editorData: EditorData) => void;
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
        notes: [],
        draggingBlockId: null,
        activeBlockId: null,
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
        editorData: {
            id: "",
            designId: 1,
            order: "auto",
            colorOptionId: 1,
            title: "",
            content: initialJsonForEditor,
            type: "block",
            action: "add",
        },

        setIsSyncing: (value) => set({ isSyncing: value }),
        setIsExporting: (value) => set({ isExporting: value }),
        setIsPreviewMode: (value) => set({ isPreviewMode: value }),
        setDoSaveImmediately: (value) => set({ doSaveImmediately: value }),
        setIsAiOpen: (value) => set({ isAiOpen: value }),
        setIsGenerating: (value) => set({ isGenerating: value }),
        setIsEditorOpen: (value) => set({ isEditorOpen: value }),
        setEditorData: (data) => set({ editorData: data }),
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
        setNotes: (notes) => set({ notes }),
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
                    content: editorData.content,
                    type: editorData.type,
                    title: editorData.title,
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

                const changedBlock: EditBlockType = {};
                const keysToCompare: Array<
                    keyof Pick<
                        BlockType,
                        | "designId"
                        | "colorOptionId"
                        | "content"
                        | "title"
                        | "type"
                    >
                > = ["designId", "colorOptionId", "content", "title", "type"];

                for (const key of keysToCompare) {
                    const editorValue = editorData[key as keyof EditorData];
                    if (editorValue !== blockToBeChanged[key]) {
                        (changedBlock as Record<string, unknown>)[key] =
                            editorValue;
                    }
                }

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
            const backupBlocksToBeSynced = structuredClone(
                get().blocksToBeSynced,
            );
            try {
                if (get().isReadOnly) return;
                if (get().blocksToBeSynced.length === 0) return;
                set({ blocksToBeSynced: [] });

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
                    set({ blocksToBeSynced: backupBlocksToBeSynced });
                    return;
                }

                const savedBlocks = structuredClone(get().blocks);
                const addedData = data.addedData;

                // Update ids of newly added blocks
                if (
                    addedData &&
                    Array.isArray(addedData) &&
                    addedData.length > 0
                ) {
                    const idMap = new Map(
                        addedData.map((item) => [item.publicId, item.id]),
                    );

                    for (const block of savedBlocks) {
                        const newId = idMap.get(block.publicId);
                        if (newId) block.id = newId;
                    }
                }

                set({
                    blocks: savedBlocks,
                    syncedBlocks: savedBlocks,
                });
            } catch (error) {
                if (process.env.NODE_ENV === "development") console.log(error);
                //TODO: bug of duplicate entry
                set({
                    blocksToBeSynced: get().blocksToBeSynced.concat(
                        backupBlocksToBeSynced,
                    ),
                });

                alert(
                    error instanceof Error
                        ? error.message
                        : "Error while saving document",
                );
            }
        },
    })),
);
