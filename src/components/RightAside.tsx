"use client";

import { useMemo, useState } from "react";
import { useNoteStore } from "@/Context/DataStore";
import { DragDropProvider } from "@dnd-kit/react";
import { move } from "@dnd-kit/helpers";
import Sortable from "@/components/dnd-Kit/Sortable";
import { randomBetweenExclusive } from "@/utils/UtilFunctions";
import { PanelRightClose, PanelRightOpen } from "lucide-react";

const RightAside = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const {
        blocks,
        isReadOnly,
        searchQuery,
        setBlocks,
        setDraggingBlockId,
        draggingBlockId,
        activeBlockId,
        setActiveBlockId,
        pushToBlocksToBeSynced,
    } = useNoteStore();

    const filteredBlocks = useMemo(() => {
        if (!searchQuery.trim()) return blocks;
        const query = searchQuery.toLowerCase();
        return blocks.filter(
            (b) =>
                (b.title || "").toLowerCase().includes(query) ||
                b.type.toLowerCase().includes(query),
        );
    }, [blocks, searchQuery]);

    const handleBlockClick = (blockId: string) => {
        setActiveBlockId(blockId);
        const el = document.getElementById(`block-${blockId}`);
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
    };

    return (
        <aside
            className={`relative flex h-full shrink-0 flex-col overflow-hidden border-l border-muted bg-card/60 transition-[width,opacity,transform] duration-300 ease-out ${isCollapsed ? "w-10" : "w-56"}`}
        >
            {isCollapsed && (
                <div className="flex h-full flex-col items-center pt-3">
                    <button
                        type="button"
                        onClick={() => setIsCollapsed(false)}
                        className="flex h-8 w-8 items-center justify-center cursor-w-resize rounded-lg text-muted-foreground transition-colors hover:bg-primary/20 hover:text-primary"
                        aria-label="Expand outline"
                    >
                        <PanelRightOpen size={16} />
                    </button>
                </div>
            )}
            <div
                className={`flex flex-1 min-h-0 flex-col transition-[transform,opacity] duration-300 ${isCollapsed && "absolute left-96 opacity-0"}`}
            >
                <div className="flex items-center justify-between border-b border-muted px-4 py-3">
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Outline
                        </p>
                        <p className="mt-0.5 text-[10px] text-muted-foreground">
                            {blocks.length}{" "}
                            {blocks.length === 1 ? "block" : "blocks"}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setIsCollapsed(true)}
                        className="flex h-7 w-7 items-center justify-center cursor-w-resize rounded-lg text-muted-foreground transition-colors hover:bg-primary/20 hover:text-primary"
                        aria-label="Collapse outline"
                    >
                        <PanelRightClose size={15} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-2 py-2">
                    {blocks.length === 0 ? (
                        <p className="px-3 pt-3 text-[12px] text-muted-foreground leading-relaxed">
                            Blocks you add will appear here for quick
                            navigation.
                        </p>
                    ) : filteredBlocks.length === 0 ? (
                        <p className="px-3 pt-3 text-[12px] text-muted-foreground">
                            No blocks match your search.
                        </p>
                    ) : (
                        <DragDropProvider
                            onDragEnd={(event) => {
                                if (isReadOnly) return;

                                // `move` changes the visual position; assign a new
                                // numeric order so the position can be persisted.
                                const newBlocks = move(blocks, event);

                                if (!draggingBlockId) return;

                                const draggingBlockIndex = newBlocks.findIndex(
                                    (item) => item.id === draggingBlockId,
                                );

                                if (draggingBlockIndex === -1) {
                                    return;
                                }

                                const prevOrder =
                                    newBlocks[draggingBlockIndex - 1]?.order;
                                const nextOrder =
                                    newBlocks[draggingBlockIndex + 1]?.order;

                                if (!prevOrder && !nextOrder) return;
                                if (
                                    draggingBlockId ===
                                    blocks[draggingBlockIndex].id
                                )
                                    return;

                                let newOrder = -1;

                                if (!nextOrder) {
                                    // Appending needs an order greater than the current last block.
                                    newOrder = (blocks.at(-1)?.order || 0) + 1;
                                } else {
                                    // Place between neighbors without renumbering every block.
                                    newOrder = randomBetweenExclusive(
                                        prevOrder ? prevOrder : 0,
                                        nextOrder,
                                    );
                                }

                                newBlocks[draggingBlockIndex] = {
                                    ...newBlocks[draggingBlockIndex],
                                    order: newOrder,
                                };
                                setBlocks(newBlocks);
                                // Queue the same order change for persistence.
                                pushToBlocksToBeSynced({
                                    id: draggingBlockId,
                                    action: "edit",
                                    data: { order: newOrder },
                                });
                                setDraggingBlockId(null);
                            }}
                        >
                            <div className="flex flex-col gap-0.5">
                                {filteredBlocks.map((block, ind) => {
                                    const isActive =
                                        activeBlockId === block.id ||
                                        draggingBlockId === block.id;

                                    return (
                                        <Sortable
                                            key={block.id}
                                            id={block.id}
                                            index={ind}
                                            isActive={isActive}
                                            disabled={
                                                isReadOnly ||
                                                filteredBlocks.length !==
                                                    blocks.length
                                            }
                                            onClick={() =>
                                                handleBlockClick(block.id)
                                            }
                                            otherInfo={{
                                                type: block.type,
                                                designId: block.designId || 0,
                                                colorOptionId:
                                                    block.colorOptionId || 1,
                                                title:
                                                    block.title ||
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
            </div>
        </aside>
    );
};

export default RightAside;
