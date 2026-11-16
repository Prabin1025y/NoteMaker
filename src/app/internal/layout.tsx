import type { Metadata } from "next";
import { PRIVATE_ROBOTS } from "@/lib/seo";

export const metadata: Metadata = {
    title: { absolute: "Internal rendering | Eton Note" },
    robots: PRIVATE_ROBOTS,
    openGraph: { images: [] },
    twitter: { card: "summary", images: [] },
};

export default function InternalLayout({ children }: { children: React.ReactNode }) {
    return children;
}
