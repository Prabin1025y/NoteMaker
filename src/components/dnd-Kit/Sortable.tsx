import React, { useEffect, useRef, useState } from "react";
import { useSortable } from "@dnd-kit/react/sortable";
import { GripVerticalIcon } from "lucide-react";
import { useNoteStore } from "@/Context/DataStore";
import { colorOptions } from "@/utils/ColorsInfo";

function Sortable({
    id,
    index,
    otherInfo,
    isActive,
    onClick,
}: {
    id: string;
    index: number;
    isActive?: boolean;
    onClick?: () => void;
    otherInfo: {
        colorOptionId: number;
        designId: number;
        title?: string;
        type: string;
    };
}) {
    const [element, setElement] = useState<Element | null>(null);
    const handleRef = useRef<HTMLDivElement | null>(null);
    const { setDraggingBlockId } = useNoteStore();
    const { isDragging } = useSortable({
        id,
        index,
        element,
        handle: handleRef,
    });

    const colorOption = colorOptions.find(
        (co) => co.id === otherInfo.colorOptionId,
    );
    const isDesignEnabled = otherInfo.designId !== 0;

    useEffect(() => {
        if (isDragging) {
            setDraggingBlockId(id);
        } else {
            setDraggingBlockId(null);
        }
    }, [isDragging, id, setDraggingBlockId]);

    return (
        <div
            ref={setElement}
            onClick={onClick}
            style={
                isDesignEnabled && !isActive
                    ? { backgroundColor: colorOption?.backgroundColorHex }
                    : {}
            }
            className={`w-full text-left flex items-center gap-2 rounded-lg px-2 py-2 transition-all duration-150 cursor-pointer group ${
                isActive
                    ? "bg-[#F5F3FF] ring-1 ring-[#6D5EF6]/20"
                    : "hover:bg-[#F5F3FF]/50"
            } ${isDragging ? "shadow-md ring-1 ring-[#6D5EF6]/30 bg-white scale-[1.02]" : ""}`}
        >
            <div
                ref={handleRef}
                onClick={(e) => e.stopPropagation()}
                className="text-[#C8C8C8] cursor-grab active:cursor-grabbing transition-colors group-hover:text-[#9A9A9A] shrink-0"
            >
                <GripVerticalIcon size={16} />
            </div>
            <div className="flex-1 min-w-0">
                <p
                    style={
                        isDesignEnabled && !isActive
                            ? { color: colorOption?.borderColorHex }
                            : {}
                    }
                    className={`text-[12px] font-medium truncate transition-colors ${
                        isActive
                            ? "text-[#6D5EF6]"
                            : "text-[#1A1A1A] group-hover:text-[#1A1A1A]"
                    }`}
                >
                    {otherInfo.title}
                </p>
                <p className="text-[10px] text-[#9A9A9A] truncate capitalize">
                    {otherInfo.type}
                </p>
            </div>
        </div>
    );
}

export default Sortable;
