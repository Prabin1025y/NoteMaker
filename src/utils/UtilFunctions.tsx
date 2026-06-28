import CodeBlock from "@/components/Blocks/CodeBlock";
import DividerBlock from "@/components/Blocks/DividerBlock";
import FormulaBlock from "@/components/Blocks/FormulaBlock";
import GeneralBlock from "@/components/Blocks/GeneralBlock";
import ImageBlock from "@/components/Blocks/ImageBlock";
import TableBlock from "@/components/Blocks/TableBlock";
import { apiFetch } from "@/lib/api-client";
import { blockTypeOptions } from "@/types/Editor";

export function isValidJson(str: string) {
    try {
        JSON.parse(str);
        return true;
    } catch {
        return false;
    }
}

export const initialJsonForEditor = `{"type":"doc","content":[{"type":"paragraph","attrs":{"textAlign":null},"content":[{"type":"text","text":" "}]}]}`;

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
