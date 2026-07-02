import prisma from "../prisma";

export async function getBlocksFromNoteId(noteId: string) {
    const blocks = await prisma.block.findMany({
        where: { noteId: noteId },
    });

    const blocksSorted = blocks.sort((a, b) => a.order - b.order);

    return blocksSorted;
}
