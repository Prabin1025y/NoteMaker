"use client";

import { useState } from "react";
import { blockTypeOptions, EditorData } from "@/types/Editor";
import { allBlocks, blockCategories } from "@/utils/BlocksInfo";
import { initialJsonForEditor } from "@/utils/UtilFunctions";
import { PanelLeftCloseIcon, PanelRightCloseIcon, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LeftAsideProps {
    openBlockEditor: (editorData: EditorData) => void;
    isGenerating: boolean;
    openAiModel: () => void;
}

const COLLAPSED_WIDTH = "w-[52px]";
const EXPANDED_WIDTH = "w-60";

const LeftAside = ({
    openBlockEditor,
    isGenerating,
    openAiModel,
}: LeftAsideProps) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [selectedType, setSelectedType] = useState<blockTypeOptions | null>(
        null,
    );

    // const isExpanded = isHovered;

    const handleBlockClick = (
        type: blockTypeOptions,
        content: string = initialJsonForEditor,
    ) => {
        setSelectedType(type);
        openBlockEditor({
            id: "",
            designId: 0,
            colorOptionId: 1,
            action: "add",
            content,
            title: "",
            type,
            order: "auto",
        });
    };

    const blocksByCategory = blockCategories.map((category) => ({
        ...category,
        blocks: allBlocks.filter((b) => b.category === category.id),
    }));

    return (
        <>
            <aside
                className={`relative group/aside flex h-full shrink-0 flex-col overflow-hidden border-r border-hairline bg-paper transition-[width] duration-300 ease-out ${isExpanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH}`}
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
                                    onClick={() => openAiModel()}
                                    disabled={isGenerating}
                                    className={`${isGenerating && "cursor-not-allowed opacity-70"} flex-1 bg-brand-cta text-[color:var(--ds-accent-contrast)] transition-[filter] duration-150 hover:brightness-105`}
                                >
                                    <Sparkles size={14} />
                                    AI Block Generator
                                </Button>
                                <button
                                    type="button"
                                    onClick={() => setIsExpanded(false)}
                                    title="Close Left Panel"
                                    className="h-9 w-9 flex items-center justify-center rounded-full text-brand-cta transition-colors hover:bg-tint"
                                >
                                    <PanelLeftCloseIcon size={18} />
                                </button>
                            </div>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    onClick={() => openAiModel()}
                                    title="AI Block Generator"
                                    className="group-hover/aside:hidden flex h-9 w-9 items-center justify-center rounded-lg text-brand-cta transition-colors hover:bg-tint"
                                >
                                    <Sparkles size={18} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsExpanded(true)}
                                    title="Open Left Panel"
                                    className="hidden group-hover/aside:flex h-9 w-9 items-center justify-center rounded-lg text-brand-cta transition-colors hover:bg-tint"
                                >
                                    <PanelRightCloseIcon size={18} />
                                </button>
                            </>
                        )}
                    </div>

                    <div
                        className={`mx-2 mb-2 h-px bg-hairline ${isExpanded ? "" : "mx-3"}`}
                    />

                    {/* Block categories */}
                    {blocksByCategory.map((category) => (
                        <div
                            key={category.id}
                            className="mb-1"
                        >
                            {isExpanded && (
                                <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-faint">
                                    {category.label}
                                </p>
                            )}
                            <div className="flex flex-col gap-0.5 px-1.5">
                                {category.blocks.map((block) => {
                                    const isSelected =
                                        selectedType === block.type;
                                    return (
                                        <button
                                            key={block.type}
                                            type="button"
                                            onClick={() =>
                                                handleBlockClick(
                                                    block.type,
                                                    block.defaultContent,
                                                )
                                            }
                                            title={block.title}
                                            className={`group flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors duration-150 ${
                                                isSelected
                                                    ? "bg-brand-soft text-brand-cta"
                                                    : "text-body hover:bg-tint"
                                            } ${!isExpanded ? "justify-center px-0" : ""}`}
                                        >
                                            <span
                                                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors ${
                                                    isSelected
                                                        ? "bg-tint text-brand-cta"
                                                        : "text-muted-ink group-hover:text-brand-cta group-hover:bg-tint"
                                                }`}
                                            >
                                                {block.icon}
                                            </span>
                                            {isExpanded && (
                                                <div className="min-w-0 flex-1 overflow-hidden">
                                                    <p className="text-[12px] font-medium truncate">
                                                        {block.title}
                                                    </p>
                                                    <p className="text-[10px] text-faint truncate">
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
