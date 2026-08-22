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
    isReadOnly?: boolean;
}

const MainPage = ({
    openBlockEditor,
    noteRef,
    isGenerating,
    openAiModel,
    isReadOnly = false,
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
        <main className="flex-1 overflow-y-auto bg-canvas">
            <div
                ref={noteRef}
                className="mx-auto max-w-5xl px-6 py-10 md:px-10"
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
                                    {!isReadOnly && (
                                        <div className="pointer-events-none absolute inset-x-0 -top-4 z-10 flex -translate-y-2 scale-95 justify-center opacity-0 transition-[opacity,transform] duration-200 ease-[cubic-bezier(0.2,0,0,1)] group-hover/add:pointer-events-auto group-hover/add:translate-y-0 group-hover/add:scale-100 group-hover/add:opacity-100">
                                            <div className="absolute top-1/2 h-px w-full border-t border-dashed border-[color:var(--ds-accent-soft)]" />
                                            <button
                                                onClick={() =>
                                                    handleAddBlockInBetween(i)
                                                }
                                                className="z-10 flex items-center justify-center gap-1 rounded-full border border-[color:var(--ds-accent)] bg-surface px-4 py-1 text-[12px] font-medium text-brand-cta shadow-sm outline-none transition-colors duration-150 hover:bg-tint focus-visible:ring-2 focus-visible:ring-[color:var(--ds-focus-ring)]"
                                            >
                                                <PlusIcon size={18} />
                                                <span>Add Block</span>
                                            </button>
                                        </div>
                                    )}
                                    <Component
                                        title={block.title || ""}
                                        content={block.content}
                                        designId={block.designId}
                                        colorOptionId={block.colorOptionId}
                                        readOnly={isReadOnly}
                                        className={`peer ${draggingBlockId === block.id ? "-translate-y-1 shadow-lg ring-2 ring-[color:var(--ds-focus-ring)] ring-offset-2 ring-offset-[color:var(--ds-surface-canvas)]" : ""}`}
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
                        <div className="my-5 flex h-40 w-full animate-pulse items-center justify-center gap-3 rounded-xl border border-hairline bg-paper text-muted-ink">
                            <Loader className="animate-spin" />
                            <p className="text-[13px] font-medium">
                                Generating…
                            </p>
                        </div>
                    )}
                </div>

                <div className="mb-8 mt-3 flex flex-col gap-3 md:flex-row">
                    {!isReadOnly && (
                        <>
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
                                className="group flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-strong bg-paper px-4 py-5 outline-none transition-colors duration-150 hover:border-[color:var(--ds-accent)] hover:bg-tint focus-visible:ring-2 focus-visible:ring-[color:var(--ds-focus-ring)]"
                            >
                                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-tint text-brand-cta transition-colors duration-150 group-hover:bg-brand-soft">
                                    <Plus size={18} />
                                </div>
                                <p className="text-center text-[13px] font-semibold text-ink">
                                    Add a block
                                </p>
                            </button>

                            <button
                                type="button"
                                disabled={isGenerating}
                                onClick={() => openAiModel()}
                                className={`${isGenerating ? "cursor-not-allowed opacity-70" : ""} flex flex-1 flex-col items-center justify-center gap-3 rounded-xl bg-brand-cta px-4 py-5 text-[color:var(--ds-accent-contrast)] shadow-sm outline-none transition-[transform,filter] duration-150 hover:brightness-105 focus-visible:ring-2 focus-visible:ring-[color:var(--ds-focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--ds-surface-canvas)] active:scale-[0.99]`}
                            >
                                <div
                                    className="grid h-9 w-9 shrink-0 place-items-center rounded-lg"
                                    style={{ backgroundColor: "rgba(0,0,0,0.12)" }}
                                >
                                    <Sparkles size={18} />
                                </div>
                                <div>
                                    <p className="text-center text-[13px] font-semibold">
                                        Generate with AI
                                    </p>
                                    <p className="mt-0.5 text-center text-[11px] opacity-80">
                                        Describe the block and let AI create it
                                    </p>
                                </div>
                            </button>
                        </>
                    )}
                </div>
            </div>
        </main>
    );
};

export default MainPage;
