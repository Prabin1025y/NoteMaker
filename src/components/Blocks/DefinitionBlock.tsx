import { Edit3 } from "lucide-react";
import React from "react";

type DefinitionBlockProps = {
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
};

export default function DefinitionBlock({
    title = "Note",
    children,
    className = "",
    titleClassName = "",
    bodyClassName = "",
    borderColor,
    backgroundColor,
    titleColor,
    textColor,
}: DefinitionBlockProps) {
    return (
        <div
            className={`
                group relative mt-8 rounded-xl border-2
                p-5 shadow-sm transition-all duration-300
                hover:shadow-lg
                ${borderColor || "border-red-700"}
                ${backgroundColor || "bg-red-50"}
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
            >
                <Edit3 size={14} />
                Edit
            </button>

            {/* Ribbon Title */}
            <div
                className={`
                    absolute -top-2 left-5
                    inline-flex items-center
                    h-9
                    text-xs font-semibold
                     tracking-[0.18em]
                    ${titleColor || "text-white"}
                    ${titleClassName}
                `}
            >
                <div>
                    <div className="ribbon px-5 py-2 ">{title}</div>
                </div>
            </div>

            {/* Content */}
            <div
                className={`
                    pt-3 text-sm leading-7
                    ${textColor || "text-slate-800"}
                    ${bodyClassName}
                `}
            >
                {children}
            </div>
        </div>
    );
}
