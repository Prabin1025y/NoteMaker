"use client";
import { useNoteStore } from "@/Context/DataStore";
import { EditorData } from "@/types/Editor";
import { mapTypeToElement } from "@/utils/UtilFunctions";
import { RefObject } from "react";

interface MainPageProps {
    openBlockEditor: (editorData: EditorData) => void;
    noteRef: RefObject<HTMLDivElement | null>
}

const MainPage = ({ openBlockEditor, noteRef }: MainPageProps) => {
    const { blocks, deleteBlock, draggingBlockId} =
        useNoteStore();

    return (
        <main
            className="flex-1 overflow-y-auto bg-white"
            style={{ fontFamily: "'Inter', sans-serif" }}
        >
            <div ref={noteRef} className="max-w-5xl mx-auto px-10 py-10">
                {/* Note title */}

                {/* Blocks */}
                <div className="flex flex-col gap-3">
                    {blocks && blocks.length > 0 ? (
                        blocks.map((block) => {
                            const Component = mapTypeToElement(block.type);
                            if (!Component) return null;
                            return (
                                <Component
                                    key={block.id}
                                    title={block.title || ""}
                                    content={block.content}
                                    designId={block.designId}
                                    colorOptionId={block.colorOptionId}
                                    className={` ${
                                        draggingBlockId === block.id
                                            ? "ring-2 ring-indigo-400 ring-offset-2 -translate-y-1 shadow-lg"
                                            : ""
                                    }`}
                                    onEdit={() =>
                                        openBlockEditor({
                                            id: block.id,
                                            designId: block.designId,
                                            colorOptionId: block.colorOptionId,
                                            title: block.title || "",
                                            content: block.content,
                                            type: block.type,
                                            action: "save",
                                        })
                                    }
                                    onDelete={() => deleteBlock(block.id)}
                                />
                            );
                        })
                    ) : (
                        <div className="mt-6 flex flex-col items-center justify-center py-16 border border-dashed border-[#e2e0dc] rounded-xl text-center">
                            <div className="w-11 h-11 bg-indigo-50 rounded-[12px] flex items-center justify-center mb-3">
                                <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="#4338ca"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M12 5v14M5 12h14" />
                                </svg>
                            </div>
                            <p className="text-[13px] font-medium text-[#1a1714] mb-1">
                                No blocks yet
                            </p>
                            <p className="text-[12px] text-[#9e9a94]">
                                Choose a block from the left panel to start
                                writing.
                            </p>
                        </div>
                    )}
                </div>

                {/* Add block hint */}
                {blocks && blocks.length > 0 && (
                    <div className="mt-4 flex items-center justify-center py-4 border border-dashed border-[#e2e0dc] rounded-xl text-center text-[12px] text-[#b8b3ac] cursor-default hover:border-indigo-200 hover:bg-indigo-50/30 transition-colors">
                        Click a block on the left to add more
                    </div>
                )}
            </div>
        </main>
    );
};

export default MainPage;
