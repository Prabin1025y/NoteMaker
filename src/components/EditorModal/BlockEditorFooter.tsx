import { Loader, Save } from "lucide-react";

interface BlockEditorFooterProps {
    onClose: () => void;
    onSave: () => void;
    disabled: boolean;
    isAdding: boolean;
    action: "add" | "save";
}

const BlockEditorFooter = ({ onClose, onSave, disabled, isAdding, action }: BlockEditorFooterProps) => {
    return (
        <div className="flex items-center justify-end border-t border-muted bg-background/80 px-8 py-4">
            <div className="flex gap-3">
                <button
                    onClick={onClose}
                    className="rounded-lg border border-muted bg-card/80 px-6 py-2 font-medium text-body outline-none transition-colors duration-150 hover:bg-background/80 focus-visible:ring-2 focus-visible:ring-[color:var(--ds-focus-ring)] active:scale-[0.98]"
                >
                    Cancel
                </button>
                <button
                    onClick={onSave}
                    disabled={disabled || isAdding}
                    className={`${disabled || isAdding ? "cursor-not-allowed opacity-40" : "hover:brightness-105 active:scale-[0.98]"} flex w-32 items-center justify-center rounded-lg bg-primary px-6 py-2 font-medium text-primary-foreground outline-none transition-[transform,filter] duration-150 focus-visible:ring-2 focus-visible:ring-[color:var(--ds-focus-ring)] focus-visible:ring-offset-2`}
                >
                    {isAdding ? (
                        <Loader className="animate-spin" />
                    ) : action === "add" ? (
                        "Add Block"
                    ) : (
                        <span className="flex items-center gap-2">
                            <Save size={18} />
                            <span>Save</span>
                        </span>
                    )}
                </button>
            </div>
        </div>
    );
};

export default BlockEditorFooter;
