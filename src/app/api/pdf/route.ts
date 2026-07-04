import { ForbiddenError, UnauthorizedError } from "@/lib/custom-errors";
import { authorizeNoteAccess } from "@/lib/pdf/authorizeNoteAccess";
import { PdfService } from "@/lib/pdf/PdfService";
import requireAuth from "@/lib/requireAuth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { noteId } = await req.json();

        if (!noteId) {
            return NextResponse.json(
                { message: "noteId is required" },
                { status: 400 },
            );
        }

        const user = await requireAuth();

        const note = await authorizeNoteAccess(user.id, noteId);

        const pdf = await PdfService.generateNote({
            noteId,
            userName: user.name,
            noteTitle: note.title,
            userId: user.id,
            signal: req.signal,
        });

        return new NextResponse(Buffer.from(pdf), {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="note-${noteId}.pdf"`,
            },
        });
    } catch (err) {
        if (process.env.NODE_ENV === "development") console.error(err);

        if (err instanceof UnauthorizedError) {
            return NextResponse.json(
                { message: err.message || "Unauthorized" },
                { status: 401 },
            );
        } else if (err instanceof ForbiddenError) {
            return NextResponse.json(
                { message: err.message || "Forbidden" },
                { status: 403 },
            );
        }

        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 },
        );
    }
}
