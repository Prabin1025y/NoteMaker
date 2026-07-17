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
        <div className="border-t border-slate-200 px-8 py-4 bg-slate-50 flex items-center justify-end">
            <div className="flex gap-3">
                <button
                    onClick={onClose}
                    className="px-6 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-100 transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={onSave}
                    disabled={disabled || isAdding}
                    className={`${disabled || isAdding ? " bg-indigo-600/50 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 cursor-pointer"} px-6 py-2 rounded-lg text-white font-medium transition-colors flex items-center justify-center w-32`}
                >
                    {isAdding ? (
                        <Loader className="animate-spin" />
                    ) : action === "add" ? (
                        "Add Block"
                    ) : (
                        <p className="flex gap-2 items-center">
                            <Save size={20} />
                            <span>Save</span>
                        </p>
                    )}
                </button>
            </div>
        </div>
    );
};

export default BlockEditorFooter;
