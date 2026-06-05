import React, { useRef, useState } from "react";
import { useSortable } from "@dnd-kit/react/sortable";
import { GripVerticalIcon } from "lucide-react";

function Sortable({
    id,
    index,
    otherInfo,
    blockTitle,
}: {
    id: string;
    index: number;
    otherInfo: {
        color?: string;
        icon: React.ReactNode;
        bgColor?: string;
        hoverColor?: string;
    };
    blockTitle?: string;
}) {
    const [element, setElement] = useState<Element | null>(null);
    const handleRef = useRef<HTMLDivElement | null>(null);
    const { isDragging } = useSortable({
        id,
        index,
        element,
        handle: handleRef,
    });

    return (
        <div
            ref={setElement}
            className={`w-full text-left p-3 rounded-lg  transition-colors border ${otherInfo.bgColor} ${otherInfo.hoverColor} ${isDragging && `shadow-2xl`}`}
        >
            <div className="flex items-start gap-3">
                <div className={`shrink-0 mt-0.5 ${otherInfo.color}`}>
                    {otherInfo.icon}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className={`text-sm font-semibold ${otherInfo.color}`}>
                        {blockTitle}
                    </h3>
                </div>
                <div ref={handleRef} className={`${otherInfo.color} cursor-grab`}>
                    <GripVerticalIcon />
                </div>
            </div>
        </div>
    );
}

export default Sortable;
