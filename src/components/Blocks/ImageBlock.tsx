
import { EditIcon, Trash2Icon } from "lucide-react";
import BlockActionButton from "../ui/BlockActionButton";

type ImageBlockProps = {
    title?: string;
    designId?: number;
    colorOptionId?: number;
    content: string;

    className?: string;
    titleClassName?: string;
    bodyClassName?: string;

    borderColor?: string;
    backgroundColor?: string;
    titleColor?: string;

    onEdit: () => void;
    onDelete: () => void;
};

export default function ImageBlock({
    content,
    title,
    className = "",
    onEdit,
    onDelete,
}: ImageBlockProps) {
    const iconClassName = "max-w-5 transition-transform group-hover/button:scale-110";

    return (
        <figure
            className={`
                break-inside-avoid group relative
                ${className}
            `}
        >
            {/* Actions */}
            <div
                className="
                    absolute right-2 top-2 z-10
                    hidden overflow-hidden rounded-md border border-hairline shadow-sm
                    group-hover:flex
                "
            >
                <BlockActionButton
                    icon={
                        <EditIcon
                            className={`${iconClassName} hover:text-brand-cta`}
                        />
                    }
                    onClick={onEdit}
                >
                    Edit
                </BlockActionButton>

                <BlockActionButton
                    icon={
                        <Trash2Icon
                            className={`${iconClassName} hover:text-[color:var(--ds-danger)]`}
                        />
                    }
                    onClick={onDelete}
                >
                    Delete
                </BlockActionButton>
            </div>

            {/* Image */}
            <div className="flex justify-center">
                <img
                    src={content}
                    alt={title ?? "Document image"}
                    className="
                        max-h-[600px]
                        max-w-full
                        object-contain
                        transition-[box-shadow]
                        duration-300
                        group-hover:shadow-md
                    "
                />
            </div>

            {/* Caption */}
            {title && (
                <figcaption
                    className="
                        mx-auto mt-3
                        max-w-3xl
                        text-center
                        text-sm
                        italic
                        text-muted-ink
                    "
                >
                    {title}
                </figcaption>
            )}
        </figure>
    );
}
