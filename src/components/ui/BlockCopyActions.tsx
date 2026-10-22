import { Copy, CopyPlus } from "lucide-react";
import BlockActionButton from "./BlockActionButton";

type BlockCopyActionsProps = {
    onCopy?: () => void;
    onDuplicate?: () => void;
    readOnly?: boolean;
};

export default function BlockCopyActions({
    onCopy,
    onDuplicate,
    readOnly = false,
}: BlockCopyActionsProps) {
    const iconClassName =
        "max-w-5 group-hover/button:scale-110 transition-transform";

    return (
        <>
            {onCopy && (
                <BlockActionButton
                    icon={
                        <Copy
                            className={`${iconClassName} hover:text-primary`}
                        />
                    }
                    onClick={onCopy}
                >
                    Copy
                </BlockActionButton>
            )}
            {!readOnly && onDuplicate && (
                <BlockActionButton
                    icon={
                        <CopyPlus
                            className={`${iconClassName} hover:text-primary`}
                        />
                    }
                    onClick={onDuplicate}
                >
                    Duplicate
                </BlockActionButton>
            )}
        </>
    );
}
