import { z } from "zod";
import { BlockType } from "@/generated/prisma/enums";

export const blockSchema = z.object({
    type: z.enum(BlockType),
    content: z.string().min(1, "Content cannot be empty."),
    designId: z.number(),
    colorOptionId: z.number(),
    title: z.string().optional(),
    order: z.number(),
    noteId: z.string(),
});
