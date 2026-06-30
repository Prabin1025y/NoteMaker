"use client";
import AuthGate from "@/components/AuthGate";
import HomeLayout from "@/Pages/HomeLayout";

export default function Home() {
    return (
        <AuthGate>
            <HomeLayout />
        </AuthGate>
    );
}
