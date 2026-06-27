"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";

export default function GuestGate({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (loading) return;

        if (user) {
            router.replace("/");
        }
    }, [loading, user]);

    if (loading) return null;

    if (user) return null;

    return <>{children}</>;
}
