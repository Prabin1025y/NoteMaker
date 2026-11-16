"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, type SyntheticEvent } from "react";

export function useInlineEditorDismiss(
    onFinish: () => Promise<boolean>,
    regions: readonly (HTMLElement | null)[],
) {
    const internalEvents = useRef(new WeakSet<Event>());
    const editorEscapes = useRef(new WeakSet<Event>());
    const finishRef = useRef(onFinish);
    const regionsRef = useRef(regions);
    const frame = useRef<number | null>(null);
    const pendingEventType = useRef<string | null>(null);
    useLayoutEffect(() => {
        finishRef.current = onFinish;
        regionsRef.current = regions;
    }, [onFinish, regions]);
    const markInteraction = useCallback((event: SyntheticEvent) => {
        if (event.nativeEvent instanceof KeyboardEvent) {
            // ProseMirror suppresses native Escape even without an Escape command.
            // Capture its unconsumed state after portaled menus get first refusal.
            if (event.nativeEvent.key === "Escape" && !event.nativeEvent.defaultPrevented &&
                event.target instanceof Element && event.target.closest(".ProseMirror")) {
                editorEscapes.current.add(event.nativeEvent);
            }
            return;
        }
        // React capture follows portals, including menus mounted under document.body.
        internalEvents.current.add(event.nativeEvent);
        // Menu focus restoration must not cancel a real click outside the editor.
        if (frame.current !== null && (event.type === "pointerdown" || pendingEventType.current === "focusin")) {
            cancelAnimationFrame(frame.current);
            frame.current = null;
            pendingEventType.current = null;
        }
    }, []);

    useEffect(() => {
        const handleOutsideInteraction = (event: Event) => {
            const path = event.composedPath();
            if (internalEvents.current.has(event) || regionsRef.current.some((region) =>
                region && (path.includes(region) || (event.target instanceof Node && region.contains(event.target))),
            )) return;
            // Closing a menu may briefly focus the document instead of a control.
            if (event.type === "focusin" && (event.target === document.body || event.target === document.documentElement)) return;
            if (event.type === "focusin" && pendingEventType.current === "pointerdown") return;
            if (frame.current !== null) cancelAnimationFrame(frame.current);
            pendingEventType.current = event.type;
            // Let blur handlers flush type-specific content before committing.
            frame.current = requestAnimationFrame(() => {
                frame.current = null;
                pendingEventType.current = null;
                void finishRef.current();
            });
        };
        const handleKeyDown = (event: KeyboardEvent) => {
            // Let the active editor or an open menu consume Escape first.
            if ((event.defaultPrevented && !editorEscapes.current.has(event)) || event.isComposing) return;
            if (event.key === "Escape" ||
                (event.key === "Enter" && (event.ctrlKey || event.metaKey) && event.shiftKey)) {
                event.preventDefault();
                void finishRef.current();
            }
        };

        document.addEventListener("pointerdown", handleOutsideInteraction);
        document.addEventListener("focusin", handleOutsideInteraction);
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            if (frame.current !== null) cancelAnimationFrame(frame.current);
            frame.current = null;
            pendingEventType.current = null;
            document.removeEventListener("pointerdown", handleOutsideInteraction);
            document.removeEventListener("focusin", handleOutsideInteraction);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    return markInteraction;
}
