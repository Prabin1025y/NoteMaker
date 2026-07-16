"use client";
import {
    Check,
    ChevronDown,
    Loader,
    PenBox,
    Plus,
    Save,
    X,
} from "lucide-react";
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
import {
    editorJsonForPreview,
    initialJsonForEditor,
    isValidJson,
    mapTypeToElement,
    MONACO_LANGUAGES,
    MonacoLanguage,
} from "@/utils/UtilFunctions";
import FormulaSection from "./FormulaSection";
import CodeSection from "./CodeSection";
import EditableTable from "./TableSection";
import DividerSelection from "./DividerSelection";
import { ALL_DIVIDERS } from "@/utils/Dividers";
import { Switch } from "../ui/switch";

interface BlockEditorModalProps {
    onClose: () => void;
    onSave: (editorData: EditorData) => void;
    editorData: EditorData;
}

const BlockEditorModal = ({
    onClose,
    onSave,
    editorData,
}: BlockEditorModalProps) => {
    const [disabled, setDisabled] = useState(true);
    const [designEnabled, setDesignEnabled] = useState<boolean>(
        editorData.designId === 0 ? false : true,
    );
    const [isAdding, setIsAdding] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    const [title, setTitle] = useState(editorData.title);
    const [file, setFile] = useState<PreviewFile | null>(null);
    const [currentBlock, setCurrentBlock] = useState<BlockItem | null>(
        allBlocks.find((b) => b.type === editorData.type) || null,
    );
    const [language, setLanguage] = useState<MonacoLanguage>("javascript");
    const [designId, setDesignId] = useState<number>(
        editorData.action === "add" ? 1 : editorData.designId || 1,
    );
    const [colorOptionId, setColorOptionId] = useState<number>(
        editorData.action === "add" ? 1 : editorData.colorOptionId,
    );
    const [content, setContent] = useState(editorData.content);

    const hasValidBlockContent = (value: string) => {
        if (!isValidJson(value)) return false;

        try {
            const parsed = JSON.parse(value);
            const firstLevelContent = parsed?.content;

            if (!Array.isArray(firstLevelContent)) return false;

            const hasTextContent = firstLevelContent.some((item: unknown) => {
                if (typeof item !== "object" || item === null) return false;

                const itemContent = (
                    item as { content?: Array<{ text?: string }> }
                ).content;

                if (!Array.isArray(itemContent)) return false;

                return itemContent.some(
                    (nestedItem) =>
                        typeof nestedItem?.text === "string" &&
                        nestedItem.text.trim() !== "",
                );
            });

            return hasTextContent || firstLevelContent.length > 1;
        } catch {
            return false;
        }
    };

    useEffect(() => {
        const frame = requestAnimationFrame(() => setIsVisible(true));

        return () => cancelAnimationFrame(frame);
    }, []);

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

        if (editorData.action === "save" && editorData.designId === 0) {
            setDesignEnabled(false);
        }

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
        if (
            currentBlock?.type === "code" &&
            MONACO_LANGUAGES.includes(editorData.title.trim())
        ) {
            setLanguage(editorData.title.trim());
        } else if (
            currentBlock?.type === "divider" &&
            !ALL_DIVIDERS.some((divider) => divider.name === content.trim())
        ) {
            setContent(ALL_DIVIDERS[0].name);
        } else if (currentBlock?.type === "formula") {
            setContent("E=mc^2");
        }
    }, [currentBlock, editorData.title]);

    useEffect(() => {
        if (currentBlock) {
            setDisabled(
                (currentBlock.type === "image" &&
                    (file === null || !!!title)) ||
                    (currentBlock.type === "block" &&
                        !hasValidBlockContent(content)),
            );

            if (currentBlock.type !== "image") {
                setFile(null);
            } else setContent(file?.preview.toString() || "");
        }
    }, [currentBlock, file, content, title]);

    // if (!isOpen) return null;

    const handleSave = async () => {
        if (!currentBlock) return;
        setIsAdding(true);
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
            order: editorData.order,
            content:
                currentBlock.type === "image" && !!file ? imageURL : content,
            type: currentBlock.type,
            action: editorData.action,
        });
        setIsAdding(false);
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

    const PreviewComponent = mapTypeToElement(currentBlock.type);
    const designUnavailable = ["image", "divider"].includes(
        currentBlock.type || "",
    );

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm transition-opacity duration-200 ease-out ${isVisible ? "opacity-100" : "opacity-0"}`}
        >
            <div
                className={`flex h-full max-w-7xl w-full flex-col overflow-hidden rounded-2xl bg-white shadow-2xl transition-all duration-200 ease-out ${isVisible ? "translate-y-0 scale-100 opacity-100" : "translate-y-3 scale-95 opacity-0"}`}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-200 px-8 py-5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white">
                            {editorData.action === "add" ? (
                                <Plus size={20} />
                            ) : (
                                <PenBox size={18} />
                            )}
                        </div>
                        <h2 className="text-xl font-semibold text-slate-900">
                            {editorData.action === "add"
                                ? "New Block"
                                : `Edit Block`}
                        </h2>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500 hover:text-slate-700"
                        aria-label="Close editor"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Body: two columns */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Left column: content editor */}
                    <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-8 py-6 min-w-0">
                        {(() => {
                            if (currentBlock.type === "code")
                                return (
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-3">
                                            Language
                                        </label>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button
                                                    type="button"
                                                    className="flex h-9 w-full items-center justify-between gap-2 rounded-md border bg-background px-3 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground"
                                                >
                                                    <span className="capitalize">
                                                        {language}
                                                    </span>
                                                    <ChevronDown className="h-4 w-4 opacity-60" />
                                                </button>
                                            </DropdownMenuTrigger>

                                            <DropdownMenuContent
                                                align="start"
                                                className="max-h-80 w-56 overflow-y-auto"
                                            >
                                                {MONACO_LANGUAGES.map(
                                                    (lang) => (
                                                        <DropdownMenuItem
                                                            key={lang}
                                                            onSelect={() => {
                                                                setLanguage(
                                                                    lang,
                                                                );
                                                                setTitle(lang);
                                                            }}
                                                            className="cursor-pointer"
                                                        >
                                                            <div className="flex w-full items-center justify-between">
                                                                <span className="capitalize">
                                                                    {lang}
                                                                </span>

                                                                {language ===
                                                                    lang && (
                                                                    <Check className="h-4 w-4" />
                                                                )}
                                                            </div>
                                                        </DropdownMenuItem>
                                                    ),
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                );
                            else if (
                                currentBlock.type === "divider" ||
                                currentBlock.type === "heading"
                            )
                                return null;
                            else
                                return (
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-3">
                                            {currentBlock.type === "image"
                                                ? "Caption"
                                                : "Title"}{" "}
                                            <span className="font-normal text-slate-400">
                                                (optional)
                                            </span>
                                        </label>
                                        <input
                                            type="text"
                                            value={title}
                                            onChange={(e) =>
                                                setTitle(e.target.value)
                                            }
                                            placeholder={`${currentBlock.type === "image" ? "Enter caption" : "Enter title (optional)"}`}
                                            className={`w-full px-4 py-3 rounded-lg border border-slate-200 font-medium transition-all outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-offset-1 focus:ring-indigo-300 bg-white text-slate-900`}
                                        />
                                    </div>
                                );
                        })()}
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
                                ["block", "heading"].includes(
                                    currentBlock.type || "",
                                )
                            )
                                return (
                                    <div className="flex-1 flex flex-col min-h-0">
                                        <div className="flex-1 flex flex-col min-h-0 border border-slate-300 rounded-lg overflow-hidden">
                                            <div className="flex-1 min-h-0 overflow-y-auto px-4">
                                                <SimpleEditor
                                                    className="max-w-full h-full"
                                                    initialContent={
                                                        isValidJson(
                                                            editorData.content,
                                                        )
                                                            ? editorData.content
                                                            : initialJsonForEditor
                                                    }
                                                    onChange={(content) => {
                                                        setContent(content);
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            else if (currentBlock.type === "formula")
                                return (
                                    <FormulaSection
                                        content={content}
                                        onChangeHandler={(value) =>
                                            setContent(value)
                                        }
                                    />
                                );
                            else if (currentBlock.type === "code")
                                return (
                                    <CodeSection
                                        onChangeHandler={(value) =>
                                            setContent(value)
                                        }
                                        language={language}
                                        editorData={editorData}
                                    />
                                );
                            else if (currentBlock.type === "table")
                                return (
                                    <EditableTable
                                        onChangeHandler={(value) =>
                                            setContent(value)
                                        }
                                        editorData={editorData}
                                    />
                                );
                            else if (currentBlock.type === "divider")
                                return (
                                    <DividerSelection
                                        colorOptionId={colorOptionId}
                                        setColorOptionId={setColorOptionId}
                                        content={content}
                                        onChangeHandler={(value) =>
                                            setContent(value.trim())
                                        }
                                    />
                                );

                            return "hello";
                        })()}
                    </div>

                    {/* Right column: settings sidebar */}
                    <div className="flex w-85 shrink-0 flex-col overflow-y-auto border-l border-slate-200 bg-slate-50/60 px-6 py-6">
                        {/* <h3 className="text-base font-semibold text-slate-900 mb-5">
                            Block Settings
                        </h3> */}

                        <div className="space-y-6">
                            {/* 1. Block Type */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-3">
                                    1. Block Type
                                </label>
                                <DropdownMenu>
                                    <DropdownMenuTrigger className="w-full">
                                        <div
                                            className={`w-full cursor-pointer text-left p-3 rounded-lg transition-colors border border-slate-200 ${currentBlock.bgColor} ${currentBlock.hoverColor} focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-300`}
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
                                                    {/* <p className="text-xs text-slate-500 truncate">
                                                        {
                                                            currentBlock.description
                                                        }
                                                    </p> */}
                                                </div>
                                                <ChevronDown className="h-4 w-4 mt-0.5 shrink-0 opacity-60" />
                                            </div>
                                        </div>
                                    </DropdownMenuTrigger>
                                    {/* <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]"> */}
                                    <DropdownMenuContent className="min-w-full">
                                        {allBlocks.map((b) => (
                                            <DropdownMenuItem
                                                key={b.type}
                                                onSelect={() =>
                                                    setCurrentBlock(b)
                                                }
                                                className="rounded-none min-w-full"
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
                            <hr />

                            {/* 2. Apply Design */}
                            <div
                                className={`${designUnavailable && "saturate-0 opacity-40 pointer-events-none"} flex items-center justify-between`}
                            >
                                <label
                                    className="text-sm font-semibold text-slate-700 cursor-pointer"
                                    htmlFor="design-switch"
                                >
                                    2. Apply Design
                                </label>
                                <Switch
                                    className="data-checked:bg-indigo-500 data-unchecked:bg-red-500 cursor-pointer"
                                    id="design-switch"
                                    onCheckedChange={(checked) =>
                                        setDesignEnabled(checked)
                                    }
                                />
                                {/* <ToogleButton
                                    setDesignEnabled={setDesignEnabled}
                                    designEnabled={designEnabled}
                                    className=""
                                /> */}
                            </div>
                            <hr />

                            {/* 3 & 4: Design Type + Color Option */}
                            <DesignSelection
                                className={`${(!designEnabled || designUnavailable) && "saturate-0 opacity-40 pointer-events-none"}`}
                                currentBlock={currentBlock}
                                colorOptionId={colorOptionId}
                                designId={designId}
                                setDesignId={setDesignId}
                                setColorOptionId={setColorOptionId}
                            />

                            <hr />

                            <div>
                                <label className="text-sm font-semibold text-slate-700">
                                    5. Preview
                                </label>
                                <div className="mt-2">
                                    {PreviewComponent && (
                                        <PreviewComponent
                                            title={title ? "Title" : ""}
                                            content={(() => {
                                                switch (currentBlock.type) {
                                                    case "formula":
                                                        return "E=mc^2";

                                                    case "image":
                                                        return "https://my.clevelandclinic.org/-/scassets/images/org/health/articles/21704-heart-overview-outside";

                                                    case "code":
                                                        return `//Your code will be here`;
                                                    
                                                    case "divider":
                                                        return content;

                                                    default:
                                                        return editorJsonForPreview;
                                                }
                                            })()}
                                            designId={
                                                designEnabled ? designId : 0
                                            }
                                            colorOptionId={colorOptionId}
                                            onEdit={() => {}}
                                            onDelete={() => {}}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-slate-200 px-8 py-4 bg-slate-50 flex items-center justify-end">
                    <div className="flex gap-3">
                        <button
                            onClick={handleClose}
                            className="px-6 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-100 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={disabled || isAdding}
                            className={`${disabled || isAdding ? " bg-indigo-600/50 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 cursor-pointer"} px-6 py-2  rounded-lg  text-white font-medium  transition-colors flex items-center justify-center w-32`}
                        >
                            {isAdding ? (
                                <Loader className="animate-spin" />
                            ) : editorData.action === "add" ? (
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
        </div>
    );
};

export default BlockEditorModal;
