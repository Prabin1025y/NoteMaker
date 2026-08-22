import prisma from "@/lib/prisma";
import type {
    CreateFolderSchemaType,
    UpdateFolderSchemaType,
} from "@/validation/notes";

const folderWithCount = {
    _count: {
        select: { notes: true },
    },
} as const;

export async function findManyByAuthor(authorId: string) {
    return prisma.folder.findMany({
        where: { authorId },
        orderBy: [{ isFavorite: "desc" }, { name: "asc" }],
        include: folderWithCount,
    });
}

export async function findByIdForAuthor(id: string, authorId: string) {
    return prisma.folder.findFirst({
        where: { id, authorId },
        include: folderWithCount,
    });
}

export async function createFolder(
    authorId: string,
    data: CreateFolderSchemaType & { color: string },
) {
    return prisma.folder.create({
        data: {
            name: data.name,
            color: data.color,
            icon: data.icon ?? null,
            authorId,
        },
        include: folderWithCount,
    });
}

export async function updateFolderForAuthor(
    id: string,
    authorId: string,
    data: UpdateFolderSchemaType,
) {
    // Scope the update to the owner so users can't touch others' folders.
    const result = await prisma.folder.updateMany({
        where: { id, authorId },
        data,
    });

    if (result.count === 0) return null;

    return findByIdForAuthor(id, authorId);
}

export async function countNotesInFolder(id: string, authorId: string) {
    return prisma.note.count({ where: { folderId: id, authorId } });
}

export async function deleteFolderForAuthor(id: string, authorId: string) {
    const result = await prisma.folder.deleteMany({
        where: { id, authorId },
    });

    return result.count > 0;
}
