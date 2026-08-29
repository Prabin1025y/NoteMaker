'use client'
import { THEMES } from "@/lib/themes";
import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = keyof typeof THEMES;

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

const CustomThemeContext = createContext<ThemeContextType | undefined>(
    undefined,
);

export const CustomThemeProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [currentTheme, setCurrentTheme] = useState<Theme>("default");

    useEffect(() => {
        const savedTheme = localStorage.getItem("custom-theme") || "default";

        if (savedTheme && savedTheme in THEMES) {
            setCurrentTheme(savedTheme as Theme);
            document.documentElement.setAttribute("data-theme", savedTheme);
        }
    }, []);

    const setTheme = (theme: Theme) => {
        if (!(theme in THEMES)) return;

        setCurrentTheme(theme);
        localStorage.setItem("custom-theme", theme);
        document.documentElement.setAttribute("data-theme", theme);
    };

    return (
        <CustomThemeContext.Provider value={{ theme: currentTheme, setTheme }}>
            {children}
        </CustomThemeContext.Provider>
    );
};

export function useCustomTheme() {
    const context = useContext(CustomThemeContext);

    if (!context) {
        throw new Error("useTheme must be used inside ThemeProvider");
    }

    return context;
}
