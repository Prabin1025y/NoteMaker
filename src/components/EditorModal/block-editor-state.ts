import { useEffect, useReducer } from "react";
import { EditorData, blockTypeOptions } from "@/types/Editor";
import { getBlockTypeConfig, getDefaultLanguage } from "./block-editor-config";
import { PreviewFile } from "./../ImageUploader";

export interface BlockEditorState {
    currentType: blockTypeOptions;
    title: string;
    content: string;
    file: PreviewFile | null;
    language: string;
    designEnabled: boolean;
    designId: number;
    colorOptionId: number;
    isAdding: boolean;
    isVisible: boolean;
}

export type BlockEditorAction =
    | { type: "initialize"; payload: EditorData }
    | { type: "setType"; payload: blockTypeOptions }
    | { type: "setTitle"; payload: string }
    | { type: "setContent"; payload: string }
    | { type: "setFile"; payload: PreviewFile | null }
    | { type: "setLanguage"; payload: string }
    | { type: "setDesignEnabled"; payload: boolean }
    | { type: "setDesignId"; payload: number }
    | { type: "setColorOptionId"; payload: number }
    | { type: "setAdding"; payload: boolean }
    | { type: "setVisible"; payload: boolean };

const getInitialState = (editorData: EditorData): BlockEditorState => {
    const config = getBlockTypeConfig(editorData.type);
    const language =
        editorData.type === "code"
            ? getDefaultLanguage(editorData.title)
            : "javascript";

    const content =
        editorData.action === "add"
            ? config.initialContent
            : editorData.content;

    return {
        currentType: editorData.type,
        title: editorData.type === "code" ? language : editorData.title,
        content,
        file: null,
        language,
        designEnabled: editorData.designId !== 0,
        designId:
            editorData.action === "add"
                ? editorData.designId || 1
                : editorData.designId || 1,
        colorOptionId:
            editorData.action === "add"
                ? editorData.colorOptionId || 1
                : editorData.colorOptionId || 1,
        isAdding: false,
        isVisible: false,
    };
};

const reducer = (state: BlockEditorState, action: BlockEditorAction) => {
    switch (action.type) {
        case "initialize": {
            return getInitialState(action.payload);
        }
        case "setType": {
            const config = getBlockTypeConfig(action.payload);
            const language =
                action.payload === "code"
                    ? getDefaultLanguage(state.title)
                    : state.language;

            return {
                ...state,
                currentType: action.payload,
                title: action.payload === "code" ? language : "",
                content: config.initialContent,
                file: action.payload === "image" ? state.file : null,
                language,
            };
        }
        case "setTitle":
            return state.title === action.payload
                ? state
                : { ...state, title: action.payload };
        case "setContent":
            return state.content === action.payload
                ? state
                : { ...state, content: action.payload };
        case "setFile":
            return state.file === action.payload
                ? state
                : { ...state, file: action.payload };
        case "setLanguage":
            return state.language === action.payload
                ? state
                : { ...state, language: action.payload, title: action.payload };
        case "setDesignEnabled":
            return state.designEnabled === action.payload
                ? state
                : { ...state, designEnabled: action.payload };
        case "setDesignId":
            return state.designId === action.payload
                ? state
                : { ...state, designId: action.payload };
        case "setColorOptionId":
            return state.colorOptionId === action.payload
                ? state
                : { ...state, colorOptionId: action.payload };
        case "setAdding":
            return state.isAdding === action.payload
                ? state
                : { ...state, isAdding: action.payload };
        case "setVisible":
            return state.isVisible === action.payload
                ? state
                : { ...state, isVisible: action.payload };
        default:
            return state;
    }
};

export const useBlockEditorState = (editorData: EditorData) => {
    const [state, dispatch] = useReducer(reducer, editorData, getInitialState);

    useEffect(() => {
        dispatch({ type: "initialize", payload: editorData });
    }, [editorData]);

    useEffect(() => {
        const frame = requestAnimationFrame(() => {
            dispatch({ type: "setVisible", payload: true });
        });

        return () => cancelAnimationFrame(frame);
    }, []);

    useEffect(() => {
        if (editorData.action !== "save" || editorData.type !== "image") {
            return;
        }
        

        let active = true;
        (async () => {
            try {
                const response = await fetch(editorData.content);
                const blob = await response.blob();
                const newFile = new File([blob], editorData.title, {
                    type: blob.type,
                });
                const withPreview = Object.assign(newFile, {
                    preview: URL.createObjectURL(newFile),
                });

                if (!active) return;
                dispatch({ type: "setFile", payload: withPreview });
            } catch {
                // ignore preview generation failures
            }
        })();

        return () => {
            active = false;
        };
    }, [editorData]);

    useEffect(() => {
        return () => {
            if (state.file) {
                URL.revokeObjectURL(state.file.preview);
            }
        };
    }, [state.file]);

    return { state, dispatch } as const;
};
