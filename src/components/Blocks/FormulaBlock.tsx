import type { CSSProperties } from "react";
import { EditIcon, Trash2Icon } from "lucide-react";
import BlockActionButton from "../ui/BlockActionButton";
import BlockCopyActions from "../ui/BlockCopyActions";
import { allBlockDesigns } from "@/utils/DesignInfo";
import { colorOptions } from "@/utils/ColorsInfo";
import FormulaViewer from "../FormulaViewer";

type FormulaBlockProps = {
    title?: string;
    designId: number;
    colorOptionId: number;
    content: string;

    className?: string;
    readOnly?: boolean;
    onEdit: () => void;
    onDelete: () => void;
    onCopy?: () => void;
    onDuplicate?: () => void;
};

export default function FormulaBlock({
    content,
    designId,
    colorOptionId,
    title,
    className = "",
    readOnly = false,
    onEdit,
    onDelete,
    onCopy,
    onDuplicate,
}: FormulaBlockProps) {
    const iconClassName = "max-w-5 group-hover/button:scale-110 transition-transform";
    const colorOption =
        colorOptions.find((co) => co.id === colorOptionId) || colorOptions[0];
    const isDesignDisabled = designId === 0;
    return (
        <div className={`pt-2 ${!isDesignDisabled && "break-inside-avoid"}`}>
            <div
                className={`
                group relative  rounded-xl ${isDesignDisabled ? "px-3" : "ds-block-surface border-2 px-5 my-3"}
                 ${!!title?.trim() ? "pt-5" : "pt-3"} pb-3 transition-[box-shadow,transform] duration-300
                hover:shadow-lg
                ${className}
            `}
                style={
                    !isDesignDisabled
                        ? ({
                              backgroundColor: colorOption.primaryColorHex + "20",
                              borderColor: colorOption.borderColorHex + "80"
                          } as CSSProperties)
                        : {}
                }
            >
                {!readOnly && (
                    <div
                        className={`hidden border group-hover:flex max-md:group-data-[mobile-active=true]/add:flex absolute right-2 top-2 z-10 items-center w-fit rounded-md overflow-hidden`}
                    >
                        <BlockCopyActions
                            onCopy={onCopy}
                            onDuplicate={onDuplicate}
                        />
                        <BlockActionButton
                            icon={
                                <EditIcon
                                    className={`${iconClassName} hover:text-primary`}
                                />
                            }
                            onClick={() => onEdit()}
                        >
                            Edit
                        </BlockActionButton>
                        <BlockActionButton
                            icon={
                                <Trash2Icon
                                    className={`${iconClassName} hover:text-[color:var(--ds-danger)]`}
                                />
                            }
                            onClick={() => onDelete()}
                        >
                            Delete
                        </BlockActionButton>
                    </div>
                )}

                {/* Ribbon */}
                {title &&
                    title.trim() !== "" &&
                    (isDesignDisabled ? (
                        <h2 className="text-2xl font-bold">{title}</h2>
                    ) : (
                        allBlockDesigns
                            .find((b) => b.id === designId)
                            ?.applyDesign(
                                title,
                                colorOption.primaryColorHex,
                                colorOption.secondaryColorHex,
                                colorOption.titleColorHex,
                            )
                    ))}

                <FormulaViewer
                    latex={content}
                    className={`${isDesignDisabled ? "" : "py-5"} flex justify-center`}
                />
            </div>
        </div>
    );
}
