import { ForbiddenError } from "../custom-errors";
import prisma from "../prisma";

export async function authorizeNoteAccess(userId: string, noteId: string) {
    const note = await prisma.note.findUnique({
        where: { authorId: userId, id: noteId },
    });

    const authorized = !!note;

    if (!authorized) throw new ForbiddenError("Forbidden");
}
