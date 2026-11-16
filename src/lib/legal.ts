// Keep drafts out of the sitemap until the release checklist in SEO.md is complete.
export const LEGAL_DETAILS = {
    draft: true,
    operator: "[Operator legal name]",
    address: "[Operator postal address]",
    supportEmail: "[Support email]",
    privacyEmail: "[Privacy contact email]",
    country: "Nepal",
    updatedAt: "2026-11-13",
} as const;

export const LEGAL_PATHS = ["/privacy", "/terms", "/cookies", "/contact"];
