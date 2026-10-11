import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { marked } from "marked";
import { generateJSON } from "@tiptap/core";
import { tiptap_extensions_list } from "@/components/tiptap/tiptap-templates/simple/simple-editor";
import type { JSONContent } from "@tiptap/core";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export async function markdownToTiptap(
    markdown: string,
): Promise<JSONContent> {
    // Convert Markdown -> HTML
    const html = await marked.parse(markdown);

    // Convert HTML -> Tiptap JSON
    const json = generateJSON(html, tiptap_extensions_list);

    return json;
}

type TiptapNode = {
    text?: string;
    content?: TiptapNode[];
};

export function extractText(node?: TiptapNode): string {
    if (!node) return "";
    if (node.text) return node.text;

    if (!node.content || node.content.length === 0) return "";

    // Concatenate text from all child nodes
    return extractText(node.content[0]);
}
