import BlockActionButton from "../ui/BlockActionButton";
import { EditIcon, Trash2Icon } from "lucide-react";
import ReadOnlyEditor from "../ReadOnlyEditor";

type TextBlockProps = {
    title?: string;
    content: string;
    designId?: number;

    className?: string;
    titleClassName?: string;
    bodyClassName?: string;

    borderColor?: string;
    backgroundColor?: string;
    titleColor?: string;

    onEdit: () => void;
    onDelete: () => void;
};

export default function TextBlock({
    title = "Note",
    content,
    className = "",
    titleClassName = "",
    borderColor,
    backgroundColor,
    titleColor,
    onEdit,
    onDelete,
    designId = 3,
}: TextBlockProps) {
    const iconClassName = "max-w-5 group-hover/button:scale-110 transition-all";
    return (
        <div
            className={`
                group relative mt-8 rounded-xl
                px-3 transition-all duration-300
                hover:shadow-lg
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

            {/* Ribbon */}
            {/* {title && title !== "" && children} */}
            {title && <h2 className="text-2xl font-bold">{title}</h2>}

            <ReadOnlyEditor hasTitle={!!title} className="pt-2" content={content} />
        </div>
    );
}
