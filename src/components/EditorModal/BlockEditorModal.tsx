"use client";
import { Divide, Save, X } from "lucide-react";
import { useEffect, useState } from "react";
import { BlockItem, allBlocks } from "@/utils/BlocksInfo";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { EditorData } from "@/types/Editor";
import { SimpleEditor } from "../tiptap/tiptap-templates/simple/simple-editor";
import DesignSelection from "./DesignSelection";
import { ImageDropZone, type PreviewFile } from "../ImageUploader";
import { initialJsonForEditor, isValidJson } from "@/utils/UtilFunctions";
import FormulaSection from "./FormulaSection";
import ToogleButton from "../ui/ToogleButton";

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
    const [disabled, setDisabled] = useState(true);
    const [designEnabled, setDesignEnabled] = useState<boolean>(true);

    const [title, setTitle] = useState(editorData.title);
    const [file, setFile] = useState<PreviewFile | null>(null);
    const [currentBlock, setCurrentBlock] = useState<BlockItem | null>(
        allBlocks.find((b) => b.type === editorData.type) || null,
    );
    const [designId, setDesignId] = useState<number>(
        editorData.action === "add" ? 1 : editorData.designId || 1,
    );
    const [colorOptionId, setColorOptionId] = useState<number>(
        editorData.action === "add" ? 1 : editorData.colorOptionId,
    );
    const [content, setContent] = useState(editorData.content);

    useEffect(() => {
        setTitle(editorData.title);
        setCurrentBlock(
            allBlocks.find((b) => b.type === editorData.type) || null,
        );
        setContent(editorData.content);
        setColorOptionId(
            editorData.action === "add" ? 1 : editorData.colorOptionId,
        );
        setDesignId(editorData.action === "add" ? 1 : editorData.designId || 1);

        (async () => {
            if (editorData.action === "save" && editorData.type === "image") {
                const response = await fetch(editorData.content);
                const blob = await response.blob();

                const new_file = new File([blob], editorData.title, {
                    type: blob.type,
                });

                const withPreview = Object.assign(new_file, {
                    preview: URL.createObjectURL(new_file),
                });

                setFile((prev) => {
                    if (prev) URL.revokeObjectURL(prev.preview);
                    return withPreview;
                });
                // setFile(new_file);
            }
        })();
    }, [editorData]);

    useEffect(() => {
        if (currentBlock) {
            setDisabled(
                (currentBlock.type === "image" &&
                    (file === null || !!!title)) ||
                    (["text", "block"].includes(currentBlock.type) &&
                        isValidJson(content) &&
                        !!!JSON.parse(
                            content,
                        )?.content?.[0].content?.[0].text?.trim()),
            );

            if (currentBlock.type !== "image") {
                setFile(null);
            } else setContent(file?.preview.toString() || "");
        }
    }, [currentBlock, file, content, title]);

    if (!isOpen) return null;

    const handleSave = async () => {
        if (!currentBlock) return;
        let imageURL = "";
        if (currentBlock.type === "image" && !!file) {
            const formData = new FormData();
            formData.append("image", file);
            const response = await fetch("/api/upload-image", {
                method: "POST",
                body: formData,
            });
            const data = await response.json();
            imageURL = data.url;
        }

        onSave({
            id: editorData.id,
            designId: designEnabled ? designId : 0,
            colorOptionId: colorOptionId || 1,
            title,
            content:
                currentBlock.type === "image" && !!file ? imageURL : content,
            type: currentBlock.type,
            action: editorData.action,
        });
        setContent(initialJsonForEditor);
        setFile(null);
        setTitle("");
    };

    const handleClose = () => {
        setTitle("");
        setFile(null);
        onClose();
    };

    if (!currentBlock) return <div>Loading...</div>;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div
                className={`bg-white rounded-2xl shadow-2xl max-w-5xl w-full h-full overflow-hidden flex flex-col`}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-200 px-8 py-6">
                    <h2 className={`text-2xl font-semibold text-slate-900`}>
                        {currentBlock.title} Block
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
                                        className={`w-full cursor-pointer text-left p-3 rounded-lg transition-colors border border-transparent ${currentBlock.bgColor} ${currentBlock.hoverColor} focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-orange-300`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div
                                                className={`shrink-0 mt-0.5 ${currentBlock.color}`}
                                            >
                                                {currentBlock.icon}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3
                                                    className={`text-sm font-semibold ${currentBlock.color}`}
                                                >
                                                    {currentBlock.title}
                                                </h3>
                                                <p className="text-xs text-slate-500 truncate">
                                                    {currentBlock.description}
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
                        <div className="flex flex-col items-center">
                            <label className="block text-sm font-semibold text-slate-700 mb-3">
                                Apply Design
                            </label>
                            <ToogleButton
                                setDesignEnabled={setDesignEnabled}
                                designEnabled={designEnabled}
                                className="flex-1"
                            />
                        </div>
                    </div>

                    {/* second part */}
                    {!["text", "image"].includes(currentBlock.type || "") &&
                        designEnabled && (
                            <DesignSelection
                                colorOptionId={colorOptionId}
                                designId={designId}
                                setDesignId={setDesignId}
                                setColorOptionId={setColorOptionId}
                            />
                        )}

                    {/* Title Input */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-3">
                            {currentBlock.type === "image"
                                ? "Caption"
                                : "Title"}
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder={`${currentBlock.type === "image" ? "Enter caption" : "Enter title (optional)"}`}
                            className={`w-full px-4 py-3 rounded-lg border border-transparent font-medium transition-all outline-none placeholder:text-slate-400 hover:shadow-md focus:ring-2 focus:ring-offset-1 focus:ring-orange-300 bg-white text-slate-900`}
                        />
                    </div>

                    {/* Content Editor */}
                    {(() => {
                        if (currentBlock.type === "image")
                            return (
                                <ImageDropZone
                                    editorData={editorData}
                                    file={file}
                                    setFile={setFile}
                                />
                            );
                        else if (
                            ["block", "text"].includes(currentBlock.type || "")
                        )
                            return (
                                <div className="flex-1 flex flex-col">
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Content
                                    </label>
                                    <div className="border flex-1 border-slate-300 rounded-lg overflow-hidden ">
                                        {/* Editor */}
                                        <div className=" p-4 min-h-64 max-h-100 overflow-y-hidden">
                                            {
                                                <SimpleEditor
                                                    className="max-w-full max-h-100"
                                                    initialContent={
                                                        isValidJson(
                                                            editorData.content,
                                                        )
                                                            ? editorData.content
                                                            : initialJsonForEditor
                                                    }
                                                    onChange={(content) => {
                                                        console.log(content);
                                                        setContent(content);
                                                    }}
                                                />
                                            }
                                        </div>
                                    </div>
                                </div>
                            );
                        else if (currentBlock.type === "formula")
                            return (
                                <FormulaSection
                                    content={content}
                                    onChangeHandler={(content) =>
                                        setContent(content)
                                    }
                                />
                            );

                        return "hello";
                    })()}
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
                        disabled={disabled}
                        className={`${disabled ? " bg-orange-500/50 cursor-not-allowed" : "bg-orange-500 hover:bg-orange-600 cursor-pointer"} px-6 py-2  rounded-lg  text-white font-medium  transition-colors`}
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
