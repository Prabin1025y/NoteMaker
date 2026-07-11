import { withErrorHandling } from "@/lib/Error/error-handler";
import prisma from "@/lib/prisma";
import requireAuth from "@/lib/requireAuth";
import {
    findManyByAuthor,
} from "@/server/repositories/note.repository";
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
    const { title, description } = parsed;

    const note = await prisma.note.create({
        data: {
            title,
            description: description || "",
            authorId: user.id,
        },
        include: {
            _count: {
                select: {
                    blocks: true,
                },
            },
        },
    });

    return NextResponse.json({ note, authorName: user.name });
});
