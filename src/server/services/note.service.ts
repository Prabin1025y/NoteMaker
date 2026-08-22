import type {
    SaveNoteSchemaType,
    UpdateNoteSchemaType,
} from "@/validation/notes";
import * as noteRepository from "../repositories/note.repository";

export async function saveBlocks(authorId: string, data: SaveNoteSchemaType) {
    const addData = data.filter((e) => e.action === "add").map((e) => e.block);
    const deleteData = data
        .filter((e) => e.action === "delete")
        .map((e) => e.id);
    const editData = data
        .filter((e) => e.action === "edit")
        .map((e) => ({ id: e.id, ...e.data }));

    return noteRepository.saveBlocks({ authorId, addData, deleteData, editData });
}

export async function getNoteForViewer(id: string, userId: string) {
    return noteRepository.findByIdForViewer(id, userId);
}

export async function updateNoteMeta(
    id: string,
    authorId: string,
    data: UpdateNoteSchemaType,
) {
    return noteRepository.updateNoteMetaForAuthor(id, authorId, data);
}
