import { allBlocks } from "@/utils/BlocksInfo";
import {
    INITIAL_JSON_CANVAS,
    INITIAL_JSON_EDITOR,
    INITIAL_JSON_HEADING,
    MONACO_LANGUAGES,
} from "@/utils/UtilFunctions";
import { blockTypeOptions, ContentType } from "@/types/Editor";
import { PreviewFile } from "./../ImageUploader";
import { JSONContent } from "@tiptap/core";
import {
    CanvasEditorContentSchema,
    JSONContentSchema,
    TableStateSchema,
} from "@/validation/editorData";
import { ALL_DIVIDERS } from "@/utils/Dividers";
import { makeInitialState } from "./TableSection";

export interface BlockEditorValidationContext {
    currentType: blockTypeOptions;
    title: string;
    content: ContentType;
    file: PreviewFile | null;
    language: string;
}

export interface BlockTypeConfig {
    type: blockTypeOptions;
    showTitleField: boolean;
    supportsDesign: boolean;
    initialContent: ContentType;
    titleLabel: string;
    validate: (context: BlockEditorValidationContext) => boolean;
    previewContent: (
        context: BlockEditorValidationContext,
    ) => BlockEditorValidationContext["content"];
}

const codeLanguageFromTitle = (title: string) => {
    const normalized = title.trim().toLowerCase();
    return MONACO_LANGUAGES.includes(normalized) ? normalized : "javascript";
};

const previewContentForType = (
    type: blockTypeOptions,
    content: ContentType,
    file: PreviewFile | null,
): ContentType => {
    if (type === "image") {
        return file?.preview || (typeof content === "string" ? content : "");
    }

    if (type === "formula") {
        return typeof content === "string" && content
            ? content
            : "E=mc^2";
    }

    if (type === "code") {
        return typeof content === "string" && content
            ? content
            : "//Your code will be here";
    }

    if (type === "divider") {
        return typeof content === "string" ? content : ALL_DIVIDERS[0].name;
    }

    if (type === "canvas") {
        const result = CanvasEditorContentSchema.safeParse(content);
        return result.success ? result.data : INITIAL_JSON_CANVAS;
    }

    if (type === "table") {
        const result = TableStateSchema.safeParse(content);
        if (result.success) return result.data;

        const initialState = allBlocks.find(
            (block) => block.type === "table",
        )?.defaultContent;
        const initialResult = TableStateSchema.safeParse(initialState);
        return initialResult.success ? initialResult.data : makeInitialState();
    }

    const result = JSONContentSchema.safeParse(content);
    if (result.success) return result.data;
    return type === "heading" ? INITIAL_JSON_HEADING : INITIAL_JSON_EDITOR;
};

export const blockTypeConfigs: Record<blockTypeOptions, BlockTypeConfig> = {
    block: {
        type: "block",
        showTitleField: true,
        supportsDesign: true,
        initialContent: INITIAL_JSON_EDITOR,
        titleLabel: "Title",
        validate: ({ content }) => {
            const result = JSONContentSchema.safeParse(content);
            if (!result.success) {
                return false;
            }

            const document = result.data;

            function hasText(node: JSONContent): boolean {
                if (node.type === "text") {
                    return (
                        typeof node.text === "string" &&
                        node.text.trim().length > 0
                    );
                }

                return node.content?.some(hasText) ?? false;
            }

            return document.content?.some(hasText) ?? false;
        },
        previewContent: ({ content }) => content,
    },
    heading: {
        type: "heading",
        showTitleField: false,
        supportsDesign: true,
        initialContent: INITIAL_JSON_HEADING,
        titleLabel: "Title",
        validate: ({ content }) => JSONContentSchema.safeParse(content).success,
        previewContent: ({ content }) => {
            const result = JSONContentSchema.safeParse(content);
            return result.success ? result.data : INITIAL_JSON_HEADING;
        },
    },
    code: {
        type: "code",
        showTitleField: true,
        supportsDesign: true,
        initialContent: "// Do Something",
        titleLabel: "Title",
        validate: ({ content }) =>
            typeof content === "string" && content.trim().length > 0,
        previewContent: ({ content }) =>
            typeof content === "string" && content
                ? content
                : "//Your code will be here",
    },
    image: {
        type: "image",
        showTitleField: true,
        supportsDesign: false,
        initialContent: "",
        titleLabel: "Caption",
        validate: ({ file }) => Boolean(file),
        previewContent: ({ content, file }) => file?.preview || content || "",
    },
    table: {
        type: "table",
        showTitleField: true,
        supportsDesign: true,
        initialContent:
            allBlocks.find((b) => b.type === "table")?.defaultContent || "",
        titleLabel: "",
        validate: ({ content }) => {
            const result = TableStateSchema.safeParse(content);
            if (!result.success) return false;
            return true;
        },
        previewContent: ({ content }) => {
            const result = TableStateSchema.safeParse(content);
            if (result.success) return result.data;
            const initialState = allBlocks.find(
                (block) => block.type === "table",
            )?.defaultContent;
            const initialResult = TableStateSchema.safeParse(initialState);
            return initialResult.success
                ? initialResult.data
                : makeInitialState();
        },
    },
    divider: {
        type: "divider",
        showTitleField: false,
        supportsDesign: false,
        initialContent:
            allBlocks.find((b) => b.type === "divider")?.defaultContent || "",
        titleLabel: "",
        validate: ({ content }) =>
            typeof content === "string" &&
            ALL_DIVIDERS.some((divider) => divider.name === content.trim()),
        previewContent: ({ content }) =>
            typeof content === "string" ? content : ALL_DIVIDERS[0].name,
    },
    formula: {
        type: "formula",
        showTitleField: false,
        supportsDesign: true,
        initialContent: "E=mc^2",
        titleLabel: "",
        validate: ({ content }) =>
            typeof content === "string" && content.trim().length > 0,
        previewContent: ({ content }) =>
            typeof content === "string" && content ? content : "E=mc^2",
    },
    canvas: {
        type: "canvas",
        showTitleField: true,
        supportsDesign: false,
        initialContent: INITIAL_JSON_CANVAS,
        titleLabel: "Caption",
        validate: ({ content }) => {
            const result = CanvasEditorContentSchema.safeParse(content);
            if (!result.success) return false;
            return true;
        },
        previewContent: ({ content }) => {
            const result = CanvasEditorContentSchema.safeParse(content);
            return result.success ? result.data : INITIAL_JSON_CANVAS;
        },
    },
};

export const getBlockTypeConfig = (type: blockTypeOptions) =>
    blockTypeConfigs[type];

export const getDefaultLanguage = (title: string) =>
    codeLanguageFromTitle(title);

export const getPreviewContent = (
    type: blockTypeOptions,
    content: ContentType,
    file: PreviewFile | null,
) => previewContentForType(type, content, file);

export const wantsTitleField = (type: blockTypeOptions) =>
    blockTypeConfigs[type].showTitleField;

export const supportsDesign = (type: blockTypeOptions) =>
    blockTypeConfigs[type].supportsDesign;
