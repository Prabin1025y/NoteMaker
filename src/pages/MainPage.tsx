"use client";
import { useNoteStore } from "@/Context/DataStore";
import { EditorData } from "@/types/Editor";
import { initialJsonForEditor, mapTypeToElement } from "@/utils/UtilFunctions";
import { Plus } from "lucide-react";
import { RefObject } from "react";

interface MainPageProps {
    openBlockEditor: (editorData: EditorData) => void;
    noteRef: RefObject<HTMLDivElement | null>;
}

const MainPage = ({ openBlockEditor, noteRef }: MainPageProps) => {
    const { blocks, deleteBlock, draggingBlockId } = useNoteStore();

    return (
        <main className="flex-1 overflow-y-auto bg-white" style={{ fontFamily: "'Inter', sans-serif" }}>
            <div ref={noteRef} className="mx-auto max-w-5xl px-10 py-10">
                <div className="flex flex-col gap-3">
                    {blocks &&
                        blocks.length > 0 &&
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
                                    className={`${draggingBlockId === block.id ? "-translate-y-1 shadow-lg ring-2 ring-indigo-400 ring-offset-2" : ""}`}
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
                        })}
                </div>

                <button
                    onClick={() =>
                        openBlockEditor({
                            id: "",
                            designId: 0,
                            colorOptionId: 1,
                            action: "add",
                            content: initialJsonForEditor,
                            title: "",
                            type: "block",
                        })
                    }
                    className="mb-8 flex w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[#d4d0c8] bg-[#faf9f7] px-4 py-5 text-left transition-all hover:border-indigo-400 hover:bg-indigo-50/40"
                >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] bg-indigo-100 transition-colors group-hover:bg-indigo-200">
                        <Plus size={18} className="text-indigo-700" />
                    </div>
                    <div>
                        <p className="text-center text-[13px] font-medium text-indigo-700">Add Block</p>
                    </div>
                </button>
            </div>
        </main>
    );
};

export default MainPage;
