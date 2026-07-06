import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { marked } from "marked";
import { generateJSON } from "@tiptap/core";
import { tiptap_extensions_list } from "@/components/tiptap/tiptap-templates/simple/simple-editor";
// import type { JSONContent } from "@tiptap/core";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export async function markdownToTiptap(markdown: string): Promise<string> {
    // Convert Markdown -> HTML
    const html = await marked.parse(markdown);

    // Convert HTML -> Tiptap JSON
    const json = generateJSON(html, tiptap_extensions_list);

    return JSON.stringify(json);
}
