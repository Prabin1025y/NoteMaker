"use client";

import { useId, type Dispatch } from "react";
import { PanelRightClose, PanelRightOpen, ImagePlus, Trash2 } from "lucide-react";
import type { BlockEditorAction, BlockEditorState } from "@/types/Editor";
import type { BlockItem } from "@/utils/BlocksInfo";
import BlockEditorFields from "@/components/EditorModal/BlockEditorFields";
import BlockTypeSelector from "@/components/EditorModal/BlockTypeSelector";
import DesignSelection from "@/components/EditorModal/DesignSelection";
import DividerSelection from "@/components/EditorModal/DividerSelection";
import { supportsDesign } from "@/components/EditorModal/block-editor-config";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

interface BlockSettingsDrawerProps {
    state: BlockEditorState;
    dispatch: Dispatch<BlockEditorAction>;
    currentBlock: BlockItem;
    expanded: boolean;
    onExpandedChange: (expanded: boolean) => void;
    onPickImage: () => void;
}

export default function BlockSettingsDrawer({
    state, dispatch, currentBlock, expanded, onExpandedChange,
    onPickImage,
}: BlockSettingsDrawerProps) {
    const id = useId();
    const hasDesign = supportsDesign(state.currentType);

    return (
        <div className={`h-full ${expanded ? "w-72 max-w-[calc(100vw-3rem)]" : "w-10"}`}>
            <aside
                aria-label="Block settings"
                aria-busy={state.isAdding}
                className="relative flex h-full w-full flex-col overflow-hidden border-l border-muted bg-card shadow-lg"
            >
                {!expanded && (
                    <button
                        type="button"
                        onClick={() => onExpandedChange(true)}
                        aria-label="Expand block settings"
                        aria-expanded={false}
                        aria-controls={`${id}-settings`}
                        className="mx-auto mt-3 flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-primary/10 hover:text-primary focus-visible:ring-2 focus-visible:ring-(--ds-focus-ring)"
                    >
                        <PanelRightOpen size={16} />
                    </button>
                )}
                <div id={`${id}-settings`} className={expanded ? "flex min-h-0 flex-1 flex-col" : "hidden"}>
                    <div className="flex items-center justify-between border-b border-muted px-4 py-3">
                        <h2 className="text-[13px] font-semibold text-ink">Block settings</h2>
                        <button
                            type="button"
                            onClick={() => onExpandedChange(false)}
                            aria-label="Collapse block settings"
                            aria-expanded={true}
                            aria-controls={`${id}-settings`}
                            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-primary/10 hover:text-primary focus-visible:ring-2 focus-visible:ring-(--ds-focus-ring)"
                        >
                            <PanelRightClose size={16} />
                        </button>
                    </div>
                    <div inert={state.isAdding} className="min-h-0 flex-1 space-y-6 overflow-y-auto px-4 py-5">
                        <BlockTypeSelector
                            currentBlock={currentBlock}
                            onTypeChange={(type) => {
                                if (type !== state.currentType) dispatch({ type: "setType", payload: type });
                            }}
                        />
                        <BlockEditorFields state={state} dispatch={dispatch} />
                        {hasDesign && (
                            <div className="flex items-center justify-between gap-3">
                                <label htmlFor={`${id}-design`} className="text-[13px] font-semibold text-body">Apply Design</label>
                                <Switch
                                    id={`${id}-design`}
                                    checked={state.designEnabled}
                                    onCheckedChange={(checked) => dispatch({ type: "setDesignEnabled", payload: checked })}
                                    className="data-checked:bg-primary data-unchecked:bg-muted-foreground"
                                />
                            </div>
                        )}
                        {state.currentType === "divider" && typeof state.content === "string" && (
                            <DividerSelection
                                content={state.content}
                                colorOptionId={state.colorOptionId}
                                setColorOptionId={(value) => dispatch({ type: "setColorOptionId", payload: value })}
                                onChangeHandler={(value) => dispatch({ type: "setContent", payload: value })}
                                showColorOptions={false}
                            />
                        )}
                        {(hasDesign || state.currentType === "divider") && (
                            <DesignSelection
                                currentBlock={currentBlock}
                                designId={state.designId}
                                colorOptionId={state.colorOptionId}
                                setDesignId={(value) => dispatch({ type: "setDesignId", payload: value })}
                                setColorOptionId={(value) => dispatch({ type: "setColorOptionId", payload: value })}
                                showDesign={hasDesign}
                                designDisabled={!state.designEnabled}
                            />
                        )}
                        {state.currentType === "image" && (
                            <div className="flex flex-col gap-2">
                                <Button variant="outline" onClick={onPickImage}>
                                    <ImagePlus size={15} />
                                    {state.file || state.url ? "Replace image" : "Choose image"}
                                </Button>
                                <Button
                                    variant="outline"
                                    disabled={!state.file && !state.url}
                                    onClick={() => {
                                        dispatch({ type: "setFile", payload: null });
                                        dispatch({ type: "setUrl", payload: "" });
                                    }}
                                >
                                    <Trash2 size={15} />Remove image
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </aside>
        </div>
    );
}
