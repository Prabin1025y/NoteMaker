import { allBlockDesigns } from "@/utils/DesignInfo";
import BaseBlock from "./BaseBlock";

type DefinitionBlockProps = {
    title?: string;
    designId?: number;
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

export default function DefinitionBlock({
    title = "Definition",
    content,
    className = "",
    titleClassName = "",
    borderColor,
    backgroundColor,
    titleColor,
    onEdit,
    onDelete,
    designId = 2,
}: DefinitionBlockProps) {
    return (
        <BaseBlock
            title={title}
            content={content || `{"type":"doc","content":[{"type":"paragraph","attrs":{"textAlign":null},"content":[{"type":"text","text":" "}]}]}`}
            className={className}
            borderColor={borderColor || "border-red-700"}
            backgroundColor={backgroundColor || "bg-red-50"}
            onEdit={onEdit}
            onDelete={onDelete}
        >
            {/* Ribbon Title */}
            {allBlockDesigns
                .find((b) => b.id === designId)
                ?.applyDesign(
                    title,
                    "#c50000",
                    "#970000",
                    titleColor,
                    titleClassName,
                )}
            {/* <div
                className={`
                    absolute top-2 -left-2.5
                    inline-flex items-center
                    h-9
                    text-xs font-semibold
                     tracking-[0.18em]
                    ${titleColor || "text-white"}
                    ${titleClassName}
                `}
            >
                <div>
                    <div className="ribbon1 px-5 pb-3 pt-2 flex items-center justify-center ">{title}</div>
                </div>
            </div> */}
        </BaseBlock>
    );
}
