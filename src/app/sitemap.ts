import type { MetadataRoute } from "next";
import { GUIDES } from "@/lib/guides";
import { LEGAL_DETAILS, LEGAL_PATHS } from "@/lib/legal";
import { absoluteUrl, CONTENT_UPDATED_AT, IS_PREVIEW } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
    if (IS_PREVIEW) return [];

    const paths = [
        "/", "/features", "/faq", "/about", "/guides",
        ...Object.values(GUIDES).map((guide) => guide.path),
        ...(!LEGAL_DETAILS.draft ? LEGAL_PATHS : []),
    ];

    return paths.map((path) => ({
        url: absoluteUrl(path),
        lastModified: LEGAL_PATHS.includes(path)
            ? LEGAL_DETAILS.updatedAt
            : CONTENT_UPDATED_AT,
    }));
}
