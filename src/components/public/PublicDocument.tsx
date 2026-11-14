import type { ReactNode } from "react";
import JsonLd from "@/components/seo/JsonLd";
import { LEGAL_DETAILS } from "@/lib/legal";
import { absoluteUrl, CONTENT_UPDATED_AT, SITE_NAME, SOCIAL_IMAGE } from "@/lib/seo";
import landing from "@/app/landing.module.css";
import styles from "./public.module.css";

export type DocumentSection = { id: string; title: string; content: ReactNode };
type PageLink = { href: string; label: string };

export default function PublicDocument({
    title,
    description,
    path,
    sections,
    draft = false,
    updatedAt = CONTENT_UPDATED_AT,
    breadcrumbs = [{ href: "/", label: "Home" }],
    related = [{ href: "/guides", label: "Study guides" }, { href: "/faq", label: "Frequently asked questions" }],
    schemaType = "WebPage",
    schema = {},
}: {
    title: string;
    description: string;
    path: string;
    sections: DocumentSection[];
    draft?: boolean;
    updatedAt?: string;
    breadcrumbs?: PageLink[];
    related?: PageLink[];
    schemaType?: "WebPage" | "AboutPage" | "ContactPage" | "CollectionPage" | "Article" | "FAQPage";
    schema?: Record<string, unknown>;
}) {
    const crumbs = [...breadcrumbs, { href: path, label: title }];
    const date = new Date(`${updatedAt}T00:00:00Z`).toLocaleDateString("en", {
        year: "numeric", month: "long", day: "numeric", timeZone: "UTC",
    });

    return (
        <main id="main-content" tabIndex={-1} className={styles.document}>
            <JsonLd data={{
                "@context": "https://schema.org",
                "@graph": [
                    {
                        "@type": "BreadcrumbList",
                        "@id": absoluteUrl(`${path}#breadcrumb`),
                        itemListElement: crumbs.map((crumb, index) => ({
                            "@type": "ListItem",
                            position: index + 1,
                            name: crumb.label,
                            item: absoluteUrl(crumb.href),
                        })),
                    },
                    {
                        "@type": schemaType === "Article" ? "WebPage" : schemaType,
                        "@id": absoluteUrl(`${path}#page`),
                        url: absoluteUrl(path),
                        name: title,
                        description,
                        inLanguage: "en",
                        dateModified: updatedAt,
                        isPartOf: { "@id": absoluteUrl("/#website") },
                        breadcrumb: { "@id": absoluteUrl(`${path}#breadcrumb`) },
                        ...(schemaType === "Article" ? { mainEntity: { "@id": absoluteUrl(`${path}#article`) } } : {}),
                        ...schema,
                    },
                    ...(schemaType === "Article" ? [{
                            "@type": "Article",
                            "@id": absoluteUrl(`${path}#article`),
                            headline: title,
                            description,
                            inLanguage: "en",
                            dateModified: updatedAt,
                            mainEntityOfPage: { "@id": absoluteUrl(`${path}#page`) },
                            image: absoluteUrl(SOCIAL_IMAGE.url),
                            author: { "@type": "Organization", name: SITE_NAME, url: absoluteUrl("/about") },
                            publisher: {
                                "@type": "Organization",
                                name: SITE_NAME,
                                url: absoluteUrl("/"),
                                logo: { "@type": "ImageObject", url: absoluteUrl("/logo.png") },
                            },
                    }] : []),
                ],
            }} />
            <div className={landing.container}>
                <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
                    <ol>
                        {breadcrumbs.map((crumb) => (
                            <li key={crumb.href}><a href={crumb.href}>{crumb.label}</a></li>
                        ))}
                        <li><span aria-current="page">{title}</span></li>
                    </ol>
                </nav>
                <header className={styles.intro}>
                    <h1>{title}</h1>
                    <p className={styles.lead}>{description}</p>
                    <p className={styles.updated}>Last updated <time dateTime={updatedAt}>{date}</time></p>
                    {draft && (
                        <aside className={styles.draftNotice} aria-label="Draft status">
                            <strong>Draft for review — not a finalized legal notice</strong>
                            <p>Operator identity, contact details, and legal review in {LEGAL_DETAILS.country} are outstanding. Placeholders are not active contact channels.</p>
                        </aside>
                    )}
                </header>
                <div className={styles.documentGrid}>
                    <aside className={styles.contents}>
                        <nav aria-label="On this page">
                            <h2>On this page</h2>
                            <ul>{sections.map((section) => (
                                <li key={section.id}><a href={`#${section.id}`}>{section.title}</a></li>
                            ))}</ul>
                        </nav>
                        {related.length > 0 && (
                            <nav aria-label="Related pages" className={styles.related}>
                                <h2>Keep exploring</h2>
                                <ul>{related.map((link) => (
                                    <li key={link.href}><a href={link.href}>{link.label}</a></li>
                                ))}</ul>
                            </nav>
                        )}
                    </aside>
                    <article className={styles.prose}>
                        {sections.map((section) => (
                            <section id={section.id} key={section.id} aria-labelledby={`${section.id}-title`}>
                                <h2 id={`${section.id}-title`}>{section.title}</h2>
                                {section.content}
                            </section>
                        ))}
                    </article>
                </div>
            </div>
        </main>
    );
}
