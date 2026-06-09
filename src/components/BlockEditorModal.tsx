"use client";
import { Save, X } from "lucide-react";
import { useEffect, useState } from "react";
import { BlockItem, allBlocks } from "@/utils/BlocksInfo";
import { allBlockDesigns } from "@/utils/DesignInfo";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { EditorData } from "@/types/Editor";
import { SimpleEditor } from "./tiptap/tiptap-templates/simple/simple-editor";

interface BlockEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (editorData: EditorData) => void;
    editorData: EditorData;
}

const BlockEditorModal = ({
    isOpen,
    onClose,
    onSave,
    editorData,
}: BlockEditorModalProps) => {
    const [title, setTitle] = useState(editorData.title);
    const [currentBlock, setCurrentBlock] = useState<BlockItem | null>(
        allBlocks.find((b) => b.type === editorData.type) || null,
    );
    const [designId, setDesignId] = useState<number>(
        editorData.action === "add"
            ? allBlocks.find((b) => b.type === editorData.type)
                  ?.defaultDesignId || 1
            : editorData.designId,
    );
    const [content, setContent] = useState(editorData.content);

    useEffect(() => {
        setTitle(editorData.title);
        setCurrentBlock(
            allBlocks.find((b) => b.type === editorData.type) || null,
        );
        setContent(editorData.content);
        setDesignId(
            editorData.action === "add"
                ? allBlocks.find((b) => b.type === editorData.type)
                      ?.defaultDesignId || 1
                : editorData.designId,
        );
    }, [editorData]);

    if (!isOpen) return null;

    const handleSave = () => {
        onSave({
            id: editorData.id,
            designId: designId,
            title,
            content,
            type: currentBlock?.type || "text",
            action: editorData.action,
        });
        setTitle("");
    };

    const handleClose = () => {
        setTitle("");
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div
                className={`bg-white rounded-2xl shadow-2xl max-w-5xl w-full h-full overflow-hidden flex flex-col`}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-200 px-8 py-6">
                    <h2 className={`text-2xl font-semibold text-slate-900`}>
                        {currentBlock?.title} Block
                    </h2>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500 hover:text-slate-700"
                        aria-label="Close editor"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto flex flex-col px-8 py-6 space-y-6">
                    {/* Type Dropdown */}
                    <div className="flex gap-5">
                        <div className="flex-1">
                            <label className="block text-sm font-semibold text-slate-700 mb-3">
                                Block Type
                            </label>
                            <DropdownMenu>
                                <DropdownMenuTrigger className="w-full">
                                    <div
                                        className={`w-full cursor-pointer text-left p-3 rounded-lg transition-colors border border-transparent ${currentBlock?.bgColor} ${currentBlock?.hoverColor} focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-orange-300`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div
                                                className={`shrink-0 mt-0.5 ${currentBlock?.color}`}
                                            >
                                                {currentBlock?.icon}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3
                                                    className={`text-sm font-semibold ${currentBlock?.color}`}
                                                >
                                                    {currentBlock?.title}
                                                </h3>
                                                <p className="text-xs text-slate-500 truncate">
                                                    {currentBlock?.description}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    {allBlocks.map((b) => (
                                        <DropdownMenuItem
                                            key={b.type}
                                            onSelect={() => setCurrentBlock(b)}
                                            className="rounded-none"
                                            asChild
                                        >
                                            <div
                                                className={`w-full cursor-pointer text-left p-3 transition-colors border border-transparent ${b.bgColor} ${b.hoverColor} hover:border-slate-300`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div
                                                        className={`shrink-0 mt-0.5 ${b.color}`}
                                                    >
                                                        {b.icon}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3
                                                            className={`text-sm font-semibold ${b.color}`}
                                                        >
                                                            {b.title}
                                                        </h3>
                                                        <p className="text-xs text-slate-500 truncate">
                                                            {b.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    {/* second part */}
                    <div className="flex gap-5">
                        <div className="flex-1">
                            <label className="block text-sm font-semibold text-slate-700 mb-3">
                                Design Type
                            </label>
                            <DropdownMenu>
                                <DropdownMenuTrigger className="w-full border cursor-pointer hover:bg-amber-50 border-dashed rounded-lg flex items-center justify-center py-2">
                                    {
                                        allBlockDesigns.find(
                                            (b) => b.id === designId,
                                        )?.exampleDesign
                                    }
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    {allBlockDesigns.map((b) => (
                                        <DropdownMenuItem
                                            key={b.id}
                                            onSelect={() => setDesignId(b.id)}
                                            className="rounded-none flex items-center justify-center py-2"
                                        >
                                            {b.exampleDesign}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-semibold text-slate-700 mb-3">
                                Color Options
                            </label>
                            <DropdownMenu>
                                <DropdownMenuTrigger className="w-full">
                                    <div
                                        className={`w-full cursor-pointer text-left p-3 rounded-lg transition-colors border border-transparent ${currentBlock?.bgColor} ${currentBlock?.hoverColor} focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-orange-300`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div
                                                className={`shrink-0 mt-0.5 ${currentBlock?.color}`}
                                            >
                                                {currentBlock?.icon}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3
                                                    className={`text-sm font-semibold ${currentBlock?.color}`}
                                                >
                                                    {currentBlock?.title}
                                                </h3>
                                                <p className="text-xs text-slate-500 truncate">
                                                    {currentBlock?.description}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    {allBlocks.map((b) => (
                                        <DropdownMenuItem
                                            key={b.type}
                                            onSelect={() => setCurrentBlock(b)}
                                            className="rounded-none"
                                            asChild
                                        >
                                            <div
                                                className={`w-full cursor-pointer text-left p-3 transition-colors border border-transparent ${b.bgColor} ${b.hoverColor} hover:border-slate-300`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div
                                                        className={`shrink-0 mt-0.5 ${b.color}`}
                                                    >
                                                        {b.icon}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3
                                                            className={`text-sm font-semibold ${b.color}`}
                                                        >
                                                            {b.title}
                                                        </h3>
                                                        <p className="text-xs text-slate-500 truncate">
                                                            {b.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    {/* Title Input */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-3">
                            Title
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter title (optional)"
                            className={`w-full px-4 py-3 rounded-lg border border-transparent font-medium transition-all outline-none placeholder:text-slate-400 hover:shadow-md focus:ring-2 focus:ring-offset-1 focus:ring-orange-300 bg-white text-slate-900`}
                        />
                    </div>

                    {/* Content Editor */}
                    <div className="flex-1 flex flex-col">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Content
                        </label>
                        <div className="border flex-1 border-slate-300 rounded-lg overflow-hidden ">
                            {/* Editor */}
                            <div className=" p-4 min-h-64 max-h-[400px] overflow-y-hidden">
                                <SimpleEditor
                                    className="max-w-full max-h-[400px]"
                                    initialContent={editorData.content}
                                    onChange={(content) => setContent(content)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-slate-200 px-8 py-4 bg-slate-50 flex gap-3 justify-end">
                    <button
                        onClick={handleClose}
                        className="px-6 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-100 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-6 py-2 cursor-pointer rounded-lg bg-orange-500 text-white font-medium hover:bg-orange-600 transition-colors"
                    >
                        {editorData.action === "add" ? (
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
        </div>
    );
};

export default BlockEditorModal;
