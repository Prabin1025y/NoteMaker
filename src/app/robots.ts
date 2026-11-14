import type { MetadataRoute } from "next";
import { absoluteUrl, IS_PREVIEW } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
    if (IS_PREVIEW) return { rules: { userAgent: "*", disallow: "/" } };

    return {
        rules: {
            userAgent: "*",
            allow: "/",
            disallow: ["/dashboard", "/note", "/api", "/internal"],
        },
        sitemap: absoluteUrl("/sitemap.xml"),
    };
}
