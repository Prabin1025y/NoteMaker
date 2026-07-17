import { ChevronDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { BlockItem, allBlocks } from "@/utils/BlocksInfo";
import { blockTypeOptions } from "@/types/Editor";

interface BlockTypeSelectorProps {
    currentBlock: BlockItem;
    onTypeChange: (type: blockTypeOptions) => void;
}

const BlockTypeSelector = ({ currentBlock, onTypeChange }: BlockTypeSelectorProps) => {
    return (
        <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">1. Block Type</label>
            <DropdownMenu>
                <DropdownMenuTrigger className="w-full">
                    <div
                        className={`w-full cursor-pointer text-left p-3 rounded-lg transition-colors border border-slate-200 ${currentBlock.bgColor} ${currentBlock.hoverColor} focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-300`}
                    >
                        <div className="flex items-start gap-3">
                            <div className={`shrink-0 mt-0.5 ${currentBlock.color}`}>{currentBlock.icon}</div>
                            <div className="flex-1 min-w-0">
                                <h3 className={`text-sm font-semibold ${currentBlock.color}`}>{currentBlock.title}</h3>
                            </div>
                            <ChevronDown className="h-4 w-4 mt-0.5 shrink-0 opacity-60" />
                        </div>
                    </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="min-w-full">
                    {allBlocks.map((block) => (
                        <DropdownMenuItem
                            key={block.type}
                            onSelect={() => onTypeChange(block.type)}
                            className="rounded-none min-w-full"
                            asChild
                        >
                            <div className={`w-full cursor-pointer text-left p-3 transition-colors border border-transparent ${block.bgColor} ${block.hoverColor} hover:border-slate-300`}>
                                <div className="flex items-start gap-3">
                                    <div className={`shrink-0 mt-0.5 ${block.color}`}>{block.icon}</div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className={`text-sm font-semibold ${block.color}`}>{block.title}</h3>
                                        <p className="text-xs text-slate-500 truncate">{block.description}</p>
                                    </div>
                                </div>
                            </div>
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
};

export default BlockTypeSelector;
