"use client";
import { useState } from "react";
import { X } from "lucide-react";

interface CreateNoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreateNote: (title: string, description: string) => void;
}

export default function CreateNoteModal({ isOpen, onClose, onCreateNote }: CreateNoteModalProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const handleCreate = () => {
        onCreateNote(title || "Untitled", description);
        setTitle("");
        setDescription("");
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && e.ctrlKey) handleCreate();
        if (e.key === "Escape") onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" style={{ fontFamily: "'Inter', sans-serif" }}>
            <div className="bg-white rounded-[14px] border border-[#e8e5e0] w-full max-w-[400px] mx-4 overflow-hidden shadow-2xl">
                <div className="flex items-center justify-between px-5 py-4 border-b border-[#f0ede8]">
                    <h2 className="text-[15px] font-semibold text-[#1a1714] tracking-tight">Create a new note</h2>
                    <button
                        onClick={onClose}
                        aria-label="Close"
                        className="w-7 h-7 rounded-[7px] flex items-center justify-center text-[#9e9a94] hover:bg-[#f5f3f0] hover:text-[#1a1714] transition-colors"
                    >
                        <X size={15} />
                    </button>
                </div>

                <div className="px-5 py-5 flex flex-col gap-4">
                    <div>
                        <label htmlFor="title" className="block text-[12px] font-medium text-[#5a5550] mb-1.5">
                            Note title
                        </label>
                        <input
                            id="title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="What's this note about?"
                            autoFocus
                            className="w-full px-3 py-2.5 bg-[#faf9f7] border border-[#e2e0dc] rounded-[9px] text-[13px] text-[#1a1714] placeholder-[#b8b3ac] outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                        />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-[12px] font-medium text-[#5a5550] mb-1.5">
                            Description <span className="text-[#b8b3ac] font-normal">(optional)</span>
                        </label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Add a short description to find it easily later…"
                            rows={3}
                            className="w-full px-3 py-2.5 bg-[#faf9f7] border border-[#e2e0dc] rounded-[9px] text-[13px] text-[#1a1714] placeholder-[#b8b3ac] outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all resize-none"
                        />
                    </div>
                    <p className="text-[11px] text-[#b8b3ac]">
                        Tip: press{" "}
                        <kbd className="px-1.5 py-0.5 bg-[#f5f3f0] border border-[#e2e0dc] rounded-[5px] font-mono text-[10px] text-[#5a5550]">
                            Ctrl+Enter
                        </kbd>{" "}
                        to create instantly
                    </p>
                </div>

                <div className="flex gap-2 px-5 py-4 border-t border-[#f0ede8] bg-[#faf9f7]">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 text-[13px] font-medium text-[#5a5550] bg-white border border-[#e2e0dc] rounded-[9px] hover:bg-[#f5f3f0] transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleCreate}
                        className="flex-1 py-2.5 text-[13px] font-medium text-white bg-indigo-700 hover:bg-indigo-800 rounded-[9px] transition-colors"
                    >
                        Create note
                    </button>
                </div>
            </div>
        </div>
    );
}