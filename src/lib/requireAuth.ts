import { ForbiddenError, UnauthorizedError } from "./Error/custom-errors";
import { auth } from "@/auth";

type Role = "USER" | "ADMIN";

export async function requireAuth(requiredRoles?: Role[]) {
    const session = await auth();

    if (!session?.user) {
        throw new UnauthorizedError("Unauthorized");
    }

    if (requiredRoles && !requiredRoles.includes(session.user.role)) {
        throw new ForbiddenError("Forbidden");
    }
    return session.user;
}

export default requireAuth;
