import { NextRequest, NextResponse } from "next/server";
import { ForbiddenError, GeneralBadRequestError, UnauthorizedError } from "./custom-errors";
import { ZodError } from "zod";

export function withErrorHandling<TContext = unknown>(
    handler: (req: NextRequest, context: TContext) => Promise<Response>,
) {
    return async (req: NextRequest, context: TContext): Promise<Response> => {
        try {
            return await handler(req, context);
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
            } else if (error instanceof GeneralBadRequestError) {
                return NextResponse.json(
                    { message: error.message || "Bad Request" },
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
