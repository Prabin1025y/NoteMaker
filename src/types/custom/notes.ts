import { omit } from "lodash";
import { CreateNoteFolderOptions } from "./folder";

export interface NoteType {
    id: string;
    folderId: string;
    title: string;
    blocksCount: number;
    createdAt: Date;
    updatedAt: Date;
    description: string;
    authorName: string;
    authorId: string;
    isFavorite: boolean;
    isPinned: boolean;
    isPublic: boolean;
}

export type NoteTypeRaw = Omit<NoteType, "authorName" | "blocksCount">;

export interface CreateNoteDataType {
    title: string;
    description: string;
    folderOptions?: CreateNoteFolderOptions;
}

export interface CreateNoteResponseType {
    noteId: string;
}

export type UpdateNoteDataType = {
    id: string;
    patch: {
        title?: string;
        description?: string;
        isFavorite?: boolean;
        isPinned?: boolean;
        isPublic?: boolean;
        folderId?: string;
    };
};
