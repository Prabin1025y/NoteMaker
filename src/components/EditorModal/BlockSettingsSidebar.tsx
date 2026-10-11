import type { Dispatch } from "react";
import { Switch } from "../ui/switch";
import { BlockItem } from "@/utils/BlocksInfo";
import BlockTypeSelector from "./BlockTypeSelector";
import DesignSelection from "./DesignSelection";
import BlockPreview from "./BlockPreview";
import { getBlockTypeConfig, supportsDesign } from "./block-editor-config";
import { BlockEditorAction, BlockEditorState } from "@/types/Editor";

interface BlockSettingsSidebarProps {
    state: BlockEditorState;
    dispatch: Dispatch<BlockEditorAction>;
    currentBlock: BlockItem;
}

const BlockSettingsSidebar = ({ state, dispatch, currentBlock }: BlockSettingsSidebarProps) => {
    const designUnavailable = !supportsDesign(state.currentType);

    return (
        <div className="flex w-85 shrink-0 flex-col overflow-y-auto border-l border-muted bg-background/80 px-6 py-6">
            <div className="space-y-6">
                <BlockTypeSelector
                    currentBlock={currentBlock}
                    onTypeChange={(type) => dispatch({ type: "setType", payload: type })}
                />
                <hr className="border-muted" />
                <div className={`${designUnavailable && "saturate-0 opacity-40 pointer-events-none"} flex items-center justify-between`}>
                    <label className="text-[13px] font-semibold text-body cursor-pointer" htmlFor="design-switch">
                        2. Apply Design
                    </label>
                    <Switch
                        className="data-checked:bg-primary data-unchecked:bg-muted-foreground cursor-pointer"
                        id="design-switch"
                        checked={state.designEnabled}
                        onCheckedChange={(checked) => dispatch({ type: "setDesignEnabled", payload: checked })}
                    />
                </div>
                <hr className="border-muted" />
                <DesignSelection
                    className={`${(!state.designEnabled || designUnavailable) && "saturate-0 opacity-40 pointer-events-none"}`}
                    currentBlock={currentBlock}
                    colorOptionId={state.colorOptionId}
                    designId={state.designId}
                    setDesignId={(id) => dispatch({ type: "setDesignId", payload: id })}
                    setColorOptionId={(id) => dispatch({ type: "setColorOptionId", payload: id })}
                />
                {/* <hr className="border-muted" />
                <div>
                    <label className="text-[13px] font-semibold text-body">5. Preview</label>
                    <BlockPreview currentBlock={currentBlock} state={state} />
                </div> */}
            </div>
        </div>
    );
};

export default BlockSettingsSidebar;
