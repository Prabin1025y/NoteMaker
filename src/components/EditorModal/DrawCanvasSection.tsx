import { GridId, Quickdraw, type Editor } from "@quickdrawjs/react";
import "@quickdrawjs/core/quickdraw.css";
import { useRef, useState, type RefCallback } from "react";
import { ModifiedCanvasEditorContentType } from "@/validation/editorData";
import DrawingEditorControls from "./DrawingEditorControls";

const DrawCanvasSection = ({
    content,
    onChangeHandler,
    toolbarTarget,
    toolbarRef,
    inline = false,
}: {
    content: ModifiedCanvasEditorContentType;
    onChangeHandler: (value: ModifiedCanvasEditorContentType) => void;
    toolbarTarget?: HTMLDivElement | null;
    toolbarRef?: RefCallback<HTMLDivElement>;
    inline?: boolean;
}) => {
    const drawCanvasRef = useRef(null);
    const [editor, setEditor] = useState<Editor | null>(null);
    const [settingsTarget, setSettingsTarget] = useState<HTMLDivElement | null>(null);
    return (
        <div className={inline ? "relative mx-auto aspect-square w-[80%] overflow-hidden rounded-md" : "flex flex-1 flex-col gap-3 min-h-0 bg-background relative"}>
            <div className="h-full w-full absolute inset-0">
                <Quickdraw
                    ref={drawCanvasRef}
                    autoFit
                    hideUi={inline}
                    watermark={!inline}
                    onMount={(drawingEditor) => {
                        if (inline) {
                            setEditor(drawingEditor);
                            drawingEditor.container.focus();
                        }
                    }}
                    onChange={(_diff, _source, editor) => {
                        onChangeHandler({
                            ...content,
                            data: editor.store.getSnapshot(),
                        });
                    }}
                    onGridChange={(grid) => {
                        onChangeHandler({
                            ...content,
                            config: {
                                ...content.config,
                                grid,
                            },
                        });
                    }}
                    onThemeChange={(theme) => {
                        onChangeHandler({
                            ...content,
                            config: {
                                ...content.config,
                                theme,
                            },
                        });
                    }}
                    grid={content.config.grid as GridId}
                    theme={content.config.theme}
                    snapshot={content.data}
                />
            </div>
            {inline && <>
                <div
                    ref={toolbarRef}
                    role="region"
                    aria-label="Block editor toolbar"
                    className="absolute inset-x-2 bottom-2 z-40 rounded-lg border border-muted bg-card shadow-lg"
                />
                <div ref={setSettingsTarget} className="absolute right-2 top-2 z-40 max-h-[calc(100%-4rem)] w-60 max-w-[calc(100%-1rem)] overflow-y-auto empty:hidden" />
                {editor && <DrawingEditorControls editor={editor} toolbarTarget={toolbarTarget ?? null} settingsTarget={settingsTarget} />}
            </>}
        </div>
    );
};

export default DrawCanvasSection;
