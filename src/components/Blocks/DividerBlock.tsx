import { EditIcon, Trash2Icon } from "lucide-react";
import BlockActionButton from "../ui/BlockActionButton";
import BlockCopyActions from "../ui/BlockCopyActions";
import { colorOptions } from "@/utils/ColorsInfo";
import { ALL_DIVIDERS } from "@/utils/Dividers";

type DividerBlockProps = {
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

export default function DividerBlock({
    content,
    colorOptionId,
    className = "",
    readOnly = false,
    onEdit,
    onDelete,
    onCopy,
    onDuplicate,
}: DividerBlockProps) {
    const iconClassName = "max-w-5 group-hover/button:scale-110 transition-transform";
    const colorOption =
        colorOptions.find((co) => co.id === colorOptionId) || colorOptions[0];
    const DividerComponent = ALL_DIVIDERS.find(
        (d) => d.name === content.trim(),
    )?.component;

    return (
        <div
            className={`
                group relative  rounded-lg mb-40
                hover:shadow-lg
                ${className}
            `}
        >
            {!readOnly && (
                <div
                    className={`hidden border group-hover:flex absolute right-2 top-2 z-10 items-center w-fit rounded-md overflow-hidden`}
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
