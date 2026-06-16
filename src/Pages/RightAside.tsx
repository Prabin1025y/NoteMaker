"use client";
import { BlockType, blockTypeOptions, useNoteStore } from "@/Context/DataStore";
import { DragDropProvider } from "@dnd-kit/react";
import { move } from "@dnd-kit/helpers";
import { allBlocks } from "@/utils/BlocksInfo";
import Sortable from "@/components/dnd-Kit/Sortable";

const RightAside = () => {
    const { blocks, setBlocks } = useNoteStore();

    const getBlockInfo = (type: blockTypeOptions) => {
        const block = allBlocks.find((b) => b.type === type);
        return {
            color: block?.color,
            icon: block?.icon,
            bgColor: block?.bgColor,
            hoverColor: block?.hoverColor,
        };
    };

    return (
        <aside className="flex-1 rounded-3xl border border-dashed border-orange-200 bg-white/50 p-6 overflow-y-auto">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Page Content
            </h2>
            <div className="space-y-2">
                <DragDropProvider
                    onDragEnd={(event) => {
                        setBlocks(move(blocks, event));
                    }}
                >
                    <div className="flex flex-col gap-2">
                        {blocks.map((block, index) => {
                            const otherInfo = getBlockInfo(block.type);
                            return (
                                <Sortable
                                    key={block.id}
                                    id={block.id}
                                    index={index}
                                    blockTitle={
                                        block.title ||
                                        `${block.type.charAt(0).toUpperCase() + block.type.slice(1).toLowerCase()}`
                                    }
                                    otherInfo={{
                                        bgColor: otherInfo.bgColor,
                                        color: otherInfo.color,
                                        hoverColor: otherInfo.hoverColor,
                                        icon: otherInfo.icon,
                                    }}
                                />
                            );
                        })}
                    </div>
                </DragDropProvider>
            </div>
        </aside>
    );
};

export default RightAside;
