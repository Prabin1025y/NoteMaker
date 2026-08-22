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
    if (
        addData.length === 0 &&
        deleteData.length === 0 &&
        editData.length === 0
    ) {
        return [];
    }

    return prisma.$transaction(
        async (tx) => {
            if (deleteData.length > 0) {
                await tx.block.deleteMany({
                    where: {
                        id: {
                            in: deleteData,
                        },
                    },
                });
            }

            if (editData.length > 0) {
                await Promise.all(
                    editData.map(({ id, ...rest }) =>
                        tx.block.update({
                            where: { id },
                            data: rest,
                        }),
                    ),
                );
            }

            if (addData.length === 0) {
                return [];
            }

            return tx.block.createManyAndReturn({
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
        },
        {
            maxWait: 10000,
            timeout: 10000,
        },
    );
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

type UpdateNoteMetaInput = {
    title?: string;
    description?: string;
    isFavorite?: boolean;
    isPinned?: boolean;
    folderId?: string;
};

export async function updateNoteMetaForAuthor(
    id: string,
    authorId: string,
    data: UpdateNoteMetaInput,
) {
    // Ownership-scoped update; returns null when nothing matched.
    const result = await prisma.note.updateMany({
        where: { id, authorId },
        data,
    });

    if (result.count === 0) return null;

    return prisma.note.findFirst({
        where: { id, authorId },
        include: {
            _count: {
                select: { blocks: true },
            },
        },
    });
}
