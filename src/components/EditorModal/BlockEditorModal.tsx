"use client";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { EditorData } from "@/types/Editor";
import { allBlocks } from "@/utils/BlocksInfo";
import { useBlockEditorState } from "./block-editor-state";
import BlockEditorHeader from "./BlockEditorHeader";
import BlockContentEditor from "./BlockContentEditor";
import BlockSettingsSidebar from "./BlockSettingsSidebar";
import BlockEditorFooter from "./BlockEditorFooter";
import { getBlockTypeConfig } from "./block-editor-config";
import {
    getBlobImageFile,
    removeBlobImageFile,
} from "@/lib/tiptap-utils";

type TiptapJsonNode = {
    type?: string;
    attrs?: Record<string, unknown>;
    content?: TiptapJsonNode[];
};

const uploadBlobImages = async (content: string): Promise<string> => {
    const document = JSON.parse(content) as TiptapJsonNode;
    const blobUrls: string[] = [];

    const visit = (node: TiptapJsonNode) => {
        if (node.type === "image" && typeof node.attrs?.src === "string") {
            const src = node.attrs.src;
            if (src.startsWith("blob:") && getBlobImageFile(src)) {
                blobUrls.push(src);
            }
        }

        node.content?.forEach(visit);
    };

    visit(document);

    if (blobUrls.length === 0) {
        return content;
    }

    const formData = new FormData();
    blobUrls.forEach((url) => {
        const file = getBlobImageFile(url);
        if (file) {
            formData.append("images", file);
        }
    });

    const response = await fetch("/api/upload-images", {
        method: "POST",
        body: formData,
    });
    const data = (await response.json()) as {
        images?: Array<{ url: string }>;
        error?: string;
    };

    if (!response.ok || !data.images || data.images.length !== blobUrls.length) {
        throw new Error(data.error || "Failed to upload images");
    }

    let imageIndex = 0;
    const replaceUrls = (node: TiptapJsonNode) => {
        if (node.type === "image" && typeof node.attrs?.src === "string") {
            const src = node.attrs.src;
            if (src === blobUrls[imageIndex]) {
                node.attrs.src = data.images![imageIndex].url;
                removeBlobImageFile(src);
                imageIndex += 1;
            }
        }

        node.content?.forEach(replaceUrls);
    };

    replaceUrls(document);
    return JSON.stringify(document);
};

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
    const { state, dispatch } = useBlockEditorState(editorData);

    const currentBlock = useMemo(
        () =>
            allBlocks.find((block) => block.type === state.currentType) ||
            allBlocks[0],
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

    const handleSave = useCallback(async () => {
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
        } else if (state.currentType === "block" || state.currentType === "heading") {
            savedContent = await uploadBlobImages(state.content);
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
    }, [dispatch, editorData, onSave, state]);

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
        onClose();
    };

    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        const id = window.setTimeout(() => panelRef.current?.focus(), 30);
        return () => {
            window.removeEventListener("keydown", onKey);
            window.clearTimeout(id);
        };
    }, [onClose]);

    if (!currentBlock) {
        return null;
    }

    return (
        <div
            className="ds-animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-label={
                editorData.action === "add"
                    ? "New block editor"
                    : "Edit block editor"
            }
        >
            <div
                ref={panelRef}
                tabIndex={-1}
                className="ds-animate-fade-up flex h-full w-full max-w-7xl flex-col overflow-hidden rounded-2xl border border-muted bg-card shadow-2xl outline-none"
            >
                <BlockEditorHeader
                    action={editorData.action}
                    onClose={handleClose}
                />
                <div className="flex flex-1 overflow-hidden">
                    <BlockContentEditor
                        state={state}
                        dispatch={dispatch}
                        editorData={editorData}
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
                    action={editorData.action}
                />
            </div>
        </div>
    );
};

export default BlockEditorModal;
