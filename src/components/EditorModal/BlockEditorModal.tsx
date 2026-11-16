"use client";
import { useCallback, useEffect, useMemo } from "react";
import { EditorDataType } from "@/types/Editor";
import { allBlocks } from "@/utils/BlocksInfo";
import { useBlockEditorState } from "./block-editor-state";
import BlockEditorHeader from "./BlockEditorHeader";
import BlockContentEditor from "./BlockContentEditor";
import BlockSettingsSidebar from "./BlockSettingsSidebar";
import BlockEditorFooter from "./BlockEditorFooter";
import { useNoteStore } from "@/Context/DataStore";
import { isBlockEditorValid, prepareBlockEditorData } from "./block-editor-save";

interface BlockEditorModalProps {
    onSave: (editorData: EditorDataType) => void;
}

const BlockEditorModal = ({ onSave }: BlockEditorModalProps) => {
    const { editorDataState, setIsEditorOpen } = useNoteStore();
    const { state, dispatch } = useBlockEditorState(editorDataState);

    const currentBlock = useMemo(
        () =>
            allBlocks.find((block) => block.type === state.currentType) ||
            allBlocks[0],
        [state.currentType],
    );

    const isValid = isBlockEditorValid(state);

    const handleSave = useCallback(async () => {
        if (!isValid) return;

        dispatch({ type: "setAdding", payload: true });

        try {
            onSave(await prepareBlockEditorData(editorDataState, state));
        } finally {
            dispatch({ type: "setAdding", payload: false });
        }
    }, [dispatch, editorDataState, isValid, onSave, state]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.ctrlKey && event.shiftKey && event.key === "Enter") {
                event.preventDefault();
                void handleSave();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [handleSave]);

    const handleClose = () => {
        setIsEditorOpen(false);
    };


    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setIsEditorOpen(false);
        };
        window.addEventListener("keydown", onKey);
        // const id = window.setTimeout(() => panelRef.current?.focus(), 30);
        return () => {
            window.removeEventListener("keydown", onKey);
            // window.clearTimeout(id);
        };
    }, [setIsEditorOpen]);

    if (!currentBlock) {
        return null;
    }

    return (
        <div
            className="ds-animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/40 md:p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-label={
                editorDataState.action === "add"
                    ? "New block editor"
                    : "Edit block editor"
            }
        >
            <div
                tabIndex={-1}
                className="ds-animate-fade-up flex h-full w-full max-w-375 flex-col overflow-hidden md:rounded-2xl border border-muted bg-card shadow-2xl outline-none"
            >
                <BlockEditorHeader
                    action={editorDataState.action}
                    onClose={handleClose}
                />
                <div className="flex flex-1 overflow-hidden relative">
                    <BlockContentEditor
                        state={state}
                        dispatch={dispatch}
                        editorData={editorDataState}
                    />
                    <BlockSettingsSidebar
                        state={state}
                        dispatch={dispatch}
                        currentBlock={currentBlock}
                    />
                </div>
                <BlockEditorFooter
                    onClose={handleClose}
                    onSave={handleSave}
                    disabled={!isValid}
                    isAdding={state.isAdding}
                    action={editorDataState.action}
                />
            </div>
        </div>
    );
};

export default BlockEditorModal;
