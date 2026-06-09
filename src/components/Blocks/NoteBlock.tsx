import { allBlockDesigns } from "@/utils/DesignInfo";
import BaseBlock from "./BaseBlock";

type NoteBlockProps = {
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

export default function NoteBlock({
    title = "Note",
    content,
    className = "",
    titleClassName = "",
    borderColor,
    backgroundColor,
    titleColor,
    onEdit,
    onDelete,
    designId = 1,
}: NoteBlockProps) {
    return (
        <BaseBlock
            title={title}
            content={content || `{"type":"doc","content":[{"type":"paragraph","attrs":{"textAlign":null},"content":[{"type":"text","text":" "}]}]}`}
            className={className}
            borderColor={borderColor || "border-sky-700"}
            backgroundColor={backgroundColor || "bg-sky-50"}
            onEdit={onEdit}
            onDelete={onDelete}
        >
            {/* Ribbon Title */}
            {/* <div
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
            </div> */}
            {allBlockDesigns
                .find((b) => b.id === designId)
                ?.applyDesign(
                    title,
                    "#008ad4",
                    "#004080",
                    titleColor,
                    titleClassName,
                )}
        </BaseBlock>
    );
}
