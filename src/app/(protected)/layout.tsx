import type { Metadata } from "next";
import AuthGate from "@/components/AuthGate";
import { PRIVATE_ROBOTS } from "@/lib/seo";

export const metadata: Metadata = {
    title: { absolute: "Workspace | Eton Note" },
    description: "Sign in to manage your Eton Note study notes.",
    robots: PRIVATE_ROBOTS,
    openGraph: {
        title: "Workspace | Eton Note",
        description: "Your study-note workspace.",
        images: [],
    },
    twitter: {
        card: "summary",
        title: "Workspace | Eton Note",
        description: "Your study-note workspace.",
        images: [],
    },
};

export default function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <AuthGate>{children}</AuthGate>;
}
