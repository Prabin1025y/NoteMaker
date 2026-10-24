import { GridId, Quickdraw } from "@quickdrawjs/react";
import "@quickdrawjs/core/quickdraw.css";
import { useRef } from "react";
import { ModifiedCanvasEditorContentType } from "@/validation/editorData";

const DrawCanvasSection = ({
    content,
    onChangeHandler,
}: {
    content: ModifiedCanvasEditorContentType;
    onChangeHandler: (value: ModifiedCanvasEditorContentType) => void;
}) => {
    const drawCanvasRef = useRef(null);
    return (
        <div className="flex flex-1 flex-col gap-3 min-h-0 bg-background relative">
            <div className="h-full w-full absolute inset-0">
                <Quickdraw
                    ref={drawCanvasRef}
                    autoFit
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
        </div>
    );
};

export default DrawCanvasSection;
