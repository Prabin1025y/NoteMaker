"use client";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { EditorDataType } from "@/types/Editor";
import { allBlocks } from "@/utils/BlocksInfo";
import { useBlockEditorState } from "./block-editor-state";
import BlockEditorHeader from "./BlockEditorHeader";
import BlockContentEditor from "./BlockContentEditor";
import BlockSettingsSidebar from "./BlockSettingsSidebar";
import BlockEditorFooter from "./BlockEditorFooter";
import { getBlockTypeConfig } from "./block-editor-config";
import { getBlobImageFile, removeBlobImageFile } from "@/lib/tiptap-utils";
import { useNoteStore } from "@/Context/DataStore";
import type { JSONContent } from "@tiptap/core";
import {
    CanvasEditorContentSchema,
    JSONContentSchema,
    TableStateSchema,
} from "@/validation/editorData";
import { ALL_DIVIDERS } from "@/utils/Dividers";

const uploadBlobImages = async (content: JSONContent): Promise<JSONContent> => {
    const blobUrls: string[] = [];

    const visit = (node: JSONContent) => {
        if (node.type === "image" && typeof node.attrs?.src === "string") {
            const src = node.attrs.src;
            if (src.startsWith("blob:") && getBlobImageFile(src)) {
                blobUrls.push(src);
            }
        }

        node.content?.forEach(visit);
    };

    visit(content);

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

    if (
        !response.ok ||
        !data.images ||
        data.images.length !== blobUrls.length
    ) {
        throw new Error(data.error || "Failed to upload images");
    }

    let imageIndex = 0;
    const replaceUrls = (node: JSONContent) => {
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

    replaceUrls(content);
    return content;
};

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

    const config = getBlockTypeConfig(state.currentType);

    const isValid = config.validate({
        currentType: state.currentType,
        title: state.title,
        content: state.content,
        file: state.file,
        language: state.language,
    });

    const handleSave = useCallback(async () => {
        if (!isValid) return;

        dispatch({ type: "setAdding", payload: true });

        try {
            const saveData = {
                id: editorDataState.id,
                title: state.title,
                designId: state.designEnabled ? state.designId : 0,
                colorOptionId: state.colorOptionId || 1,
                order: editorDataState.order,
                action: editorDataState.action,
            };

            switch (state.currentType) {
                case "image": {
                    if (!state.file) {
                        throw new Error("Select an image before saving");
                    }

                    const formData = new FormData();
                    formData.append("image", state.file);

                    const response = await fetch("/api/upload-image", {
                        method: "POST",
                        body: formData,
                    });
                    const data = (await response.json()) as {
                        url?: string;
                        error?: string;
                    };

                    if (!response.ok || !data.url) {
                        throw new Error(data.error || "Failed to upload image");
                    }

                    onSave({
                        ...saveData,
                        type: "image",
                        url: data.url,
                    });
                    break;
                }
                case "block":
                case "heading": {
                    const result = JSONContentSchema.safeParse(state.content);
                    if (!result.success) {
                        throw new Error("Invalid block editor content");
                    }
                    const content = await uploadBlobImages(result.data);
                    onSave({
                        ...saveData,
                        type: state.currentType,
                        content,
                    });
                    break;
                }
                case "table": {
                    const result = TableStateSchema.safeParse(state.content);
                    if (!result.success) {
                        throw new Error("Invalid table content");
                    }
                    onSave({
                        ...saveData,
                        type: "table",
                        content: result.data,
                    });
                    break;
                }
                case "canvas": {
                    const result = CanvasEditorContentSchema.safeParse(
                        state.content,
                    );
                    if (!result.success) {
                        throw new Error("Invalid canvas content");
                    }
                    onSave({
                        ...saveData,
                        type: "canvas",
                        content: result.data,
                    });
                    break;
                }
                case "code":
                    if (typeof state.content !== "string") {
                        throw new Error(`Invalid ${state.currentType} content`);
                    }
                    onSave({
                        ...saveData,
                        type: "code",
                        content: state.content,
                        language: state.language,
                    });
                    break;
                case "divider": {
                    const divider = ALL_DIVIDERS.find(
                        ({ name }) => name === state.content,
                    );
                    if (!divider) {
                        throw new Error("Invalid divider content");
                    }
                    onSave({
                        ...saveData,
                        type: "divider",
                        content: divider.name,
                    });
                    break;
                }
                case "formula":
                    if (typeof state.content !== "string") {
                        throw new Error(`Invalid ${state.currentType} content`);
                    }
                    onSave({
                        ...saveData,
                        type: "formula",
                        content: state.content,
                    });
                    break;
            }
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

    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setIsEditorOpen(false);
        };
        window.addEventListener("keydown", onKey);
        const id = window.setTimeout(() => panelRef.current?.focus(), 30);
        return () => {
            window.removeEventListener("keydown", onKey);
            window.clearTimeout(id);
        };
    }, [setIsEditorOpen]);

    if (!currentBlock) {
        return null;
    }

    return (
        <div
            className="ds-animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-label={
                editorDataState.action === "add"
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
                    action={editorDataState.action}
                    onClose={handleClose}
                />
                <div className="flex flex-1 overflow-hidden">
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
