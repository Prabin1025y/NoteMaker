import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import { devtools } from "zustand/middleware";
import { blockTypeOptions, EditorData } from "@/types/Editor";
import { getBlocksFromNoteId } from "@/utils/UtilFunctions";
import { apiFetch } from "@/lib/api-client";
import { createNote, fetchNotes } from "@/services/noteService";
import { isEqual } from "lodash";

// export interface BlockType {
//     id: string;
//     type: blockTypeOptions;
//     content: string;
//     designId: number;
//     colorOptionId: number;
//     title: string | null;
//     order: number;
// }

export interface BlockType {
    id: string;
    publicId: string;
    noteId: string;
    createdAt: Date;
    updatedAt: Date;
    type: blockTypeOptions;
    content: string;
    designId: number;
    colorOptionId: number;
    title: string | null;
    order: number;
}

export interface NoteType {
    id: string;
    title: string;
    blocksCount: number;
    createdAt: Date;
    updatedAt: Date;
    description: string;
    authorName: string;
    authorId: string;
}

type AddBlockType = Omit<BlockType, "id" | "updatedAt">;
type EditBlockType = Partial<
    Omit<BlockType, "id" | "publicId" | "createdAt" | "updatedAt" | "noteId">
>;

export type BlockSyncType = {
    id: string;
} & (
    | {
          action: "add";
          block: AddBlockType;
      }
    | {
          action: "delete";
      }
    | {
          action: "edit";
          data: EditBlockType;
      }
);

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

    setTitle: (title: string) => void;
    setBlocks: (blocks: BlockType[], recordHistory?: boolean) => void;
    setDraggingBlockId: (id: string | null) => void;
    setActiveBlockId: (id: string | null) => void;
    setNotes: (notes: NoteType[]) => void;

    createNote: (title?: string, description?: string) => Promise<NoteType>;
    deleteNote: (id: string) => void;
    loadNote: (id: string) => Promise<void>;
    updateNoteTitle: (title: string) => void;

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

        setTitle: (title) => set({ title }),
        setBlocks: (blocks, recordHistory = true) => {
            if (recordHistory) get().snapshotHistory();
            set({ blocks });
        },
        setDraggingBlockId: (id) => set({ draggingBlockId: id }),
        setActiveBlockId: (id) => set({ activeBlockId: id }),
        setNotes: (notes) => set({ notes }),

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
            const past = get().historyPast;
            if (past.length === 0) return;
            const previous = past[past.length - 1];
            set({
                blocks: previous,
                historyPast: past.slice(0, -1),
                historyFuture: [
                    structuredClone(get().blocks),
                    ...get().historyFuture,
                ],
            });
            get().syncLocally();
        },

        redo: () => {
            const future = get().historyFuture;
            if (future.length === 0) return;
            const next = future[0];
            set({
                blocks: next,
                historyFuture: future.slice(1),
                historyPast: [
                    ...get().historyPast,
                    structuredClone(get().blocks),
                ],
            });
            get().syncLocally();
        },

        createNote: async (title = "Untitled Note", description = "") => {
            const { note, authorName } = await createNote(title, description);
            const newNote: NoteType = {
                id: note.id,
                authorName: authorName,
                description: note.description,
                title: note.title,
                blocksCount: note._count.blocks,
                createdAt: note.createdAt,
                updatedAt: note.updatedAt,
                authorId: note.authorId,
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

        loadNote: async (id) => {
            if (get().notes.length === 0) {
                const { notes, authorName } = await fetchNotes();

                if (notes && Array.isArray(notes)) {
                    get().setNotes(
                        notes.map((n) => ({
                            id: n.id,
                            title: n.title,
                            blocksCount: n._count.blocks,
                            createdAt: n.createdAt,
                            updatedAt: n.updatedAt,
                            description: n.description,
                            authorName,
                            authorId: n.authorId,
                        })),
                    );
                }
            }

            const note = get().notes.find((note) => note.id === id);
            const blocks: BlockType[] = await getBlocksFromNoteId(id);
            const sortedBlocks = blocks.sort((a, b) => a.order - b.order);
            set({
                title: note?.title,
                currentNote: note,
                blocks: sortedBlocks,
                syncedBlocks: sortedBlocks,
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

                const { id, updatedAt, ...blockToSync } = block;
                get().pushToBlocksToBeSynced({
                    id,
                    action: "add",
                    block: blockToSync,
                });
            } else {
                const blockToBeChanged = get().blocks.find(
                    (b) => b.id === editorData.id,
                );
                if (!blockToBeChanged) return;

                const changedBlock: EditBlockType = {};
                const keysToCompare: Array<keyof Omit<BlockType, "id">> = [
                    "designId",
                    "colorOptionId",
                    "content",
                    "title",
                    "type",
                ];

                for (const key of keysToCompare) {
                    const editorValue = editorData[key as keyof EditorData];
                    if (editorValue !== blockToBeChanged[key]) {
                        (changedBlock as any)[key] = editorValue;
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
            get().snapshotHistory();
            set({ blocks: get().blocks.filter((block) => block.id !== id) });
            get().syncLocally();
            get().pushToBlocksToBeSynced({ id, action: "delete" });
        },

        duplicateBlock: (id) => {
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

            const exists = get().blocksToBeSynced.find(
                (item) => item.id === data.id,
            );
            if (!exists) {
                set({ blocksToBeSynced: [...get().blocksToBeSynced, data] });
                return;
            }

            // Invalid cases
            if (exists.action === "delete" || data.action === "add") return;

            if (exists.action === "add") {
                // add --> delete
                if (data.action === "delete") {
                    set({
                        blocksToBeSynced: get().blocksToBeSynced.filter(
                            (b) => b.id !== exists.id,
                        ),
                    });
                    return;
                }

                // Guaranteed that new action will is edit: add --> edit
                const newAddData = { ...exists.block, ...data.data };
                set({
                    blocksToBeSynced: [
                        ...get().blocksToBeSynced.filter(
                            (b) => b.id !== exists.id,
                        ),
                        { ...exists, block: newAddData },
                    ],
                });
                return;
            }

            // Guaranteed that existing action is edit: edit --> delete
            if (data.action === "delete") {
                set({
                    blocksToBeSynced: [
                        ...get().blocksToBeSynced.filter(
                            (b) => b.id !== exists.id,
                        ),
                        data,
                    ],
                });
                return;
            }

            //Guaranteed that new action will be edit: edit --> edit
            const newAddData = { ...exists.data, ...data.data };
            set({
                blocksToBeSynced: [
                    ...get().blocksToBeSynced.filter((b) => b.id !== exists.id),
                    { ...exists, data: newAddData },
                ],
            });
        },

        syncToDB: async () => {
            try {
                if (get().blocksToBeSynced.length === 0) return;
                const currentBlocks = get().blocks;

                const res = await apiFetch(
                    `${process.env.NEXT_PUBLIC_WEBSITE_URL}/api/notes/save`,
                    {
                        method: "POST",
                        body: JSON.stringify(get().blocksToBeSynced),
                    },
                );

                const data = await res.json();

                if (res.ok) {
                    set({ blocksToBeSynced: [], syncedBlocks: currentBlocks });
                    alert("Saved successfully");
                } else {
                    alert("Couldn't save!");
                    return;
                }

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

                    const tempBlocks = get().blocks;

                    for (const block of tempBlocks) {
                        const newId = idMap.get(block.publicId);
                        if (newId) block.id = newId;
                    }

                    set({ blocks: tempBlocks });
                }
            } catch (error) {
                if (process.env.NODE_ENV === "development") console.log(error);

                alert(
                    error instanceof Error
                        ? error.message
                        : "Error while saving document",
                );
            }
        },
    })),
);
