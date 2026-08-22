"use client";
import { useEffect, useRef, useState } from "react";
import { X, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { resolveFolderColor } from "@/utils/folderColors";
import { FolderOption } from "@/types/misc";

type FolderSelection = {
    isNewFolder: boolean;
    folderId?: string;
    folderName?: string;
};

interface CreateNoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreateNote: (
        title: string,
        description: string,
        folderDetails?: FolderSelection,
    ) => void;
    folders: FolderOption[];
}

const inputClass =
    "w-full rounded-md border border-[color:var(--ds-border-input)] bg-surface px-3 py-2.5 text-[13px] text-ink outline-none transition-colors duration-150 placeholder:text-faint focus-visible:border-[color:var(--ds-focus-ring)] focus-visible:ring-2 focus-visible:ring-[color:var(--ds-focus-ring)]";

const labelClass = "mb-1.5 block text-[12px] font-medium text-body";

export default function CreateNoteModal({
    isOpen,
    onClose,
    onCreateNote,
    folders,
}: CreateNoteModalProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [isNewFolder, setIsNewFolder] = useState(false);
    const [selectedFolderId, setSelectedFolderId] = useState("");
    const [newFolderName, setNewFolderName] = useState("");
    const titleRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!isOpen) return;

        if (folders.length > 0) {
            setSelectedFolderId((current) => current || folders[0].id);
            setIsNewFolder(false);
        } else {
            setSelectedFolderId("");
            setIsNewFolder(true);
        }
        setNewFolderName("");
        // Move focus into the dialog.
        const id = window.setTimeout(() => titleRef.current?.focus(), 30);
        return () => window.clearTimeout(id);
    }, [isOpen, folders]);

    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [isOpen, onClose]);

    const handleCreate = () => {
        const folderDetails: FolderSelection = isNewFolder
            ? { isNewFolder: true, folderName: newFolderName.trim() }
            : { isNewFolder: false, folderId: selectedFolderId };

        onCreateNote(title || "Untitled", description, folderDetails);
        setTitle("");
        setDescription("");
        setSelectedFolderId(folders[0]?.id || "");
        setNewFolderName("");
        setIsNewFolder(!folders.length);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && e.ctrlKey) handleCreate();
    };

    if (!isOpen) return null;

    const canCreate = isNewFolder ? newFolderName.trim().length > 0 : true;
    const activeColor = isNewFolder
        ? resolveFolderColor("amber")
        : resolveFolderColor(
              folders.find((f) => f.id === selectedFolderId)?.color,
          );

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-note-title"
        >
            <div
                aria-hidden
                onClick={onClose}
                className="ds-animate-fade-in absolute inset-0 bg-black/40"
            />

            <div className="ds-animate-fade-up relative w-full max-w-[420px] overflow-hidden rounded-2xl border border-hairline bg-elevated shadow-2xl">
                <div className="flex items-center justify-between border-b border-hairline px-5 py-4">
                    <div className="flex items-center gap-2.5">
                        <span className="grid h-8 w-8 place-items-center rounded-lg bg-tint text-brand-cta">
                            <FileText size={16} />
                        </span>
                        <h2
                            id="create-note-title"
                            className="text-[15px] font-semibold tracking-tight text-ink"
                        >
                            Create a new note
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        aria-label="Close"
                        className="grid h-8 w-8 place-items-center rounded-lg text-muted-ink outline-none transition-colors duration-150 hover:bg-paper hover:text-ink focus-visible:ring-2 focus-visible:ring-[color:var(--ds-focus-ring)]"
                    >
                        <X size={15} />
                    </button>
                </div>

                <div className="flex flex-col gap-4 px-5 py-5">
                    <div>
                        <label htmlFor="title" className={labelClass}>
                            Note title
                        </label>
                        <input
                            id="title"
                            ref={titleRef}
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="What's this note about?"
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label htmlFor="description" className={labelClass}>
                            Description{" "}
                            <span className="font-normal text-faint">
                                (optional)
                            </span>
                        </label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Add a short description to find it easily later…"
                            rows={3}
                            className={cn(inputClass, "resize-none")}
                        />
                    </div>

                    <div>
                        <label htmlFor="folder" className={labelClass}>
                            Folder
                        </label>
                        <div className="relative">
                            <span
                                className="pointer-events-none absolute left-3 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full"
                                style={{ backgroundColor: activeColor.dot }}
                            />
                            <select
                                id="folder"
                                value={isNewFolder ? "new" : selectedFolderId}
                                onChange={(e) => {
                                    if (e.target.value === "new") {
                                        setIsNewFolder(true);
                                        setSelectedFolderId("");
                                        return;
                                    }
                                    setIsNewFolder(false);
                                    setSelectedFolderId(e.target.value);
                                }}
                                className={cn(inputClass, "appearance-none pl-7")}
                            >
                                {folders.map((folder) => (
                                    <option key={folder.id} value={folder.id}>
                                        {folder.name}
                                    </option>
                                ))}
                                <option value="new">+ New folder</option>
                            </select>
                        </div>
                    </div>

                    {isNewFolder && (
                        <div>
                            <label htmlFor="newFolder" className={labelClass}>
                                New folder name
                            </label>
                            <input
                                id="newFolder"
                                type="text"
                                value={newFolderName}
                                onChange={(e) =>
                                    setNewFolderName(e.target.value)
                                }
                                onKeyDown={handleKeyDown}
                                placeholder="Enter a folder name"
                                className={inputClass}
                            />
                        </div>
                    )}

                    <p className="text-[11px] text-faint">
                        Tip: press{" "}
                        <kbd className="rounded-[5px] border border-hairline bg-paper px-1.5 py-0.5 font-mono text-[10px] text-body">
                            Ctrl+Enter
                        </kbd>{" "}
                        to create instantly
                    </p>
                </div>

                <div className="flex gap-2 border-t border-hairline bg-paper px-5 py-4">
                    <button
                        onClick={onClose}
                        className="flex-1 rounded-lg border border-hairline bg-surface py-2.5 text-[13px] font-medium text-body outline-none transition-colors duration-150 hover:bg-paper focus-visible:ring-2 focus-visible:ring-[color:var(--ds-focus-ring)] active:scale-[0.98]"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleCreate}
                        disabled={!canCreate}
                        className="flex-1 rounded-lg bg-brand-cta py-2.5 text-[13px] font-semibold text-[color:var(--ds-accent-contrast)] outline-none transition-[transform,filter] duration-150 hover:brightness-105 focus-visible:ring-2 focus-visible:ring-[color:var(--ds-focus-ring)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40 active:scale-[0.98]"
                    >
                        Create note
                    </button>
                </div>
            </div>
        </div>
    );
}
