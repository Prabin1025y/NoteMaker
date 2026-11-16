import { useId, type Dispatch } from "react";
import type { BlockEditorAction, BlockEditorState } from "@/types/Editor";
import { MONACO_LANGUAGES } from "@/utils/UtilFunctions";
import { getBlockTypeConfig } from "./block-editor-config";

interface BlockEditorFieldsProps {
    state: BlockEditorState;
    dispatch: Dispatch<BlockEditorAction>;
}

export default function BlockEditorFields({ state, dispatch }: BlockEditorFieldsProps) {
    const id = useId();
    const config = getBlockTypeConfig(state.currentType);
    return (
        <div className="space-y-5">
            {state.currentType === "code" && (
                <div>
                    <label htmlFor={`${id}-language`} className="mb-2 block text-[13px] font-semibold text-body">
                        Language
                    </label>
                    <select
                        id={`${id}-language`}
                        value={state.language}
                        onChange={(event) => dispatch({
                            type: "setLanguage",
                            payload: event.target.value as BlockEditorState["language"],
                        })}
                        className="h-9 w-full rounded-md border border-input bg-background px-3 text-[13px] text-ink outline-none focus-visible:ring-2 focus-visible:ring-(--ds-focus-ring)"
                    >
                        {MONACO_LANGUAGES.map((language) => (
                            <option key={language} value={language}>{language}</option>
                        ))}
                    </select>
                </div>
            )}
            {config.showTitleField && (
                <div>
                    <label htmlFor={`${id}-title`} className="mb-2 block text-[13px] font-semibold text-body">
                        {config.titleLabel || "Title"}{" "}
                        <span className="font-normal text-muted-foreground">(optional)</span>
                    </label>
                    <input
                        id={`${id}-title`}
                        type="text"
                        value={state.title}
                        onChange={(event) => dispatch({ type: "setTitle", payload: event.target.value })}
                        placeholder={config.titleLabel === "Caption" ? "Enter caption" : "Enter title (optional)"}
                        className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-[13px] text-ink outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-(--ds-focus-ring)"
                    />
                </div>
            )}
        </div>
    );
}
