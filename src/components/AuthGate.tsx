"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

type Props = {
    roles?: string[] | string;
    redirectTo?: string;
    children: React.ReactNode;
};
export default function AuthGate({
    roles,
    redirectTo = "/",
    children,
}: Props) {
    const router = useRouter();
    // const { user, loading, hasRole } = useAuth();
    const { status, data } = useSession();

    useEffect(() => {
        if (status === "loading") return;

        if (!data?.user) {
            router.replace(redirectTo);
            return;
        }

        if (
            roles &&
            !(Array.isArray(roles) ? roles : [roles]).includes(data.user.role)
        ) {
            router.replace("/403");
        }
    }, [status, data, roles, redirectTo, router]);

    if (status === "loading") return null;

    if (
        !data?.user ||
        (roles &&
            !(Array.isArray(roles) ? roles : [roles]).includes(data.user.role))
    )
        return null;

    return <>{children}</>;
}
