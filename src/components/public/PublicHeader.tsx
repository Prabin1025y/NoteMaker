import Image from "next/image";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import { SignInButton } from "@/components/auth/sign-in-button";
import landing from "@/app/landing.module.css";
import styles from "./public.module.css";

const links = [
    { href: "/features", label: "Features" },
    { href: "/guides", label: "Study guides" },
    { href: "/faq", label: "FAQ" },
    { href: "/about", label: "About" },
];

export default function PublicHeader() {
    return (
        <header className={landing.header}>
            <div className={`${landing.container} ${styles.headerInner}`}>
                <Link href="/" prefetch={false} className={landing.brand} aria-label="Eton Note home">
                    <Image src="/logo.png" width={34} height={33} alt="" />
                    <span>Eton Note</span>
                </Link>
                <nav aria-label="Main navigation" className={styles.navigation}>
                    {links.map((link) => (
                        <Link key={link.href} href={link.href} prefetch={false}>{link.label}</Link>
                    ))}
                </nav>
                <div className={landing.headerActions}>
                    <ThemeToggle className={landing.themeToggle} />
                    <SignInButton label="Sign in" size="sm" variant="outline" className={landing.headerSignIn} />
                </div>
            </div>
        </header>
    );
}
