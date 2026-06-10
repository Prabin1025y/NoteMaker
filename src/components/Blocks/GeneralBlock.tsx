import { EditIcon, Trash2Icon } from "lucide-react";
import ReadOnlyEditor from "../ReadOnlyEditor";
import BlockActionButton from "../ui/BlockActionButton";
import { allBlockDesigns } from "@/utils/DesignInfo";
import { colorOptions } from "@/utils/ColorsInfo";

type GeneralBlockProps = {
    title?: string;
    designId: number;
    colorOptionId: number;
    content: string;

    className?: string;
    onEdit: () => void;
    onDelete: () => void;
};

export default function GeneralBlock({
    content,
    designId,
    colorOptionId,
    title,
    className = "",
    onEdit,
    onDelete,
}: GeneralBlockProps) {
    const iconClassName = "max-w-5 group-hover/button:scale-110 transition-all";
    const colorOption =
        colorOptions.find((co) => co.id === colorOptionId) || colorOptions[0];
    return (
        <div
            className={`
                group relative mt-8 rounded-xl border-2
                px-5 ${!!title?.trim() ? "pt-5" : "pt-3"} pb-3 shadow-sm transition-all duration-300
                hover:shadow-lg
                ${className}
            `}
            style={{
                backgroundColor: colorOption.backgroundColorHex,
                borderColor: colorOption.borderColorHex,
            }}
        >
            <div
                className={`hidden group-hover:flex absolute right-2 top-2 z-10 items-center w-fit rounded-md overflow-hidden`}
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

            {/* Ribbon */}
            {title &&
                title.trim() !== "" &&
                allBlockDesigns
                    .find((b) => b.id === designId)
                    ?.applyDesign(
                        title,
                        colorOption.primaryColorHex,
                        colorOption.secondaryColorHex,
                        colorOption.titleColorHex,
                    )}

            <ReadOnlyEditor
                hasTitle={!!title?.trim()}
                content={content}
            />
        </div>
    );
}
