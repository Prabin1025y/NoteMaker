import { allBlockDesigns } from "@/utils/DesignInfo";
import BaseBlock from "./BaseBlock";
import { colorOptions } from "@/utils/ColorsInfo";
import { initialJsonForEditor } from "@/utils/UtilFunctions";

type GeneralBlockProps = {
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

export default function GeneralBlock({
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
    colorOptionId = 1,
}: GeneralBlockProps) {
    const colorOption =
        colorOptions.find((co) => co.id === colorOptionId) || colorOptions[0];
    return (
        <BaseBlock
            title={title}
            content={
                content ||
                initialJsonForEditor
            }
            className={className}
            borderColor={borderColor || `border-["${colorOption.borderColorHex}"]`}
            backgroundColor={backgroundColor || `bg-["${colorOption.backgroundColorHex}"]`}
            onEdit={onEdit}
            onDelete={onDelete}
        >
            {/* Ribbon Title */}
            {allBlockDesigns
                .find((b) => b.id === designId)
                ?.applyDesign(
                    title,
                    colorOption.primaryColorHex,
                    colorOption.secondaryColorHex,
                    colorOption.titleColorHex,
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
