import { withErrorHandling } from "@/lib/Error/error-handler";
import requireAuth from "@/lib/requireAuth";
import * as folderService from "@/server/services/folder.service";
import { updateFolderSchema } from "@/validation/notes";
import { NextResponse } from "next/server";

export const PATCH = withErrorHandling(
    async (req, { params }: { params: Promise<{ id: string }> }) => {
        const user = await requireAuth();
        const { id } = await params;

        if (!id)
            return NextResponse.json(
                { message: "Folder Not Found" },
                { status: 404 },
            );

        const body = await req.json();
        const parsed = updateFolderSchema.parse(body);

        const folder = await folderService.updateFolder(id, user.id, parsed);

        if (!folder)
            return NextResponse.json(
                { message: "Folder Not Found" },
                { status: 404 },
            );

        return NextResponse.json({
            folder: {
                id: folder.id,
                name: folder.name,
                color: folder.color,
                icon: folder.icon,
                isFavorite: folder.isFavorite,
                notesCount: folder._count.notes,
            },
        });
    },
);

export const DELETE = withErrorHandling(
    async (req, { params }: { params: Promise<{ id: string }> }) => {
        const user = await requireAuth();
        const { id } = await params;

        if (!id)
            return NextResponse.json(
                { message: "Folder Not Found" },
                { status: 404 },
            );

        const deleted = await folderService.deleteFolder(id, user.id);

        if (!deleted)
            return NextResponse.json(
                { message: "Folder Not Found" },
                { status: 404 },
            );

        return NextResponse.json({ success: true });
    },
);
