"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface RevealProps {
    children: ReactNode;
    className?: string;
    /** Extra delay (ms) before this element eases in once visible. */
    delay?: number;
    /** Render as a different element (e.g. "li", "section"). Defaults to div. */
    as?: "div" | "li" | "section";
}

/**
 * Fades + lifts its children into view the first time they enter the viewport.
 * Children are passed through untouched, so server components (like the
 * Google sign-in form) keep working inside it. Motion is skipped entirely
 * when the visitor prefers reduced motion.
 */
export function Reveal({ children, className, delay = 0, as = "div" }: RevealProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [shown, setShown] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        // Respect reduced motion: the `.reveal` stylesheet override renders
        // children fully visible with no transition, so we simply skip the
        // observer instead of flipping state inside the effect.
        const prefersReduced = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
        ).matches;
        if (prefersReduced) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0]?.isIntersecting) {
                    setShown(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    const Tag = as;

    return (
        <Tag
            ref={ref as React.Ref<HTMLDivElement & HTMLLIElement>}
            data-shown={shown}
            style={{ transitionDelay: shown ? `${delay}ms` : "0ms" }}
            className={cn("reveal", className)}
        >
            {children}
        </Tag>
    );
}
