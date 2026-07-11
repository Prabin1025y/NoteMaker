import { SaveNoteSchemaType } from "@/validation/notes";
import * as noteRepository from "../repositories/note.repository";

export async function saveBlocks(data: SaveNoteSchemaType) {
    const addData = data.filter((e) => e.action === "add").map((e) => e.block);
    const deleteData = data
        .filter((e) => e.action === "delete")
        .map((e) => e.id);
    const editData = data
        .filter((e) => e.action === "edit")
        .map((e) => ({ id: e.id, ...e.data }));

    return noteRepository.saveBlocks({ addData, deleteData, editData });
}
