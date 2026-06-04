import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import { ElementType } from "react";
import DefinitionBlock from "@/components/Blocks/DefinitionBlock";
import NoteBlock from "@/components/Blocks/NoteBlock";
import { devtools } from 'zustand/middleware'

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

    mapTypeToElement: (type: blockTypeOptions) => ElementType | null;

    addBlock: (
        type: blockTypeOptions,
        content?: string,
        title?: string,
    ) => void;
    deletetBlock: (id: string) => void;
    duplicateBlock: (id: string) => void;

    syncLocally: () => void;
};

export const useNoteStore = create<Store>()(devtools((set, get) => ({
    currentNote: null,
    blocks: [{id: "12345", type: "definition", content: "{}", title: "Definition 1.1"}],
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

    addBlock: (type, content = "", title = "") => {
        const block: BlockType = {
            id: uuidv4(),
            content,
            type,
            title,
        };
        set({ blocks: [...get().blocks, block] });
        get().syncLocally();
    },

    deletetBlock: (id) => {
        set({ blocks: get().blocks.filter((block) => block.id !== id) });
        get().syncLocally();
    },

    duplicateBlock: (id) => {
        const existingBlocks = get().blocks;
        const blockIndex = existingBlocks.findIndex((block) => block.id === id);
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
})));
