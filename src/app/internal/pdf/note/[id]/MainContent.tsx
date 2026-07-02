"use client";
import type { blockTypeOptions } from "@/types/Editor";
import { mapTypeToElement } from "@/utils/UtilFunctions";
interface BlockType {
    id: string;
    publicId: string;
    noteId: string | null;
    createdAt: Date;
    updatedAt: Date;
    type: blockTypeOptions;
    content: string;
    designId: number;
    colorOptionId: number;
    title: string | null;
    order: number;
}

const MainContent = ({ blocks }: { blocks: BlockType[] }) => {
    return (
        <main
            id="pdf-root"
            data-pdf-root
            className="flex-1 overflow-y-auto bg-white"
            style={{ fontFamily: "'Inter', sans-serif" }}
        >
            <div className="mx-auto max-w-5xl px-10 py-10">
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
                                    className=""
                                    onEdit={() => {}}
                                    onDelete={() => {}}
                                />
                            );
                        })}
                </div>
            </div>
        </main>
    );
};

export default MainContent;
