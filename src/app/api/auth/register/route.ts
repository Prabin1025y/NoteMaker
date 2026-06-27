import { hashPassword } from "@/lib/password";
import prisma from "@/lib/prisma";
import { registerSchema } from "@/validation/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json(
            { message: parsed.error.message || "Invalid input" },
            { status: 400 },
        );
    }

    const { email, password, fullName } = parsed.data;

    const exists = await prisma.user.findUnique({ where: { email } });

    if (exists) {
        return NextResponse.json(
            { message: "User already exists" },
            { status: 409 },
        );
    }

    const user = await prisma.user.create({
        data: {
            email,
            password: await hashPassword(password),
            name: fullName
        },
    });

    return NextResponse.json({ id: user.id, email: user.email });
}
