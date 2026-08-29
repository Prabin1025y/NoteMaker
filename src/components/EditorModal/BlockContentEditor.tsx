"use client";
import { useCallback } from "react";
import type { Dispatch } from "react";
import { Check, ChevronDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { SimpleEditor } from "../tiptap/tiptap-templates/simple/simple-editor";
import { EditorData } from "@/types/Editor";
import { MONACO_LANGUAGES } from "@/utils/UtilFunctions";
import { BlockEditorState, BlockEditorAction } from "./block-editor-state";
import CodeSection from "./CodeSection";
import FormulaSection from "./FormulaSection";
import EditableTable from "./TableSection";
import DividerSelection from "./DividerSelection";
import CanvasSection from "./CanvasSection";
import { ImageDropZone, PreviewFile } from "../ImageUploader";
import { getBlockTypeConfig } from "./block-editor-config";

interface BlockContentEditorProps {
    state: BlockEditorState;
    dispatch: Dispatch<BlockEditorAction>;
    editorData: EditorData;
}

const BlockContentEditor = ({ state, dispatch, editorData }: BlockContentEditorProps) => {
    const config = getBlockTypeConfig(state.currentType);
    const showTitleInput = config.showTitleField;

    const renderTitleInput = () => {
        if (state.currentType === "code") {
            return (
                <div>
                    <label className="mb-3 block text-[13px] font-semibold text-body">Language</label>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                type="button"
                                className="flex h-9 w-full items-center justify-between gap-2 rounded-md border border-[color:var(--ds-border-input)] bg-background/80 px-3 text-sm font-medium text-ink outline-none transition-colors duration-150 hover:bg-background focus-visible:ring-2 focus-visible:ring-primary/60"
                            >
                                <span className="capitalize">{state.language}</span>
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="max-h-80 w-56 overflow-y-auto">
                            {MONACO_LANGUAGES.map((lang) => (
                                <DropdownMenuItem
                                    key={lang}
                                    onSelect={() => dispatch({ type: "setLanguage", payload: lang })}
                                    className="cursor-pointer"
                                >
                                    <div className="flex w-full items-center justify-between">
                                        <span className="capitalize">{lang}</span>
                                        {state.language === lang && <Check className="h-4 w-4" />}
                                    </div>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            );
        }

        if (!showTitleInput) return null;

        return (
            <div>
                <label className="mb-3 block text-[13px] font-semibold text-body">
                    {state.currentType === "image" ||
                    state.currentType === "canvas"
                        ? "Caption"
                        : "Title"}{" "}
                    <span className="font-normal text-muted-foreground">(optional)</span>
                </label>
                <input
                    type="text"
                    value={state.title}
                    onChange={(e) => dispatch({ type: "setTitle", payload: e.target.value })}
                    placeholder={
                        state.currentType === "image" ||
                        state.currentType === "canvas"
                            ? "Enter caption"
                            : "Enter title (optional)"
                    }
                    className="w-full rounded-md border border-muted bg-background/70 px-3 py-2.5 text-[13px] font-medium text-ink outline-none transition-colors duration-150 placeholder:text-muted-foreground focus-visible:border-[color:var(--ds-focus-ring)] focus-visible:ring-2 focus-visible:ring-[color:var(--ds-focus-ring)]"
                />
            </div>
        );
    };

    const updateFile = (file: PreviewFile | null) => {
        dispatch({ type: "setFile", payload: file });
    };

    const updateColorOptionId = (id: number) => {
        dispatch({ type: "setColorOptionId", payload: id });
    };

    const handleTableChange = useCallback(
        (value: string) => dispatch({ type: "setContent", payload: value }),
        [dispatch],
    );

    const renderEditor = () => {
        switch (state.currentType) {
            case "image":
                return <ImageDropZone file={state.file} setFile={updateFile} editorData={editorData} />;
            case "block":
            case "heading":
                return (
                    <div className="flex-1 flex flex-col min-h-0">
                        <div className="flex-1 flex flex-col min-h-0 border border-muted rounded-lg overflow-hidden">
                            <div className="flex-1 min-h-0 overflow-y-auto px-4">
                                <SimpleEditor
                                    key={state.currentType}
                                    className="max-w-full h-full"
                                    initialContent={state.content}
                                    onChange={(content) => dispatch({ type: "setContent", payload: content })}
                                />
                            </div>
                        </div>
                    </div>
                );
            case "formula":
                return <FormulaSection content={state.content} onChangeHandler={(value) => dispatch({ type: "setContent", payload: value })} />;
            case "code":
                return <CodeSection language={state.language} content={state.content} onChangeHandler={(value) => dispatch({ type: "setContent", payload: value })} />;
            case "table":
                return <EditableTable onChangeHandler={handleTableChange} editorData={editorData} />;
            case "divider":
                return <DividerSelection colorOptionId={state.colorOptionId} setColorOptionId={updateColorOptionId} content={state.content} onChangeHandler={(value) => dispatch({ type: "setContent", payload: value.trim() })} />;
            case "canvas":
                return (
                    <CanvasSection
                        content={state.content}
                        onChangeHandler={(value) =>
                            dispatch({ type: "setContent", payload: value })
                        }
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-8 py-6 min-w-0">
            {renderTitleInput()}
            {renderEditor()}
        </div>
    );
};

export default BlockContentEditor;
