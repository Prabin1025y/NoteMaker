import { withErrorHandling } from "@/lib/Error/error-handler";
import prisma from "@/lib/prisma";
import requireAuth from "@/lib/requireAuth";
import { findManyByAuthor } from "@/server/repositories/note.repository";
import { createNoteSchema } from "@/validation/notes";
import { NextResponse } from "next/server";

export const GET = withErrorHandling(async () => {
    const user = await requireAuth();

    const notes = await findManyByAuthor(user.id, {
        include: {
            _count: {
                select: {
                    blocks: true,
                },
            },
        },
    });

    return NextResponse.json({ notes, authorName: user.name });
});

export const POST = withErrorHandling(async (req) => {
    const user = await requireAuth();
    const body = await req.json();
    const parsed = createNoteSchema.parse(body);
    const { title, description, isNewFolder, folderId, folderName } = parsed;

    let f_id;
    if (isNewFolder) {
        if (!folderName?.trim())
            throw new Error("Foldername is required for new folder.");

        const folder = await prisma.folder.create({
            data: {
                name: folderName,
                authorId: user.id,
            },
        });

        f_id = folder.id;
    } else {
        const folder = await prisma.folder.findUnique({
            where: {
                id: folderId,
            },
        });

        if (!folder) throw new Error("Invalid folder seleted.");

        f_id = folderId;
    }

    if (!f_id) throw new Error("Invalid Folder!");

    const note = await prisma.note.create({
        data: {
            title,
            description: description || "",
            authorId: user.id,
            folderId: f_id,
        },
        include: {
            _count: {
                select: {
                    blocks: true,
                },
            },
        },
    });

    return NextResponse.json({ note, authorName: user.name, folderId: f_id });
});
