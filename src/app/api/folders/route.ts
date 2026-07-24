import { withErrorHandling } from "@/lib/Error/error-handler";
import prisma from "@/lib/prisma";
import requireAuth from "@/lib/requireAuth";
import { NextResponse } from "next/server";

export const GET = withErrorHandling(async () => {
    const user = await requireAuth();

    const folders = await prisma.folder.findMany({
        where: { authorId: user.id },
        orderBy: { createdAt: "asc" },
        select: {
            id: true,
            name: true,
        },
    });

    return NextResponse.json({ folders });
});
