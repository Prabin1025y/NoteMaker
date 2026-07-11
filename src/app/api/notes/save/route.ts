import { GeneralBadRequestError } from "@/lib/Error/custom-errors";
import { withErrorHandling } from "@/lib/Error/error-handler";
import requireAuth from "@/lib/requireAuth";
import { saveBlocks } from "@/server/services/note.service";
import {
    SaveNoteSchema,
} from "@/validation/notes";
import { NextResponse } from "next/server";

export const POST = withErrorHandling(async (req) => {
    await requireAuth();

    const body = await req.json();
    const parsed = SaveNoteSchema.safeParse(body);

    if (!parsed.success) throw new GeneralBadRequestError("Invalid Data");

    const addedData = await saveBlocks(parsed.data);

    return NextResponse.json({ addedData });
});
