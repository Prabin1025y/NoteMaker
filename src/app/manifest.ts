import type { MetadataRoute } from "next";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: SITE_NAME,
        short_name: SITE_NAME,
        description: SITE_DESCRIPTION,
        start_url: "/",
        display: "browser",
        background_color: "#ffffff",
        theme_color: "#c78316",
        icons: [
            { src: "/icons/app-192.png", sizes: "192x192", type: "image/png" },
            { src: "/icons/app-512.png", sizes: "512x512", type: "image/png" },
        ],
    };
}
