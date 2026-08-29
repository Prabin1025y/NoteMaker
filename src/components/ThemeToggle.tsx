"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
    className?: string;
}

/**
 * Light/dark switch wired to next-themes (drives the `.dark` class → --ds-*
 * tokens). Hydration-safe: renders a stable placeholder until mounted so the
 * server and client markup match. Both icons stay in the DOM and cross-fade
 * with the shared easing (design.md motion contract).
 */
export default function ThemeToggle({ className }: ThemeToggleProps) {
    const { resolvedTheme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    const isDark = resolvedTheme === "dark";

    return (
        <button
            type="button"
            aria-label={
                mounted
                    ? `Switch to ${isDark ? "light" : "dark"} theme`
                    : "Toggle theme"
            }
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className={cn(
                "relative grid h-9 w-9 place-items-center rounded-lg border border-muted bg-card/80 text-muted-foreground outline-none",
                "transition-colors duration-150 hover:bg-background/80 hover:text-ink",
                "focus-visible:ring-2 focus-visible:ring-[color:var(--ds-focus-ring)] focus-visible:ring-offset-1 focus-visible:ring-offset-card/80",
                "active:scale-[0.96]",
                className,
            )}
        >
            {/* Both icons mounted; cross-fade + scale on theme change. */}
            <Sun
                size={16}
                className={cn(
                    "absolute transition-[opacity,transform] duration-[300ms] ease-[cubic-bezier(0.2,0,0,1)]",
                    mounted && !isDark
                        ? "scale-100 opacity-100"
                        : "scale-50 opacity-0",
                )}
            />
            <Moon
                size={16}
                className={cn(
                    "absolute transition-[opacity,transform] duration-[300ms] ease-[cubic-bezier(0.2,0,0,1)]",
                    mounted && isDark
                        ? "scale-100 opacity-100"
                        : "scale-50 opacity-0",
                )}
            />
        </button>
    );
}
