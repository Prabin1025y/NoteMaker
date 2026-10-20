import CodeBlock from "@/components/Blocks/CodeBlock";
import DividerBlock from "@/components/Blocks/DividerBlock";
import FormulaBlock from "@/components/Blocks/FormulaBlock";
import GeneralBlock from "@/components/Blocks/GeneralBlock";
import HeaderBlock from "@/components/Blocks/HeaderBlock";
import ImageBlock from "@/components/Blocks/ImageBlock";
import TableBlock from "@/components/Blocks/TableBlock";
import { apiFetch } from "@/lib/api-client";
import { blockTypeOptions, EditorDataType } from "@/types/Editor";
import { NoteSortKey } from "@/types/misc";
import { NoteType } from "@/types/custom/notes";
import CanvasBlock from "@/components/Blocks/CanvasBlock";
import type { JSONContent } from "@tiptap/core";
import { CanvasEditorContentType } from "@/types/CanvasEditor";

export function isValidJson(str: string) {
    try {
        JSON.parse(str);
        return true;
    } catch {
        return false;
    }
}

export const INITIAL_JSON_EDITOR: JSONContent = {
    type: "doc",
    content: [
        {
            type: "paragraph",
            attrs: { textAlign: null },
            content: [{ type: "text", text: " " }],
        },
    ],
};
export const INITIAL_JSON_CANVAS: CanvasEditorContentType = {
    data: { document: { store: {} } },
    config: { theme: "light", grid: "dots" },
};
export const INITIAL_JSON_HEADING: JSONContent = {
    type: "doc",
    content: [
        {
            type: "heading",
            attrs: { textAlign: "center", level: 2 },
            content: [{ type: "text", text: "Heading" }],
        },
    ],
};

export const INITIAL_EDITOR_DATA: EditorDataType = {
    id: "",
    action: "add",
    colorOptionId: 1,
    designId: 1,
    type: "block",
    order: "auto",
    title: "",
    content: INITIAL_JSON_EDITOR,
};

export const initialJsonForEditor = `{"type":"doc","content":[{"type":"paragraph","attrs":{"textAlign":null},"content":[{"type":"text","text":" "}]}]}`;
export const editorJsonForPreview = `{"type":"doc","content":[{"type":"paragraph","attrs":{"textAlign":null},"content":[{"type":"text","text":"This is example text for this block."}]}]}`;
export const initialHeadingJsonContent = `{"type":"doc","content":[{"type":"heading","attrs":{"textAlign":"center","level":2},"content":[{"type":"text","text":"Heading"}]}]}`;
export const initialJsonForCanvas = `{data:{"document":{"store":{}}}, config:{"theme":"light", "grid":"dots"}}`;

export const MONACO_LANGUAGES = [
    "plaintext",
    "javascript",
    "typescript",
    "html",
    "css",
    "scss",
    "json",
    "markdown",
    "xml",
    "yaml",
    "sql",
    "python",
    "java",
    "c",
    "cpp",
    "csharp",
    "go",
    "rust",
    "php",
    "ruby",
    "swift",
    "kotlin",
    "shell",
    "powershell",
    "dockerfile",
];

export type MonacoLanguage = (typeof MONACO_LANGUAGES)[number];

export function randomBetweenExclusive(min: number, max: number) {
    let r;
    do {
        r = Math.random();
    } while (r === 0);

    return min + r * (max - min);
}

export const mapTypeToElement = (type: blockTypeOptions) => {
    switch (type) {
        case "block":
            return GeneralBlock;
        case "image":
            return ImageBlock;
        case "formula":
            return FormulaBlock;
        case "code":
            return CodeBlock;
        case "table":
            return TableBlock;
        case "divider":
            return DividerBlock;
        case "heading":
            return HeaderBlock;
        case "canvas":
            return CanvasBlock;

        default:
            return null;
    }
};

export const getBlocksFromNoteId = async (id: string) => {
    try {
        const res = await apiFetch(
            `${process.env.NEXT_PUBLIC_WEBSITE_URL}/api/blocks?noteId=${id}`,
        );

        const data = await res.json();

        if (!res.ok) throw new Error(data.message);

        return data.blocks;
    } catch (error) {
        if (process.env.NODE_ENV === "development") console.log(error);

        alert(
            error instanceof Error
                ? error.message
                : "Error while fetching data",
        );
    }
};

export const SORT_OPTIONS: { key: NoteSortKey; label: string }[] = [
    { key: "updated", label: "Last edited" },
    { key: "created", label: "Date created" },
    { key: "title", label: "Title (A–Z)" },
];

export const formatDate = (value: Date | string) =>
    new Date(value).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });

export const sortNotes = (list: NoteType[], sort: NoteSortKey) => {
    const copy = [...list];
    if (sort === "title") {
        return copy.sort((a, b) =>
            (a.title || "Untitled").localeCompare(b.title || "Untitled"),
        );
    }
    const field = sort === "created" ? "createdAt" : "updatedAt";
    return copy.sort(
        (a, b) => new Date(b[field]).getTime() - new Date(a[field]).getTime(),
    );
};

export const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
};
