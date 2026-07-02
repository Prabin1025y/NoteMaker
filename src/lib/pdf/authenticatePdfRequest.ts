import { headers } from "next/headers";
import { PdfToken } from "./PdfToken";

export async function authenticatePdfRequest(noteId: string) {
    const headerStore = await headers();

    const auth = headerStore.get("authorization");

    if (!auth) {
        throw new Error("Missing Authorization header.");
    }

    const [scheme, token] = auth.split(" ");

    if (scheme !== "Bearer" || !token) {
        throw new Error("Invalid Authorization header.");
    }

    const payload = await PdfToken.verify(token);

    if (payload.noteId !== noteId) {
        throw new Error("Note mismatch.");
    }

    return payload;
}
