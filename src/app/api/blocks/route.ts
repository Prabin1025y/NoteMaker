import { withErrorHandling } from "@/lib/Error/error-handler";
import prisma from "@/lib/prisma";
import requireAuth from "@/lib/requireAuth";
import { NextRequest, NextResponse } from "next/server";

export const GET = withErrorHandling(async (req: NextRequest) => {
    const user = await requireAuth();
    const noteId = req.nextUrl.searchParams.get("noteId");

    if (!noteId)
        return NextResponse.json(
            { message: "Note not found" },
            { status: 404 },
        );

    // Allow reading blocks when the user owns the note OR the note is public.
    const exists = await prisma.note.count({
        where: {
            id: noteId,
            OR: [{ authorId: user.id }, { isPublic: true }],
        },
    });

    if (exists === 0)
        return NextResponse.json(
            { message: "Note not found" },
            { status: 404 },
        );

    const blocks = await prisma.block.findMany({
        where: { noteId: noteId },
    });

    return NextResponse.json({ blocks });
});
