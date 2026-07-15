"use client";
import { useNoteStore } from "@/Context/DataStore";
import { EditorData } from "@/types/Editor";
import {
    initialJsonForEditor,
    mapTypeToElement,
    randomBetweenExclusive,
} from "@/utils/UtilFunctions";
import { Loader, Plus, PlusIcon, Sparkles } from "lucide-react";
import { RefObject } from "react";

interface MainPageProps {
    openBlockEditor: (editorData: EditorData) => void;
    isGenerating: boolean;
    openAiModel: () => void;
    noteRef: RefObject<HTMLDivElement | null>;
}

const MainPage = ({
    openBlockEditor,
    noteRef,
    isGenerating,
    openAiModel,
}: MainPageProps) => {
    const { blocks, deleteBlock, draggingBlockId } = useNoteStore();

    const handleAddBlockInBetween = async (index: number) => {
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
                                    className={`relative group/add ${block.type === "heading" && "break-after-avoid"}`}
                                    key={block.id}
                                    id={`block-${block.id}`}
                                >
                                    <div className="pointer-events-none absolute inset-x-0 -top-4 z-10  flex justify-center opacity-0 -translate-y-2 scale-95 transition-all duration-200 ease-out group-hover/add:pointer-events-auto group-hover/add:translate-y-0 group-hover/add:scale-100 group-hover/add:opacity-100">
                                        <div className="h-px w-full absolute top-1/2 border-t border-dashed border-indigo-300" />
                                        <button
                                            onClick={() =>
                                                handleAddBlockInBetween(i)
                                            }
                                            className="flex items-center justify-center z-10 gap-1 rounded-full border border-indigo-500 bg-white px-4 py-1 text-[12px] font-medium text-indigo-600 shadow-sm transition-all duration-200 ease-out hover:bg-indigo-100"
                                        >
                                            <PlusIcon size={18} />
                                            <span>Add Block</span>
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
                    {isGenerating && (
                        <div className="w-full h-40 bg-gray-300 animate-pulse my-5 gap-3 rounded-lg flex items-center justify-center">
                            <Loader className="animate-spin duration-500" />
                            <p>Generating...</p>
                        </div>
                    )}
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
                        disabled={isGenerating}
                        onClick={() => openAiModel()}
                        className={` ${isGenerating && "cursor-not-allowed opacity-70"} flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-indigo-200 bg-linear-to-br from-indigo-600 to-violet-600 px-4 py-5 text-left text-white shadow-sm transition-all hover:from-indigo-700 hover:to-violet-700`}
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
        </main>
    );
};

export default MainPage;
