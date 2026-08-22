import { ColorOptionSelect } from "../ColorOptionSelect";
import { colorOptions } from "@/utils/ColorsInfo";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "../ui/dropdown-menu";
import { ALL_DIVIDERS } from "@/utils/Dividers";

interface DividerSelectiontype {
    colorOptionId: number;
    setColorOptionId: (id: number) => void;
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
                <label className="mb-3 block text-[13px] font-semibold text-body">
                    Design Type
                </label>

                <DropdownMenu>
                    <DropdownMenuTrigger className="flex w-full cursor-pointer items-center justify-center rounded-lg border border-dashed border-strong py-4 outline-none transition-colors duration-150 hover:bg-tint focus-visible:ring-2 focus-visible:ring-[color:var(--ds-focus-ring)]">
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
                <label className="mb-3 block text-[13px] font-semibold text-body">
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
