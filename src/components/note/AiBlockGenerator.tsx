"use client";

import { Dispatch, SetStateAction, useState } from "react";
import { Sparkles, X } from "lucide-react";
import { useNoteStore } from "@/Context/DataStore";
import { Button } from "@/components/ui/button";
import { generateAiNote } from "@/lib/generate-note";

interface AiBlockGeneratorProps {
    isOpen: boolean;
    setIsGenerating: Dispatch<SetStateAction<boolean>>;
    onClose: () => void;
}

const AiBlockGenerator = ({
    isOpen,
    onClose,
    setIsGenerating,
}: AiBlockGeneratorProps) => {
    const { addSaveBlock } = useNoteStore();
    const [prompt, setPrompt] = useState("");

    const handleGenerateBlocks = async () => {
        try {
            setIsGenerating(true);
            onClose();

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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/30 px-4 backdrop-blur-[2px]">
            <div
                className="w-full max-w-lg rounded-lg border border-[#E8E8E8] bg-white shadow-lg animate-in fade-in zoom-in-95 duration-200"
                role="dialog"
                aria-labelledby="ai-generator-title"
            >
                <div className="flex items-start justify-between border-b border-[#E8E8E8] px-5 py-4">
                    <div>
                        <h2
                            id="ai-generator-title"
                            className="text-[15px] font-semibold text-[#1A1A1A] tracking-tight"
                        >
                            AI Block Generator
                        </h2>
                        <p className="mt-1 text-[12px] text-[#6B6B6B]">
                            Describe the block you want and AI will create it.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => {
                            onClose();
                            setPrompt("");
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-[#9A9A9A] transition-colors hover:bg-[#F5F3FF] hover:text-[#1A1A1A]"
                        aria-label="Close"
                    >
                        <X size={16} />
                    </button>
                </div>

                <div className="px-5 py-4">
                    <label
                        htmlFor="ai-block-prompt"
                        className="mb-2 block text-[12px] font-medium text-[#4A4A4A]"
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
                        className="w-full resize-none rounded-lg border border-[#E8E8E8] bg-[#FAFAFA] px-3 py-3 text-[13px] text-[#1A1A1A] outline-none transition-all placeholder:text-[#B0B0B0] focus:border-[#6D5EF6] focus:ring-2 focus:ring-[#6D5EF6]/15"
                    />
                    <p className="mt-2 text-[11px] text-[#9A9A9A]">
                        Press Ctrl/Cmd + Enter to generate
                    </p>
                </div>

                <div className="flex items-center justify-end gap-2 border-t border-[#E8E8E8] px-5 py-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            onClose();
                            setPrompt("");
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        size="sm"
                        disabled={!prompt.trim()}
                        onClick={() => void handleGenerateBlocks()}
                        className="bg-[#6D5EF6] text-white hover:bg-[#5B4DE0]"
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
