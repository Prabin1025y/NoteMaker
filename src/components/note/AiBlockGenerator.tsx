"use client";

import { useState } from "react";
import { Sparkles, X } from "lucide-react";
import { useNoteStore } from "@/Context/DataStore";
import { Button } from "@/components/ui/button";
import { generateAiNote } from "@/lib/generate-note";

const AiBlockGenerator = () => {
    const { addSaveBlock, isAiOpen, setIsAiOpen, setIsGenerating } =
        useNoteStore();
    const [prompt, setPrompt] = useState("");

    const handleGenerateBlocks = async () => {
        try {
            setIsGenerating(true);
            setIsAiOpen(false);

            await generateAiNote(prompt, addSaveBlock);

            setPrompt("");
        } catch (error) {
            alert(
                error instanceof Error
                    ? error.message
                    : "Failed to generate a block.",
            );
        } finally {
            setIsGenerating(false);
        }
    };

    if (!isAiOpen) return null;

    return (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/30 px-4 backdrop-blur-[2px]">
            <div
                className="w-full max-w-lg rounded-lg border border-muted bg-card/80 shadow-lg animate-in fade-in zoom-in-95 duration-200"
                role="dialog"
                aria-labelledby="ai-generator-title"
            >
                <div className="flex items-start justify-between border-b border-muted px-5 py-4">
                    <div>
                        <h2
                            id="ai-generator-title"
                            className="text-[15px] font-semibold text-ink tracking-tight"
                        >
                            AI Block Generator
                        </h2>
                        <p className="mt-1 text-[12px] text-muted-foreground">
                            Describe the block you want and AI will create it.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => {
                            setIsAiOpen(false);
                            setPrompt("");
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-background/80 hover:text-ink"
                        aria-label="Close"
                    >
                        <X size={16} />
                    </button>
                </div>

                <div className="px-5 py-4">
                    <label
                        htmlFor="ai-block-prompt"
                        className="mb-2 block text-[12px] font-medium text-body"
                    >
                        Describe your block
                    </label>
                    <textarea
                        id="ai-block-prompt"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => {
                            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                                e.preventDefault();
                                void handleGenerateBlocks();
                            }
                        }}
                        placeholder={`"Create a comparison table."\n"Generate an example."\n"Summarize this topic."`}
                        rows={5}
                        autoFocus
                        className="w-full resize-none rounded-lg border border-muted bg-background/80 px-3 py-3 text-[13px] text-ink outline-none transition-colors placeholder:text-muted-foreground focus:border-[color:var(--ds-focus-ring)] focus:ring-2 focus:ring-[color:var(--ds-focus-ring)]"
                    />
                    <p className="mt-2 text-[11px] text-muted-foreground">
                        Press Ctrl/Cmd + Enter to generate
                    </p>
                </div>

                <div className="flex items-center justify-end gap-2 border-t border-muted px-5 py-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            setIsAiOpen(false);
                            setPrompt("");
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        size="sm"
                        disabled={!prompt.trim()}
                        onClick={() => void handleGenerateBlocks()}
                        className="bg-primary text-primary-foreground transition-[filter] duration-150 hover:brightness-105"
                    >
                        <>
                            <Sparkles size={14} />
                            Generate AI Block
                        </>
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default AiBlockGenerator;
