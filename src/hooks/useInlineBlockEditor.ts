"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useNoteStore } from "@/Context/DataStore";
import type { EditorDataType } from "@/types/Editor";
import { INITIAL_EDITOR_DATA } from "@/utils/UtilFunctions";
import type { InlineBlockEditorHandle } from "@/components/note/InlineBlockEditor";

interface EditingSession {
    key: number;
    noteId: string;
    data: EditorDataType;
}

export function useInlineBlockEditor(noteId: string) {
    const [session, setSession] = useState<EditingSession | null>(null);
    const sessionRef = useRef<EditingSession | null>(null);
    const editorRef = useRef<InlineBlockEditorHandle | null>(null);
    const nextKeyRef = useRef(0);
    const openRequestRef = useRef(0);

    const closeEditor = useCallback((key: number) => {
        if (sessionRef.current?.key !== key) return;
        sessionRef.current = null;
        setSession(null);
        const store = useNoteStore.getState();
        store.setIsEditorOpen(false);
        store.setEditorDataState(INITIAL_EDITOR_DATA);
    }, []);

    const finishEditing = useCallback(() => {
        if (!sessionRef.current) return Promise.resolve(true);
        return editorRef.current?.finish() ?? Promise.resolve(false);
    }, []);

    const openBlockEditor = useCallback((data: EditorDataType) => {
        const request = ++openRequestRef.current;
        const open = async () => {
            const active = sessionRef.current;
            if (active?.data.action === "save" && data.action === "save" && active.data.id === data.id) {
                return;
            }
            if (!(await finishEditing()) || request !== openRequestRef.current) return;
            const store = useNoteStore.getState();
            if (store.isReadOnly || store.isPreviewMode || store.currentNote?.id !== noteId) return;

            const next = { key: ++nextKeyRef.current, noteId, data };
            sessionRef.current = next;
            setSession(next);
            store.setEditorDataState(data);
            store.setIsEditorOpen(true);
        };
        void open();
    }, [finishEditing, noteId]);

    const saveBlock = useCallback((data: EditorDataType) => {
        const store = useNoteStore.getState();
        if (store.isReadOnly || store.currentNote?.id !== noteId) {
            throw new Error("This note is no longer editable.");
        }
        store.addSaveBlock(data);
    }, [noteId]);

    const deleteEditedBlock = useCallback((id: string) => {
        const store = useNoteStore.getState();
        if (store.isReadOnly || store.currentNote?.id !== noteId) return;
        if (store.blocks.some((block) => block.id === id)) store.deleteBlock(id);
    }, [noteId]);

    useEffect(() => () => {
        openRequestRef.current += 1;
        sessionRef.current = null;
        const store = useNoteStore.getState();
        store.setIsEditorOpen(false);
        store.setEditorDataState(INITIAL_EDITOR_DATA);
    }, [noteId]);

    return {
        activeEditor: session?.noteId === noteId ? session : null,
        editorRef,
        openBlockEditor,
        finishEditing,
        saveBlock,
        deleteEditedBlock,
        closeEditor,
    };
}
