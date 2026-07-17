import { colorOptions } from "@/utils/ColorsInfo";
import { allBlockDesigns } from "@/utils/DesignInfo";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "../ui/dropdown-menu";
import { BlockItem } from "@/utils/BlocksInfo";
import { Check } from "lucide-react";

interface DesignSelectiontype {
    designId: number;
    colorOptionId: number;
    setDesignId: (id: number) => void;
    setColorOptionId: (id: number) => void;
    currentBlock: BlockItem | null;
    className?: string;
}

const DesignSelection = ({
    designId,
    colorOptionId,
    setDesignId,
    setColorOptionId,
    className = "",
    // currentBlock,
}: DesignSelectiontype) => {
    // const colorOption = colorOptions.find((co) => co.id === colorOptionId);
    return (
        <div className={`${className} flex flex-col gap-5`}>
            <div className="flex-1">
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                    3. Design Type
                </label>
                <DropdownMenu>
                    <DropdownMenuTrigger className="w-full border cursor-pointer hover:bg-amber-50 border-dashed rounded-lg flex items-center justify-center py-2">
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
                    4. Color Options
                </label>
                {/* <DropdownMenu>
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
                </DropdownMenu> */}
                <div className="grid grid-cols-5 gap-3">
                    {colorOptions.map((co) => (
                        <button
                            key={co.id}
                            style={
                                {
                                    backgroundColor: co.primaryColorHex,
                                    "--tw-ring-color":
                                        co.name.toLowerCase() === "white"
                                            ? "#000000"
                                            : co.primaryColorHex,
                                } as React.CSSProperties
                            }
                            onClick={() => setColorOptionId(co.id)}
                            className={` ${co.name.toLowerCase() === "white" ? "border border-black" : ""} ${colorOptionId === co.id && "ring-2"} cursor-pointer size-8 ring-offset-2 rounded-full aspect-square grid place-items-center`}
                        >
                            {colorOptionId === co.id && (
                                <Check
                                    size={18}
                                    className={`${co.name.toLowerCase() === "white" ? "text-black" : "text-white"} `}
                                />
                            )}
                        </button>
                    ))}
                    <button className="" />
                </div>
            </div>
        </div>
    );
};

export default DesignSelection;
