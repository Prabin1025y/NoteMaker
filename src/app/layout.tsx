import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import QueryProvider from "@/Providers/QueryProvider";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

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
            className={`${geistSans.variable} ${geistMono.variable} h-full antialiased overflow-x-hidden`}
        >
            <body className="min-h-full flex flex-col overflow-y-auto">
                <SessionProvider>
                    <QueryProvider>
                        <TooltipProvider>{children}</TooltipProvider>
                        <ReactQueryDevtools initialIsOpen={false} />
                    </QueryProvider>
                    <Toaster
                        theme="light"
                        richColors
                        id="normal"
                        position="top-right"
                    />
                    <Toaster
                        theme="light"
                        richColors
                        id="promise"
                        position="bottom-right"
                    />
                </SessionProvider>
            </body>
        </html>
    );
}
