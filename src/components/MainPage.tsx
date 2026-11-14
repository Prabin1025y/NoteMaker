"use client";
import { useNoteStore } from "@/Context/DataStore";
import { EditorDataType } from "@/types/Editor";
import {
    INITIAL_JSON_EDITOR,
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
import { copyBlockToClipboard } from "@/utils/blockClipboard";
import {
    ClipboardPaste,
    ChevronDown,
    ChevronUp,
    Loader,
    Plus,
    PlusIcon,
    Sparkles,
} from "lucide-react";
import { RefObject, useEffect, useRef, useState } from "react";
import { useIsBreakpoint } from "@/hooks/use-is-breakpoint";

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
                language: block.language ?? "javascript",
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
        addCopiedBlock,
        duplicateBlock,
        copiedContent,
        draggingBlockId,
        isReadOnly,
        isGenerating,
        setCopiedContent,
        setIsAiOpen,
    } = useNoteStore();
    const [showScrollTopBottom, setShowScrollTopBottom] = useState([
        false,
        true,
    ]);

    const contentRef = useRef<HTMLDivElement>(null);
    const enableTapControls = useIsBreakpoint("max", 768);
    const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

    useEffect(() => {
        if (!enableTapControls || !selectedBlockId) return;

        const handleOutsidePointerDown = (event: PointerEvent) => {
            const block = document.getElementById(`block-${selectedBlockId}`);
            if (event.target instanceof Node && !block?.contains(event.target)) {
                setSelectedBlockId(null);
            }
        };

        document.addEventListener("pointerdown", handleOutsidePointerDown, true);
        return () => {
            document.removeEventListener(
                "pointerdown",
                handleOutsidePointerDown,
                true,
            );
        };
    }, [enableTapControls, selectedBlockId]);

    useEffect(() => {
        const contentDiv = contentRef.current;
        if (!contentDiv) return;

        const handleScroll = () => {
            const top = contentDiv.scrollTop > 100;
            const bottom =
                contentDiv.scrollHeight - contentDiv.clientHeight - contentDiv.scrollTop > 100;
            if (top === visibility[0] && bottom === visibility[1]) return;
            visibility = [top, bottom];
            setShowScrollTopBottom(visibility);
        };

        let visibility = [false, true];
        handleScroll();
        contentDiv.addEventListener("scroll", handleScroll, { passive: true });
        const observer = new ResizeObserver(handleScroll);
        observer.observe(contentDiv);
        if (noteRef.current) observer.observe(noteRef.current);

        return () => {
            contentDiv.removeEventListener("scroll", handleScroll);
            observer.disconnect();
        };
    }, [noteRef]);

    const handleQuickScroll = (direction: "top" | "bottom") => {
        const block = direction === "top" ? blocks.at(0) : blocks.at(-1);
        if (!block) return;

        document.getElementById(`block-${block.id}`)?.scrollIntoView({
            behavior: "smooth",
        });
    };

    const getOrderBetweenBlocks = (index: number) => {
        const prevOrder = blocks[index - 1]?.order ?? 0;
        const nextOrder = blocks[index]?.order;

        if (nextOrder === undefined) {
            alert("Something is not right.");
            return null;
        }

        return randomBetweenExclusive(prevOrder, nextOrder);
    };

    const handleAddBlockInBetween = (index: number) => {
        const newOrder = getOrderBetweenBlocks(index);
        if (newOrder === null) return;

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

    const handleCopyBlock = async (
        block: (typeof blocks)[number],
        canvasImage?: Promise<Blob | null>,
    ) => {
        setCopiedContent({
            type: block.type,
            content: block.content,
            title: block.title,
            language: block.language,
            designId: block.designId,
            colorOptionId: block.colorOptionId,
        });
        try {
            await copyBlockToClipboard(
                block,
                document.getElementById(`block-${block.id}`),
                canvasImage,
            );
        } catch (error) {
            alert(
                error instanceof Error
                    ? error.message
                    : "Couldn't copy block content to the clipboard.",
            );
        }
    };

    const handlePasteBlock = (order: number | "auto" = "auto") => {
        if (copiedContent) addCopiedBlock(copiedContent, order);
    };

    const handlePasteBlockInBetween = (index: number) => {
        if (!copiedContent) return;
        const order = getOrderBetweenBlocks(index);
        if (order !== null) handlePasteBlock(order);
    };

    return (
        <main className="flex-1 relative max-md:min-w-0">
            {showScrollTopBottom[0] && (
                <button
                    type="button"
                    onClick={() => handleQuickScroll("top")}
                    title="Scroll to Top"
                    aria-label="Scroll to Top"
                    className="absolute right-3 top-3 z-20 w-8 h-8 md:right-5 md:top-5 md:w-10 md:h-10 rounded-md grid place-items-center cursor-pointer text-background bg-secondary hover:bg-primary transition-colors duration-500"
                >
                    <ChevronUp className="h-5 w-5 md:h-6 md:w-6" />
                </button>
            )}
            {showScrollTopBottom[1] && (
                <button
                    type="button"
                    onClick={() => handleQuickScroll("bottom")}
                    title="Scroll to Bottom"
                    aria-label="Scroll to Bottom"
                    className="absolute right-3 bottom-3 z-20 w-8 h-8 md:right-5 md:bottom-5 md:w-10 md:h-10 rounded-md grid place-items-center cursor-pointer text-background bg-secondary hover:bg-primary transition-colors duration-500"
                >
                    <ChevronDown className="h-5 w-5 md:h-6 md:w-6" />
                </button>
            )}
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
                                    className: "peer",
                                    onEdit: () => openBlockEditor(editorData),
                                    onDelete: () => deleteBlock(block.id),
                                    onCopy: (canvasImage?: Promise<
                                        Blob | null
                                    >) =>
                                        handleCopyBlock(block, canvasImage),
                                    onDuplicate: () => duplicateBlock(block.id),
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
                                                language={editorData.language}
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
                                        className={`relative group/add ${block.type === "heading" ? "break-after-avoid" : ""} ${draggingBlockId === block.id ? "rounded-xl bg-primary/10 outline-2 outline-dashed outline-primary outline-offset-4 shadow-lg" : ""}`}
                                        key={block.id}
                                        id={`block-${block.id}`}
                                        data-mobile-active={
                                            enableTapControls &&
                                            selectedBlockId === block.id
                                        }
                                        onClickCapture={() => {
                                            if (enableTapControls) {
                                                setSelectedBlockId(block.id);
                                            }
                                        }}
                                    >
                                        {draggingBlockId === block.id && (
                                            <span className="absolute -top-3 right-2 z-20 rounded bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                                                Moving block
                                            </span>
                                        )}
                                        {!isReadOnly && (
                                            <div className="pointer-events-none absolute inset-x-0 -top-4 z-10 flex -translate-y-2 scale-95 justify-center gap-2 opacity-0 transition-[opacity,transform] duration-200 ease-[cubic-bezier(0.2,0,0,1)] group-hover/add:pointer-events-auto group-hover/add:translate-y-0 group-hover/add:scale-100 group-hover/add:opacity-100 max-md:group-data-[mobile-active=true]/add:pointer-events-auto max-md:group-data-[mobile-active=true]/add:translate-y-0 max-md:group-data-[mobile-active=true]/add:scale-100 max-md:group-data-[mobile-active=true]/add:opacity-100">
                                                <div className="absolute top-1/2 h-px w-full border-t border-dashed border-[color:var(--ds-accent-soft)]" />
                                                <button
                                                    onClick={() =>
                                                        handleAddBlockInBetween(
                                                            i,
                                                        )
                                                    }
                                                    className="z-10 flex items-center justify-center gap-1 rounded-full border border-[color:var(--ds-accent)] bg-card px-4 py-1 text-[12px] font-medium text-primary shadow-sm outline-none transition-colors duration-150 hover:bg-muted focus-visible:ring-2 focus-visible:ring-[color:var(--ds-focus-ring)] max-md:gap-0.5 max-md:px-2 max-md:text-[11px]"
                                                >
                                                    <PlusIcon size={18} />
                                                    <span>Add Block</span>
                                                </button>
                                                {copiedContent && (
                                                    <button
                                                        onClick={() =>
                                                            handlePasteBlockInBetween(
                                                                i,
                                                            )
                                                        }
                                                        title="Paste copied block here"
                                                        aria-label="Paste copied block here"
                                                        className="z-10 flex items-center justify-center gap-1 rounded-full border border-[color:var(--ds-accent)] bg-card px-4 py-1 text-[12px] font-medium text-primary shadow-sm outline-none transition-colors duration-150 hover:bg-muted focus-visible:ring-2 focus-visible:ring-[color:var(--ds-focus-ring)] max-md:gap-0.5 max-md:px-2 max-md:text-[11px]"
                                                    >
                                                        <ClipboardPaste
                                                            size={16}
                                                        />
                                                        <span>Paste Block</span>
                                                    </button>
                                                )}
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

                                {copiedContent && (
                                    <button
                                        type="button"
                                        onClick={() => handlePasteBlock()}
                                        className="group flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-strong bg-card px-4 py-5 outline-none transition-colors duration-150 hover:border-accent hover:bg-muted focus-visible:ring-2 focus-visible:ring-[color:var(--ds-focus-ring)]"
                                    >
                                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/20 text-primary transition-colors duration-150 group-hover:bg-brand-soft">
                                            <ClipboardPaste size={18} />
                                        </div>
                                        <p className="text-center text-[13px] font-semibold text-ink">
                                            Paste copied block
                                        </p>
                                    </button>
                                )}

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
