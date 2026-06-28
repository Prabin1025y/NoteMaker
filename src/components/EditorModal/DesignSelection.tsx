import { ColorOptionSelect } from "../ColorOptionSelect";
import { colorOptions } from "@/utils/ColorsInfo";
import { allBlockDesigns } from "@/utils/DesignInfo";
import { Dispatch, SetStateAction } from "react";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "../ui/dropdown-menu";
import { BlockItem } from "@/utils/BlocksInfo";

interface DesignSelectiontype {
    designId: number;
    colorOptionId: number;
    setDesignId: Dispatch<SetStateAction<number>>;
    setColorOptionId: Dispatch<SetStateAction<number>>;
    currentBlock: BlockItem | null;
}

const DesignSelection = ({
    designId,
    colorOptionId,
    setDesignId,
    setColorOptionId,
    // currentBlock,
}: DesignSelectiontype) => {
    // const colorOption = colorOptions.find((co) => co.id === colorOptionId);
    return (
        <div className="flex gap-5">
            <div className="flex-1">
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Design Type
                </label>
                {/*
                    <DropdownMenu>
                        <DropdownMenuTrigger className="w-full border cursor-pointer hover:bg-amber-50 border-dashed rounded-lg flex items-center justify-center py-4">
                            {(() => {
                                const DividerComponent = ALL_DIVIDERS.find(
                                    (b) => b.name === dividerName,
                                )?.component;

                                return DividerComponent ? (
                                    <DividerComponent
                                        color={colorOption?.borderColorHex}
                                        width="full"
                                        className="w-full"
                                    />
                                ) : null;
                            })()}
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            {ALL_DIVIDERS.map((b) => (
                                <DropdownMenuItem
                                    key={b.name}
                                    onSelect={() => setDividerName(b.name)}
                                    className="rounded-none flex items-center justify-center py-2"
                                >
                                    {(() => {
                                        const DividerComponent = b.component;

                                        return DividerComponent ? (
                                            <DividerComponent
                                                color={
                                                    colorOption?.borderColorHex
                                                }
                                                width="full"
                                                className="w-full"
                                            />
                                        ) : null;
                                    })()}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                 */}
                <DropdownMenu>
                    <DropdownMenuTrigger className="w-full border cursor-pointer hover:bg-amber-50 border-dashed rounded-lg flex items-center justify-center py-4">
                        {allBlockDesigns
                            .find((b) => b.id === designId)
                            ?.exampleDesign(
                                colorOptions.find(
                                    (co) => co.id === colorOptionId,
                                ) || colorOptions[0],
                            )}
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        {allBlockDesigns.map((b) => (
                            <DropdownMenuItem
                                key={b.id}
                                onSelect={() => setDesignId(b.id)}
                                className="rounded-none flex items-center justify-center py-2"
                            >
                                {b.exampleDesign(
                                    colorOptions.find(
                                        (co) => co.id === colorOptionId,
                                    ) || colorOptions[0],
                                )}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <div className="flex-1">
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Color Options
                </label>
                <DropdownMenu>
                    <DropdownMenuTrigger className="w-full">
                        <ColorOptionSelect colorOptionId={colorOptionId} />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        {colorOptions.map((colorOption) => (
                            <DropdownMenuItem
                                key={colorOption.id}
                                onSelect={() =>
                                    setColorOptionId(colorOption.id)
                                }
                                className="rounded-none"
                            >
                                <ColorOptionSelect
                                    colorOptionId={colorOption.id}
                                />
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
};

export default DesignSelection;
