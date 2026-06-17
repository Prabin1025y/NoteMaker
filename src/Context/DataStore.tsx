import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import { ElementType } from "react";
import GeneralBlock from "@/components/Blocks/GeneralBlock";
import { devtools } from "zustand/middleware";
import { EditorData } from "@/types/Editor";
import ImageBlock from "@/components/Blocks/ImageBlock";
import { initialJsonForEditor } from "@/utils/UtilFunctions";
import FormulaBlock from "@/components/Blocks/FormulaBlock";
import CodeBlock from "@/components/Blocks/CodeBlock";
import TableBlock from "@/components/Blocks/TableBlock";
import DividerBlock from "@/components/Blocks/DividerBlock";

export type blockTypeOptions =
    | "block"
    | "code"
    | "image"
    | "table"
    | "divider"
    | "formula"
    | "unset";

export interface BlockType {
    id: string;
    designId: number;
    colorOptionId: number;
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
    draggingBlockId: string | null;

    createNote: (title?: string, description?: string) => NoteType;
    deleteNote: (id: string) => void;
    loadNote: (id: string) => void;
    setTitle: (title: string) => void;
    setBlocks: (blocks: BlockType[]) => void;
    updateNoteTitle: (title: string) => void;

    mapTypeToElement: (type: blockTypeOptions) => ElementType | null;

    addSaveBlock: (editorData: EditorData) => void;
    deleteBlock: (id: string) => void;
    duplicateBlock: (id: string) => void;

    syncLocally: () => void;
    setDraggingBlockId: (id: string | null) => void;
};

export const useNoteStore = create<Store>()(
    devtools((set, get) => ({
        currentNote: null,
        blocks: [
            {
                designId: 1,
                colorOptionId: 1,
                id: "405a6215-fcaa-4ed8-bd0a-bd80a5e4c201",
                content: initialJsonForEditor,
                type: "block",
                title: "Definition 1",
            },
        ],
        title: "Untitled Note",
        notes: [],
        draggingBlockId: null,

        createNote: (title = "Untitled Note", description = "") => {
            const newNote: NoteType = {
                id: uuidv4(),
                author: "Author",
                title: title,
                blocks: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            set({
                notes: [...get().notes, newNote],
            });
            get().loadNote(newNote.id);
            return newNote;
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
        setBlocks: (blocks) => set({ blocks }),

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
                const block: BlockType = {
                    id: uuidv4(),
                    designId: editorData.designId,
                    colorOptionId: editorData.colorOptionId,
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
                                  designId: editorData.designId,
                                  colorOptionId: editorData.colorOptionId,
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

        deleteBlock: (id) => {
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
                case "block":
                    return GeneralBlock;
                case "image":
                    return ImageBlock;
                case "formula":
                    return FormulaBlock;
                case "code":
                    return CodeBlock;
                case "table":
                    return TableBlock;
                case "divider":
                    return DividerBlock;

                default:
                    return null;
            }
        },

        setDraggingBlockId: (id) => set({ draggingBlockId: id }),
    })),
);
