import { cookies } from "next/headers";
import { verifyToken } from "./auth-jwt";

export async function isAuthenticated() {
    const cookieStore = await cookies();

    const token = cookieStore.get("access_token")?.value;

    if (!token) {
        return false;
    }

    try {
        await verifyToken(token);
        return true;
    } catch (error) {
        return false;
    }
}
