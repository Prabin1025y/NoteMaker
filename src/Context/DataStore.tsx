import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import { devtools } from "zustand/middleware";
import { blockTypeOptions, EditorData } from "@/types/Editor";
import { createNote, isValidJson } from "@/utils/UtilFunctions";
import { apiFetch } from "@/lib/api-client";

export interface BlockType {
    id: string;
    designId: number;
    colorOptionId: number;
    type: blockTypeOptions;
    content: string;
    order: number;
    title?: string;
}

export interface NoteType {
    id: string;
    title: string;
    blocks: BlockType[];
    createdAt: Date;
    updatedAt: Date;
    description: string;
    author: string;
}

export type BlockSyncType = {
    id: string;
} & (
    | {
          action: "add";
          block: Omit<BlockType, "id">;
      }
    | {
          action: "delete";
      }
    | {
          action: "edit";
          data: Partial<Omit<BlockType, "id">>;
      }
);

type Store = {
    currentNote: NoteType | null;
    blocks: BlockType[];
    title: string;
    notes: NoteType[];
    draggingBlockId: string | null;
    blocksToBeSynced: BlockSyncType[];

    setTitle: (title: string) => void;
    setBlocks: (blocks: BlockType[]) => void;
    setDraggingBlockId: (id: string | null) => void;

    createNote: (title?: string, description?: string) => Promise<NoteType>;
    LoadNotesFromLocalStorage: () => Promise<void>;
    deleteNote: (id: string) => void;
    loadNote: (id: string) => void;
    updateNoteTitle: (title: string) => void;

    addSaveBlock: (editorData: EditorData) => void;
    deleteBlock: (id: string) => void;
    duplicateBlock: (id: string) => void;

    pushToBlocksToBeSynced: (data: BlockSyncType) => void;
    syncLocally: () => void;
    syncToDB: () => Promise<void>;
};

export const useNoteStore = create<Store>()(
    devtools((set, get) => ({
        currentNote: null,
        blocks: [],
        title: "Untitled Note",
        notes: [],
        draggingBlockId: null,
        blocksToBeSynced: [],

        setTitle: (title) => set({ title }),
        setBlocks: (blocks) => set({ blocks }),
        setDraggingBlockId: (id) => set({ draggingBlockId: id }),

        createNote: async (title = "Untitled Note", description = "") => {
            const newNote: NoteType = {
                id: uuidv4(),
                author: "Author",
                description: description,
                title: title,
                blocks: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            set({
                notes: [...get().notes, newNote],
            });
            const note = await createNote(newNote);
            if (note.id) newNote.id = note.id;
            get().syncLocally();
            get().loadNote(newNote.id);
            return newNote;
        },

        LoadNotesFromLocalStorage: async () => {
            // try {
            //     const res = await apiFetch("http://localhost:3000/api/notes", {
            //         method: "GET",
            //     });

            //     const data = await res.json()

            //     set({notes: data.notes.map(item=>({
            //         id: item.id,
            //         author: "Author",
            //         description: item.description,
            //         title: item.title,
            //         blocks: 
            //     }))})
            // } catch (error) {
            //     if (process.env.NODE_ENV === "development") console.log(error);

            //     alert("Error while fetching data");
            // }

            const notesString = localStorage.getItem("notes");
            if (!notesString) return;
            const notes = isValidJson(notesString)
                ? JSON.parse(notesString)
                : null;

            if (!notes) return;

            set({ notes: notes.notes });
        },

        deleteNote: (id) => {
            set({ notes: get().notes.filter((note) => note.id !== id) });
        },

        loadNote: (id) => {
            const note = get().notes.find((note) => note.id === id);
            set({
                title: note?.title,
                currentNote: note,
                blocks: note?.blocks,
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
            if (editorData.action === "add") {
                const lastBlockOrder = get().blocks.at(-1)?.order;
                console.log(lastBlockOrder);
                const block: BlockType = {
                    id: uuidv4(),
                    order: lastBlockOrder ? lastBlockOrder + 1 : 1,
                    designId: editorData.designId,
                    colorOptionId: editorData.colorOptionId,
                    content: editorData.content,
                    type: editorData.type,
                    title: editorData.title,
                };
                set({ blocks: [...get().blocks, block] });

                const { id, ...blockToSync } = block;
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

                const changedBlock: Partial<Omit<BlockType, "id">> = {};
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
            set({ blocks: get().blocks.filter((block) => block.id !== id) });
            get().syncLocally();
            get().pushToBlocksToBeSynced({ id, action: "delete" });
        },

        duplicateBlock: (id) => {
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
                blocks: get().blocks,
                updatedAt: new Date(),
            };

            set({
                notes: get().notes.map((note) =>
                    note.id === currentNoteId ? updatedNote : note,
                ),
            });
            // localStorage.setItem(
            //     "notes",
            //     JSON.stringify({
            //         notes: get().notes.map((note) =>
            //             note.id === currentNoteId ? updatedNote : note,
            //         ),
            //     }),
            // );
        },
        pushToBlocksToBeSynced: (data) => {
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

                const res = await apiFetch(
                    "http://localhost:3000/api/notes/save",
                    {
                        method: "POST",
                        body: JSON.stringify({
                            noteId: get().currentNote?.id,
                            data: get().blocksToBeSynced,
                        }),
                    },
                );

                set({ blocksToBeSynced: [] });

                const data = await res.json();

                if (data?.success) alert("Saved successfully");
            } catch (error) {
                if (process.env.NODE_ENV === "development") console.log(error);

                console.log("Error while saving document");
            }
        },
    })),
);
