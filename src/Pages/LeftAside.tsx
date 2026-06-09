import { blockTypeOptions } from "@/Context/DataStore";
import { EditorData } from "@/types/Editor";
import { allBlocks } from "@/utils/BlocksInfo";

interface LeftAsideProps {
    openBlockEditor: (editorData: EditorData) => void;
}

const LeftAside = ({ openBlockEditor }: LeftAsideProps) => {
    const handleBlockClick = (type: blockTypeOptions) => {
        openBlockEditor({
            id: "",
            action: "add",
            content: `{"type":"doc","content":[{"type":"paragraph","attrs":{"textAlign":null},"content":[{"type":"text","text":" "}]}]}`,
            title: "",
            type: type,
        });
    };

    return (
        <aside className="flex-1 rounded-3xl border border-dashed border-orange-200 bg-white/50 p-6 overflow-y-auto">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Blocks
            </h2>
            <div className="space-y-2">
                {allBlocks.map((block) => (
                    <button
                        key={block.type}
                        onClick={() => handleBlockClick(block.type)}
                        className={`w-full cursor-pointer text-left p-3 rounded-lg transition-colors border border-transparent ${block.bgColor} ${block.hoverColor} focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-orange-300`}
                    >
                        <div className="flex items-start gap-3">
                            <div className={`shrink-0 mt-0.5 ${block.color}`}>
                                {block.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3
                                    className={`text-sm font-semibold ${block.color}`}
                                >
                                    {block.title}
                                </h3>
                                <p className="text-xs text-slate-500 truncate">
                                    {block.description}
                                </p>
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </aside>
    );
};

export default LeftAside;
