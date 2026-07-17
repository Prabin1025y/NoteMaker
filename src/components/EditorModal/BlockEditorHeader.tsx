import { PenBox, Plus, X } from "lucide-react";

interface BlockEditorHeaderProps {
    action: "add" | "save";
    onClose: () => void;
}

const BlockEditorHeader = ({ action, onClose }: BlockEditorHeaderProps) => {
    return (
        <div className="flex items-center justify-between border-b border-slate-200 px-8 py-5">
            <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white">
                    {action === "add" ? <Plus size={20} /> : <PenBox size={18} />}
                </div>
                <h2 className="text-xl font-semibold text-slate-900">
                    {action === "add" ? "New Block" : "Edit Block"}
                </h2>
            </div>
            <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500 hover:text-slate-700"
                aria-label="Close editor"
            >
                <X size={24} />
            </button>
        </div>
    );
};

export default BlockEditorHeader;
