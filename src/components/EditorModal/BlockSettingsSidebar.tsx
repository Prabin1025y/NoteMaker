import { useEffect, useState, type Dispatch } from "react";
import { Switch } from "../ui/switch";
import { BlockItem } from "@/utils/BlocksInfo";
import BlockTypeSelector from "./BlockTypeSelector";
import DesignSelection from "./DesignSelection";
import { supportsDesign } from "./block-editor-config";
import { BlockEditorAction, BlockEditorState } from "@/types/Editor";
import { ChevronLeft, Settings, X } from "lucide-react";

interface BlockSettingsSidebarProps {
    state: BlockEditorState;
    dispatch: Dispatch<BlockEditorAction>;
    currentBlock: BlockItem;
}

const BlockSettingsSidebar = ({
    state,
    dispatch,
    currentBlock,
}: BlockSettingsSidebarProps) => {
    const designUnavailable = !supportsDesign(state.currentType);
    const [collapsed, setCollapsed] = useState(false);
    const [collapsible, setCollapsible] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1300) setCollapsible(true);
            else setCollapsible(false);
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <div
            className={`flex shrink-0 flex-col overflow-y-auto border-l border-muted transition-[width] duration-100 bg-background/80 px-6 py-6 ${collapsible ? `absolute right-0 top-0 bottom-0 z-50  ${collapsed ? "w-10 items-center justify-center overflow-x-hidden" : "w-64"}` : "w-64"}`}
        >
            {collapsible && collapsed && (
                <button
                    onClick={() => setCollapsed(false)}
                    className=" h-20 w-10 grid place-items-center cursor-pointer"
                >
                    <ChevronLeft />
                </button>
            )}
            {!(collapsible && collapsed) && (
                <div className="space-y-6">
                    <div className="flex gap-2 items-center justify-between">
                        <p className="text-[16px] font-semibold text-body cursor-pointer">
                            Design Setting
                        </p>
                        <X
                            size={25}
                            onClick={() => setCollapsed(true)}
                            className={`${!collapsible && "hidden"} hover:bg-muted/40 cursor-pointer transition-colors duration-150 p-1 rounded-xs`}
                        />
                    </div>
                    <hr className="border-muted" />
                    <BlockTypeSelector
                        currentBlock={currentBlock}
                        onTypeChange={(type) =>
                            dispatch({ type: "setType", payload: type })
                        }
                    />
                    <hr className="border-muted" />
                    <div
                        className={`${designUnavailable && "saturate-0 opacity-40 pointer-events-none"} flex items-center justify-between`}
                    >
                        <label
                            className="text-[13px] font-semibold text-body cursor-pointer"
                            htmlFor="design-switch"
                        >
                            Apply Design
                        </label>
                        <Switch
                            className="data-checked:bg-primary data-unchecked:bg-muted-foreground cursor-pointer"
                            id="design-switch"
                            checked={state.designEnabled}
                            onCheckedChange={(checked) =>
                                dispatch({
                                    type: "setDesignEnabled",
                                    payload: checked,
                                })
                            }
                        />
                    </div>

                    <hr className="border-muted" />
                    <DesignSelection
                        className={`${(!state.designEnabled || designUnavailable) && "saturate-0 opacity-40 pointer-events-none"}`}
                        currentBlock={currentBlock}
                        colorOptionId={state.colorOptionId}
                        designId={state.designId}
                        setDesignId={(id) =>
                            dispatch({ type: "setDesignId", payload: id })
                        }
                        setColorOptionId={(id) =>
                            dispatch({ type: "setColorOptionId", payload: id })
                        }
                    />
                    {/* <hr className="border-muted" />
                <div>
                    <label className="text-[13px] font-semibold text-body">5. Preview</label>
                    <BlockPreview currentBlock={currentBlock} state={state} />
                </div> */}
                </div>
            )}
        </div>
    );
};

export default BlockSettingsSidebar;
