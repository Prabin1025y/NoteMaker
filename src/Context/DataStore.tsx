import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import { ElementType } from "react";
import DefinitionBlock from "@/components/Blocks/DefinitionBlock";
import NoteBlock from "@/components/Blocks/NoteBlock";
import { devtools } from "zustand/middleware";
import { EditorData } from "@/types/Editor";

export type blockTypeOptions =
    | "definition"
    | "note"
    | "tips"
    | "code"
    | "example"
    | "image"
    | "table"
    | "divider"
    | "formula"
    | "text";

export interface BlockType {
    id: string;
    type: blockTypeOptions;
    content: string;
    title?: string;
}
export interface NoteType {
    id: string;
    title: string;
    blocks: BlockType[];
    createdAt: Date;
    updatedAt: Date;
    author: string;
}

type Store = {
    currentNote: NoteType | null;
    blocks: BlockType[];
    title: string;
    notes: NoteType[];

    createNote: () => void;
    deleteNote: (id: string) => void;
    loadNote: (id: string) => void;
    setTitle: (title: string) => void;
    setBlocks: (blocks: BlockType[]) => void;

    mapTypeToElement: (type: blockTypeOptions) => ElementType | null;

    addSaveBlock: (editorData: EditorData) => void;
    saveBlock: (editorData: EditorData) => void;
    deletetBlock: (id: string) => void;
    duplicateBlock: (id: string) => void;

    syncLocally: () => void;
};

export const useNoteStore = create<Store>()(
    devtools((set, get) => ({
        currentNote: null,
        blocks: [
            {
                id: "405a6215-fcaa-4ed8-bd0a-bd80a5e4c201",
                content: `{"type":"doc","content":[{"type":"paragraph","attrs":{"textAlign":null},"content":[{"type":"text","text":"Definition 1"}]}]}`,
                type: "definition",
                title: "Definition 1",
            },
            {
                id: "2bc3404c-6486-4f28-a42b-73258fa9340b",
                content: `{"type":"doc","content":[{"type":"paragraph","attrs":{"textAlign":null},"content":[{"type":"text","text":"Note 1"}]}]}`,
                type: "note",
                title: "Note 1",
            },
            {
                id: "7cfc2d35-9c91-4ea2-8862-e87f5f080884",
                content: `{"type":"doc","content":[{"type":"paragraph","attrs":{"textAlign":null},"content":[{"type":"text","text":"Definition 2"}]}]}`,
                type: "definition",
                title: "Definition 2",
            },
            {
                id: "3a6cb155-203f-4cfa-88eb-a10e9a793999",
                content: `{"type":"doc","content":[{"type":"paragraph","attrs":{"textAlign":null},"content":[{"type":"text","text":"Note 2"}]}]}`,
                type: "note",
                title: "Note 2",
            },
            {
                id: "ad8e51d2-93b6-4f9a-bfca-cd0a6635c13d",
                content: `{"type":"doc","content":[{"type":"paragraph","attrs":{"textAlign":null},"content":[{"type":"text","text":"Definition 3"}]}]}`,
                type: "definition",
                title: "Definition 3",
            },
        ],
        title: "Untitled Note",
        notes: [],

        createNote: () => {
            const newNote: NoteType = {
                id: uuidv4(),
                author: "Author",
                title: "Untitled Note",
                blocks: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            set({
                notes: [...get().notes, newNote],
            });
            get().loadNote(newNote.id);
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

        setTitle: (title) => set({ title }),
        setBlocks: (blocks) => set({blocks}),

        addSaveBlock: (editorData) => {
            if (editorData.action === "add") {
                const block: BlockType = {
                    id: uuidv4(),
                    content: editorData.content,
                    type: editorData.type,
                    title: editorData.title,
                };
                set({ blocks: [...get().blocks, block] });
            } else {
                set({
                    blocks: get().blocks.map((b) =>
                        b.id === editorData.id
                            ? {
                                  ...b,
                                  content: editorData.content,
                                  title: editorData.title,
                                  type: editorData.type,
                              }
                            : b,
                    ),
                });
            }
            get().syncLocally();
        },

        saveBlock: (editorData) => {
            set({
                blocks: get().blocks.map((b) =>
                    b.id === editorData.id
                        ? {
                              ...b,
                              content: editorData.content,
                              title: editorData.title,
                              type: editorData.type,
                          }
                        : b,
                ),
            });
            // const block = get().blocks.find((b) => b.id === id);
            // if (!block) return;
            // block.content = content;
            // block.type = type;
            // block.title = title;
            // set({ blocks: [...get().blocks, block] });
            get().syncLocally();
        },

        deletetBlock: (id) => {
            set({ blocks: get().blocks.filter((block) => block.id !== id) });
            get().syncLocally();
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
        },

        mapTypeToElement: (type) => {
            switch (type) {
                case "definition":
                    return DefinitionBlock;
                case "note":
                    return NoteBlock;

                default:
                    return null;
            }
        },
    })),
);
