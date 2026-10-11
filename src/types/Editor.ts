import { JSONContent } from "@tiptap/core";
import { CanvasEditorContentType } from "./CanvasEditor";
import { MonacoLanguage } from "@/utils/UtilFunctions";
import { ALL_DIVIDERS } from "@/utils/Dividers";
import { TableState } from "@/components/EditorModal/TableSection";
import { PreviewFile } from "@/components/ImageUploader";

export type blockTypeOptions =
    | "block"
    | "heading"
    | "code"
    | "image"
    | "table"
    | "divider"
    | "formula"
    | "canvas";

// export interface EditorData {
//     id: string;
//     title: string;
//     type: blockTypeOptions;
//     content: string;
//     designId: number;
//     order: number | "auto";
//     colorOptionId: number;
//     action: "save" | "add";
// }

export interface BaseEditorDataType {
    id: string;
    title: string;
    designId: number;
    order: number | "auto";
    colorOptionId: number;
    action: "save" | "add";
}

export type EditorDataType =
    | (BaseEditorDataType & {
          type: "block" | "heading";
          content: JSONContent;
      })
    | (BaseEditorDataType & {
          type: "canvas";
          content: CanvasEditorContentType;
      })
    | (BaseEditorDataType & {
          type: "code";
          content: string;
          language: MonacoLanguage;
      })
    | (BaseEditorDataType & {
          type: "divider";
          content: (typeof ALL_DIVIDERS)[number]["name"];
      })
    | (BaseEditorDataType & {
          type: "image";
          url: string;
      })
    | (BaseEditorDataType & {
          type: "table";
          content: TableState;
      })
    | (BaseEditorDataType & {
          type: "formula";
          content: string;
      });

// For use reducer
export type ContentType =
    | string
    | JSONContent
    | CanvasEditorContentType
    | TableState;

export interface BlockEditorState {
    currentType: blockTypeOptions;
    title: string;
    content: ContentType;
    language: MonacoLanguage;
    url: string;
    file: PreviewFile | null;
    designEnabled: boolean;
    designId: number;
    colorOptionId: number;
    isAdding: boolean;
    isVisible: boolean;
}

export type BlockEditorAction =
    | { type: "initialize"; payload: EditorDataType }
    | { type: "setType"; payload: blockTypeOptions }
    | { type: "setTitle"; payload: string }
    | {
          type: "setContent";
          payload: ContentType;
      }
    | { type: "setFile"; payload: PreviewFile | null }
    | { type: "setLanguage"; payload: MonacoLanguage }
    | { type: "setDesignEnabled"; payload: boolean }
    | { type: "setDesignId"; payload: number }
    | { type: "setColorOptionId"; payload: number }
    | { type: "setAdding"; payload: boolean }
    | { type: "setVisible"; payload: boolean };
