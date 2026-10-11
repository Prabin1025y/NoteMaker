"use client";
import { useNoteStore } from "@/Context/DataStore";
import { EditorDataType } from "@/types/Editor";
import {
    INITIAL_JSON_EDITOR,
    MONACO_LANGUAGES,
    randomBetweenExclusive,
} from "@/utils/UtilFunctions";
import GeneralBlock from "@/components/Blocks/GeneralBlock";
import HeaderBlock from "@/components/Blocks/HeaderBlock";
import ImageBlock from "@/components/Blocks/ImageBlock";
import CodeBlock from "@/components/Blocks/CodeBlock";
import DividerBlock from "@/components/Blocks/DividerBlock";
import FormulaBlock from "@/components/Blocks/FormulaBlock";
import TableBlock from "@/components/Blocks/TableBlock";
import CanvasBlock from "@/components/Blocks/CanvasBlock";
import {
    CanvasEditorContentSchema,
    JSONContentSchema,
    TableStateSchema,
} from "@/validation/editorData";
import { ALL_DIVIDERS } from "@/utils/Dividers";
import {
    ChevronDown,
    ChevronUp,
    Loader,
    Plus,
    PlusIcon,
    Sparkles,
} from "lucide-react";
import { RefObject, useEffect, useRef, useState } from "react";

const parseStructuredContent = (content: string): unknown => {
    try {
        return JSON.parse(content);
    } catch {
        return null;
    }
};

const getEditorDataForBlock = (
    block: ReturnType<typeof useNoteStore.getState>["blocks"][number],
): EditorDataType | null => {
    const base = {
        id: block.id,
        title: block.title || "",
        designId: block.designId,
        colorOptionId: block.colorOptionId,
        order: "auto" as const,
        action: "save" as const,
    };

    switch (block.type) {
        case "block":
        case "heading": {
            const result = JSONContentSchema.safeParse(
                parseStructuredContent(block.content),
            );
            return result.success
                ? { ...base, type: block.type, content: result.data }
                : null;
        }
        case "canvas": {
            const result = CanvasEditorContentSchema.safeParse(
                parseStructuredContent(block.content),
            );
            return result.success
                ? { ...base, type: "canvas", content: result.data }
                : null;
        }
        case "code":
            if (typeof block.content !== "string") return null;
            return {
                ...base,
                type: "code",
                content: block.content,
                language:
                    MONACO_LANGUAGES.find(
                        (language) => language === base.title.toLowerCase(),
                    ) ?? "javascript",
            };
        case "divider": {
            const divider = ALL_DIVIDERS.find(
                (item) => item.name === block.content,
            );
            return divider
                ? { ...base, type: "divider", content: divider.name }
                : null;
        }
        case "formula":
            return typeof block.content === "string"
                ? { ...base, type: "formula", content: block.content }
                : null;
        case "image":
            return typeof block.content === "string"
                ? { ...base, type: "image", url: block.content }
                : null;
        case "table": {
            const result = TableStateSchema.safeParse(
                parseStructuredContent(block.content),
            );
            return result.success
                ? { ...base, type: "table", content: result.data }
                : null;
        }
    }
};

interface MainPageProps {
    openBlockEditor: (editorData: EditorDataType) => void;
    noteRef: RefObject<HTMLDivElement | null>;
}

const MainPage = ({ openBlockEditor, noteRef }: MainPageProps) => {
    const {
        blocks,
        deleteBlock,
        draggingBlockId,
        isReadOnly,
        isGenerating,
        setIsAiOpen,
    } = useNoteStore();
    const [showScrollTopBottom, setShowScrollTopBottom] = useState([
        false,
        true,
    ]);

    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const contentDiv = contentRef.current;
        if (!contentDiv) return;

        const handleScroll = () => {
            if (contentDiv.scrollTop > 100)
                setShowScrollTopBottom((prev) => [true, prev[1]]);
            else setShowScrollTopBottom((prev) => [false, prev[1]]);

            if (contentDiv.scrollHeight - contentDiv.scrollTop < 1000)
                setShowScrollTopBottom((prev) => [prev[0], false]);
            else setShowScrollTopBottom((prev) => [prev[0], true]);
        };

        contentDiv.addEventListener("scroll", handleScroll);

        return () => {
            contentDiv.removeEventListener("scroll", handleScroll);
        };
    }, [contentRef]);

    const handleQuickScroll = (direction: "top" | "bottom") => {
        if (direction === "top") {
            const firstContentElement: HTMLElement | null =
                document.getElementById(`block-${blocks[0].id}`);
            firstContentElement?.scrollIntoView({ behavior: "smooth" });
        } else {
            const lastContentElement: HTMLElement | null =
                document.getElementById(
                    `block-${blocks[blocks.length - 1].id}`,
                );
            lastContentElement?.scrollIntoView({ behavior: "smooth" });
        }
    };

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
            content: INITIAL_JSON_EDITOR,
            title: "",
            type: "block",
        });
    };

    return (
        <main className="flex-1 relative">
            <div className="absolute right-5 h-full w-10">
                {showScrollTopBottom[0] && (
                    <button
                        onClick={() => handleQuickScroll("top")}
                        title="Scroll to Top"
                        className="absolute top-5 w-10 h-10 rounded-md grid place-items-center cursor-pointer text-background bg-secondary hover:bg-primary transition-colors duration-500"
                    >
                        <ChevronUp size={24} />
                    </button>
                )}
                {showScrollTopBottom[1] && (
                    <button
                        onClick={() => handleQuickScroll("bottom")}
                        title="Scroll to Bottom"
                        className="absolute bottom-5 w-10 h-10 rounded-md grid place-items-center cursor-pointer text-background bg-secondary hover:bg-primary transition-colors duration-500"
                    >
                        <ChevronDown size={24} />
                    </button>
                )}
            </div>
            <div
                ref={contentRef}
                className=" flex-1 h-full overflow-y-auto"
            >
                <div
                    ref={noteRef}
                    className="mx-auto max-w-5xl px-6 py-10 md:px-10"
                >
                    <div className="flex flex-col gap-3">
                        {blocks &&
                            blocks.length > 0 &&
                            blocks.map((block, i) => {
                                const editorData = getEditorDataForBlock(block);
                                if (!editorData) return null;
                                const commonProps = {
                                    title: editorData.title,
                                    designId: editorData.designId,
                                    colorOptionId: editorData.colorOptionId,
                                    readOnly: isReadOnly,
                                    className: `peer ${draggingBlockId === block.id ? "-translate-y-1 shadow-lg ring-2 ring-[color:var(--ds-focus-ring)] ring-offset-2 ring-offset-[color:var(--ds-surface-canvas)]" : ""}`,
                                    onEdit: () => openBlockEditor(editorData),
                                    onDelete: () => deleteBlock(block.id),
                                };
                                let renderedBlock: React.ReactNode;

                                switch (editorData.type) {
                                    case "block":
                                        renderedBlock = (
                                            <GeneralBlock
                                                {...commonProps}
                                                content={editorData.content}
                                            />
                                        );
                                        break;
                                    case "heading":
                                        renderedBlock = (
                                            <HeaderBlock
                                                {...commonProps}
                                                content={editorData.content}
                                            />
                                        );
                                        break;
                                    case "image":
                                        renderedBlock = (
                                            <ImageBlock
                                                {...commonProps}
                                                content={editorData.url}
                                            />
                                        );
                                        break;
                                    case "code":
                                        renderedBlock = (
                                            <CodeBlock
                                                {...commonProps}
                                                title={editorData.language}
                                                content={editorData.content}
                                            />
                                        );
                                        break;
                                    case "divider":
                                        renderedBlock = (
                                            <DividerBlock
                                                {...commonProps}
                                                content={editorData.content}
                                            />
                                        );
                                        break;
                                    case "formula":
                                        renderedBlock = (
                                            <FormulaBlock
                                                {...commonProps}
                                                content={editorData.content}
                                            />
                                        );
                                        break;
                                    case "table":
                                        renderedBlock = (
                                            <TableBlock
                                                {...commonProps}
                                                content={editorData.content}
                                            />
                                        );
                                        break;
                                    case "canvas":
                                        renderedBlock = (
                                            <CanvasBlock
                                                {...commonProps}
                                                content={editorData.content}
                                            />
                                        );
                                        break;
                                }

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
                                                        handleAddBlockInBetween(
                                                            i,
                                                        )
                                                    }
                                                    className="z-10 flex items-center justify-center gap-1 rounded-full border border-[color:var(--ds-accent)] bg-card px-4 py-1 text-[12px] font-medium text-primary shadow-sm outline-none transition-colors duration-150 hover:bg-muted focus-visible:ring-2 focus-visible:ring-[color:var(--ds-focus-ring)]"
                                                >
                                                    <PlusIcon size={18} />
                                                    <span>Add Block</span>
                                                </button>
                                            </div>
                                        )}
                                        {renderedBlock}
                                    </div>
                                );
                            })}
                        {isGenerating && (
                            <div className="my-5 flex h-40 w-full animate-pulse items-center justify-center gap-3 rounded-xl border border-muted bg-card text-muted-foreground">
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
                                            content: INITIAL_JSON_EDITOR,
                                            title: "",
                                            type: "block",
                                        })
                                    }
                                    className="group flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-strong bg-card px-4 py-5 outline-none transition-colors duration-150 hover:border-accent hover:bg-muted focus-visible:ring-2 focus-visible:ring-[color:var(--ds-focus-ring)]"
                                >
                                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/20 text-primary transition-colors duration-150 group-hover:bg-brand-soft">
                                        <Plus size={18} />
                                    </div>
                                    <p className="text-center text-[13px] font-semibold text-ink">
                                        Add a block
                                    </p>
                                </button>

                                <button
                                    type="button"
                                    disabled={isGenerating}
                                    onClick={() => setIsAiOpen(true)}
                                    className={`${isGenerating ? "cursor-not-allowed opacity-70" : ""} flex flex-1 flex-col items-center justify-center gap-3 rounded-xl bg-primary px-4 py-5 text-primary-foreground shadow-sm outline-none transition-[transform,filter] duration-150 hover:brightness-105 focus-visible:ring-2 focus-visible:ring-[color:var(--ds-focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--ds-surface-canvas)] active:scale-[0.99]`}
                                >
                                    <div
                                        className="grid h-9 w-9 shrink-0 place-items-center rounded-lg"
                                        style={{
                                            backgroundColor: "rgba(0,0,0,0.12)",
                                        }}
                                    >
                                        <Sparkles size={18} />
                                    </div>
                                    <div>
                                        <p className="text-center text-[13px] font-semibold">
                                            Generate with AI
                                        </p>
                                        <p className="mt-0.5 text-center text-[11px] opacity-80">
                                            Describe the block and let AI create
                                            it
                                        </p>
                                    </div>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
};

export default MainPage;
