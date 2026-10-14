import { Prisma } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";
import { AddBlockSchema, BlockSyncSchema } from "@/validation/notes";
import { ForbiddenError } from "@/lib/Error/custom-errors";
import { z } from "zod";

type AddBlockType = z.infer<typeof AddBlockSchema>;
type EditBlockType = Extract<
    z.infer<typeof BlockSyncSchema>,
    { action: "edit" }
>["data"] & { id: string };

type SaveBlocksType = {
    authorId: string;
    addData: AddBlockType[];
    deleteData: string[];
    editData: EditBlockType[];
};
export async function saveBlocks({
    authorId,
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
            // --- Ownership enforcement -------------------------------------
            // Every note a block is added to, and every block being edited or
            // deleted, must belong to the requesting user. This keeps public
            // notes strictly read-only for non-owners even though their note
            // and block ids are discoverable via the public link.
            const addNoteIds = [
                ...new Set(
                    addData
                        .map((a) => a.noteId)
                        .filter((id): id is string => Boolean(id)),
                ),
            ];
            if (addNoteIds.length > 0) {
                const ownedCount = await tx.note.count({
                    where: { id: { in: addNoteIds }, authorId },
                });
                if (ownedCount !== addNoteIds.length) {
                    throw new ForbiddenError(
                        "You do not have permission to modify this note.",
                    );
                }
            }

            const blockIds = [
                ...new Set([
                    ...deleteData,
                    ...editData.map((e) => e.id),
                ]),
            ];
            if (blockIds.length > 0) {
                const ownedBlocks = await tx.block.count({
                    where: {
                        id: { in: blockIds },
                        note: { is: { authorId } },
                    },
                });
                console.log(ownedBlocks, blockIds.length)
                if (ownedBlocks !== blockIds.length) {
                    throw new ForbiddenError(
                        "You do not have permission to modify these blocks.",
                    );
                }
            }
            // ---------------------------------------------------------------

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
    isPublic?: boolean;
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
    });
}

// Fetch a single note for a viewer. Returns the note when the requesting user
// owns it OR when it is public. Includes block count and the author's name so
// the client can render attribution. Returns null when not accessible.
export async function findByIdForViewer(id: string, userId: string) {
    return prisma.note.findFirst({
        where: {
            id,
            OR: [{ authorId: userId }, { isPublic: true }],
        },
        include: {
            _count: {
                select: { blocks: true },
            },
            author: {
                select: { name: true },
            },
        },
    });
}

export async function findFolderNotesForViewer(
    noteId: string,
    userId: string,
) {
    const note = await findByIdForViewer(noteId, userId);
    if (!note) return null;

    return prisma.note.findMany({
        where: {
            folderId: note.folderId,
            OR: [{ authorId: userId }, { isPublic: true }],
        },
        orderBy: [{ isPinned: "desc" }, { updatedAt: "desc" }],
        include: {
            _count: {
                select: { blocks: true },
            },
            author: {
                select: { name: true },
            },
        },
    });
}
