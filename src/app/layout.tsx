import type { Metadata } from "next";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import QueryProvider from "@/Providers/QueryProvider";
import ThemeProvider from "@/Providers/ThemeProvider";
import { CustomThemeProvider } from "@/Providers/CustomThemeProvider";
import {
    IS_PREVIEW,
    PRIVATE_ROBOTS,
    SITE_DESCRIPTION,
    SITE_NAME,
    SITE_URL,
    SOCIAL_IMAGE,
} from "@/lib/seo";

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    applicationName: SITE_NAME,
    title: {
        default: "Beautiful study notes, less busywork | Eton Note",
        template: "%s | Eton Note",
    },
    description: SITE_DESCRIPTION,
    robots: IS_PREVIEW ? PRIVATE_ROBOTS : { index: true, follow: true },
    openGraph: {
        type: "website",
        siteName: SITE_NAME,
        title: SITE_NAME,
        description: SITE_DESCRIPTION,
        images: [SOCIAL_IMAGE],
    },
    twitter: {
        card: "summary_large_image",
        title: SITE_NAME,
        description: SITE_DESCRIPTION,
        images: [SOCIAL_IMAGE],
    },
    verification: {
        google: process.env.GOOGLE_SITE_VERIFICATION?.trim() || undefined,
        other: process.env.BING_SITE_VERIFICATION?.trim()
            ? { "msvalidate.01": process.env.BING_SITE_VERIFICATION.trim() }
            : undefined,
    },
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
                <CustomThemeProvider>
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
                </CustomThemeProvider>
            </body>
        </html>
    );
}
