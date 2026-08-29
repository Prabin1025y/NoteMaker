"use client";

import { THEMES } from "@/lib/themes";
import { useCustomTheme } from "@/Providers/CustomThemeProvider";
import {
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuPortal,
    DropdownMenuItem,
    DropdownMenuSubContent,
} from "./ui/dropdown-menu";
import { PaletteIcon } from "lucide-react";

export function CustomThemeSelector() {
    const { theme, setTheme } = useCustomTheme();

    return (
        <DropdownMenuSub>
            <DropdownMenuSubTrigger>
                <PaletteIcon />
                Appearance
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
                <DropdownMenuSubContent>
                    {Array.from(Object.keys(THEMES)).map((th) => (
                        <DropdownMenuItem
                            key={th}
                            className={
                                theme === th ? "bg-primary/20 text-primary" : ""
                            }
                            onClick={() => setTheme(th as keyof typeof THEMES)}
                        >
                            <div className="flex gap-1 items-center">
                                {THEMES[th as keyof typeof THEMES].colors.map(
                                    (c, index) => (
                                        <div
                                            key={index}
                                            className="h-2 w-2 border-foreground/20 border"
                                            style={{ backgroundColor: c }}
                                        />
                                    ),
                                )}
                            </div>
                            <p>{THEMES[th as keyof typeof THEMES].name}</p>
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuSubContent>
            </DropdownMenuPortal>
        </DropdownMenuSub>
    );
}
