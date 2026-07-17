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
                    <label className="block text-sm font-semibold text-slate-700 mb-3">Language</label>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                type="button"
                                className="flex h-9 w-full items-center justify-between gap-2 rounded-md border bg-background px-3 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground"
                            >
                                <span className="capitalize">{state.language}</span>
                                <ChevronDown className="h-4 w-4 opacity-60" />
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
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                    {state.currentType === "image" ? "Caption" : "Title"}{" "}
                    <span className="font-normal text-slate-400">(optional)</span>
                </label>
                <input
                    type="text"
                    value={state.title}
                    onChange={(e) => dispatch({ type: "setTitle", payload: e.target.value })}
                    placeholder={
                        state.currentType === "image"
                            ? "Enter caption"
                            : "Enter title (optional)"
                    }
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 font-medium transition-all outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-offset-1 focus:ring-indigo-300 bg-white text-slate-900"
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
                        <div className="flex-1 flex flex-col min-h-0 border border-slate-300 rounded-lg overflow-hidden">
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
