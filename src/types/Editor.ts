import { blockTypeOptions } from "@/Context/DataStore";

export interface EditorData {
    id: string;
    title: string;
    type: blockTypeOptions;
    content: string;
    designId: number;
    action: "save" | "add";
}
