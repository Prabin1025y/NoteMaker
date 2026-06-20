"use client";
import { BlockType, useNoteStore } from "@/Context/DataStore";
import { blockTypeOptions } from "@/types/Editor";
import { allBlocks, BlockItem } from "@/utils/BlocksInfo";
import { useEffect, useState } from "react";

const RightAside = () => {
    const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(
        null,
    );
    const [mousePos, setMousePos] = useState<[number, number]>([0, 0]);
    const [dropZoneIndex, setDropZoneIndex] = useState(0);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            setMousePos([e.x, e.y]);
        };

        document.addEventListener("mousemove", handler);

        return () => document.removeEventListener("mousemove", handler);
    }, []);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (draggedItemIndex !== null) {
                e.preventDefault();
                setDraggedItemIndex(null);
                setBlocksState((prev) =>
                    reorderList(prev, draggedItemIndex, dropZoneIndex),
                );
            }
        };

        document.addEventListener("mouseup", handler);
        return () => document.removeEventListener("mouseup", handler);
    });

    useEffect(() => {
        if (draggedItemIndex !== null) {
            const allDropZones = Array.from(
                document.getElementsByClassName("block-drop-zone"),
            );

            const positions = allDropZones.map(
                (zone) => zone.getBoundingClientRect().top,
            );

            const absDifferences = positions.map((pos) =>
                Math.abs(pos - mousePos[1]),
            );

            let resultIndex = absDifferences.indexOf(
                Math.min(...absDifferences),
            );

            if (resultIndex > draggedItemIndex) resultIndex += 1;

            setDropZoneIndex(resultIndex);
        }
    }, [mousePos, draggedItemIndex]);

    const { blocks } = useNoteStore();

    // temporary
    const [blocksState, setBlocksState] = useState<BlockType[]>(blocks);
    useEffect(() => {
        setBlocksState(blocks);
    }, [blocks]);

    // temporary
    const getBlockInfo = (type: blockTypeOptions) => {
        const block = allBlocks.find((b) => b.type === type);
        return {
            color: block?.color,
            icon: block?.icon,
            bgColor: block?.bgColor,
            hoverColor: block?.hoverColor,
        };
    };

    const _reorderListForward = <T,>(list: T[], start: number, end: number) => {
        const temp = list[start];

        for (let i = start; i < end; i++) {
            list[i] = list[i + 1];
        }
        list[end - 1] = temp;

        return list;
    };

    const _reorderListBackward = <T,>(
        list: T[],
        start: number,
        end: number,
    ) => {
        const temp = list[start];
        for (let i = start; i > end; i--) {
            list[i] = list[i - 1];
        }
        list[end] = temp;
        return list;
    };

    const reorderList = <T,>(list: T[], start: number, end: number) => {
        if (start < end) return _reorderListForward([...list], start, end);
        else if (start > end)
            return _reorderListBackward([...list], start, end);

        return list;
    };

    return (
        <aside className="flex-1 rounded-3xl border border-dashed border-orange-200 bg-white/50 p-6 overflow-y-auto">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Page Content
            </h2>
            <div className="space-y-2">
                {draggedItemIndex != null && (
                    <div
                        style={{
                            left: `${mousePos[0]}px`,
                            top: `${mousePos[1]}px`,
                        }}
                        className={`w-60 absolute text-left p-3 rounded-lg transition-colors border border-transparent ${allBlocks[0].bgColor} ${allBlocks[0].hoverColor} ring-2 ring-offset-1 ring-orange-300`}
                    >
                        <div className="flex items-start gap-3">
                            <div
                                className={`shrink-0 mt-0.5 ${allBlocks[0].color}`}
                            >
                                {allBlocks[0].icon}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3
                                    className={`text-sm font-semibold ${allBlocks[0].color}`}
                                >
                                    {"Example"}
                                </h3>
                            </div>
                        </div>
                    </div>
                )}
                <div
                    className={`${draggedItemIndex === null || dropZoneIndex !== 0 ? "h-0 ring-0" : "h-12 ring-2"} block-drop-zone w-full  rounded-lg bg-slate-400/20 ring-offset-1 ring-orange-300`}
                />
                <div>
                    <DragDropProvider
                        onDragEnd={(event) => {
                            setItems((items) => move(items, event));
                        }}
                    >
                        <ul className="list">
                            {items.map((id, index) => (
                                <Sortable
                                    key={id}
                                    id={id}
                                    index={index}
                                />
                            ))}
                        </ul>
                    </DragDropProvider>
                </div>
                {blocksState.map((block, index) => {
                    const otherInfo = getBlockInfo(block.type);
                    return (
                        draggedItemIndex !== index && (
                            <div key={block.id}>
                                <div
                                    onMouseDown={() =>
                                        setDraggedItemIndex(index)
                                    }
                                    className={`w-full text-left p-3 rounded-lg transition-colors border border-transparent ${otherInfo.bgColor} ${otherInfo.hoverColor} focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-orange-300`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div
                                            className={`shrink-0 mt-0.5 ${otherInfo.color}`}
                                        >
                                            {otherInfo.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3
                                                className={`text-sm font-semibold ${otherInfo.color}`}
                                            >
                                                {block.title}
                                            </h3>
                                        </div>
                                    </div>
                                </div>
                                <div
                                    className={`${draggedItemIndex === null || dropZoneIndex !== index + 1 ? "h-0 ring-0" : "h-12 ring-2"} block-drop-zone w-full  rounded-lg bg-slate-400/20 ring-offset-1 ring-orange-300`}
                                />
                            </div>
                        )
                    );
                })}
            </div>
        </aside>
    );
};

export default RightAside;
