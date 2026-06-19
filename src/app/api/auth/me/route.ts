import { requireAuth } from "@/lib/requireAuth";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const user = await requireAuth();

        return NextResponse.json({
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
        });
    } catch (error) {
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
        }

        return NextResponse.json({ message: "Server Error" }, { status: 500 });
    }
}
