import type { EditorDataType, blockTypeOptions } from "@/types/Editor";
import { ALL_DIVIDERS } from "@/utils/Dividers";
import { MONACO_LANGUAGES } from "@/utils/UtilFunctions";
import {
    CanvasEditorContentSchema,
    TableStateSchema,
} from "@/validation/editorData";
import { markdownToTiptap } from "./utils";

type AiGeneratedBlock = {
    type: blockTypeOptions;
    content: string;
    title?: string;
    designId?: number;
    colorOptionId?: number;
};

const BLOCK_TYPES: blockTypeOptions[] = [
    "block",
    "heading",
    "code",
    "image",
    "table",
    "divider",
    "formula",
    "canvas",
];

const parseGeneratedBlock = (value: unknown): AiGeneratedBlock => {
    if (typeof value !== "object" || value === null) {
        throw new Error("Generated block must be an object");
    }

    const block = value as Record<string, unknown>;
    const type = BLOCK_TYPES.find((candidate) => candidate === block.type);
    if (
        !type ||
        typeof block.content !== "string"
    ) {
        throw new Error("Generated block has an invalid type or content");
    }

    return {
        type,
        content: block.content,
        title: typeof block.title === "string" ? block.title : "",
        designId:
            typeof block.designId === "number" ? block.designId : undefined,
        colorOptionId:
            typeof block.colorOptionId === "number"
                ? block.colorOptionId
                : undefined,
    };
};

const toEditorData = async (
    generatedBlock: AiGeneratedBlock,
): Promise<EditorDataType> => {
    const base = {
        id: "",
        title: generatedBlock.title ?? "",
        order: "auto" as const,
        designId: generatedBlock.designId ?? 0,
        colorOptionId: generatedBlock.colorOptionId ?? 1,
        action: "add" as const,
    };

    switch (generatedBlock.type) {
        case "block":
        case "heading":
            return {
                ...base,
                type: generatedBlock.type,
                content: await markdownToTiptap(generatedBlock.content),
            };
        case "code": {
            const language =
                MONACO_LANGUAGES.find(
                    (candidate) =>
                        candidate === generatedBlock.title?.toLowerCase(),
                ) ?? "javascript";
            return {
                ...base,
                type: "code",
                content: generatedBlock.content,
                language,
            };
        }
        case "image":
            return { ...base, type: "image", url: generatedBlock.content };
        case "divider": {
            const divider = ALL_DIVIDERS.find(
                ({ name }) => name === generatedBlock.content,
            );
            if (!divider) {
                throw new Error("Generated block has an invalid divider");
            }
            return { ...base, type: "divider", content: divider.name };
        }
        case "formula":
            return {
                ...base,
                type: "formula",
                content: generatedBlock.content,
            };
        case "table": {
            let parsedContent: unknown;
            try {
                parsedContent = JSON.parse(generatedBlock.content);
            } catch {
                throw new Error("Generated table content is not valid JSON");
            }
            const result = TableStateSchema.safeParse(parsedContent);
            if (!result.success) {
                throw new Error("Generated table content has an invalid shape");
            }
            return { ...base, type: "table", content: result.data };
        }
        case "canvas": {
            let parsedContent: unknown;
            try {
                parsedContent = JSON.parse(generatedBlock.content);
            } catch {
                throw new Error("Generated canvas content is not valid JSON");
            }
            const result =
                CanvasEditorContentSchema.safeParse(parsedContent);
            if (!result.success) {
                throw new Error("Generated canvas content has an invalid shape");
            }
            return { ...base, type: "canvas", content: result.data };
        }
    }
};

export async function generateAiNote(
    prompt: string,
    addSaveBlock: (editorData: EditorDataType) => void,
) {
    const trimmedPrompt = prompt.trim();

    if (!trimmedPrompt) {
        alert("Please enter a prompt to generate a block.");
        return;
    }

    const aiEndpoint =
        process.env.NEXT_PUBLIC_AI_API_URL ||
        process.env.NEXT_PUBLIC_BACKEND_URL;

    if (!aiEndpoint) {
        alert("AI generation endpoint is not configured.");
        return;
    }

    const response = await fetch(aiEndpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            command: trimmedPrompt,
            depth: "elaborated",
        }),
    });

    if (!response.ok) {
        throw new Error("Could not generate content right now.");
    }

    if (!response.body) {
        throw new Error("AI generation response body is empty");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    const processLine = async (line: string) => {
        if (!line.trim()) return;

        const parsed: unknown = JSON.parse(line);
        if (
            typeof parsed === "object" &&
            parsed !== null &&
            "error" in parsed
        ) {
            const errorMessage =
                "error" in parsed && typeof parsed.error === "string"
                    ? parsed.error
                    : "AI generation failed";
            console.error(errorMessage);
            return;
        }

        addSaveBlock(await toEditorData(parseGeneratedBlock(parsed)));
    };

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
            try {
                await processLine(line);
            } catch (error) {
                console.error("Error processing generated block:", error, line);
            }
        }
    }

    buffer += decoder.decode();
    if (buffer.trim()) {
        await processLine(buffer);
    }
}
