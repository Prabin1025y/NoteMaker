"use client";
import { useState } from "react";
import { blockTypeOptions, EditorData } from "@/types/Editor";
import { allBlocks } from "@/utils/BlocksInfo";
import { initialJsonForEditor } from "@/utils/UtilFunctions";
import {  PanelLeftCloseIcon, PanelLeftOpenIcon } from "lucide-react";

interface LeftAsideProps {
    openBlockEditor: (editorData: EditorData) => void;
}

const LeftAside = ({ openBlockEditor }: LeftAsideProps) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const handleBlockClick = (
        type: blockTypeOptions,
        content: string = initialJsonForEditor,
    ) => {
        openBlockEditor({
            id: "", designId: 0, colorOptionId: 1,
            action: "add", content, title: "", type,
        });
    };

    return (
        <aside
            className={`relative flex h-full shrink-0 flex-col overflow-hidden border-r border-[#e8e5e0] bg-[#faf9f7] transition-all duration-300 ease-out ${isCollapsed ? "w-16" : "w-72"}`}
            style={{ fontFamily: "'Inter', sans-serif" }}
        >
            <button
                type="button"
                onClick={() => setIsCollapsed((prev) => !prev)}
                className="absolute right-5 top-2 z-10 flex h-6 w-6 items-center justify-center text-[#5a5550]"
                aria-label={isCollapsed ? "Expand add block drawer" : "Collapse add block drawer"}
            >
                {isCollapsed ? <PanelLeftOpenIcon size={20} /> : <PanelLeftCloseIcon size={20} />}
            </button>

            {isCollapsed ? (
                <div className="flex flex-1 flex-col items-center gap-2 overflow-y-auto px-2 pb-3 pt-14">
                    {allBlocks.map((block) => (
                        <button
                            key={block.type}
                            type="button"
                            onClick={() => handleBlockClick(block.type, block.defaultContent)}
                            className="group flex h-10 w-10 items-center justify-center rounded-lg border border-[#ece8e2] bg-white/90 text-[14px] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#f0ede8]"
                            title={block.title}
                        >
                            <span className={`${block.color} text-[14px]`}>{block.icon}</span>
                        </button>
                    ))}
                </div>
            ) : (
                <>
                    <div className="border-b border-[#f0ede8] px-4 py-3">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#b8b3ac]">
                            Add block
                        </p>
                    </div>

                    <div className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-2">
                        {allBlocks.map((block) => (
                            <button
                                key={block.type}
                                type="button"
                                onClick={() => handleBlockClick(block.type, block.defaultContent)}
                                className="group flex w-full items-center gap-2.5 rounded-[8px] px-2.5 py-2 text-left transition-colors hover:bg-[#f0ede8] focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-offset-1"
                            >
                                <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-[7px] ${block.bgColor}`}>
                                    <span className={`${block.color} text-[14px]`}>{block.icon}</span>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-[12px] font-medium text-[#5a5550] transition-colors group-hover:text-[#1a1714]">
                                        {block.title}
                                    </p>
                                    <p className="truncate text-[11px] text-[#b8b3ac]">
                                        {block.description}
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>
                </>
            )}
        </aside>
    );
};

export default LeftAside;
