import { Edit3 } from "lucide-react";
import React from "react";

type NoteBlockProps = {
    title?: string;
    children: React.ReactNode;

    className?: string;
    titleClassName?: string;
    bodyClassName?: string;

    borderColor?: string;
    backgroundColor?: string;
    titleColor?: string;
    textColor?: string;

    icon?: React.ReactNode;
    onEdit: () => void;
};

export default function NoteBlock({
    title = "Note",
    children,
    className = "",
    titleClassName = "",
    bodyClassName = "",
    borderColor,
    backgroundColor,
    titleColor,
    textColor,
    onEdit,
}: NoteBlockProps) {
    return (
        <div
            className={`
                group relative mt-8 rounded-xl border-2
                p-5 shadow-sm transition-all duration-300
                hover:shadow-lg
                ${borderColor || "border-blue-700"}
                ${backgroundColor || "bg-blue-50"}
                ${className}
            `}
        >
            {/* Edit Button */}
            <button
                className="
                    absolute right-4 top-4
                    flex items-center gap-2
                    rounded-full
                    bg-blue-500/90 backdrop-blur
                    px-3 py-1.5
                    text-xs font-medium
                    text-white
                    hover:text-black
                    shadow-md
                    border border-blue-200
                    opacity-0
                    translate-y-1
                    transition-all duration-200
                    group-hover:opacity-100
                    group-hover:translate-y-0
                    hover:bg-blue-50
                    hover:shadow-lg
                    cursor-pointer
                "
                onClick={() => onEdit()}
            >
                <Edit3 size={14} />
                Edit
            </button>

            {/* Ribbon Title */}
            <div
                className={`
                    absolute top-0 left-10
                    inline-flex items-center
                    h-9
                    text-xs font-semibold
                     tracking-[0.18em]
                    ${titleColor || "text-white"}
                    ${titleClassName}
                `}
            >
                <div className="bg-white relative border-2 rounded-sm -translate-y-1/2 border-blue-700 text-black px-5 py-2 ">
                    {title}
                    <div className="size-2 bg-blue-700 rounded-full absolute left-0 top-1/2 -translate-x-full -translate-y-1/2" />
                    <div className="size-2 bg-blue-700 rounded-full absolute right-0 top-1/2 translate-x-full -translate-y-1/2" />
                </div>
            </div>

            {/* Content */}
            <div
                className={`
                    pt-3 text-sm leading-7
                    ${textColor || "text-slate-800"}
                    ${bodyClassName}
                `}
                dangerouslySetInnerHTML={{ __html: children?.toString() || "" }}
            ></div>
        </div>
    );
}
