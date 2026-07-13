import { BlockType } from "@/generated/prisma/enums";
import { z } from "zod";

export const AddBlockSchema = z.object({
    publicId: z.string(),
    createdAt: z.coerce.date(),
    noteId: z.string(),
    designId: z.number(),
    colorOptionId: z.number(),
    type: z.enum(BlockType),
    content: z.string(),
    order: z.number(),
    title: z.string().optional(),
});

export const createNoteSchema = z.object({
    title: z.string().min(1, "The title must be at least 1 character long"),
    description: z.string().optional(),
    // publicId: z.string(),
});

export const BlockSyncSchema = z.discriminatedUnion("action", [
    z.object({
        id: z.string(),
        action: z.literal("add"),
        block: AddBlockSchema,
    }),

    z.object({
        id: z.string(),
        action: z.literal("delete"),
    }),

    z.object({
        id: z.string(),
        action: z.literal("edit"),
        data: AddBlockSchema.omit({
            publicId: true,
            noteId: true,
            createdAt: true,
        }).partial(),
    }),
]);

export const SaveNoteSchema = z.array(BlockSyncSchema);

export type SaveNoteSchemaType = z.infer<typeof SaveNoteSchema>;
