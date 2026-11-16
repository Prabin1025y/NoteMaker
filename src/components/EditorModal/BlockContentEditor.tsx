"use client";
import { useCallback } from "react";
import type { Dispatch, RefCallback } from "react";
import { SimpleEditor } from "../tiptap/tiptap-templates/simple/simple-editor";
import {
    BlockEditorAction,
    BlockEditorState,
    EditorDataType,
} from "@/types/Editor";
import CodeSection from "./CodeSection";
import FormulaSection from "./FormulaSection";
import EditableTable from "./TableSection";
import DividerSelection from "./DividerSelection";
import { ImageDropZone, PreviewFile } from "../ImageUploader";
import BlockEditorFields from "./BlockEditorFields";
import DrawCanvasSection from "./DrawCanvasSection";
import { TableState } from "./TableSection";
import {
    CanvasEditorContentSchema,
    JSONContentSchema,
    TableStateSchema,
} from "@/validation/editorData";
import { ALL_DIVIDERS } from "@/utils/Dividers";
import { colorOptions } from "@/utils/ColorsInfo";

interface BlockContentEditorProps {
    state: BlockEditorState;
    dispatch: Dispatch<BlockEditorAction>;
    editorData: EditorDataType;
    inline?: boolean;
    toolbarTarget?: HTMLDivElement | null;
    drawingToolbarRef?: RefCallback<HTMLDivElement>;
}

const BlockContentEditor = ({
    state,
    dispatch,
    editorData,
    inline = false,
    toolbarTarget,
    drawingToolbarRef,
}: BlockContentEditorProps) => {
    const updateFile = (file: PreviewFile | null) => {
        dispatch({ type: "setFile", payload: file });
    };

    const updateColorOptionId = (id: number) => {
        dispatch({ type: "setColorOptionId", payload: id });
    };

    const handleTableChange = useCallback(
        (value: TableState) => dispatch({ type: "setContent", payload: value }),
        [dispatch],
    );

    const renderEditor = () => {
        switch (state.currentType) {
            case "image":
                return (
                    <ImageDropZone
                        file={state.file}
                        setFile={updateFile}
                        editorData={{ title: state.title }}
                        url={inline ? state.url : undefined}
                        showActions={!inline}
                        inline={inline}
                        onRemoveImage={() => {
                            updateFile(null);
                            dispatch({ type: "setUrl", payload: "" });
                        }}
                    />
                );
            case "block":
            case "heading": {
                const result = JSONContentSchema.safeParse(state.content);
                if (!result.success) return null;
                return (
                    <div className={inline ? `min-w-0 ${state.designEnabled || state.title.trim() ? "pt-2" : "pt-1"} pb-1` : "flex-1 flex flex-col min-h-0"}>
                        <div className={inline ? "min-w-0" : "flex-1 flex flex-col min-h-0 border border-muted rounded-lg overflow-hidden"}>
                            <div className={inline ? "min-w-0" : "flex-1 min-h-0 overflow-y-auto px-4"}>
                                <SimpleEditor
                                    key={state.currentType}
                                    className="max-w-full h-full"
                                    initialContent={result.data}
                                    inline={inline}
                                    toolbarTarget={toolbarTarget}
                                    onChange={(content) =>
                                        dispatch({
                                            type: "setContent",
                                            payload: content,
                                        })
                                    }
                                />
                            </div>
                        </div>
                    </div>
                );
            }
            case "formula":
                if (typeof state.content !== "string") return null;
                return (
                    <FormulaSection
                        content={state.content}
                        inline={inline}
                        onChangeHandler={(value) =>
                            dispatch({ type: "setContent", payload: value })
                        }
                    />
                );
            case "code":
                if (typeof state.content !== "string") return null;
                return (
                    <CodeSection
                        language={state.language}
                        content={state.content}
                        height={inline ? "min(60vh, 480px)" : undefined}
                        autoFocus={inline}
                        onChangeHandler={(value) =>
                            dispatch({ type: "setContent", payload: value })
                        }
                    />
                );
            case "table":
                if (!TableStateSchema.safeParse(state.content).success) {
                    return null;
                }
                return (
                    <div className={inline && !state.designEnabled ? "pt-2" : undefined}>
                        <EditableTable
                            key={state.currentType}
                            onChangeHandler={handleTableChange}
                            editorData={editorData}
                            initialContent={inline ? TableStateSchema.parse(state.content) : undefined}
                            toolbarTarget={toolbarTarget}
                            colorOptionId={state.colorOptionId}
                        />
                    </div>
                );
            case "divider":
                if (typeof state.content !== "string") return null;
                if (inline) {
                    const Divider = ALL_DIVIDERS.find(({ name }) => name === state.content)?.component;
                    const color = colorOptions.find(({ id }) => id === state.colorOptionId);
                    return Divider ? <Divider color={color?.borderColorHex} width="full" className="w-full py-4" /> : null;
                }
                return (
                    <DividerSelection
                        colorOptionId={state.colorOptionId}
                        setColorOptionId={updateColorOptionId}
                        content={state.content}
                        onChangeHandler={(value) =>
                            dispatch({
                                type: "setContent",
                                payload: value.trim(),
                            })
                        }
                    />
                );
            case "canvas":
                {
                    const result = CanvasEditorContentSchema.safeParse(
                        state.content,
                    );
                    if (!result.success) return null;
                    return (
                        <DrawCanvasSection
                            content={result.data}
                            inline={inline}
                            toolbarRef={drawingToolbarRef}
                            toolbarTarget={toolbarTarget}
                            onChangeHandler={(value) =>
                                dispatch({ type: "setContent", payload: value })
                            }
                        />
                    );
                }
            default:
                return null;
        }
    };

    return (
        <div className={inline ? "min-w-0" : "flex flex-1 flex-col gap-5 overflow-y-auto px-8 py-6 min-w-0 mr-10 xl:mr-0"}>
            {!inline && <BlockEditorFields state={state} dispatch={dispatch} />}
            {renderEditor()}
        </div>
    );
};

export default BlockContentEditor;
