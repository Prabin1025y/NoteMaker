import { allBlocks } from "@/utils/BlocksInfo";
import {
    editorJsonForPreview,
    initialHeadingJsonContent,
    initialJsonForEditor,
    isValidJson,
    MONACO_LANGUAGES,
} from "@/utils/UtilFunctions";
import { blockTypeOptions } from "@/types/Editor";
import { PreviewFile } from "./../ImageUploader";

export interface BlockEditorValidationContext {
    currentType: blockTypeOptions;
    title: string;
    content: string;
    file: PreviewFile | null;
    language: string;
}

export interface BlockTypeConfig {
    type: blockTypeOptions;
    showTitleField: boolean;
    supportsDesign: boolean;
    initialContent: string;
    titleLabel: string;
    validate: (context: BlockEditorValidationContext) => boolean;
    previewContent: (context: BlockEditorValidationContext) => string;
}

const codeLanguageFromTitle = (title: string) => {
    const normalized = title.trim().toLowerCase();
    return MONACO_LANGUAGES.includes(normalized)
        ? normalized
        : "javascript";
};

const previewContentForType = (
    type: blockTypeOptions,
    content: string,
    file: PreviewFile | null,
) => {
    if (type === "image") {
        return file?.preview || content || "";
    }

    if (type === "formula") {
        return content || "E=mc^2";
    }

    if (type === "code") {
        return content || "//Your code will be here";
    }

    if (type === "divider") {
        return content;
    }

    if (type === "canvas") {
        return content;
    }

    return content || editorJsonForPreview;
};

export const blockTypeConfigs: Record<blockTypeOptions, BlockTypeConfig> = {
    block: {
        type: "block",
        showTitleField: true,
        supportsDesign: true,
        initialContent: initialJsonForEditor,
        titleLabel: "Title",
        validate: ({ content }) => {
            if (!isValidJson(content)) return false;

            try {
                const parsed = JSON.parse(content);
                const firstLevelContent = parsed?.content;

                if (!Array.isArray(firstLevelContent)) return false;

                const hasTextContent = firstLevelContent.some((item: unknown) => {
                    if (typeof item !== "object" || item === null) return false;

                    const itemContent = (
                        item as { content?: Array<{ text?: string }> }
                    ).content;

                    if (!Array.isArray(itemContent)) return false;

                    return itemContent.some(
                        (nestedItem) =>
                            typeof nestedItem?.text === "string" &&
                            nestedItem.text.trim() !== "",
                    );
                });

                return hasTextContent || firstLevelContent.length > 1;
            } catch {
                return false;
            }
        },
        previewContent: ({ content }) => content || editorJsonForPreview,
    },
    heading: {
        type: "heading",
        showTitleField: false,
        supportsDesign: true,
        initialContent: initialHeadingJsonContent,
        titleLabel: "Title",
        validate: () => true,
        previewContent: ({ content }) => content || editorJsonForPreview,
    },
    code: {
        type: "code",
        showTitleField: false,
        supportsDesign: true,
        initialContent: "// Do Something",
        titleLabel: "Language",
        validate: ({ content }) => content.trim().length > 0,
        previewContent: ({ content }) => content || "//Your code will be here",
    },
    image: {
        type: "image",
        showTitleField: true,
        supportsDesign: false,
        initialContent: "",
        titleLabel: "Caption",
        validate: ({ file }) => Boolean(file),
        previewContent: ({ content, file }) =>
            file?.preview || content || "",
    },
    table: {
        type: "table",
        showTitleField: false,
        supportsDesign: true,
        initialContent: allBlocks.find((b) => b.type === "table")?.defaultContent || "",
        titleLabel: "",
        validate: ({ content }) => Boolean(content.trim()),
        previewContent: ({ content }) => content || editorJsonForPreview,
    },
    divider: {
        type: "divider",
        showTitleField: false,
        supportsDesign: false,
        initialContent: allBlocks.find((b) => b.type === "divider")?.defaultContent || "",
        titleLabel: "",
        validate: ({ content }) => Boolean(content.trim()),
        previewContent: ({ content }) => content,
    },
    formula: {
        type: "formula",
        showTitleField: false,
        supportsDesign: true,
        initialContent: "E=mc^2",
        titleLabel: "",
        validate: ({ content }) => content.trim().length > 0,
        previewContent: ({ content }) => content || "E=mc^2",
    },
    canvas: {
        type: "canvas",
        showTitleField: true,
        supportsDesign: false,
        initialContent: "",
        titleLabel: "Caption",
        validate: ({ content }) => {
            if (!content) return false;
            try {
                const parsed = JSON.parse(content);
                return (
                    Array.isArray(parsed?.strokes) &&
                    parsed.strokes.length > 0 &&
                    typeof parsed?.dataUrl === "string" &&
                    parsed.dataUrl.length > 0
                );
            } catch {
                return false;
            }
        },
        previewContent: ({ content }) => content,
    },
};

export const getBlockTypeConfig = (type: blockTypeOptions) => blockTypeConfigs[type];

export const getDefaultLanguage = (title: string) =>
    codeLanguageFromTitle(title);

export const getPreviewContent = (
    type: blockTypeOptions,
    content: string,
    file: PreviewFile | null,
) => previewContentForType(type, content, file);

export const wantsTitleField = (type: blockTypeOptions) =>
    blockTypeConfigs[type].showTitleField;

export const supportsDesign = (type: blockTypeOptions) =>
    blockTypeConfigs[type].supportsDesign;
