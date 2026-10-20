import { GridId, Snapshot, ThemeId } from "@quickdrawjs/react";

export type CanvasEditorContentType = {
    data: Snapshot;
    config: {
        theme: ThemeId;
        grid: GridId;
    };
};
