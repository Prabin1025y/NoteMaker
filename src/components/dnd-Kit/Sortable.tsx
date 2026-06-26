import React, { useEffect, useRef, useState } from "react";
import { useSortable } from "@dnd-kit/react/sortable";
import { GripVerticalIcon } from "lucide-react";
import { useNoteStore } from "@/Context/DataStore";

function Sortable({
    id,
    index,
    otherInfo,
    blockTitle,
    className
}: {
    id: string;
    index: number;
    otherInfo: {
        color?: string;
        icon: React.ReactNode;
        bgColor?: string;
        hoverColor?: string;
        type: string;
    };
    blockTitle?: string;
    className?: string
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

    useEffect(() => {
        console.log("Ran hehe ", isDragging);
        if (isDragging) {
            setDraggingBlockId(id);
        } else {
            setDraggingBlockId(null);
        }
    }, [isDragging]);

    return (
        // <div
        //     ref={setElement}
        //     className={`w-full text-left p-3 rounded-lg  transition-colors  ${isDragging && `shadow-2xl`}`}
        // >
        //     <div className="flex items-start gap-3">
        //         <div className={`shrink-0 mt-0.5 ${otherInfo.color}`}>
        //             {otherInfo.icon}
        //         </div>
        //         <div className="flex-1 min-w-0">
        //             <h3
        //                 className={`text-sm font-semibold ${otherInfo.color} truncate`}
        //             >
        //                 {blockTitle}
        //             </h3>
        //         </div>
        //         <div
        //             ref={handleRef}
        //             className={`${otherInfo.color} cursor-grab`}
        //         >
        //             <GripVerticalIcon />
        //         </div>
        //     </div>
        // </div>
        <div
            ref={setElement}
            className={`${className} ${isDragging && `${otherInfo.bgColor} shadow-2xl border border-gray-100`} w-full text-left flex items-center gap-2.5 px-2.5 py-2  hover:bg-[#f0ede8] group`}
        >
            <div
                ref={handleRef}
                className={`text-gray-400 cursor-grab`}
            >
                <GripVerticalIcon size={20} />
            </div>
            {/* <div
                className={`w-5 h-7 rounded-[7px] flex items-center justify-center flex-shrink-0`}
            >
                <span className={`${otherInfo.color} `}>
                    {otherInfo.icon}
                </span>
            </div> */}
            <div className="flex-1 min-w-0">
                <p className=" text-[#5a5550] group-hover:text-[#1a1714] transition-colors">
                    {blockTitle}
                </p>
                <p className="text-[11px] text-[#b8b3ac] truncate">
                    {otherInfo.type}
                </p>
            </div>
        </div>
    );
}

export default Sortable;
