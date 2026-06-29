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
        <main
            className="flex-1 overflow-y-auto bg-white"
            style={{ fontFamily: "'Inter', sans-serif" }}
        >
            <div
                ref={noteRef}
                className="max-w-5xl mx-auto px-10 py-10"
            >
                {/* Note title */}

                {/* Blocks */}
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
                        })}
                </div>

                {/* Add block hint */}
                {/* {blocks && blocks.length > 0 && ( */}
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
                    className="w-full flex flex-col justify-center items-center gap-3 bg-[#faf9f7] border border-dashed border-[#d4d0c8] rounded-xl px-4 py-5 mb-8 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/40 transition-all text-left group"
                >
                    <div className="w-9 h-9 bg-indigo-100 rounded-[9px] flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-200 transition-colors">
                        <Plus
                            size={18}
                            className="text-indigo-700"
                        />
                    </div>
                    <div>
                        <p className="text-[13px] font-medium text-center text-indigo-700">
                            Add Block
                        </p>
                        {/* <p className="text-[12px] text-[#9e9a94]">
                                Click to create a new note
                            </p> */}
                    </div>
                </button>
                {/* )} */}
            </div>
        </main>
    );
};

export default MainPage;
