import type { JSONContent } from "@tiptap/core";
import { isEqual } from "lodash";
import type { BlockEditorState, EditorDataType } from "@/types/Editor";
import { getBlobImageFile, removeBlobImageFile } from "@/lib/tiptap-utils";
import {
    CanvasEditorContentSchema,
    JSONContentSchema,
    TableStateSchema,
} from "@/validation/editorData";
import { ALL_DIVIDERS } from "@/utils/Dividers";
import { getBlockTypeConfig } from "./block-editor-config";

export const isBlockEditorUnchanged = (
    original: EditorDataType,
    state: BlockEditorState,
) =>
    original.type === state.currentType &&
    original.title === state.title &&
    original.designId === (state.designEnabled ? state.designId : 0) &&
    original.colorOptionId === state.colorOptionId &&
    !state.file &&
    (original.type === "image"
        ? original.url === state.url
        : isEqual(original.content, state.content)) &&
    (original.type !== "code" || original.language === state.language);

export const isBlockEditorValid = (state: BlockEditorState) =>
    getBlockTypeConfig(state.currentType).validate(state);

export const getBlockEditorValidationMessage = (state: BlockEditorState) => {
    switch (state.currentType) {
        case "image":
            return "Choose an image before leaving this block.";
        case "block":
            return "Add some text before leaving this block.";
        case "code":
            return "Enter some code before leaving this block.";
        case "formula":
            return "Enter a formula before leaving this block.";
        default:
            return "This block could not be saved. Check its content and try again.";
    }
};

const uploadBlobImages = async (content: JSONContent): Promise<JSONContent> => {
    const files = new Map<string, File>();
    const visit = (node: JSONContent) => {
        const src = node.type === "image" ? node.attrs?.src : undefined;
        if (typeof src === "string" && src.startsWith("blob:")) {
            const file = getBlobImageFile(src);
            if (file) files.set(src, file);
        }
        node.content?.forEach(visit);
    };
    visit(content);
    if (files.size === 0) return content;

    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));
    const response = await fetch("/api/upload-images", {
        method: "POST",
        body: formData,
    });
    const data = (await response.json()) as {
        images?: Array<{ url: string }>;
        error?: string;
    };
    if (!response.ok || !data.images || data.images.length !== files.size) {
        throw new Error(data.error || "Failed to upload images. Try again.");
    }

    const urls = new Map(
        [...files.keys()].map((url, index) => [url, data.images![index].url]),
    );
    const replaceUrls = (node: JSONContent) => {
        const src = node.type === "image" ? node.attrs?.src : undefined;
        if (typeof src === "string" && urls.has(src) && node.attrs) {
            node.attrs.src = urls.get(src);
        }
        node.content?.forEach(replaceUrls);
    };
    replaceUrls(content);
    files.forEach((_file, url) => removeBlobImageFile(url));
    return content;
};

export async function prepareBlockEditorData(
    original: EditorDataType,
    state: BlockEditorState,
): Promise<EditorDataType> {
    if (!isBlockEditorValid(state)) {
        throw new Error(getBlockEditorValidationMessage(state));
    }

    const base = {
        id: original.id,
        title: state.title,
        designId: state.designEnabled ? state.designId : 0,
        colorOptionId: state.colorOptionId || 1,
        order: original.order,
        action: original.action,
    };

    switch (state.currentType) {
        case "image": {
            if (!state.file) return { ...base, type: "image", url: state.url };
            const formData = new FormData();
            formData.append("image", state.file);
            const response = await fetch("/api/upload-image", {
                method: "POST",
                body: formData,
            });
            const data = (await response.json()) as { url?: string; error?: string };
            if (!response.ok || !data.url) {
                throw new Error(data.error || "Failed to upload image. Try again.");
            }
            return { ...base, type: "image", url: data.url };
        }
        case "block":
        case "heading": {
            const content = JSONContentSchema.parse(state.content);
            return {
                ...base,
                type: state.currentType,
                content: await uploadBlobImages(content),
            };
        }
        case "table":
            return { ...base, type: "table", content: TableStateSchema.parse(state.content) };
        case "canvas":
            return {
                ...base,
                type: "canvas",
                content: CanvasEditorContentSchema.parse(state.content),
            };
        case "divider": {
            const divider = ALL_DIVIDERS.find(({ name }) => name === state.content);
            if (!divider) throw new Error("Invalid divider content");
            return { ...base, type: "divider", content: divider.name };
        }
        case "code":
        case "formula":
            if (typeof state.content !== "string") throw new Error("Invalid block content");
            return state.currentType === "code"
                ? { ...base, type: "code", content: state.content, language: state.language }
                : { ...base, type: "formula", content: state.content };
    }
}
