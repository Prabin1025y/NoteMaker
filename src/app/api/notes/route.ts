import { ForbiddenError, UnauthorizedError } from "@/lib/custom-errors";
import prisma from "@/lib/prisma";
import requireAuth from "@/lib/requireAuth";
import { createNoteSchema } from "@/validation/notes";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

export async function GET() {
    try {
        const user = await requireAuth();

        const notes = await prisma.note.findMany({
            where: { authorId: user.id },
            include: {
                _count: {
                    select: {
                        blocks: true,
                    },
                },
            },
        });

        return NextResponse.json({ notes, authorName: user.name });
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

export async function POST(req: Request) {
    try {
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
        } else if (error instanceof ZodError) {
            return NextResponse.json(
                { message: error.message || "Validation Error" },
                { status: 400 },
            );
        }

        return NextResponse.json({ message: "Server Error" }, { status: 500 });
    }
}
