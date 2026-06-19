import { cookies } from "next/headers";

export const setAuthCookies = async (
    accessToken: string,
    refreshToken: string,
) => {
    const cookieStore = await cookies();

    cookieStore.set("access_token", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        path: "/",
        maxAge: 15 * 60,
    });

    cookieStore.set("refresh_token", refreshToken, {
        httpOnly: true,
        secure: true,
        path: "/",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60,
    });
};

export const clearAuthCookies = async () => {
    const cookieStore = await cookies();

    cookieStore.delete("access_token");
    cookieStore.delete("refresh_token");
};
