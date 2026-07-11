import { Prisma } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";
import { AddBlockSchema, BlockSyncSchema } from "@/validation/notes";
import { z } from "zod";

type AddBlockType = z.infer<typeof AddBlockSchema>;
type EditBlockType = Extract<
    z.infer<typeof BlockSyncSchema>,
    { action: "edit" }
>["data"] & { id: string };

type SaveBlocksType = {
    addData: AddBlockType[];
    deleteData: string[];
    editData: EditBlockType[];
};
export async function saveBlocks({
    addData,
    deleteData,
    editData,
}: SaveBlocksType) {
    return prisma.$transaction(async (tx) => {
        await tx.block.deleteMany({
            where: { id: { in: deleteData } },
        });

        await Promise.all(
            editData.map(({ id, ...rest }) => {
                tx.block.update({ where: { id }, data: rest });
            }),
        );

        return await tx.block.createManyAndReturn({
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
    });
}

export async function findManyByAuthor(
    authorId: string,
    args?: Omit<Prisma.NoteFindManyArgs, "where">,
) {
    return prisma.note.findMany({
        where: {
            authorId,
        },
        ...args,
    });
}
