import { Edit3 } from "lucide-react";
import React from "react";
import ReadOnlyEditor from "../ReadOnlyEditor";

type BaseBlockProps = {
    content: string;
    children: React.ReactNode;

    className?: string;

    borderColor?: string;
    backgroundColor?: string;

    onEdit: () => void;
};

export default function BaseBlock({
    content,
    children,
    className = "",
    borderColor,
    backgroundColor,
    onEdit,
}: BaseBlockProps) {
    return (
        <div
            className={`
                group relative mt-8 rounded-xl border-2
                p-5 shadow-sm transition-all duration-300
                hover:shadow-lg
                ${borderColor || "border-slate-700"}
                ${backgroundColor || "bg-slate-50"}
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

            {children}

            <ReadOnlyEditor content={content} />
        </div>
    );
}
