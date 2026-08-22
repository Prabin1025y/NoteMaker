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
            <label className="mb-3 block text-[13px] font-semibold text-body">
                1. Block type
            </label>
            <DropdownMenu>
                <DropdownMenuTrigger className="w-full">
                    <div className="flex w-full cursor-pointer items-center gap-3 rounded-lg border border-hairline bg-surface p-2.5 text-left outline-none transition-colors duration-150 hover:bg-paper focus-visible:ring-2 focus-visible:ring-[color:var(--ds-focus-ring)]">
                        <span
                            className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${currentBlock.bgColor} ${currentBlock.color}`}
                        >
                            {currentBlock.icon}
                        </span>
                        <span className="min-w-0 flex-1">
                            <span className="block truncate text-[13px] font-semibold text-ink">
                                {currentBlock.title}
                            </span>
                        </span>
                        <ChevronDown className="h-4 w-4 shrink-0 text-faint" />
                    </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-72 max-w-[calc(100vw-2rem)]">
                    {allBlocks.map((block) => (
                        <DropdownMenuItem
                            key={block.type}
                            onSelect={() => onTypeChange(block.type)}
                            className="rounded-md p-0"
                            asChild
                        >
                            <div
                                className={`flex w-full cursor-pointer items-start gap-3 rounded-md p-2.5 transition-colors duration-150 ${block.hoverColor}`}
                            >
                                <span
                                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${block.bgColor} ${block.color}`}
                                >
                                    {block.icon}
                                </span>
                                <div className="min-w-0 flex-1">
                                    <h3 className="text-[13px] font-semibold text-ink">
                                        {block.title}
                                    </h3>
                                    <p className="truncate text-[12px] text-muted-ink">
                                        {block.description}
                                    </p>
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
