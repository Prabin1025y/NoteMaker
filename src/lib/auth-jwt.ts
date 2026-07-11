import { SignJWT, jwtVerify } from "jose";

const internal_secret = new TextEncoder().encode(
    process.env.INTERNAL_JWT_SECRET!,
);

export async function signInternalToken(payload: any) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("1m")
        .sign(internal_secret);
}

export async function verifyInternalToken(token: string) {
    const { payload } = await jwtVerify(token, internal_secret);
    return payload;
}
