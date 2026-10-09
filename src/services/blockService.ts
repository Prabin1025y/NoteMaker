import { apiFetch } from "@/lib/api-client";
import { NoteBlockType } from "@/types/custom/block";

export const fetchBlocksByNoteId = async (
    noteId: string,
): Promise<NoteBlockType[]> => {
    const res = await apiFetch(
        `${process.env.NEXT_PUBLIC_WEBSITE_URL}/api/blocks?noteId=${noteId}`,
    );

    const data = await res.json();

    if (!res.ok) throw new Error(data.message);

    return data.blocks;
};
