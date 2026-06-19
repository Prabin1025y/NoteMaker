import { signAccessToken, signRefreshToken } from "@/lib/auth-jwt";
import { setAuthCookies } from "@/lib/cookies";
import { verifyPassword } from "@/lib/password";
import prisma from "@/lib/prisma";
import { loginSchema } from "@/validation/auth";
import { NextResponse } from "next/server";
import argon2 from "argon2";

export async function POST(req: Request) {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json(
            { message: parsed.error.message || "Invalid input" },
            { status: 400 },
        );
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
        return NextResponse.json(
            { message: "Invalid Credentials" },
            { status: 401 },
        );
    }

    const valid = await verifyPassword(user.password, password);

    if (!valid) {
        return NextResponse.json(
            { message: "Invalid Credentials" },
            { status: 401 },
        );
    }

    const accessToken = await signAccessToken({
        sub: user.id,
        role: user.role,
    });

    const refreshToken = await signRefreshToken({
        sub: user.id,
    });

    const hashedRefreshToken = await argon2.hash(refreshToken);

    await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: hashedRefreshToken, refreshTokenCreatedAt: new Date() },
    });

    await setAuthCookies(accessToken, refreshToken);

    return NextResponse.json({ message: `Logged in as ${user.name}` });
}
