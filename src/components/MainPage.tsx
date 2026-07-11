"use client";
import { BlockType, useNoteStore } from "@/Context/DataStore";
import { markdownToTiptap } from "@/lib/utils";
import { EditorData } from "@/types/Editor";
import {
    initialJsonForEditor,
    mapTypeToElement,
    randomBetweenExclusive,
} from "@/utils/UtilFunctions";
import { Loader2, Plus, PlusIcon, Sparkles, X } from "lucide-react";
import { RefObject, useState } from "react";

interface MainPageProps {
    openBlockEditor: (editorData: EditorData) => void;
    noteRef: RefObject<HTMLDivElement | null>;
}

type AiGeneratedBlock = {
    type: EditorData["type"];
    content: string;
    title: string;
    designId: number;
    colorOptionId: number;
    order: number;
};

const MainPage = ({ openBlockEditor, noteRef }: MainPageProps) => {
    const { blocks, deleteBlock, draggingBlockId, addSaveBlock } =
        useNoteStore();
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [prompt, setPrompt] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);

    const handleAddBlockInBetween = async (block: BlockType, index: number) => {
        const prevOrder = blocks[index - 1]?.order || 0;
        const nextOrder = blocks[index]?.order;

        if (!nextOrder) {
            alert("Something is not right.");
            return;
        }

        const newOrder = randomBetweenExclusive(
            prevOrder ? prevOrder : 0,
            nextOrder,
        );

        openBlockEditor({
            id: "",
            designId: 0,
            colorOptionId: 1,
            action: "add",
            order: newOrder,
            content: initialJsonForEditor,
            title: "",
            type: "block",
        });
    };

    const handleGenerateBlocks = async () => {
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

        try {
            setIsGenerating(true);

            const response = await fetch(aiEndpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ command: trimmedPrompt, depth: "elaborated" }),
            });

            if (!response.ok) {
                throw new Error("Could not generate content right now.");
            }

            const payload = await response.json();
            const generatedBlocks = Array.isArray(payload?.blocks)
                ? (payload.blocks as AiGeneratedBlock[])
                : [];

            if (generatedBlocks.length === 0) {
                throw new Error("The AI service did not return any blocks.");
            }

            generatedBlocks.forEach(async (generatedBlock) => {
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
            });

            setPrompt("");
            setIsAiModalOpen(false);
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

    return (
        <main
            className="flex-1 overflow-y-auto bg-white"
            style={{ fontFamily: "'Inter', sans-serif" }}
        >
            <div
                ref={noteRef}
                className="mx-auto max-w-5xl px-10 py-10"
            >
                <div className="flex flex-col gap-3">
                    {blocks &&
                        blocks.length > 0 &&
                        blocks.map((block, i) => {
                            const Component = mapTypeToElement(block.type);
                            if (!Component) return null;
                            return (
                                <div
                                    className="relative group/add"
                                    key={block.id}
                                >
                                    <div className="absolute w-full hidden group-hover/add:flex items-center justify-center h-0 border-t border-dashed border-indigo-500 opacity-70 hover:opacity-100">
                                        <button
                                            onClick={() =>
                                                handleAddBlockInBetween(
                                                    block,
                                                    i,
                                                )
                                            }
                                            className="bg-white border hover:bg-indigo-100 border-indigo-500 px-4 py-1 rounded-full cursor-pointer flex items-center justify-center gap-1"
                                        >
                                            <PlusIcon size={20} />
                                            <p>Add Block</p>
                                        </button>
                                    </div>
                                    <Component
                                        title={block.title || ""}
                                        content={block.content}
                                        designId={block.designId}
                                        colorOptionId={block.colorOptionId}
                                        className={`peer ${draggingBlockId === block.id ? "-translate-y-1 shadow-lg ring-2 ring-indigo-400 ring-offset-2" : ""}`}
                                        onEdit={() =>
                                            openBlockEditor({
                                                id: block.id,
                                                designId: block.designId,
                                                colorOptionId:
                                                    block.colorOptionId,
                                                title: block.title || "",
                                                order: "auto",
                                                content: block.content,
                                                type: block.type,
                                                action: "save",
                                            })
                                        }
                                        onDelete={() => deleteBlock(block.id)}
                                    />
                                </div>
                            );
                        })}
                </div>

                <div className="mb-8 flex flex-col gap-3 md:flex-row">
                    <button
                        type="button"
                        onClick={() =>
                            openBlockEditor({
                                id: "",
                                designId: 0,
                                colorOptionId: 1,
                                action: "add",
                                order: "auto",
                                content: initialJsonForEditor,
                                title: "",
                                type: "block",
                            })
                        }
                        className="flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[#d4d0c8] bg-[#faf9f7] px-4 py-5 text-left transition-all hover:border-indigo-400 hover:bg-indigo-50/40"
                    >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] bg-indigo-100 transition-colors">
                            <Plus
                                size={18}
                                className="text-indigo-700"
                            />
                        </div>
                        <div>
                            <p className="text-center text-[13px] font-medium text-indigo-700">
                                Add Block
                            </p>
                        </div>
                    </button>

                    <button
                        type="button"
                        onClick={() => setIsAiModalOpen(true)}
                        className="flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-600 to-violet-600 px-4 py-5 text-left text-white shadow-sm transition-all hover:from-indigo-700 hover:to-violet-700"
                    >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] bg-white/20">
                            <Sparkles
                                size={18}
                                className="text-white"
                            />
                        </div>
                        <div>
                            <p className="text-center text-[13px] font-semibold">
                                Generate with AI
                            </p>
                            <p className="mt-0.5 text-center text-[11px] text-indigo-100">
                                Describe the block and let AI create it
                            </p>
                        </div>
                    </button>
                </div>
            </div>

            {isAiModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 px-4 backdrop-blur-sm">
                    <div className="w-full max-w-xl rounded-[20px] border border-[#e8e5e0] bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-[#f0ede8] px-5 py-4">
                            <div>
                                <h2 className="text-[15px] font-semibold text-[#1a1714] tracking-tight">
                                    Generate a block with AI
                                </h2>
                                <p className="mt-1 text-[12px] text-[#7a756f]">
                                    Describe what you want and we’ll add it to
                                    your note.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsAiModalOpen(false);
                                    setPrompt("");
                                }}
                                className="flex h-8 w-8 items-center justify-center rounded-[8px] text-[#9e9a94] transition-colors hover:bg-[#f5f3f0] hover:text-[#1a1714]"
                                aria-label="Close"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <div className="px-5 py-5">
                            <label
                                htmlFor="ai-prompt"
                                className="mb-2 block text-[12px] font-medium text-[#5a5550]"
                            >
                                Prompt
                            </label>
                            <textarea
                                id="ai-prompt"
                                value={prompt}
                                onChange={(event) =>
                                    setPrompt(event.target.value)
                                }
                                onKeyDown={(event) => {
                                    if (
                                        (event.metaKey || event.ctrlKey) &&
                                        event.key === "Enter"
                                    ) {
                                        event.preventDefault();
                                        void handleGenerateBlocks();
                                    }
                                }}
                                placeholder="Example: Create a short meeting summary block with a calm blue theme..."
                                rows={6}
                                className="w-full resize-none rounded-[12px] border border-[#e2e0dc] bg-[#faf9f7] px-3 py-3 text-[13px] text-[#1a1714] outline-none transition-all placeholder:text-[#b8b3ac] focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                            />
                            <p className="mt-2 text-[11px] text-[#b8b3ac]">
                                Tip: press Ctrl/Cmd + Enter to generate
                                instantly.
                            </p>
                        </div>

                        <div className="flex items-center justify-end gap-2 border-t border-[#f0ede8] bg-[#faf9f7] px-5 py-4">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsAiModalOpen(false);
                                    setPrompt("");
                                }}
                                className="rounded-[9px] border border-[#e2e0dc] bg-white px-3.5 py-2 text-[13px] font-medium text-[#5a5550] transition-colors hover:bg-[#f5f3f0]"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    void handleGenerateBlocks();
                                }}
                                disabled={isGenerating}
                                className="flex items-center gap-2 rounded-[9px] bg-indigo-700 px-3.5 py-2 text-[13px] font-medium text-white transition-colors hover:bg-indigo-800 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2
                                            size={14}
                                            className="animate-spin"
                                        />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={14} />
                                        Generate
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
};

export default MainPage;
