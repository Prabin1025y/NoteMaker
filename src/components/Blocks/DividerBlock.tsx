import { EditIcon, Trash2Icon } from "lucide-react";
import BlockActionButton from "../ui/BlockActionButton";
import { colorOptions } from "@/utils/ColorsInfo";
import { ALL_DIVIDERS } from "@/utils/Dividers";

type DividerBlockProps = {
    title?: string;
    designId: number;
    colorOptionId: number;
    content: string;

    className?: string;
    onEdit: () => void;
    onDelete: () => void;
};

export default function DividerBlock({
    content,
    colorOptionId,
    className = "",
    onEdit,
    onDelete,
}: DividerBlockProps) {
    const iconClassName = "max-w-5 group-hover/button:scale-110 transition-all";
    const colorOption =
        colorOptions.find((co) => co.id === colorOptionId) || colorOptions[0];
    const DividerComponent = ALL_DIVIDERS.find(
        (d) => d.name === content.trim(),
    )?.component;

    return (
        <div
            className={`
                group relative  rounded-lg
                hover:shadow-lg
                ${className}
            `}
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

            {DividerComponent ? (
                <DividerComponent
                    color={colorOption.borderColorHex}
                    width="full"
                    className="w-full"
                />
            ) : (
                <div>Invalid Divider</div>
            )}
        </div>
    );
}
