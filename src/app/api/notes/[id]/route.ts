import { withErrorHandling } from "@/lib/Error/error-handler";
import prisma from "@/lib/prisma";
import requireAuth from "@/lib/requireAuth";
import * as noteService from "@/server/services/note.service";
import { updateNoteSchema } from "@/validation/notes";
import { NextResponse } from "next/server";

export const PATCH = withErrorHandling(
    async (req, { params }: { params: Promise<{ id: string }> }) => {
        const user = await requireAuth();
        const { id } = await params;

        if (!id)
            return NextResponse.json(
                { message: "Note Not Found" },
                { status: 404 },
            );

        const body = await req.json();
        const parsed = updateNoteSchema.parse(body);

        const note = await noteService.updateNoteMeta(id, user.id, parsed);

        if (!note)
            return NextResponse.json(
                { message: "Note Not Found" },
                { status: 404 },
            );

        return NextResponse.json({ note });
    },
);

export const DELETE = withErrorHandling(
    async (req, { params }: { params: Promise<{ id: string }> }) => {
        const user = await requireAuth();
        const { id } = await params;

        if (!id)
            return NextResponse.json(
                { message: "Note Not Found" },
                { status: 404 },
            );

        // Scope the delete to the owner so it can't touch other users' notes.
        const result = await prisma.note.deleteMany({
            where: { id, authorId: user.id },
        });

        if (result.count === 0)
            return NextResponse.json(
                { message: "Note Not Found" },
                { status: 404 },
            );

        return NextResponse.json({ success: true });
    },
);
