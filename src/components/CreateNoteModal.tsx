"use client";
import { useState } from "react";
import { X } from "lucide-react";

interface CreateNoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreateNote: (title: string, description: string) => void;
}

export default function CreateNoteModal({
    isOpen,
    onClose,
    onCreateNote,
}: CreateNoteModalProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const handleCreate = () => {
        onCreateNote(title || "Untitled Note", description);
        setTitle("");
        setDescription("");
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && e.ctrlKey) {
            handleCreate();
        }
        if (e.key === "Escape") {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                    <h2 className="text-xl font-bold text-slate-900">
                        Create New Note
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
                        aria-label="Close modal"
                    >
                        <X size={20} className="text-slate-600" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    <div>
                        <label htmlFor="title" className="block text-sm font-semibold text-slate-900 mb-2">
                            Title
                        </label>
                        <input
                            id="title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Enter note title..."
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                            autoFocus
                        />
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-semibold text-slate-900 mb-2">
                            Description (Optional)
                        </label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Add a brief description..."
                            rows={3}
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
                        />
                    </div>

                    <p className="text-xs text-slate-500">
                        💡 Tip: Press <kbd className="px-2 py-1 bg-slate-100 rounded text-xs font-mono">Ctrl+Enter</kbd> to create
                    </p>
                </div>

                {/* Footer */}
                <div className="flex gap-3 p-6 border-t border-slate-200 bg-slate-50 rounded-b-2xl">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg font-medium text-slate-900 hover:bg-slate-100 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleCreate}
                        className="flex-1 px-4 py-2.5 bg-linear-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-lg font-medium transition-all transform hover:scale-105 shadow-md"
                    >
                        Create Note
                    </button>
                </div>
            </div>
        </div>
    );
}
