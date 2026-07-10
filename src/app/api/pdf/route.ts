import { ForbiddenError, UnauthorizedError } from "@/lib/Error/custom-errors";
import { authorizeNoteAccess } from "@/lib/pdf/authorizeNoteAccess";
import requireAuth from "@/lib/requireAuth";
import { cookies } from "next/headers";
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

        const cookieStore = await cookies();

        const token = cookieStore.get("access_token")?.value;

        const note = await authorizeNoteAccess(user.id, noteId);

        const response = await fetch(process.env.PDF_API_URL!, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ noteId, noteTitle: note.title }),
        });

        if (!response.ok) {
            return new NextResponse(await response.text(), {
                status: response.status,
            });
        }

        const pdf = await response.arrayBuffer();

        return new NextResponse(pdf, {
            status: response.status,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition":
                    response.headers.get("Content-Disposition") ??
                    'attachment; filename="document.pdf"',
            },
        });
    } catch (err) {
        console.error(err);

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
