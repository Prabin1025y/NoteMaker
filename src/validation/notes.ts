import { z } from "zod";

export const createNoteSchema = z.object({
    title: z.string().min(1, "The title must be at least 1 character long"),
    description: z.string().optional(),
});
