import { GeneralBadRequestError } from "@/lib/Error/custom-errors";
import {
    FOLDER_COLORS,
    pickFolderColor,
    type FolderColorKey,
} from "@/utils/folderColors";
import type {
    CreateFolderSchemaType,
    UpdateFolderSchemaType,
} from "@/validation/notes";
import * as folderRepository from "../repositories/folder.repository";

/** Normalize an incoming color: keep it only if it's a known palette key. */
function normalizeColor(color: string | null | undefined): FolderColorKey | null {
    if (color && color in FOLDER_COLORS) {
        return color as FolderColorKey;
    }
    return null;
}

export async function listFolders(authorId: string) {
    return folderRepository.findManyByAuthor(authorId);
}

export async function createFolder(
    authorId: string,
    data: CreateFolderSchemaType,
) {
    // Honor an explicit valid color; otherwise assign a stable one from the name.
    const color = normalizeColor(data.color) ?? pickFolderColor(data.name);

    return folderRepository.createFolder(authorId, {
        name: data.name,
        icon: data.icon,
        color,
    });
}

export async function updateFolder(
    id: string,
    authorId: string,
    data: UpdateFolderSchemaType,
) {
    // If a color is supplied, keep it only when it maps to a real palette key.
    const patch: UpdateFolderSchemaType = { ...data };
    if (typeof patch.color !== "undefined") {
        patch.color = normalizeColor(patch.color);
    }

    return folderRepository.updateFolderForAuthor(id, authorId, patch);
}

export async function deleteFolder(id: string, authorId: string) {
    // Note.folderId is required, so deleting a folder would cascade-delete its
    // notes. Guard against accidental data loss by refusing non-empty folders.
    const noteCount = await folderRepository.countNotesInFolder(id, authorId);
    if (noteCount > 0) {
        throw new GeneralBadRequestError(
            `This folder still has ${noteCount} note${
                noteCount === 1 ? "" : "s"
            }. Move or delete them before deleting the folder.`,
        );
    }

    return folderRepository.deleteFolderForAuthor(id, authorId);
}
