import BaseBlock from "./BaseBlock";

type NoteBlockProps = {
    title?: string;
    content: string;

    className?: string;
    titleClassName?: string;
    bodyClassName?: string;

    borderColor?: string;
    backgroundColor?: string;
    titleColor?: string;

    onEdit: () => void;
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
}: NoteBlockProps) {
    return (
        <BaseBlock
            content={content || "{}"}
            className={className}
            borderColor={borderColor || "border-blue-700"}
            backgroundColor={backgroundColor || "bg-blue-50"}
            onEdit={onEdit}
        >
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
        </BaseBlock>
    );
}
