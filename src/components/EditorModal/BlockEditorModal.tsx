"use client";
import { useMemo } from "react";
import { EditorData } from "@/types/Editor";
import { allBlocks } from "@/utils/BlocksInfo";
import { useBlockEditorState } from "./block-editor-state";
import BlockEditorHeader from "./BlockEditorHeader";
import BlockContentEditor from "./BlockContentEditor";
import BlockSettingsSidebar from "./BlockSettingsSidebar";
import BlockEditorFooter from "./BlockEditorFooter";
import { getBlockTypeConfig } from "./block-editor-config";

interface BlockEditorModalProps {
    onClose: () => void;
    onSave: (editorData: EditorData) => void;
    editorData: EditorData;
}

const BlockEditorModal = ({ onClose, onSave, editorData }: BlockEditorModalProps) => {
    const { state, dispatch } = useBlockEditorState(editorData);

    const currentBlock = useMemo(
        () => allBlocks.find((block) => block.type === state.currentType) || allBlocks[0],
        [state.currentType],
    );

    const config = getBlockTypeConfig(state.currentType);

    const isValid = config.validate({
        currentType: state.currentType,
        title: state.title,
        content: state.content,
        file: state.file,
        language: state.language,
    });

    const handleSave = async () => {
        dispatch({ type: "setAdding", payload: true });

        let savedContent = state.content;

        if (state.currentType === "image" && state.file) {
            const formData = new FormData();
            formData.append("image", state.file as Blob);

            const response = await fetch("/api/upload-image", {
                method: "POST",
                body: formData,
            });
            const data = await response.json();
            savedContent = data.url;
        }

        onSave({
            id: editorData.id,
            type: state.currentType,
            title: state.title,
            content: savedContent,
            designId: state.designEnabled ? state.designId : 0,
            colorOptionId: state.colorOptionId || 1,
            order: editorData.order,
            action: editorData.action,
        });

        dispatch({ type: "setAdding", payload: false });
    };

    const handleClose = () => {
        onClose();
    };

    if (!currentBlock) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm transition-opacity duration-200 ease-out">
            <div className="flex h-full max-w-7xl w-full flex-col overflow-hidden rounded-2xl bg-white shadow-2xl transition-all duration-200 ease-out">
                <BlockEditorHeader action={editorData.action} onClose={handleClose} />
                <div className="flex flex-1 overflow-hidden">
                    <BlockContentEditor
                        state={state}
                        dispatch={dispatch}
                        editorData={editorData}
                    />
                    <BlockSettingsSidebar state={state} dispatch={dispatch} currentBlock={currentBlock} />
                </div>
                <BlockEditorFooter
                    onClose={handleClose}
                    onSave={handleSave}
                    disabled={!isValid}
                    isAdding={state.isAdding}
                    action={editorData.action}
                />
            </div>
        </div>
    );
};

export default BlockEditorModal;
