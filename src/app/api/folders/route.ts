import { withErrorHandling } from "@/lib/Error/error-handler";
import requireAuth from "@/lib/requireAuth";
import * as folderService from "@/server/services/folder.service";
import { createFolderSchema } from "@/validation/notes";
import { NextResponse } from "next/server";

export const GET = withErrorHandling(async () => {
    const user = await requireAuth();

    const folders = await folderService.listFolders(user.id);

    // Flatten the Prisma `_count` relation into a friendly `notesCount`.
    const shaped = folders.map((folder) => ({
        id: folder.id,
        name: folder.name,
        color: folder.color,
        icon: folder.icon,
        isFavorite: folder.isFavorite,
        notesCount: folder._count.notes,
    }));

    return NextResponse.json({ folders: shaped });
});

export const POST = withErrorHandling(async (req) => {
    const user = await requireAuth();
    const body = await req.json();
    const parsed = createFolderSchema.parse(body);

    const folder = await folderService.createFolder(user.id, parsed);

    return NextResponse.json(
        {
            folder: {
                id: folder.id,
                name: folder.name,
                color: folder.color,
                icon: folder.icon,
                isFavorite: folder.isFavorite,
                notesCount: folder._count.notes,
            },
        },
        { status: 201 },
    );
});
