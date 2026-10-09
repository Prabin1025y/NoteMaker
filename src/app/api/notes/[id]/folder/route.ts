import { withErrorHandling } from "@/lib/Error/error-handler";
import requireAuth from "@/lib/requireAuth";
import * as noteService from "@/server/services/note.service";
import { NextResponse } from "next/server";

export const GET = withErrorHandling(
    async (_req, { params }: { params: Promise<{ id: string }> }) => {
        const user = await requireAuth();
        const { id } = await params;

        if (!id)
            return NextResponse.json(
                { message: "Note Not Found" },
                { status: 404 },
            );

        const notes = await noteService.getFolderNotesForViewer(id, user.id);

        if (!notes)
            return NextResponse.json(
                { message: "Note Not Found" },
                { status: 404 },
            );

        return NextResponse.json({
            notes: notes.map((note) => ({
                id: note.id,
                title: note.title,
                blocksCount: note._count.blocks,
                createdAt: note.createdAt,
                updatedAt: note.updatedAt,
                description: note.description,
                folderId: note.folderId,
                authorName: note.author.name ?? "",
                authorId: note.authorId,
                isFavorite: Boolean(note.isFavorite),
                isPinned: Boolean(note.isPinned),
                isPublic: Boolean(note.isPublic),
            })),
        });
    },
);
