import { ColorOptionSelect } from "../ColorOptionSelect";
import { colorOptions } from "@/utils/ColorsInfo";
import { Dispatch, SetStateAction } from "react";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "../ui/dropdown-menu";
import { ALL_DIVIDERS } from "@/utils/Dividers";

interface DividerSelectiontype {
    colorOptionId: number;
    setColorOptionId: Dispatch<SetStateAction<number>>;
    content: string;
    onChangeHandler: (value: string) => void;
}

const DividerSelection = ({
    colorOptionId,
    setColorOptionId,
    content,
    onChangeHandler,
}: DividerSelectiontype) => {
    const colorOption = colorOptions.find((co) => co.id === colorOptionId);
    return (
        <div className="flex gap-5">
            <div className="flex-1">
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Design Type
                </label>

                <DropdownMenu>
                    <DropdownMenuTrigger className="w-full border cursor-pointer hover:bg-amber-50 border-dashed rounded-lg flex items-center justify-center py-4">
                        {(() => {
                            const DividerComponent = ALL_DIVIDERS.find(
                                (b) => b.name === content.trim(),
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
                                onSelect={() => onChangeHandler(b.name)}
                                className="rounded-none flex items-center justify-center py-2"
                            >
                                {(() => {
                                    const DividerComponent = b.component;

                                    return DividerComponent ? (
                                        <DividerComponent
                                            color={colorOption?.borderColorHex}
                                            width="full"
                                            className="w-full"
                                        />
                                    ) : null;
                                })()}
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

export default DividerSelection;
