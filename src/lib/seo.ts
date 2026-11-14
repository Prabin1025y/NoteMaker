import type { Metadata } from "next";

export const SITE_NAME = "Eton Note";
export const SITE_URL = "https://etonnote.vercel.app";
export const SITE_DESCRIPTION =
    "Create structured study notes with text, LaTeX, code, tables, images, and drawings. Organize by subject, draft with AI, and export a PDF.";
export const CONTENT_UPDATED_AT = "2026-11-13";
export const IS_PREVIEW = process.env.VERCEL_ENV === "preview";

export const SOCIAL_IMAGE = {
    url: "/social-preview.png",
    width: 1200,
    height: 630,
    alt: "Eton Note — Beautiful notes, less busywork, with an illustrative physics study note.",
};

export const PRIVATE_ROBOTS: Metadata["robots"] = {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
    noimageindex: true,
};

export function absoluteUrl(path: string) {
    return new URL(path, SITE_URL).toString();
}

export function publicMetadata({
    title,
    description,
    path,
    draft = false,
    article = false,
}: {
    title: string;
    description: string;
    path: string;
    draft?: boolean;
    article?: boolean;
}): Metadata {
    const pageTitle = `${title}${draft ? " (Draft)" : ""} | ${SITE_NAME}`;
    return {
        title: { absolute: pageTitle },
        description,
        alternates: { canonical: absoluteUrl(path) },
        robots: IS_PREVIEW
            ? PRIVATE_ROBOTS
            : {
                index: !draft,
                follow: true,
                googleBot: { index: !draft, follow: true, "max-image-preview": "large" },
            },
        openGraph: {
            type: article ? "article" : "website",
            title: pageTitle,
            description,
            url: absoluteUrl(path),
            siteName: SITE_NAME,
            images: [SOCIAL_IMAGE],
            ...(article ? { modifiedTime: CONTENT_UPDATED_AT } : {}),
        },
        twitter: {
            card: "summary_large_image",
            title: pageTitle,
            description,
            images: [SOCIAL_IMAGE],
        },
    };
}

export const SITE_SCHEMA = {
    "@context": "https://schema.org",
    "@graph": [
        {
            "@type": "Organization",
            "@id": absoluteUrl("/#organization"),
            name: SITE_NAME,
            url: absoluteUrl("/"),
            logo: absoluteUrl("/logo.png"),
        },
        {
            "@type": "WebSite",
            "@id": absoluteUrl("/#website"),
            name: SITE_NAME,
            url: absoluteUrl("/"),
            description: SITE_DESCRIPTION,
            inLanguage: "en",
            publisher: { "@id": absoluteUrl("/#organization") },
        },
        {
            "@type": "WebApplication",
            "@id": absoluteUrl("/#application"),
            name: SITE_NAME,
            url: absoluteUrl("/"),
            description: SITE_DESCRIPTION,
            applicationCategory: "EducationalApplication",
            operatingSystem: "Web browser",
            browserRequirements: "Requires JavaScript and Google sign-in.",
            image: absoluteUrl(SOCIAL_IMAGE.url),
            provider: { "@id": absoluteUrl("/#organization") },
            featureList: [
                "Block-based study notes with rich text, LaTeX, code, tables, images, and drawings",
                "Subject folders, favorites, and pinned notes",
                "Prompt-based AI block generation",
                "PDF export",
                "Optional read-only note sharing with signed-in viewers",
            ],
        },
    ],
};
