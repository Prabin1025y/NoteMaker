import PublicFooter from "@/components/public/PublicFooter";
import PublicHeader from "@/components/public/PublicHeader";
import landing from "@/app/landing.module.css";
import styles from "@/components/public/public.module.css";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className={`${landing.page} ${styles.publicPage}`}>
            <a href="#main-content" className={landing.skipLink}>Skip to content</a>
            <PublicHeader />
            {children}
            <PublicFooter />
        </div>
    );
}
