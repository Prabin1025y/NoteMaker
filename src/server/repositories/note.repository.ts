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

            const rawBlockIds = [
                ...new Set([
                    ...deleteData,
                    ...editData.map((e) => e.id),
                ]),
            ];

            if (rawBlockIds.length > 0) {
                // Find blocks matching either by primary key `id` OR by client-generated `publicId`.
                // This gracefully handles cases where client-side operations (edits/deletes) were
                // queued using the initial publicId before a prior save's ID mapping propagated.
                const matchingBlocks = await tx.block.findMany({
                    where: {
                        OR: [
                            { id: { in: rawBlockIds } },
                            { publicId: { in: rawBlockIds } },
                        ],
                        note: { is: { authorId } },
                    },
                    select: {
                        id: true,
                        publicId: true,
                        noteId: true,
                        order: true,
                    },
                });

                // Build lookup maps: both id -> id and publicId -> id
                const idLookup = new Map<string, string>();
                for (const b of matchingBlocks) {
                    idLookup.set(b.id, b.id);
                    if (b.publicId) {
                        idLookup.set(b.publicId, b.id);
                    }
                }

                // Verify that every requested raw id/publicId successfully maps to a block owned by author
                const allResolved = rawBlockIds.every((rawId) => idLookup.has(rawId));
                if (!allResolved) {
                    throw new ForbiddenError(
                        "You do not have permission to modify these blocks.",
                    );
                }

                // Remap deleteData and editData to canonical database IDs
                if (deleteData.length > 0) {
                    const canonicalDeleteIds = [
                        ...new Set(deleteData.map((id) => idLookup.get(id)!)),
                    ];
                    await tx.block.deleteMany({
                        where: {
                            id: {
                                in: canonicalDeleteIds,
                            },
                        },
                    });
                }

                const orderEdits = editData
                    .filter((edit) => edit.order !== undefined)
                    .map((edit) => ({
                        id: idLookup.get(edit.id)!,
                        requestedOrder: edit.order!,
                        currentBlock: matchingBlocks.find(
                            (block) => block.id === idLookup.get(edit.id),
                        )!,
                    }))
                    .filter(
                        ({ requestedOrder, currentBlock }) =>
                            requestedOrder !== currentBlock.order,
                    );

                if (orderEdits.length > 0) {
                    const blocksByNote = new Map<string, typeof orderEdits>();
                    for (const orderEdit of orderEdits) {
                        const noteId = orderEdit.currentBlock.noteId;
                        if (!noteId) continue;
                        const noteEdits = blocksByNote.get(noteId) ?? [];
                        noteEdits.push(orderEdit);
                        blocksByNote.set(noteId, noteEdits);
                    }

                    for (const [noteId, noteEdits] of blocksByNote) {
                        const existingOrders = await tx.block.findMany({
                            where: { noteId },
                            select: { order: true },
                        });
                        const relevantOrders = [
                            ...existingOrders.map((block) => block.order),
                            ...addData
                                .filter((block) => block.noteId === noteId)
                                .map((block) => block.order),
                            ...noteEdits.map(
                                (edit) => edit.requestedOrder,
                            ),
                        ];
                        const minOrder = relevantOrders.reduce(
                            (min, order) => Math.min(min, order),
                            Number.POSITIVE_INFINITY,
                        );
                        const maxOrder = relevantOrders.reduce(
                            (max, order) => Math.max(max, order),
                            Number.NEGATIVE_INFINITY,
                        );
                        const spacing = Math.max(1, maxOrder - minOrder + 1);
                        const temporaryStart = minOrder - spacing;

                        if (
                            !Number.isFinite(temporaryStart) ||
                            !Number.isFinite(spacing) ||
                            !Number.isFinite(
                                temporaryStart -
                                    spacing * (noteEdits.length - 1),
                            )
                        ) {
                            throw new Error(
                                "Could not safely stage block order changes.",
                            );
                        }

                        for (const [index, edit] of noteEdits.entries()) {
                            await tx.block.update({
                                where: { id: edit.id },
                                data: {
                                    order:
                                        temporaryStart - spacing * index,
                                },
                            });
                        }
                    }
                }

                if (editData.length > 0) {
                    await Promise.all(
                        editData.map(({ id, ...rest }) =>
                            tx.block.update({
                                where: { id: idLookup.get(id)! },
                                data: rest,
                            }),
                        ),
                    );
                }
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
