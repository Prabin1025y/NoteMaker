"use client";

import { useState } from "react";
import { EditorDataType } from "@/types/Editor";
import { allBlocks, blockCategories, BlockItem } from "@/utils/BlocksInfo";
import {
    INITIAL_JSON_CANVAS,
    INITIAL_JSON_EDITOR,
    INITIAL_JSON_HEADING,
} from "@/utils/UtilFunctions";
import {
    CanvasEditorContentSchema,
    JSONContentSchema,
    TableStateSchema,
} from "@/validation/editorData";
import { ALL_DIVIDERS } from "@/utils/Dividers";
import { makeInitialState } from "@/components/EditorModal/TableSection";
import {
    PanelLeftCloseIcon,
    PanelRightCloseIcon,
    Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNoteStore } from "@/Context/DataStore";

interface LeftAsideProps {
    openBlockEditor: (editorData: EditorDataType) => void;
}

const COLLAPSED_WIDTH = "w-[52px]";
const EXPANDED_WIDTH = "w-60";

const LeftAside = ({ openBlockEditor }: LeftAsideProps) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const { isGenerating, setIsAiOpen } = useNoteStore();

    const handleBlockClick = (block: BlockItem) => {
        const base = {
            id: "",
            designId: block.defaultDesignId,
            colorOptionId: 1,
            action: "add" as const,
            title: "",
            order: "auto" as const,
        };

        switch (block.type) {
            case "block": {
                const result = JSONContentSchema.safeParse(
                    block.defaultContent,
                );
                openBlockEditor({
                    ...base,
                    type: "block",
                    content: result.success ? result.data : INITIAL_JSON_EDITOR,
                });
                break;
            }
            case "heading": {
                const result = JSONContentSchema.safeParse(
                    block.defaultContent,
                );
                openBlockEditor({
                    ...base,
                    type: "heading",
                    content: result.success
                        ? result.data
                        : INITIAL_JSON_HEADING,
                });
                break;
            }
            case "canvas": {
                const result = CanvasEditorContentSchema.safeParse(
                    block.defaultContent,
                );
                openBlockEditor({
                    ...base,
                    type: "canvas",
                    content: result.success
                        ? result.data
                        : INITIAL_JSON_CANVAS,
                });
                break;
            }
            case "code":
                openBlockEditor({
                    ...base,
                    type: "code",
                    content:
                        typeof block.defaultContent === "string"
                            ? block.defaultContent
                            : "// Do Something",
                    language: "javascript",
                });
                break;
            case "divider": {
                const divider = ALL_DIVIDERS.find(
                    ({ name }) => name === block.defaultContent,
                );
                openBlockEditor({
                    ...base,
                    type: "divider",
                    content: divider?.name ?? ALL_DIVIDERS[0].name,
                });
                break;
            }
            case "formula":
                openBlockEditor({
                    ...base,
                    type: "formula",
                    content:
                        typeof block.defaultContent === "string"
                            ? block.defaultContent
                            : "E=mc^2",
                });
                break;
            case "image":
                openBlockEditor({
                    ...base,
                    type: "image",
                    url:
                        typeof block.defaultContent === "string"
                            ? block.defaultContent
                            : "",
                });
                break;
            case "table": {
                const result = TableStateSchema.safeParse(block.defaultContent);
                openBlockEditor({
                    ...base,
                    type: "table",
                    content: result.success ? result.data : makeInitialState(),
                });
                break;
            }
        }
    };

    const blocksByCategory = blockCategories.map((category) => ({
        ...category,
        blocks: allBlocks.filter((b) => b.category === category.id),
    }));

    return (
        <>
            <aside
                className={`relative group/aside flex h-full shrink-0 flex-col overflow-hidden border-r border-muted bg-card/50 transition-[width] duration-300 ease-out ${isExpanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH}`}
            >
                <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden py-3">
                    {/* AI Generator button */}

                    <div
                        className={`px-2 mb-2 ${isExpanded ? "" : "flex justify-center"}`}
                    >
                        {isExpanded ? (
                            <div className="flex gap-2 items-center">
                                <Button
                                    size="sm"
                                    onClick={() => setIsAiOpen(true)}
                                    disabled={isGenerating}
                                    className={`${isGenerating && "cursor-not-allowed opacity-70"} flex-1 bg-primary text-primary-foreground transition-[filter] duration-150 hover:brightness-105`}
                                >
                                    <Sparkles size={14} />
                                    AI Block Generator
                                </Button>
                                <button
                                    type="button"
                                    onClick={() => setIsExpanded(false)}
                                    title="Close Left Panel"
                                    className="h-9 w-9 flex cursor-w-resize items-center justify-center rounded-full text-primary transition-colors hover:bg-primary/20"
                                >
                                    <PanelLeftCloseIcon size={18} />
                                </button>
                            </div>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    onClick={() => setIsAiOpen(true)}
                                    title="AI Block Generator"
                                    className="group-hover/aside:hidden flex h-9 w-9 items-center justify-center rounded-lg text-primary transition-colors hover:bg-tint"
                                >
                                    <Sparkles size={18} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsExpanded(true)}
                                    title="Open Left Panel"
                                    className="hidden cursor-w-resize group-hover/aside:flex h-9 w-9 items-center justify-center rounded-lg text-primary transition-colors hover:bg-primary/20"
                                >
                                    <PanelRightCloseIcon size={18} />
                                </button>
                            </>
                        )}
                    </div>

                    <div
                        className={`mx-2 mb-2 h-px bg-muted ${isExpanded ? "" : "mx-3"}`}
                    />

                    {/* Block categories */}
                    {blocksByCategory.map((category) => (
                        <div
                            key={category.id}
                            className="mb-1"
                        >
                            {isExpanded && (
                                <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                                    {category.label}
                                </p>
                            )}
                            <div className="flex flex-col gap-0.5 px-1.5">
                                {category.blocks.map((block) => {
                                    return (
                                        <button
                                            key={block.type}
                                            type="button"
                                            onClick={() =>
                                                handleBlockClick(block)
                                            }
                                            title={`${block.title} (${block.shortcut})`}
                                            className={`group flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors duration-150 text-body hover:bg-primary/20 ${!isExpanded ? "justify-center px-0" : ""}`}
                                        >
                                            <span
                                                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors text-foreground/80 group-hover:text-primary`}
                                            >
                                                {block.icon}
                                            </span>
                                            {isExpanded && (
                                                <div className="min-w-0 flex-1 overflow-hidden">
                                                    <p className="text-[12px] font-medium truncate">
                                                        {block.title}
                                                    </p>
                                                    <p className="text-[10px] text-muted-foreground truncate">
                                                        {block.description}
                                                    </p>
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </aside>
        </>
    );
};

export default LeftAside;
