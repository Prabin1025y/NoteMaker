import Image from "next/image";
import Link from "next/link";
import { LEGAL_DETAILS } from "@/lib/legal";
import landing from "@/app/landing.module.css";
import styles from "./public.module.css";

const groups = [
    {
        title: "Explore",
        links: [
            { href: "/features", label: "Features" },
            { href: "/guides", label: "Study guides" },
            { href: "/faq", label: "FAQ" },
            { href: "/about", label: "About Eton Note" },
            { href: "/contact", label: "Contact" },
        ],
    },
    {
        title: "Policies",
        links: [
            { href: "/privacy", label: "Privacy Policy" },
            { href: "/terms", label: "Terms of Service" },
            { href: "/cookies", label: "Cookie Policy" },
        ],
    },
];

export default function PublicFooter({ homeHref = "/" }: { homeHref?: string }) {
    return (
        <footer className={`${landing.footer} ${styles.footer}`}>
            <div className={`${landing.container} ${styles.footerGrid}`}>
                <div>
                    <a href={homeHref} className={landing.brand}>
                        <Image src="/logo.png" width={28} height={27} alt="" />
                        <span>Eton Note</span>
                    </a>
                    <p className={styles.footerDescription}>Mixed-content study notes.<br />More room for understanding.</p>
                </div>
                {groups.map((group) => (
                    <nav key={group.title} aria-label={`${group.title} links`}>
                        <h2>{group.title}</h2>
                        <ul className={styles.footerLinks}>
                            {group.links.map((link) => (
                                <li key={link.href}><Link href={link.href} prefetch={false}>{link.label}</Link></li>
                            ))}
                        </ul>
                    </nav>
                ))}
            </div>
            <div className={`${landing.container} ${styles.footerBottom}`}>
                <p>© {new Date().getFullYear()} Eton Note</p>
                {LEGAL_DETAILS.draft && <p>Policies are drafts pending operator details and legal review.</p>}
            </div>
        </footer>
    );
}
