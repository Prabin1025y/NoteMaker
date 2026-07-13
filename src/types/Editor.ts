export type blockTypeOptions =
    | "block"
    | "heading"
    | "code"
    | "image"
    | "table"
    | "divider"
    | "formula";

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
