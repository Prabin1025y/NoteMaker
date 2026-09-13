import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import { devtools } from "zustand/middleware";
import { EditorData } from "@/types/Editor";
import { apiFetch } from "@/lib/api-client";
import { createNote, updateNote } from "@/services/noteService";
import { isEqual } from "lodash";
import {
    AddBlockType,
    BlockSyncType,
    BlockType,
    EditBlockType,
    NoteType,
} from "@/types/dataSotoreTypes";

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
    currentNote: NoteType | null;
    blocks: BlockType[];
    syncedBlocks: BlockType[];
    title: string;
    notes: NoteType[];
    draggingBlockId: string | null;
    activeBlockId: string | null;
    blocksToBeSynced: BlockSyncType[];
    historyPast: BlockType[][];
    historyFuture: BlockType[][];
    isReadOnly: boolean;

    setTitle: (title: string) => void;
    setBlocks: (blocks: BlockType[], recordHistory?: boolean) => void;
    setDraggingBlockId: (id: string | null) => void;
    setActiveBlockId: (id: string | null) => void;
    setNotes: (notes: NoteType[]) => void;
    setReadOnly: (value: boolean) => void;

    createNote: (
        title?: string,
        description?: string,
        folderOptions?: {
            isNewFolder: boolean;
            folderId?: string;
            folderName?: string;
        },
    ) => Promise<NoteType>;
    deleteNote: (id: string) => void;
    toggleNoteFavorite: (id: string) => Promise<void>;
    toggleNotePin: (id: string) => Promise<void>;
    toggleNotePublic: (id: string) => Promise<void>;
    loadNote: (id: string) => Promise<void>;
    loadPublicNote: (note: NoteType, isOwner: boolean) => void;
    updateNoteTitle: (title: string) => void;
    initializeSyncedBlocks: () => void;

    addSaveBlock: (editorData: EditorData) => void;
    deleteBlock: (id: string) => void;
    duplicateBlock: (id: string) => void;

    pushToBlocksToBeSynced: (data: BlockSyncType) => void;
    syncLocally: () => void;
    syncToDB: () => Promise<void>;

    undo: () => void;
    redo: () => void;
    canUndo: () => boolean;
    canRedo: () => boolean;
    snapshotHistory: () => void;
};

export const useNoteStore = create<Store>()(
    devtools((set, get) => ({
        currentNote: null,
        blocks: [],
        title: "Untitled Note",
        notes: [],
        draggingBlockId: null,
        activeBlockId: null,
        blocksToBeSynced: [],
        historyPast: [],
        historyFuture: [],
        syncedBlocks: [],
        isReadOnly: false,

        setTitle: (title) => set({ title }),
        setBlocks: (blocks, recordHistory = true) => {
            // Setting blocks must work in read-only mode too (public viewers
            // receive fetched blocks); only history recording is skipped.
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

        canUndo: () => get().historyPast.length > 0,
        canRedo: () => get().historyFuture.length > 0,

        undo: () => {
            if (get().isReadOnly) return;
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

            get().syncLocally();
        },

        redo: () => {
            if (get().isReadOnly) return;
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

            get().syncLocally();
        },

        createNote: async (
            title = "Untitled Note",
            description = "",
            folderOptions,
        ) => {
            const { note, authorName, folderId } = await createNote(
                title,
                description,
                folderOptions,
            );
            const newNote: NoteType = {
                id: note.id,
                folderId,
                authorName: authorName,
                description: note.description,
                title: note.title,
                blocksCount: note._count.blocks,
                createdAt: note.createdAt,
                updatedAt: note.updatedAt,
                authorId: note.authorId,
                isFavorite: Boolean(note.isFavorite),
                isPinned: Boolean(note.isPinned),
                isPublic: Boolean(note.isPublic),
            };
            set({
                notes: [...get().notes, newNote],
            });
            get().syncLocally();
            get().loadNote(newNote.id);
            return newNote;
        },

        deleteNote: (id) => {
            set({ notes: get().notes.filter((note) => note.id !== id) });
        },

        toggleNoteFavorite: async (id) => {
            const note = get().notes.find((n) => n.id === id);
            if (!note) return;

            const nextValue = !note.isFavorite;

            // Optimistic update.
            set({
                notes: get().notes.map((n) =>
                    n.id === id ? { ...n, isFavorite: nextValue } : n,
                ),
            });

            try {
                await updateNote(id, { isFavorite: nextValue });
            } catch (error) {
                // Roll back on failure.
                set({
                    notes: get().notes.map((n) =>
                        n.id === id ? { ...n, isFavorite: !nextValue } : n,
                    ),
                });
                if (process.env.NODE_ENV === "development") console.log(error);
            }
        },

        toggleNotePin: async (id) => {
            const note = get().notes.find((n) => n.id === id);
            if (!note) return;

            const nextValue = !note.isPinned;

            // Optimistic update.
            set({
                notes: get().notes.map((n) =>
                    n.id === id ? { ...n, isPinned: nextValue } : n,
                ),
            });

            try {
                await updateNote(id, { isPinned: nextValue });
            } catch (error) {
                // Roll back on failure.
                set({
                    notes: get().notes.map((n) =>
                        n.id === id ? { ...n, isPinned: !nextValue } : n,
                    ),
                });
                if (process.env.NODE_ENV === "development") console.log(error);
            }
        },

        toggleNotePublic: async (id) => {
            const current = get().currentNote;
            const note =
                get().notes.find((n) => n.id === id) ??
                (current?.id === id ? current : undefined);
            if (!note) return;

            const nextValue = !note.isPublic;

            // Optimistic update of both the notes list and the open note.
            set({
                notes: get().notes.map((n) =>
                    n.id === id ? { ...n, isPublic: nextValue } : n,
                ),
                currentNote:
                    current && current.id === id
                        ? { ...current, isPublic: nextValue }
                        : current,
            });

            try {
                await updateNote(id, { isPublic: nextValue });
            } catch (error) {
                // Roll back on failure.
                const rolledBackCurrent = get().currentNote;
                set({
                    notes: get().notes.map((n) =>
                        n.id === id ? { ...n, isPublic: !nextValue } : n,
                    ),
                    currentNote:
                        rolledBackCurrent && rolledBackCurrent.id === id
                            ? { ...rolledBackCurrent, isPublic: !nextValue }
                            : rolledBackCurrent,
                });
                if (process.env.NODE_ENV === "development") console.log(error);
            }
        },

        loadNote: async (id) => {
            const note = get().notes.find((note) => note.id === id);
            // Only the owner's own notes live in `notes`; if it isn't here the
            // caller should use loadPublicNote (viewer path) instead.
            if (!note) return;
            set({
                title: note.title,
                currentNote: note,
                isReadOnly: false,
                blocksToBeSynced: [],
                historyPast: [],
                historyFuture: [],
            });
        },

        loadPublicNote: (note, isOwner) => {
            // Viewer path: the note isn't in the user's own list, so set it as
            // the current note directly. Non-owners get a read-only session.
            set({
                title: note.title,
                currentNote: note,
                isReadOnly: !isOwner,
                blocksToBeSynced: [],
                historyPast: [],
                historyFuture: [],
            });
        },

        updateNoteTitle: (title) => {
            set({ title });
            const currentNoteId = get().currentNote?.id;
            if (!currentNoteId) return;

            const updatedNotes = get().notes.map((note) =>
                note.id === currentNoteId
                    ? { ...note, title, updatedAt: new Date() }
                    : note,
            );
            set({ notes: updatedNotes });
        },

        addSaveBlock: (editorData) => {
            if (get().isReadOnly) return;
            get().snapshotHistory();
            if (editorData.action === "add") {
                const lastBlockOrder = get().blocks.at(-1)?.order;
                const publicId = uuidv4();
                const currentNote = get().currentNote;
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
            get().syncLocally();
        },

        deleteBlock: (id) => {
            if (get().isReadOnly) return;
            get().snapshotHistory();
            set({ blocks: get().blocks.filter((block) => block.id !== id) });
            get().syncLocally();
            get().pushToBlocksToBeSynced({ id, action: "delete" });
        },

        duplicateBlock: (id) => {
            if (get().isReadOnly) return;
            get().snapshotHistory();
            const existingBlocks = get().blocks;
            const blockIndex = existingBlocks.findIndex(
                (block) => block.id === id,
            );
            const block = existingBlocks.find((block) => block.id === id);
            if (!block) return;

            const newBlock: BlockType = {
                ...block,
                id: uuidv4(),
            };

            const beforeItems = existingBlocks.slice(0, blockIndex + 1);
            const afterItems = existingBlocks.slice(blockIndex + 1);
            set({ blocks: [...beforeItems, newBlock, ...afterItems] });
            get().syncLocally();
        },

        syncLocally: () => {
            const currentNoteId = get().currentNote?.id;
            const note = get().notes.find((note) => note.id === currentNoteId);
            if (!note) return;
            const updatedNote: NoteType = {
                ...note,
                blocksCount: get().blocks.length,
                updatedAt: new Date(),
            };

            set({
                notes: get().notes.map((note) =>
                    note.id === currentNoteId ? updatedNote : note,
                ),
            });
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
                    blocksToBeSynced: get().blocksToBeSynced.concat(backupBlocksToBeSynced)
                })

                alert(
                    error instanceof Error
                        ? error.message
                        : "Error while saving document",
                );
            }
        },
    })),
);
