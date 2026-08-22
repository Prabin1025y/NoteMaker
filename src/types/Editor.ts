export type blockTypeOptions =
    | "block"
    | "heading"
    | "code"
    | "image"
    | "table"
    | "divider"
    | "formula"
    | "canvas";

export interface EditorData {
    id: string;
    title: string;
    type: blockTypeOptions;
    content: string;
    designId: number;
    order: number | 'auto';
    colorOptionId: number;
    action: "save" | "add";
}
