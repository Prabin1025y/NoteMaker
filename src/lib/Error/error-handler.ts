import { NextResponse } from "next/server";
import { ForbiddenError, UnauthorizedError } from "./custom-errors";
import { ZodError } from "zod";

export async function withErrorHandling(
    handler: (req: Request) => Promise<Response>,
) {
    return async (req: Request) => {
        try {
            return handler(req);
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
            } else if (error instanceof ZodError) {
                return NextResponse.json(
                    { message: error.message || "Validation Error" },
                    { status: 400 },
                );
            }

            return NextResponse.json(
                { message: "Server Error" },
                { status: 500 },
            );
        }
    };
}
