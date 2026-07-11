"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function GuestGate({ children }: { children: React.ReactNode }) {
    const { data, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "loading") return;

        if (data?.user) {
            router.replace("/dashboard");
        }
    }, [status, data, router]);

    if (status === "loading") return null;

    if (data?.user) return null;

    return <>{children}</>;
}
