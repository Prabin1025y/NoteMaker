"use client";
import { useNoteStore } from "@/Context/DataStore";
import { EditorData } from "@/types/Editor";
import { useEffect, useState } from "react";

interface MainPageProps {
    openBlockEditor: (editorData: EditorData) => void;
}

const MainPage = ({ openBlockEditor }: MainPageProps) => {
    const {
        blocks,
        mapTypeToElement,
        deleteBlock,
        draggingBlockId,
        title,
        currentNote,
        updateNoteTitle,
    } = useNoteStore();
    const [localTitle, setLocalTitle] = useState(title || "");
    const [localDescription, setLocalDescription] = useState("");

    useEffect(() => {
        setLocalTitle(title || "");
    }, [title]);

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTitle = e.target.value;
        setLocalTitle(newTitle);
        updateNoteTitle(newTitle);
    };

    return (
        <main className="flex-none w-[1000px] max-h-[calc(100vh-100px)]  overflow-y-auto">
            <div className="flex flex-col gap-6 w-full h-[1414px] p-10 border border-slate-200 bg-white">
                {/* <div className="space-y-3 flex flex-col gap-1">
                    <input
                        value={localTitle}
                        onChange={handleTitleChange}
                        placeholder="Title"
                        className="text-4xl font-semibold text-slate-900 outline-none"
                        aria-label="Note title"
                    />
                    <input
                        value={localDescription}
                        onChange={(e) => setLocalDescription(e.target.value)}
                        placeholder="Description"
                        className="text-base leading-7 text-slate-600 outline-none"
                        aria-label="Note description"
                    />
                    <hr className="border-t bg-transparent border-dashed border-slate-300" />
                </div> */}
                <div className="pb-10">
                    {blocks &&
                        blocks.map((block) => {
                            const Component = mapTypeToElement(block.type);
                            if (!Component) return null;

                            return (
                                <Component
                                    key={block.id}
                                    title={block.title}
                                    content={block.content}
                                    designId={block.designId}
                                    colorOptionId={block.colorOptionId}
                                    className={`${
                                        draggingBlockId === block.id
                                            ? "ring-4 ring-offset-1 -translate-y-2.5 ring-sky-300 shadow-2xl"
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
            </div>
        </main>
    );
};

export default MainPage;
