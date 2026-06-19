import { signAccessToken, signRefreshToken, verifyToken } from "@/lib/auth-jwt";
import { clearAuthCookies, setAuthCookies } from "@/lib/cookies";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import argon2 from "argon2";

const MAX_REFRESH_LIFETIME = 30 * 24 * 60 * 60 * 1000;
export async function POST() {
    const cookieStore = await cookies();

    const refreshToken = cookieStore.get("refresh_token")?.value;

    if (!refreshToken) {
        return NextResponse.json(
            { message: "Invalid Session" },
            { status: 401 },
        );
    }

    try {
        const payload = await verifyToken(refreshToken);
        const userId = payload.sub as string;

        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user || !user.refreshToken || !user.refreshTokenCreatedAt) {
            return NextResponse.json(
                { message: "Invalid Session" },
                { status: 401 },
            );
        }

        const isValid = await argon2.verify(user.refreshToken, refreshToken);

        if (!isValid) {
            await clearAuthCookies();
            return NextResponse.json(
                { message: "Invalid Session" },
                { status: 401 },
            );
        }

        if (
            Date.now() - user.refreshTokenCreatedAt.getTime() >
            MAX_REFRESH_LIFETIME
        )
            return NextResponse.json(
                { message: "Session Expired" },
                { status: 401 },
            );

        const newAccessToken = await signAccessToken({
            sub: user.id,
            role: user.role,
        });

        const newRefreshToken = await signRefreshToken({ sub: user.id });
        const hashedRefreshToken = await argon2.hash(newRefreshToken);

        await prisma.user.update({
            where: { id: user.id },
            data: { refreshToken: hashedRefreshToken },
        });

        await setAuthCookies(newAccessToken, newRefreshToken);

        return NextResponse.json({ message: "Refreshed" });
    } catch (error) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
}
