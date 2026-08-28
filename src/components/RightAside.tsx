"use client";

import { useMemo, useState } from "react";
import { useNoteStore } from "@/Context/DataStore";
import { DragDropProvider } from "@dnd-kit/react";
import { move } from "@dnd-kit/helpers";
import Sortable from "@/components/dnd-Kit/Sortable";
import { randomBetweenExclusive } from "@/utils/UtilFunctions";
import {
    PanelRightClose,
    PanelRightOpen,
} from "lucide-react";

interface RightAsideProps {
    searchQuery?: string;
    isReadOnly?: boolean;
}

const RightAside = ({
    searchQuery = "",
    isReadOnly = false,
}: RightAsideProps) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const {
        blocks,
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

    const getBlockInfo = (id: string) => {
        const block = blocks.find((b) => b.id === id);
        return {
            colorOptionId: block?.colorOptionId,
            type: block?.type,
            title: block?.title,
            designId: block?.designId,
        };
    };

    const handleBlockClick = (blockId: string) => {
        setActiveBlockId(blockId);
        const el = document.getElementById(`block-${blockId}`);
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
    };

    return (
        <aside
            className={`relative flex h-full shrink-0 flex-col overflow-hidden border-l border-muted bg-card/60 transition-[width,opacity,transform] duration-300 ease-out ${isCollapsed ? "w-10" : "w-56"}`}
        >
            {isCollapsed ? (
                <div className="flex h-full flex-col items-center pt-3">
                    <button
                        type="button"
                        onClick={() => setIsCollapsed(false)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-primary/20 hover:text-primary"
                        aria-label="Expand outline"
                    >
                        <PanelRightOpen size={16} />
                    </button>
                </div>
            ) : (
                <>
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
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-primary/20 hover:text-primary"
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
                                    const newBlocks = move(blocks, event);
                                    const orderUpdatedBlocks = newBlocks.map(
                                        (b, index) => {
                                            if (b.id === draggingBlockId) {
                                                const prevOrder =
                                                    newBlocks[index - 1]?.order;
                                                const nextOrder =
                                                    newBlocks[index + 1]?.order;
                                                if (!prevOrder && !nextOrder)
                                                    return b;
                                                if (b.id === blocks[index].id)
                                                    return b;
                                                if (!nextOrder) {
                                                    const newOrder =
                                                        (blocks.at(-1)?.order ||
                                                            0) + 1;
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
                                                const newOrder =
                                                    randomBetweenExclusive(
                                                        prevOrder
                                                            ? prevOrder
                                                            : 0,
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
                                <div className="flex flex-col gap-0.5">
                                    {filteredBlocks.map((block) => {
                                        const index = blocks.findIndex(
                                            (b) => b.id === block.id,
                                        );
                                        const info = getBlockInfo(block.id);
                                        const isActive =
                                            activeBlockId === block.id ||
                                            draggingBlockId === block.id;

                                        return (
                                            <Sortable
                                                key={block.id}
                                                id={block.id}
                                                index={index}
                                                isActive={isActive}
                                                disabled={isReadOnly}
                                                onClick={() =>
                                                    handleBlockClick(block.id)
                                                }
                                                otherInfo={{
                                                    type: block.type,
                                                    designId:
                                                        info.designId || 0,
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
                </>
            )}
        </aside>
    );
};

export default RightAside;
