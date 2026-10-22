import { EditIcon, PenLine, Trash2Icon } from "lucide-react";
import BlockActionButton from "../ui/BlockActionButton";
import BlockCopyActions from "../ui/BlockCopyActions";
import { GridId, Quickdraw, QuickdrawRef } from "@quickdrawjs/react";
import { useEffect, useRef } from "react";
import { CanvasEditorContentType } from "@/types/CanvasEditor";
import { ModifiedCanvasEditorContentType } from "@/validation/editorData";

type CanvasBlockProps = {
    title?: string;
    designId?: number;
    colorOptionId?: number;
    content: ModifiedCanvasEditorContentType;

    className?: string;
    readOnly?: boolean;
    onEdit: () => void;
    onDelete: () => void;
    onCopy?: (canvasImage?: Promise<Blob | null>) => void;
    onDuplicate?: () => void;
};

export default function CanvasBlock({
    content,
    title,
    className = "",
    readOnly = false,
    onEdit,
    onDelete,
    onCopy,
    onDuplicate,
}: CanvasBlockProps) {
    const iconClassName =
        "max-w-5 transition-transform group-hover/button:scale-110";
    const canvasEditor = useRef<QuickdrawRef>(null);

    if (!content) return;


    useEffect(() => {
        if (canvasEditor.current && content) {
            canvasEditor.current.editor?.store.loadSnapshot(content.data);
            canvasEditor.current.editor?.setGrid(content.config.grid as GridId);
            canvasEditor.current.editor?.setTheme(content.config.theme);
            canvasEditor.current.editor?.fitContent({ animate: 220 });
        }
    }, [content, canvasEditor]);

    return (
        <figure className={`group relative break-inside-avoid ${className}`}>
            {/* Actions */}
            {!readOnly && (
                <div className="absolute right-2 top-2 z-10 hidden overflow-hidden rounded-md group-hover:flex">
                    <BlockCopyActions
                        onCopy={() =>
                            onCopy?.(
                                canvasEditor.current?.editor?.exportImage() ??
                                    Promise.resolve(null),
                            )
                        }
                        onDuplicate={onDuplicate}
                    />
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

            {content ? (
                <div className="w-[80%] mx-auto aspect-square">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <Quickdraw
                        ref={canvasEditor}
                        autoFit
                        grid={content.config.grid as GridId}
                        theme={content.config.theme}
                        readonly
                        snapshot={content.data}
                        watermark={false}
                    />
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-strong bg-background/80 py-12 text-muted-foreground">
                    <PenLine
                        size={22}
                        className="opacity-50"
                    />
                    <p className="text-[13px]">
                        Empty drawing — click Edit to sketch.
                    </p>
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
