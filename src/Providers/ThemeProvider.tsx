"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * App theme provider (next-themes).
 * Adds/removes the `.dark` class on <html>, which drives the `--ds-*`
 * design tokens defined in globals.css. System detection is enabled so the
 * app honors the OS preference until the user makes an explicit choice.
 */
export default function ThemeProvider({
    children,
    ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
    return (
        <NextThemesProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
            {...props}
        >
            {children}
        </NextThemesProvider>
    );
}
