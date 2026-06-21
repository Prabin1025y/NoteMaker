import { ForbiddenError, UnauthorizedError } from "@/lib/custom-errors";
import prisma from "@/lib/prisma";
import requireAuth from "@/lib/requireAuth";
import { BlockWithoutIdSchema, SaveNoteSchema } from "@/validation/notes";
import { NextResponse } from "next/server";
import { ZodError, z } from "zod";

type BlockTypeFromSchema = z.infer<typeof BlockWithoutIdSchema> & {
    id: string;
};

export async function POST(req: Request) {
    try {
        const user = await requireAuth();

        const body = await req.json();
        const parsed = SaveNoteSchema.safeParse(body);

        if (!parsed.success)
            return NextResponse.json(
                { message: "Validation Error" },
                { status: 400 },
            );

        const addData: BlockTypeFromSchema[] = [];
        const deleteData: string[] = [];
        const editData: Partial<BlockTypeFromSchema>[] = [];

        parsed.data.data.forEach((item) => {
            if (item.action === "add")
                addData.push({ id: item.id, ...item.block });
            else if (item.action === "delete") deleteData.push(item.id);
            else if (item.action === "edit")
                editData.push({ id: item.id, ...item.data });
        });

        const updates = editData.map((item) => {
            const { id, ...rest } = item;
            return prisma.block.update({
                where: { publicId: id },
                data: rest,
            });
        });

        const addedData = await prisma.block.createManyAndReturn({
            data: addData.map((item) => ({
                publicId: item.id,
                title: item.title ?? "",
                content: item.content,
                colorOptionId: item.colorOptionId,
                designId: item.designId,
                type: item.type,
                order: item.order,
                noteId: parsed.data.noteId
            })),
            select: {
                id: true,
                publicId: true,
            },
        });

        await prisma.$transaction([
            prisma.block.deleteMany({
                where: { publicId: { in: deleteData } },
            }),

            ...updates,
        ]);

        return NextResponse.json({ success: true, addedData });
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
