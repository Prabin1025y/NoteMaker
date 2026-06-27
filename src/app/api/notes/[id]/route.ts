import { ForbiddenError, UnauthorizedError } from "@/lib/custom-errors";
import prisma from "@/lib/prisma";
import requireAuth from "@/lib/requireAuth";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
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
    } catch (error) {
        if (process.env.NODE_ENV === "development") console.log(error);

        if (error instanceof UnauthorizedError) {
            return NextResponse.json(
                { message: error.message || "Unauthorized" },
                { status: 401 },
            );
        } else if (error instanceof ForbiddenError) {
            return NextResponse.json(
                { message: error.message || "Forbidden" },
                { status: 403 },
            );
        }

        return NextResponse.json({ message: "Server Error" }, { status: 500 });
    }
}
