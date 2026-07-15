import { EditorData } from "@/types/Editor";
import { markdownToTiptap } from "./utils";

type AiGeneratedBlock = {
    type: EditorData["type"];
    content: string;
    title: string;
    designId: number;
    colorOptionId: number;
    order: number;
};

export async function generateAiNote(
    prompt: string,
    addSaveBlock: (editorData: EditorData) => void,
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
        console.error("Response body is null");
        return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        // Decode the chunk of data
        buffer += decoder.decode(value, { stream: true });
        // Split the buffer by newlines to get individual JSON strings
        const lines = buffer.split("\n");
        // Keep the last partial line in the buffer
        buffer = lines.pop() ?? "";
        for (const line of lines) {
            if (!line.trim()) continue;
            try {
                const generatedBlock: AiGeneratedBlock = JSON.parse(line);

                if ("error" in generatedBlock) {
                    console.error(generatedBlock.error);
                    continue;
                }
                console.log("Received new block:", generatedBlock);

                let content = generatedBlock.content;
                if (generatedBlock.type === "block")
                    content = await markdownToTiptap(content);
                addSaveBlock({
                    id: "",
                    title: generatedBlock.title || "",
                    type: generatedBlock.type || "block",
                    order: "auto", //Automatically order as last one
                    content: content || "",
                    designId: generatedBlock.designId ?? 0,
                    colorOptionId: generatedBlock.colorOptionId ?? 1,
                    action: "add",
                });
            } catch (err) {
                console.error("Error parsing JSON chunk:", err, line);
            }
        }
    }

    // Process any remaining buffered line
    if (buffer.trim()) {
        const generatedBlock: AiGeneratedBlock = JSON.parse(buffer);

        let content = generatedBlock.content;

        if (generatedBlock.type === "block") {
            content = await markdownToTiptap(content);
        }

        addSaveBlock({
            id: "",
            title: generatedBlock.title ?? "",
            type: generatedBlock.type ?? "block",
            order: "auto",
            content: content ?? "",
            designId: generatedBlock.designId ?? 0,
            colorOptionId: generatedBlock.colorOptionId ?? 1,
            action: "add",
        });
    }
}
