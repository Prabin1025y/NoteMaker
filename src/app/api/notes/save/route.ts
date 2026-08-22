import { GeneralBadRequestError } from "@/lib/Error/custom-errors";
import { withErrorHandling } from "@/lib/Error/error-handler";
import requireAuth from "@/lib/requireAuth";
import { saveBlocks } from "@/server/services/note.service";
import {
    SaveNoteSchema,
} from "@/validation/notes";
import { NextResponse } from "next/server";

export const POST = withErrorHandling(async (req) => {
    const user = await requireAuth();

    const body = await req.json();
    const parsed = SaveNoteSchema.safeParse(body);

    if (!parsed.success) throw new GeneralBadRequestError("Invalid Data");

    // Pass the owner id so the repository can enforce that every block written
    // belongs to a note this user owns (keeps public notes read-only).
    const addedData = await saveBlocks(user.id, parsed.data);

    return NextResponse.json({ addedData });
});
