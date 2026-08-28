import { colorOptions } from "@/utils/ColorsInfo";
import { CSSProperties } from "react";

export function ColorOptionSelect({
    colorOptionId,
}: {
    colorOptionId: number;
}) {
    const colorOption =
        colorOptions.find((co) => co.id === colorOptionId) || colorOptions[0];
    return (
        <div
            className={`w-full rounded-lg border p-3 text-left transition ds-block-surface hover:text-foreground`}
            style={
                {
                    "--block-bg": colorOption.backgroundColorHex,
                    "--block-border": colorOption.borderColorHex,
                } as CSSProperties
            }
        >
            <div className="flex items-center gap-3">
                {/* Color Preview */}
                <div className="h-12 w-20 overflow-hidden rounded-md border shrink-0">
                    <div className="flex h-full">
                        <div
                            className="flex-1"
                            style={{
                                background: `linear-gradient(90deg,${colorOption.secondaryColorHex} 0%, ${colorOption.primaryColorHex} 50%, ${colorOption.secondaryColorHex} 100%)`,
                            }}
                        />
                    </div>
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                    <div className="font-medium text-foreground">
                        {colorOption.name}
                    </div>

                    <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                            <div
                                className="h-3 w-3 rounded-full border border-gray-300"
                                style={{
                                    backgroundColor:
                                        colorOption.primaryColorHex,
                                }}
                            />
                            <span>Primary</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                            <div
                                className="h-3 w-3 rounded-full border border-gray-300"
                                style={{
                                    backgroundColor:
                                        colorOption.secondaryColorHex,
                                }}
                            />
                            <span>Secondary</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
