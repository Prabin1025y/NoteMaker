import { cookies } from "next/headers";
import { verifyToken } from "./auth-jwt";
import prisma from "./prisma";
import { ForbiddenError, UnauthorizedError } from "./custom-errors";

type Role = "USER" | "ADMIN";

export async function requireAuth(requiredRoles?: Role[]) {
    const cookieStore = await cookies();

    const token = cookieStore.get("access_token")?.value;

    if (!token) {
        throw new UnauthorizedError("Unauthorized");
    }

    let payload: any;
    try {
        payload = await verifyToken(token);
    } catch (_) {
        throw new UnauthorizedError("Unauthorized");
    }

    const userId = payload?.sub as string | undefined;
    const role = payload?.role as Role | undefined;

    if (!userId || !role) {
        throw new UnauthorizedError("Unauthorized");
    }

    if (requiredRoles && !requiredRoles.includes(role)) {
        throw new ForbiddenError("Unauthorized");
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, role: true, name: true },
    });

    if (!user) {
        throw new ForbiddenError("Forbidden");
    }

    return user;
}

export default requireAuth;
