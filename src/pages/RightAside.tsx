"use client";
import { useState } from "react";
import { useNoteStore } from "@/Context/DataStore";
import { DragDropProvider } from "@dnd-kit/react";
import { move } from "@dnd-kit/helpers";
import Sortable from "@/components/dnd-Kit/Sortable";
import { randomBetweenExclusive } from "@/utils/UtilFunctions";
import { PanelLeftCloseIcon, PanelLeftOpenIcon } from "lucide-react";

const RightAside = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const {
        blocks,
        setBlocks,
        setDraggingBlockId,
        draggingBlockId,
        pushToBlocksToBeSynced,
    } = useNoteStore();

    const getBlockInfo = (id: string) => {
        const block = blocks.find((b) => b.id === id);
        return {
            colorOptionId: block?.colorOptionId,
            type: block?.type,
            title: block?.title,
            designId: block?.designId,
        };
    };

    if (isCollapsed)
        return (
            <div className="absolute right-0 p-3 top-15 z-10 flex items-center justify-center bg-gray-100 border rounded-l-lg">
                <button
                    type="button"
                    onClick={() => setIsCollapsed((prev) => !prev)}
                    className=" flex h-6 w-6 items-center justify-center text-[#5a5550]"
                    aria-label={
                        isCollapsed
                            ? "Expand add block drawer"
                            : "Collapse add block drawer"
                    }
                >
                    {isCollapsed ? (
                        <PanelLeftCloseIcon size={20} />
                    ) : (
                        <PanelLeftOpenIcon size={20} />
                    )}
                </button>
            </div>
        );

    return (
        <aside
            className={`relative flex h-full shrink-0 flex-col overflow-hidden border-l border-[#e8e5e0] bg-[#faf9f7] transition-all duration-300 ease-out w-72`}
            style={{ fontFamily: "'Inter', sans-serif" }}
        >
            <button
                type="button"
                onClick={() => setIsCollapsed((prev) => !prev)}
                className="absolute left-5 top-2 z-10 flex h-6 w-6 items-center justify-center text-[#5a5550]"
                aria-label={
                    isCollapsed
                        ? "Expand add block drawer"
                        : "Collapse add block drawer"
                }
            >
                {isCollapsed ? (
                    <PanelLeftCloseIcon size={20} />
                ) : (
                    <PanelLeftOpenIcon size={20} />
                )}
            </button>

            <div className="border-b border-[#f0ede8] px-4 py-3">
                <p className="text-[10px] font-semibold text-right uppercase tracking-[0.08em] text-[#b8b3ac]">
                    Page outline
                </p>
            </div>

            <div className="flex-1 overflow-y-auto px-2 py-2">
                {blocks.length === 0 ? (
                    <p className="px-3 pt-2 text-[11px] text-[#b8b3ac]">
                        Blocks you add will appear here.
                    </p>
                ) : (
                    <DragDropProvider
                        onDragEnd={(event) => {
                            const newBlocks = move(blocks, event);
                            const orderUpdatedBlocks = newBlocks.map(
                                (b, index) => {
                                    if (b.id === draggingBlockId) {
                                        const prevOrder =
                                            newBlocks[index - 1]?.order;
                                        const nextOrder =
                                            newBlocks[index + 1]?.order;
                                        if (!prevOrder && !nextOrder) return b;
                                        if (b.id === blocks[index].id) return b;
                                        if (!nextOrder) {
                                            const newOrder =
                                                (blocks.at(-1)?.order || 0) + 1;
                                            pushToBlocksToBeSynced({
                                                id: b.id,
                                                action: "edit",
                                                data: {
                                                    order: newOrder,
                                                },
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
                                        return {
                                            ...b,
                                            order: newOrder,
                                        };
                                    }
                                    return b;
                                },
                            );
                            setBlocks(orderUpdatedBlocks);
                            setDraggingBlockId(null);
                        }}
                    >
                        <div className="flex flex-col">
                            {blocks.map((block, index) => {
                                const info = getBlockInfo(block.id);
                                return (
                                    <Sortable
                                        key={block.id}
                                        id={block.id}
                                        index={index}
                                        className="border-b"
                                        otherInfo={{
                                            type: block.type,
                                            designId: info.designId || 0,
                                            colorOptionId:
                                                info.colorOptionId || 1,
                                            title:
                                                info.title ||
                                                block.type
                                                    .charAt(0)
                                                    .toUpperCase() +
                                                    block.type
                                                        .slice(1)
                                                        .toLowerCase(),
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
