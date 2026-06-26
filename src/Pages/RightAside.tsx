"use client";
import { useNoteStore } from "@/Context/DataStore";
import { DragDropProvider } from "@dnd-kit/react";
import { move } from "@dnd-kit/helpers";
import { allBlocks } from "@/utils/BlocksInfo";
import Sortable from "@/components/dnd-Kit/Sortable";
import { blockTypeOptions } from "@/types/Editor";
import { randomBetweenExclusive } from "@/utils/UtilFunctions";

const colorDotMap: Record<string, string> = {
    paragraph: "bg-blue-400",
    heading:   "bg-violet-500",
    image:     "bg-emerald-400",
    quote:     "bg-amber-400",
    code:      "bg-pink-400",
    table:     "bg-sky-400",
    divider:   "bg-yellow-400",
};

const RightAside = () => {
    const { blocks, setBlocks, setDraggingBlockId, draggingBlockId, pushToBlocksToBeSynced } = useNoteStore();

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
        <aside
            className="w-80 flex-shrink-0 border-l border-[#e8e5e0] bg-[#faf9f7] flex flex-col overflow-hidden"
            style={{ fontFamily: "'Inter', sans-serif" }}
        >
            <div className="px-4 py-3 border-b border-[#f0ede8]">
                <p className="text-[10px] font-semibold text-[#b8b3ac] uppercase tracking-[0.08em]">
                    Page outline
                </p>
            </div>

            <div className="flex-1 overflow-y-auto px-2">
                {blocks.length === 0 ? (
                    <p className="text-[11px] text-[#b8b3ac] px-3 pt-2">
                        Blocks you add will appear here.
                    </p>
                ) : (
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
                                        const newOrder = (blocks.at(-1)?.order || 0) + 1;
                                        pushToBlocksToBeSynced({ id: b.id, action: "edit", data: { order: newOrder } });
                                        return { ...b, order: newOrder };
                                    }
                                    const newOrder = randomBetweenExclusive(prevOrder ? prevOrder : 0, nextOrder);
                                    pushToBlocksToBeSynced({ id: b.id, action: "edit", data: { order: newOrder } });
                                    return { ...b, order: newOrder };
                                }
                                return b;
                            });
                            setBlocks(orderUpdatedBlocks);
                            setDraggingBlockId(null);
                        }}
                    >
                        <div className="flex flex-col">
                            {blocks.map((block, index) => {
                                const info = getBlockInfo(block.type);
                                const dot = colorDotMap[block.type] ?? "bg-slate-400";
                                return (
                                    <Sortable
                                        key={block.id}
                                        id={block.id}
                                        index={index}
                                        blockTitle={
                                            block.title ||
                                            `${block.type.charAt(0).toUpperCase() + block.type.slice(1).toLowerCase()}`
                                        }
                                        className={`border-b`}
                                        otherInfo={{
                                            type: block.type,
                                            bgColor: info.bgColor,
                                            color: info.color,
                                            hoverColor: info.hoverColor,
                                            icon: info.icon,
                                        }}
                                    />
                                );
                            })}
                        </div>
                    </DragDropProvider>
                )}
            </div>
        </aside>
    );
};

export default RightAside;