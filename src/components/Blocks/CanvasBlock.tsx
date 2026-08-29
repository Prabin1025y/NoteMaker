import { EditIcon, PenLine, Trash2Icon } from "lucide-react";
import BlockActionButton from "../ui/BlockActionButton";

type CanvasBlockProps = {
    title?: string;
    designId?: number;
    colorOptionId?: number;
    content: string;

    className?: string;
    readOnly?: boolean;
    onEdit: () => void;
    onDelete: () => void;
};

type ParsedCanvas = {
    dataUrl?: string;
    background?: string;
};

const parse = (content: string): ParsedCanvas | null => {
    if (!content) return null;
    try {
        const parsed = JSON.parse(content);
        if (typeof parsed !== "object" || parsed === null) return null;
        return parsed as ParsedCanvas;
    } catch {
        return null;
    }
};

export default function CanvasBlock({
    content,
    title,
    className = "",
    readOnly = false,
    onEdit,
    onDelete,
}: CanvasBlockProps) {
    const iconClassName = "max-w-5 transition-transform group-hover/button:scale-110";
    const parsed = parse(content);
    const dataUrl = parsed?.dataUrl;

    return (
        <figure className={`group relative break-inside-avoid ${className}`}>
            {/* Actions */}
            {!readOnly && (
                <div className="absolute right-2 top-2 z-10 hidden overflow-hidden rounded-md group-hover:flex">
                    <BlockActionButton
                        icon={
                            <EditIcon
                                className={`${iconClassName} hover:text-[color:var(--ds-accent)]`}
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
            )}

            {dataUrl ? (
                <div className="flex justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={dataUrl}
                        alt={title || "Drawing"}
                        className="max-h-[640px] w-full max-w-4xl rounded-xl border border-muted object-contain shadow-sm transition-[box-shadow,transform] duration-300 group-hover:shadow-md"
                    />
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-strong bg-background/80 py-12 text-muted-foreground">
                    <PenLine size={22} className="opacity-50" />
                    <p className="text-[13px]">Empty drawing — click Edit to sketch.</p>
                </div>
            )}

            {title && title.trim() !== "" && (
                <figcaption className="mx-auto mt-3 max-w-3xl text-center text-sm italic text-muted-foreground">
                    {title}
                </figcaption>
            )}
        </figure>
    );
}
