import ReadOnlyEditor from "../ReadOnlyEditor";
import BlockActionButton from "../ui/BlockActionButton";
import { colorOptions } from "@/utils/ColorsInfo";
import { EditIcon, Trash2Icon } from "lucide-react";

type HeaderBlockProps = {
    title?: string;
    designId: number;
    colorOptionId: number;
    content: string;

    className?: string;
    onEdit: () => void;
    onDelete: () => void;
};

export default function HeaderBlock({
    content,
    designId,
    colorOptionId,
    title,
    className = "",
    onEdit,
    onDelete,
}: HeaderBlockProps) {
    const iconClassName = "max-w-5 group-hover/button:scale-110 transition-all";
    const colorOption =
        colorOptions.find((co) => co.id === colorOptionId) || colorOptions[0];

    const isDesignDisabled = designId === 0;
    return (
        <div
            className={`pt-2 break-after-avoid ${!isDesignDisabled && "break-inside-avoid"}`}
        >
            <div
                className={`
                group relative  rounded-xl ${isDesignDisabled ? "px-3" : "border-2 px-5 my-3 "}
                 ${!!title?.trim() && !isDesignDisabled ? "pt-6" : "pt-3"} pb-3 transition-all duration-300
                hover:shadow-lg
                ${className}
            `}
                style={
                    !isDesignDisabled
                        ? {
                              backgroundColor: colorOption.backgroundColorHex,
                              borderColor: colorOption.borderColorHex,
                          }
                        : {}
                }
            >
                <div
                    className={`hidden border group-hover:flex absolute right-2 top-2 z-10 items-center w-fit rounded-md overflow-hidden`}
                >
                    <BlockActionButton
                        icon={
                            <EditIcon
                                className={`${iconClassName} hover:text-blue-500`}
                            />
                        }
                        onClick={() => onEdit()}
                    >
                        Edit
                    </BlockActionButton>
                    <BlockActionButton
                        icon={
                            <Trash2Icon
                                className={`${iconClassName} hover:text-red-500`}
                            />
                        }
                        onClick={() => onDelete()}
                    >
                        Delete
                    </BlockActionButton>
                </div>

                <ReadOnlyEditor
                    hasTitle={!!title?.trim()}
                    className={!isDesignDisabled ? "pt-2" : ""}
                    content={content}
                />
            </div>
        </div>
    );
}
