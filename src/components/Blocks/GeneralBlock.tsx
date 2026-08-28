import type { CSSProperties } from "react";
import ReadOnlyEditor from "../ReadOnlyEditor";
import BlockActionButton from "../ui/BlockActionButton";
import { allBlockDesigns } from "@/utils/DesignInfo";
import { colorOptions } from "@/utils/ColorsInfo";
import { EditIcon, Trash2Icon } from "lucide-react";

type GeneralBlockProps = {
    title?: string;
    designId: number;
    colorOptionId: number;
    content: string;

    className?: string;
    readOnly?: boolean;
    onEdit: () => void;
    onDelete: () => void;
};

export default function GeneralBlock({
    content,
    designId,
    colorOptionId,
    title,
    className = "",
    readOnly = false,
    onEdit,
    onDelete,
}: GeneralBlockProps) {
    const iconClassName = "max-w-5 group-hover/button:scale-110 transition-transform";
    const colorOption =
        colorOptions.find((co) => co.id === colorOptionId) || colorOptions[0];

    const isDesignDisabled = designId === 0;
    return (
        <div
            className={`pt-2 ${!isDesignDisabled && "break-inside-avoid"}`}
        >
            <div
                className={`
                group relative  rounded-xl ${isDesignDisabled ? "px-3" : "ds-block-surface border-2 px-5 my-3 "}
                 ${!!title?.trim() && !isDesignDisabled ? "pt-6" : "pt-3"} pb-3 transition-[box-shadow,transform] duration-300
                hover:shadow-lg
                ${className}
            `}
                style={
                    !isDesignDisabled
                        ? ({
                              "--block-bg": colorOption.backgroundColorHex,
                              "--block-border": colorOption.borderColorHex,
                          } as CSSProperties)
                        : {}
                }
            >
                {!readOnly && (
                    <div
                        className={`hidden border group-hover:flex absolute right-2 top-2 z-10 items-center w-fit rounded-md overflow-hidden`}
                    >
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
                                    className={`${iconClassName} hover:text-destructive`}
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
                        <h2 className="text-xl font-bold">{title}</h2>
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

                <ReadOnlyEditor
                    hasTitle={!!title?.trim()}
                    className={!isDesignDisabled ? "pt-2" : ""}
                    content={content}
                />
            </div>
        </div>
    );
}
