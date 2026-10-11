import { TableState } from "@/components/EditorModal/TableSection";
import type { CanvasEditorContentType } from "@/types/CanvasEditor";
import type { BoardRecord, GridId, Snapshot, ThemeId } from "@quickdrawjs/core";
import { JSONContent } from "@tiptap/core";
import { z } from "zod";

const JSONContentSchema: z.ZodType<JSONContent> = z.lazy(() =>
    z.object({
        type: z.string(),
        attrs: z.record(z.string(), z.unknown()).optional(),
        content: z.array(JSONContentSchema).optional(),
        marks: z
            .array(
                z.object({
                    type: z.string(),
                    attrs: z.record(z.string(), z.unknown()).optional(),
                }),
            )
            .optional(),
        text: z.string().optional(),
    }),
);

const TableStateSchema: z.ZodType<TableState> = z.object({
    cols: z.array(z.string()),
    rows: z.array(z.string()),
    headers: z.record(z.string(), z.string()),
    data: z.record(z.string(), z.string()),
});
const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null && !Array.isArray(value);

const isBoardRecord = (value: unknown): value is BoardRecord => {
    if (!isRecord(value) || typeof value.id !== "string") return false;

    if (value.typeName === "asset") {
        return (
            typeof value.src === "string" &&
            typeof value.w === "number" &&
            typeof value.h === "number"
        );
    }

    return (
        value.typeName === "shape" &&
        typeof value.type === "string" &&
        typeof value.x === "number" &&
        typeof value.y === "number" &&
        typeof value.rot === "number" &&
        typeof value.z === "number" &&
        isRecord(value.props)
    );
};

const SnapshotSchema = z.custom<Snapshot>((value) => {
    if (
        !isRecord(value) ||
        !isRecord(value.document) ||
        !isRecord(value.document.store)
    ) {
        return false;
    }

    return Object.values(value.document.store).every(isBoardRecord);
});

type ModifiedCanvasEditorContentType = {
    data: Snapshot;
    config: {
        theme: ThemeId;
        grid: GridId | "crosses" | "iso" | "ruled";
    };
};

const CanvasEditorContentSchema: z.ZodType<ModifiedCanvasEditorContentType> = z.object({
    data: SnapshotSchema,
    config: z.object({
        theme: z.enum(["light", "dark"]),
        grid: z.enum([
            "none",
            "lines",
            "dots",
            "crosses",
            "iso",
            "ruled",
        ]),
    }),
});

export { JSONContentSchema, TableStateSchema, CanvasEditorContentSchema };
