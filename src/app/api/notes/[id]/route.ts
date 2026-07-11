import { withErrorHandling } from "@/lib/Error/error-handler";
import prisma from "@/lib/prisma";
import requireAuth from "@/lib/requireAuth";
import {  NextResponse } from "next/server";

export const DELETE = withErrorHandling(
    async (req, { params }: { params: Promise<{ id: string }> }) => {
        const user = await requireAuth();
        const { id } = await params;

        if (!id)
            return NextResponse.json(
                { message: "Note Not Found" },
                { status: 404 },
            );

        const note = await prisma.note.delete({
            where: { id, authorId: user.id },
        });

        if (!note)
            return NextResponse.json(
                { message: "Note Not Found" },
                { status: 404 },
            );

        return NextResponse.json({ note });
    },
);
