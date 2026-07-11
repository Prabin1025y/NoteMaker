import { useNoteStore } from "@/Context/DataStore";
import Link, { LinkProps } from "next/link";
import { MouseEvent, ReactNode } from "react";

type GuardedLinkProps = LinkProps & {
    children: ReactNode;
    className?: string;
};

export function GuardedLink({ children, href, ...props }: GuardedLinkProps) {
    const { blocksToBeSynced } = useNoteStore();

    const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
        if (blocksToBeSynced.length == 0) return;

        const leave = window.confirm(
            "You have unsaved changes. Are you sure you want to leave?",
        );

        if (!leave) {
            e.preventDefault();
        }
    };

    return (
        <Link
            prefetch={false}
            href={href}
            onClick={handleClick}
            {...props}
        >
            {children}
        </Link>
    );
}
