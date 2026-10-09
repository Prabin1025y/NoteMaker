import { blockTypeOptions } from "../Editor";

export interface NoteBlockType {
    id: string;
    type: blockTypeOptions;
    content: string;
    designId: number;
    colorOptionId: number;
    title: string | null;
    order: number;
    noteId: string;
    createdAt: Date;
    updatedAt: Date;
    publicId: string;
}
