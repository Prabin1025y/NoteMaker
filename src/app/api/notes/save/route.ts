import { ForbiddenError, UnauthorizedError } from "@/lib/custom-errors";
import prisma from "@/lib/prisma";
import requireAuth from "@/lib/requireAuth";
import {
    AddBlockSchema,
    BlockSyncSchema,
    SaveNoteSchema,
} from "@/validation/notes";
import { NextResponse } from "next/server";
import { ZodError, z } from "zod";

type AddBlockType = z.infer<typeof AddBlockSchema>;
type EditBlockType = Extract<
    z.infer<typeof BlockSyncSchema>,
    { action: "edit" }
>["data"] & { id: string };

export async function POST(req: Request) {
    try {
        await requireAuth();

        const body = await req.json();
        const parsed = SaveNoteSchema.safeParse(body);

        if (!parsed.success)
            return NextResponse.json(
                { message: "Validation Error" },
                { status: 400 },
            );

        const addData: AddBlockType[] = parsed.data
            .filter((e) => e.action === "add")
            .map((e) => e.block);
        const deleteData: string[] = parsed.data
            .filter((e) => e.action === "delete")
            .map((e) => e.id);
        const editData: EditBlockType[] = parsed.data
            .filter((e) => e.action === "edit")
            .map((e) => ({ id: e.id, ...e.data }));

        const updates = editData.map((item) => {
            const { id, ...rest } = item;
            return prisma.block.update({
                where: { id },
                data: rest,
            });
        });

        const addedData = await prisma.block.createManyAndReturn({
            data: addData.map((item) => ({
                publicId: item.publicId,
                title: item.title ?? "",
                content: item.content,
                colorOptionId: item.colorOptionId,
                designId: item.designId,
                type: item.type,
                order: item.order,
                noteId: item.noteId,
                createdAt: item.createdAt,
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
