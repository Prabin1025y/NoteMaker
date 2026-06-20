"use client";
import { BlockType, useNoteStore } from "@/Context/DataStore";
import { DragDropProvider, DragOverEvent } from "@dnd-kit/react";
import { move } from "@dnd-kit/helpers";
import { allBlocks } from "@/utils/BlocksInfo";
import Sortable from "@/components/dnd-Kit/Sortable";
import { blockTypeOptions } from "@/types/Editor";
import { randomBetweenExclusive } from "@/utils/UtilFunctions";

const RightAside = () => {
    const {
        blocks,
        setBlocks,
        setDraggingBlockId,
        draggingBlockId,
        pushToBlocksToBeSynced,
    } = useNoteStore();

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
                        const newBlocks = move(blocks, event);

                        const orderUpdatedBlocks = newBlocks.map((b, index) => {
                            if (b.id === draggingBlockId) {
                                const prevOrder = newBlocks[index - 1]?.order;
                                const nextOrder = newBlocks[index + 1]?.order;

                                if (!prevOrder && !nextOrder) return b;

                                if (b.id === blocks[index].id) return b;

                                if (!nextOrder) {
                                    const newOrder =
                                        (blocks.at(-1)?.order || 0) + 1;
                                    pushToBlocksToBeSynced({
                                        id: b.id,
                                        action: "edit",
                                        data: { order: newOrder },
                                    });
                                    return {
                                        ...b,
                                        order: newOrder,
                                    };
                                }

                                const newOrder = randomBetweenExclusive(
                                    prevOrder ? prevOrder : 0,
                                    nextOrder,
                                );
                                pushToBlocksToBeSynced({
                                    id: b.id,
                                    action: "edit",
                                    data: { order: newOrder },
                                });

                                return { ...b, order: newOrder };
                            } else {
                                return b;
                            }
                        });
                        setBlocks(orderUpdatedBlocks);
                        setDraggingBlockId(null);
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
