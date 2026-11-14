import { ForbiddenError } from "../Error/custom-errors";
import prisma from "../prisma";

export async function authorizeNoteAccess(userId: string, noteId: string) {
    // Owner OR public note: authenticated viewers of a public note may export
    // it (read-only access includes read/export/copy).
    const note = await prisma.note.findFirst({
        where: {
            id: noteId,
            OR: [{ authorId: userId }, { isPublic: true }],
        },
        include: {
            author: { select: { name: true } },
            folder: {
                select: { name: true },
            },
        },
    });

    const authorized = !!note;

    if (!authorized) throw new ForbiddenError("Forbidden");

    return note;
}
