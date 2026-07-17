import type { Dispatch } from "react";
import { Switch } from "../ui/switch";
import { BlockEditorState, BlockEditorAction } from "./block-editor-state";
import { BlockItem } from "@/utils/BlocksInfo";
import BlockTypeSelector from "./BlockTypeSelector";
import DesignSelection from "./DesignSelection";
import BlockPreview from "./BlockPreview";
import { getBlockTypeConfig, supportsDesign } from "./block-editor-config";

interface BlockSettingsSidebarProps {
    state: BlockEditorState;
    dispatch: Dispatch<BlockEditorAction>;
    currentBlock: BlockItem;
}

const BlockSettingsSidebar = ({ state, dispatch, currentBlock }: BlockSettingsSidebarProps) => {
    const config = getBlockTypeConfig(state.currentType);
    const designUnavailable = !supportsDesign(state.currentType);

    return (
        <div className="flex w-85 shrink-0 flex-col overflow-y-auto border-l border-slate-200 bg-slate-50/60 px-6 py-6">
            <div className="space-y-6">
                <BlockTypeSelector
                    currentBlock={currentBlock}
                    onTypeChange={(type) => dispatch({ type: "setType", payload: type })}
                />
                <hr />
                <div className={`${designUnavailable && "saturate-0 opacity-40 pointer-events-none"} flex items-center justify-between`}> 
                    <label className="text-sm font-semibold text-slate-700 cursor-pointer" htmlFor="design-switch">
                        2. Apply Design
                    </label>
                    <Switch
                        className="data-checked:bg-indigo-500 data-unchecked:bg-red-500 cursor-pointer"
                        id="design-switch"
                        checked={state.designEnabled}
                        onCheckedChange={(checked) => dispatch({ type: "setDesignEnabled", payload: checked })}
                    />
                </div>
                <hr />
                <DesignSelection
                    className={`${(!state.designEnabled || designUnavailable) && "saturate-0 opacity-40 pointer-events-none"}`}
                    currentBlock={currentBlock}
                    colorOptionId={state.colorOptionId}
                    designId={state.designId}
                    setDesignId={(id) => dispatch({ type: "setDesignId", payload: id })}
                    setColorOptionId={(id) => dispatch({ type: "setColorOptionId", payload: id })}
                />
                <hr />
                <div>
                    <label className="text-sm font-semibold text-slate-700">5. Preview</label>
                    <BlockPreview currentBlock={currentBlock} state={state} />
                </div>
            </div>
        </div>
    );
};

export default BlockSettingsSidebar;
