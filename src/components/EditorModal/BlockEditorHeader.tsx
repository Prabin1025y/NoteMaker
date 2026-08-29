import { PenBox, Plus, X } from "lucide-react";

interface BlockEditorHeaderProps {
    action: "add" | "save";
    onClose: () => void;
}

const BlockEditorHeader = ({ action, onClose }: BlockEditorHeaderProps) => {
    return (
        <div className="flex items-center justify-between border-b border-muted px-8 py-5">
            <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    {action === "add" ? <Plus size={20} /> : <PenBox size={18} />}
                </div>
                <h2 className="text-lg font-semibold tracking-tight text-ink">
                    {action === "add" ? "New Block" : "Edit Block"}
                </h2>
            </div>
            <button
                onClick={onClose}
                className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground outline-none transition-colors duration-150 hover:bg-background/80 hover:text-ink focus-visible:ring-2 focus-visible:ring-[color:var(--ds-focus-ring)]"
                aria-label="Close editor"
            >
                <X size={20} />
            </button>
        </div>
    );
};

export default BlockEditorHeader;
