"use client";
import React from "react";
import useAuth from "@/hooks/useAuth";

type Props = {
    roles?: string[] | string;
    fallback?: React.ReactNode;
    children: React.ReactNode;
};

export default function AuthGate({ roles, fallback = null, children }: Props) {
    const { user, loading, hasRole } = useAuth();

    if (loading) return null;
    if (!user) return <>{fallback}</>;
    if (!hasRole(roles)) return <>{fallback}</>;
    return <>{children}</>;
}
