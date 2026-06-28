import { ForbiddenError, UnauthorizedError } from "@/lib/custom-errors";
import prisma from "@/lib/prisma";
import requireAuth from "@/lib/requireAuth";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

// export async function POST(req: Request) {
//     try {
//         const user = await requireAuth();
//         const body = await req.json();
//         const parsed = blockSchema.parse(body);

//         const { colorOptionId, content, designId, noteId, order, type, title } =
//             parsed;

//         const orderExists = await prisma.block.findUnique({
//             where: { noteId_order: { noteId, order } },
//         });

//         if (orderExists) {
//             return NextResponse.json(
//                 { message: "Invalid ordering" },
//                 { status: 400 },
//             );
//         }

//         const block = prisma.block.create({
//             data: {
//                 type,
//                 content,
//                 designId,
//                 colorOptionId,
//                 title,
//                 noteId,
//                 order,
//             },
//         });

//         return NextResponse.json({ block });
//     } catch (error) {
//         if (error instanceof UnauthorizedError) {
//             return NextResponse.json(
//                 { message: error.message || "Unauthorized" },
//                 { status: 401 },
//             );
//         } else if (error instanceof ForbiddenError) {
//             return NextResponse.json(
//                 { message: error.message || "Forbidden" },
//                 { status: 403 },
//             );
//         } else if (error instanceof ZodError) {
//             return NextResponse.json(
//                 { message: error.message || "Validation Error" },
//                 { status: 400 },
//             );
//         }

//         return NextResponse.json({ message: "Server Error" }, { status: 500 });
//     }
// }

export async function GET(req: NextRequest) {
    try {
        const user = await requireAuth();
        const noteId = req.nextUrl.searchParams.get("noteId")

        if (!noteId)
            return NextResponse.json(
                { message: "Note not found" },
                { status: 404 },
            );

        const exists = await prisma.note.count({ where: { id: noteId, authorId: user.id } });

        if (exists === 0)
            return NextResponse.json(
                { message: "Note not found" },
                { status: 404 },
            );

        const blocks = await prisma.block.findMany({
            where: { noteId: noteId },
        });

        return NextResponse.json({ blocks });
    } catch (error) {
        if (process.env.NODE_ENV === "development") console.log(error);
        if (error instanceof UnauthorizedError) {
            return NextResponse.json(
                { message: error.message || "Unauthorized" },
                { status: 401 },
            );
        } else if (error instanceof ForbiddenError) {
            return NextResponse.json(
                { message: error.message || "Forbidden" },
                { status: 403 },
            );
        } else if (error instanceof ZodError) {
            return NextResponse.json(
                { message: error.message || "Validation Error" },
                { status: 400 },
            );
        }

        return NextResponse.json({ message: "Server Error" }, { status: 500 });
    }
}
