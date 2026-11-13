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
    language: z.string().nullable().optional(),
});

export const createNoteSchema = z
    .object({
        title: z.string().min(1, "The title must be at least 1 character long"),
        description: z.string().optional(),
        isNewFolder: z.boolean(),
        folderId: z.string().optional(),
        folderName: z.string().trim().min(1, "Folder name is required when creating a new folder").optional(),
    })
    .refine((data) => {
        if (data.isNewFolder) {
            return Boolean(data.folderName);
        }

        return Boolean(data.folderId);
    }, {
        message: "Provide folderName when isNewFolder is true, or folderId when it is false.",
        path: ["folderId"],
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

// ---- Note metadata updates (favorite / pin / rename / move) ----
export const updateNoteSchema = z
    .object({
        title: z.string().min(1).optional(),
        description: z.string().optional(),
        isFavorite: z.boolean().optional(),
        isPinned: z.boolean().optional(),
        isPublic: z.boolean().optional(),
        folderId: z.string().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
        message: "No fields provided to update.",
    });

export type UpdateNoteSchemaType = z.infer<typeof updateNoteSchema>;

// ---- Folder create / update ----
export const createFolderSchema = z.object({
    name: z.string().trim().min(1, "Folder name is required"),
    color: z.string().trim().optional(),
    icon: z.string().trim().optional(),
});

export type CreateFolderSchemaType = z.infer<typeof createFolderSchema>;

export const updateFolderSchema = z
    .object({
        name: z.string().trim().min(1).optional(),
        color: z.string().trim().nullable().optional(),
        icon: z.string().trim().nullable().optional(),
        isFavorite: z.boolean().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
        message: "No fields provided to update.",
    });

export type UpdateFolderSchemaType = z.infer<typeof updateFolderSchema>;
