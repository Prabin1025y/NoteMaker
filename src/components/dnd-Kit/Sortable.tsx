import React, { useRef, useState } from "react";
import { useSortable } from "@dnd-kit/react/sortable";
import { GripVerticalIcon } from "lucide-react";
import { colorOptions } from "@/utils/ColorsInfo";

function Sortable({
    id,
    index,
    otherInfo,
    onClick,
    disabled = false,
}: {
    id: string;
    index: number;
    onClick?: () => void;
    disabled?: boolean;
    otherInfo: {
        colorOptionId: number;
        designId: number;
        title?: string;
        type: string;
    };
}) {
    const [element, setElement] = useState<Element | null>(null);
    const handleRef = useRef<HTMLDivElement | null>(null);
    const { isDragging } = useSortable({
        id,
        index,
        element,
        handle: handleRef,
        disabled,
    });

    const colorOption = colorOptions.find(
        (co) => co.id === otherInfo.colorOptionId,
    );
    const isDesignEnabled = otherInfo.designId !== 0;

    return (
        <div
            ref={setElement}
            onClick={onClick}
            style={
                isDesignEnabled
                    ? {
                          backgroundColor: colorOption?.primaryColorHex + "20",
                          borderColor: colorOption?.borderColorHex + "80",
                      }
                    : {}
            }
            className={`w-full text-left border flex items-center gap-2 rounded-lg px-2 py-2 transition-[background-color,box-shadow,transform] duration-150 cursor-pointer group hover:bg-primary/10 ${isDragging ? "shadow-md ring-1 ring-primary/30 bg-card/80 scale-[1.02]" : ""}`}
        >
            {!disabled && (
                <div
                    ref={handleRef}
                    onClick={(e) => e.stopPropagation()}
                    className="text-muted-foreground cursor-grab active:cursor-grabbing transition-colors group-hover:text-muted-foreground shrink-0"
                >
                    <GripVerticalIcon size={16} />
                </div>
            )}
            <div className="flex-1 min-w-0">
                <p
                    className={`text-[12px] font-medium truncate transition-colors text-ink group-hover:text-ink`}
                >
                    {otherInfo.title}
                </p>
                <p className="text-[10px] text-muted-foreground truncate capitalize">
                    {otherInfo.type}
                </p>
            </div>
        </div>
    );
}

export default Sortable;
