import { z } from "zod";

const BlockTypeOptionsSchema = z.enum([
    "block",
    "code",
    "image",
    "table",
    "divider",
    "formula",
]);

export const BlockWithoutIdSchema = z.object({
    designId: z.number(),
    colorOptionId: z.number(),
    type: BlockTypeOptionsSchema,
    content: z.string(),
    order: z.number(),
    title: z.string().optional(),
});

export const createNoteSchema = z.object({
    title: z.string().min(1, "The title must be at least 1 character long"),
    description: z.string().optional(),
    publicId: z.string(),
});

const BlockSyncSchema = z.discriminatedUnion("action", [
    z.object({
        id: z.string(),
        action: z.literal("add"),
        block: BlockWithoutIdSchema,
    }),

    z.object({
        id: z.string(),
        action: z.literal("delete"),
    }),

    z.object({
        id: z.string(),
        action: z.literal("edit"),
        data: BlockWithoutIdSchema.partial(),
    }),
]);

export const SaveNoteSchema = z.object({
    noteId: z.string(),
    data: z.array(BlockSyncSchema),
});
