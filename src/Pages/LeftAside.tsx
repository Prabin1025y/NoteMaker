import { blockTypeOptions, EditorData } from "@/types/Editor";
import { allBlocks } from "@/utils/BlocksInfo";
import { initialJsonForEditor } from "@/utils/UtilFunctions";

interface LeftAsideProps {
    openBlockEditor: (editorData: EditorData) => void;
}

const LeftAside = ({ openBlockEditor }: LeftAsideProps) => {
    const handleBlockClick = (
        type: blockTypeOptions,
        content: string = initialJsonForEditor,
    ) => {
        openBlockEditor({
            id: "", designId: 1, colorOptionId: 1,
            action: "add", content, title: "", type,
        });
    };

    return (
        <aside
            className="w-80 flex-shrink-0 border-r border-[#e8e5e0] bg-[#faf9f7] flex flex-col overflow-hidden"
            style={{ fontFamily: "'Inter', sans-serif" }}
        >
            <div className="px-4 py-3 border-b border-[#f0ede8]">
                <p className="text-[10px] font-semibold text-[#b8b3ac] uppercase tracking-[0.08em]">
                    Add block
                </p>
            </div>

            <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-0.5">
                {allBlocks.map((block) => (
                    <button
                        key={block.type}
                        onClick={() => handleBlockClick(block.type, block.defaultContent)}
                        className="w-full text-left flex items-center gap-2.5 px-2.5 py-2 rounded-[8px] hover:bg-[#f0ede8] transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-offset-1 group"
                    >
                        <div className={`w-7 h-7 rounded-[7px] flex items-center justify-center flex-shrink-0 ${block.bgColor}`}>
                            <span className={`${block.color} text-[14px]`}>{block.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-medium text-[#5a5550] group-hover:text-[#1a1714] transition-colors">
                                {block.title}
                            </p>
                            <p className="text-[11px] text-[#b8b3ac] truncate">
                                {block.description}
                            </p>
                        </div>
                    </button>
                ))}
            </div>
        </aside>
    );
};

export default LeftAside;