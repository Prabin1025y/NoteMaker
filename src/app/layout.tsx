import type { Metadata } from "next";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import QueryProvider from "@/Providers/QueryProvider";
import ThemeProvider from "@/Providers/ThemeProvider";

export const metadata: Metadata = {
    title: "Eton Note: Create notes that click.",
    description:
        "An interactive note creation app for your clean note taking block by block.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="en"
            suppressHydrationWarning
            className="h-full antialiased overflow-x-hidden"
        >
            <body className="min-h-full flex flex-col overflow-y-auto">
                <ThemeProvider>
                    <SessionProvider>
                        <QueryProvider>
                            <TooltipProvider>{children}</TooltipProvider>
                            <ReactQueryDevtools initialIsOpen={false} />
                        </QueryProvider>
                        <Toaster
                            richColors
                            id="normal"
                            position="top-right"
                        />
                        <Toaster
                            richColors
                            id="promise"
                            position="bottom-right"
                        />
                    </SessionProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
