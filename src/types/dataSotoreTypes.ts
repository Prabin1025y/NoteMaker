import { blockTypeOptions } from "./Editor";

export interface BlockType {
    id: string;
    publicId: string;
    noteId: string;
    createdAt: Date;
    updatedAt: Date;
    type: blockTypeOptions;
    content: string;
    designId: number;
    colorOptionId: number;
    title: string | null;
    language: string | null;
    order: number;
}

export type AddBlockType = Omit<BlockType, "id" | "updatedAt">;
export type EditBlockType = Partial<
    Omit<BlockType, "id" | "publicId" | "createdAt" | "updatedAt" | "noteId">
>;

export type BlockSyncType = {
    id: string;
} & (
    | {
          action: "add";
          block: AddBlockType;
      }
    | {
          action: "delete";
      }
    | {
          action: "edit";
          data: EditBlockType;
      }
);