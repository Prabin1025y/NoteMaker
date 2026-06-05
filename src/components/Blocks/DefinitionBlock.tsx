import BaseBlock from "./BaseBlock";

type DefinitionBlockProps = {
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

export default function DefinitionBlock({
    title = "Note",
    content,
    className = "",
    titleClassName = "",
    borderColor,
    backgroundColor,
    titleColor,
    onEdit,
}: DefinitionBlockProps) {
    return (
        <BaseBlock
            content={content || "{}"}
            className={className}
            borderColor={borderColor || "border-red-700"}
            backgroundColor={backgroundColor || "bg-red-50"}
            onEdit={onEdit}
        >
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
        </BaseBlock>
    );
}
