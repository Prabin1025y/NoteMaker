'use client'
import { blockTypeOptions, useNoteStore } from "@/Context/DataStore";
import { EditorData } from "@/types/Editor";

interface MainPageProps {
    openBlockEditor: (editorData: EditorData) => void;
}

const MainPage = ({ openBlockEditor }: MainPageProps) => {
    const { blocks, mapTypeToElement, deleteBlock } = useNoteStore();
    return (
        <main className="flex-none w-[1000px] h-[calc(100vh-40px)] rounded-3xl border border-slate-200 bg-white p-10  overflow-y-auto">
            <div className="flex h-full flex-col gap-6">
                <div className="space-y-3 flex flex-col gap-1">
                    <input
                        placeholder="Title"
                        className="text-4xl font-semibold text-slate-900 outline-none"
                        aria-label="Note title"
                    />
                    <input
                        placeholder="Description"
                        className="text-base leading-7 text-slate-600 outline-none"
                        aria-label="Note description"
                    />
                    <hr className="border-t bg-transparent border-dashed border-slate-300" />
                </div>
                <div className="pb-10">
                    {blocks.map((block) => {
                        const Component = mapTypeToElement(block.type);
                        if (!Component) return null;

                        return (
                            <Component
                                key={block.id}
                                title={block.title}
                                content={block.content}
                                designId={block.designId}
                                onEdit={() =>
                                    openBlockEditor({
                                        id: block.id,
                                        designId: block.designId,
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
