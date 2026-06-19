"use client";
import { useCallback, useEffect, useState } from "react";

type User = { id: string; email: string; role: "USER" | "ADMIN"; name?: string } | null;

export function useAuth() {
    const [user, setUser] = useState<User>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchMe = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/auth/me", { credentials: "include" });

            if (!res.ok) {
                setUser(null);
                const body = await res.json().catch(() => null);
                setError(body?.message || "Unauthorized");
                return;
            }

            const data = await res.json();
            setUser({ id: data.id, email: data.email, role: data.role, name: data.name });
        } catch (err: any) {
            setUser(null);
            setError(err?.message ?? String(err));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMe();
    }, [fetchMe]);

    const reload = fetchMe;

    function hasRole(roles?: string[] | string) {
        if (!roles) return !!user;
        if (!user) return false;
        const arr = Array.isArray(roles) ? roles : [roles];
        return arr.includes(user.role);
    }

    return { user, loading, error, reload, hasRole } as const;
}

export default useAuth;
