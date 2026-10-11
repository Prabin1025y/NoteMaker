import { Quickdraw } from "@quickdrawjs/react";
import "@quickdrawjs/core/quickdraw.css";
import { useRef } from "react";
import { toast } from "sonner";
import { CanvasEditorContentType } from "@/types/CanvasEditor";
import { config } from "process";

const parse = (content: string): CanvasEditorContentType | null => {
    if (!content) return null;
    try {
        const parsed = JSON.parse(content);
        if (typeof parsed !== "object" || parsed === null) return null;
        return parsed;
    } catch {
        return null;
    }
};

const DrawCanvasSection = ({
    content,
    onChangeHandler,
}: {
    content: string;
    onChangeHandler: (value: string) => void;
}) => {
    const parsed = parse(content);
    const drawCanvasRef = useRef(null);
    return (
        <div className="flex flex-1 flex-col gap-3 min-h-0 bg-background relative">
            <div className="h-full w-full absolute inset-0">
                <Quickdraw
                    ref={drawCanvasRef}
                    autoFit
                    onChange={(_diff, _source, editor) => {
                        onChangeHandler(
                            JSON.stringify({
                                ...parsed,
                                data: editor.store.getSnapshot(),
                            }),
                        );
                    }}
                    onGridChange={(grid) => {
                        onChangeHandler(
                            JSON.stringify({
                                ...parsed,
                                config: {
                                    ...parsed?.config,
                                    grid,
                                },
                            }),
                        );
                    }}
                    onThemeChange={(theme) => {
                        onChangeHandler(
                            JSON.stringify({
                                ...parsed,
                                config: {
                                    ...parsed?.config,
                                    theme,
                                },
                            }),
                        );
                    }}
                    grid={parsed?.config?.grid}
                    theme={parsed?.config?.theme}
                    watermark={false}
                    snapshot={parsed?.data}
                />
            </div>
        </div>
    );
};

export default DrawCanvasSection;
