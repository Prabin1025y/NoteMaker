import { editorJsonForPreview, mapTypeToElement } from "@/utils/UtilFunctions";
import { BlockItem } from "@/utils/BlocksInfo";
import { BlockEditorState } from "./block-editor-state";

interface BlockPreviewProps {
    currentBlock: BlockItem;
    state: BlockEditorState;
}

const BlockPreview = ({ currentBlock, state }: BlockPreviewProps) => {
    const PreviewComponent = mapTypeToElement(state.currentType);
    const title = state.currentType === "code" ? state.language : state.title;

    if (!PreviewComponent) return null;

    const getPreviewContent = () => {
        switch (state.currentType) {
            case "block":
                return editorJsonForPreview;

            case "code":
                return "// Code here";

            case "divider":
                return state.content;

            case "formula":
                return "E=mc^2";

            case "image":
                return "https://machinelearningmastery.com/wp-content/uploads/2021/08/attention_research_1.png";

            case "table":
                return state.content;

            case "canvas":
                return state.content;

            default:
                return editorJsonForPreview;
        }
    };

    return (
        <div className="mt-2">
            <PreviewComponent
                title={title ? "Title" : ""}
                content={getPreviewContent()}
                designId={state.designEnabled ? state.designId : 0}
                colorOptionId={state.colorOptionId}
                onEdit={() => {}}
                onDelete={() => {}}
            />
        </div>
    );
};

export default BlockPreview;
