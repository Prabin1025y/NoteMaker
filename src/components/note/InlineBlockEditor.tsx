"use client";

import {
    useCallback, useEffect, useImperativeHandle, useRef, useState,
    type Ref,
} from "react";
import { createPortal } from "react-dom";
import { Check, LoaderCircle } from "lucide-react";
import type { BlockEditorAction, EditorDataType } from "@/types/Editor";
import { allBlocks } from "@/utils/BlocksInfo";
import { allBlockDesigns } from "@/utils/DesignInfo";
import { colorOptions } from "@/utils/ColorsInfo";
import { useBlockEditorState } from "@/components/EditorModal/block-editor-state";
import {
    getBlockEditorValidationMessage, isBlockEditorUnchanged,
    isBlockEditorValid, prepareBlockEditorData,
} from "@/components/EditorModal/block-editor-save";
import { supportsDesign } from "@/components/EditorModal/block-editor-config";
import BlockContentEditor from "@/components/EditorModal/BlockContentEditor";
import BlockSettingsDrawer from "./BlockSettingsDrawer";
import { Button } from "@/components/ui/button";
import { useInlineEditorDismiss } from "@/hooks/useInlineEditorDismiss";

export interface InlineBlockEditorHandle {
    finish: () => Promise<boolean>;
}

interface InlineBlockEditorProps {
    ref: Ref<InlineBlockEditorHandle>;
    editorData: EditorDataType;
    contentTarget: HTMLDivElement | null;
    toolbarTarget: HTMLDivElement | null;
    settingsTarget: HTMLDivElement | null;
    onSave: (data: EditorDataType) => void;
    onDelete: (id: string) => void;
    onClose: () => void;
}

export default function InlineBlockEditor({
    ref, editorData, contentTarget, toolbarTarget, settingsTarget, onSave, onDelete, onClose,
}: InlineBlockEditorProps) {
    const { state, dispatch } = useBlockEditorState(editorData, { loadImagePreview: false });
    const [expanded, setExpanded] = useState(() =>
        typeof window === "undefined" || window.matchMedia("(min-width: 1024px)").matches,
    );
    const [editorToolbarTarget, setEditorToolbarTarget] = useState<HTMLDivElement | null>(null);
    const [canvasToolbarTarget, setCanvasToolbarTarget] = useState<HTMLDivElement | null>(null);
    const [error, setError] = useState<string | null>(null);
    const pendingFinish = useRef<Promise<boolean> | null>(null);
    const mounted = useRef(false);
    const currentBlock = allBlocks.find(({ type }) => type === state.currentType) ?? allBlocks[0];
    const color = colorOptions.find(({ id }) => id === state.colorOptionId) ?? colorOptions[0];
    const hasDesign = state.designEnabled && supportsDesign(state.currentType);
    const hasTitle = !!state.title.trim();
    const usesBlockFrame = ["block", "heading", "code", "formula"].includes(state.currentType);
    const activeToolbarTarget = state.currentType === "canvas" ? canvasToolbarTarget : toolbarTarget;
    const frameClassName = usesBlockFrame
        ? `${hasDesign ? "my-3 border-2 px-5" : "px-3"} ${hasTitle && (hasDesign || state.currentType === "formula") ? (state.currentType === "code" || state.currentType === "formula" ? "pt-5" : "pt-6") : "pt-3"} pb-3`
        : state.currentType === "table" ? "py-3" : "";

    useEffect(() => {
        mounted.current = true;
        return () => { mounted.current = false; };
    }, []);

    const focusBlock = useCallback(() => {
        const target = contentTarget?.querySelector<HTMLElement>(
            '[contenteditable="true"], textarea, input:not([type="file"]), [tabindex="0"]',
        ) ?? contentTarget?.querySelector<HTMLElement>("section");
        target?.focus({ preventScroll: true });
    }, [contentTarget]);

    const finish = useCallback((): Promise<boolean> => {
        if (pendingFinish.current) return pendingFinish.current;
        if (state.currentType === "image" && !state.file && !state.url.trim()) {
            if (editorData.action === "save") onDelete(editorData.id);
            onClose();
            return Promise.resolve(true);
        }
        const unchanged = isBlockEditorUnchanged(editorData, state);
        const valid = isBlockEditorValid(state);
        // An untouched empty new block is only a draft, not a persisted block.
        if (unchanged && (editorData.action === "save" || !valid)) {
            onClose();
            return Promise.resolve(true);
        }
        if (!valid) {
            setError(getBlockEditorValidationMessage(state));
            focusBlock();
            return Promise.resolve(false);
        }

        dispatch({ type: "setAdding", payload: true });
        const promise = (async () => {
            try {
                const data = await prepareBlockEditorData(editorData, state);
                if (!mounted.current) return false;
                onSave(data);
                onClose();
                return true;
            } catch (cause) {
                if (mounted.current) {
                    setError(cause instanceof Error ? cause.message : "Could not apply changes. Try again.");
                    focusBlock();
                }
                return false;
            } finally {
                pendingFinish.current = null;
                if (mounted.current) dispatch({ type: "setAdding", payload: false });
            }
        })();
        pendingFinish.current = promise;
        return promise;
    }, [dispatch, editorData, focusBlock, onClose, onDelete, onSave, state]);

    useImperativeHandle(ref, () => ({ finish }), [finish]);
    const markInteraction = useInlineEditorDismiss(finish, [contentTarget, toolbarTarget, settingsTarget, canvasToolbarTarget]);
    const editDispatch = useCallback((action: BlockEditorAction) => {
        setError(null);
        dispatch(action);
    }, [dispatch]);

    useEffect(() => {
        if (!contentTarget) return;
        const frame = requestAnimationFrame(() => {
            contentTarget.scrollIntoView({ block: "nearest" });
            focusBlock();
        });
        return () => cancelAnimationFrame(frame);
    }, [contentTarget, focusBlock]);

    return (
        <div className="contents" onPointerDownCapture={markInteraction} onFocusCapture={markInteraction} onKeyDownCapture={markInteraction}>
            {contentTarget && createPortal(
                <section
                    tabIndex={-1}
                    aria-label={`Editing ${currentBlock.title}`}
                    aria-busy={state.isAdding}
                    data-inline-block-editor-content
                    className={`min-w-0 outline-none ${usesBlockFrame ? "pt-2" : ""}`}
                >
                    <div
                        className={`relative min-w-0 rounded-xl outline outline-1 outline-offset-2 outline-(--ds-focus-ring) ${frameClassName}`}
                        style={hasDesign && usesBlockFrame ? {
                            backgroundColor: color.primaryColorHex + "20",
                            borderColor: color.borderColorHex + "80",
                        } : undefined}
                    >
                        <div inert={state.isAdding}>
                            {hasTitle && state.currentType !== "image" && state.currentType !== "canvas" && state.currentType !== "heading" && (
                                state.currentType === "table"
                                    ? <p className="mx-auto max-w-3xl text-center italic">{state.title}</p>
                                    : hasDesign
                                    ? allBlockDesigns.find(({ id }) => id === state.designId)?.applyDesign(
                                        state.title, color.primaryColorHex, color.secondaryColorHex, color.titleColorHex,
                                    )
                                    : <h2 className="text-xl font-bold">{state.title}</h2>
                            )}
                            <BlockContentEditor
                                state={state}
                                dispatch={editDispatch}
                                editorData={editorData}
                                inline
                                toolbarTarget={editorToolbarTarget}
                                drawingToolbarRef={setCanvasToolbarTarget}
                            />
                            {hasTitle && state.currentType === "canvas" && (
                                <p className="mx-auto mt-3 max-w-3xl text-center text-sm italic text-muted-foreground">{state.title}</p>
                            )}
                        </div>
                        <span className="pointer-events-none absolute -bottom-2 left-3 rounded border border-(--ds-focus-ring) bg-card px-2 py-0.5 text-[11px] font-medium text-body">Editing</span>
                    </div>
                    {error && <p role="alert" className="mt-3 text-[13px] text-destructive">{error}</p>}
                </section>, contentTarget,
            )}
            {activeToolbarTarget && createPortal(
                <div className="flex min-h-11 w-full min-w-0 items-center gap-2 px-3">
                    {/* <span className="flex shrink-0 items-center gap-2 border-r border-muted pr-3 text-[12px] font-medium text-body">
                        <span className="text-primary">{currentBlock.icon}</span>
                        <span className="max-md:hidden">{currentBlock.title}</span>
                    </span> */}
                    <div ref={setEditorToolbarTarget} inert={state.isAdding} className="min-w-0 flex-1 overflow-x-auto [scrollbar-width:none]! [&::-webkit-scrollbar]:hidden" />
                    <Button size="sm" disabled={state.isAdding} onClick={() => void finish()} className="shrink-0">
                        {state.isAdding ? <LoaderCircle size={15} className="animate-spin motion-reduce:animate-none" /> : <Check size={15} />}
                        {state.isAdding ? "Applying…" : "Done"}
                    </Button>
                </div>, activeToolbarTarget,
            )}
            {settingsTarget && createPortal(
                <BlockSettingsDrawer
                    state={state}
                    dispatch={editDispatch}
                    currentBlock={currentBlock}
                    expanded={expanded}
                    onExpandedChange={setExpanded}
                    onPickImage={() => contentTarget?.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
                />, settingsTarget,
            )}
        </div>
    );
}
