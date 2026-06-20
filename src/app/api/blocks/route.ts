import prisma from "@/lib/prisma";
import requireAuth from "@/lib/requireAuth";
import { blockSchema } from "@/validation/blocks";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

export async function POST(req: Request) {
    try {
        const user = await requireAuth();
        const body = await req.json();
        const parsed = blockSchema.parse(body);

        const { colorOptionId, content, designId, noteId, order, type, title } =
            parsed;

        const orderExists = await prisma.block.findUnique({
            where: { noteId_order: { noteId, order } },
        });

        if (orderExists) {
            return NextResponse.json(
                { message: "Invalid ordering" },
                { status: 400 },
            );
        }

        const block = prisma.block.create({
            data: {
                type,
                content,
                designId,
                colorOptionId,
                title,
                noteId,
                order,
            },
        });

        return NextResponse.json({ block });
    } catch (error) {
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
