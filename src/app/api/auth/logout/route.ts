import { clearAuthCookies } from "@/lib/cookies";
import { NextResponse } from "next/server";

export async function POST() {
    await clearAuthCookies();
    return NextResponse.json({ message: "Logged out" });
}
