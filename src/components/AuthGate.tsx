"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";

type Props = {
    roles?: string[] | string;
    redirectTo?: string;
    children: React.ReactNode;
};

export default function AuthGate({
    roles,
    redirectTo = "/login",
    children,
}: Props) {
    const router = useRouter();
    const { user, loading, hasRole } = useAuth();

    useEffect(() => {
        if (loading) return;

        if (!user) {
            router.replace(redirectTo);
            return;
        }

        if (!hasRole(roles)) {
            router.replace("/403");
        }
    }, [loading, user, roles, hasRole, redirectTo, router]);

    if (loading) return null;

    if (!user || !hasRole(roles)) return null;

    return <>{children}</>;
}
