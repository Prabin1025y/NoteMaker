import { EditIcon, Trash2Icon } from "lucide-react";
import React from "react";
import ReadOnlyEditor from "../ReadOnlyEditor";
import BlockActionButton from "../ui/BlockActionButton";

type BaseBlockProps = {
    content: string;
    children: React.ReactNode;

    className?: string;

    borderColor?: string;
    backgroundColor?: string;

    onEdit: () => void;
    onDelete: () => void;
};

export default function BaseBlock({
    content,
    children,
    className = "",
    borderColor,
    backgroundColor,
    onEdit,
    onDelete
}: BaseBlockProps) {
    const iconClassName = "max-w-5 group-hover/button:scale-110 transition-all";
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
            <div
                className={`hidden group-hover:flex absolute right-2 top-2 items-center w-fit rounded-md overflow-hidden`}
            >
                <BlockActionButton
                    icon={
                        <EditIcon
                            className={`${iconClassName} hover:text-blue-500`}
                        />
                    }
                    onClick={() => onEdit()}
                >
                    Edit
                </BlockActionButton>
                <BlockActionButton
                    icon={
                        <Trash2Icon
                            className={`${iconClassName} hover:text-red-500`}
                        />
                    }
                    onClick={() => onDelete()}
                >
                    Delete
                </BlockActionButton>
            </div>

            {children}

            <ReadOnlyEditor content={content} />
        </div>
    );
}
