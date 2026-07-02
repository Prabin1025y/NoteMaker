import { jwtVerify, SignJWT, type JWTPayload } from "jose";

export interface PdfPayload extends JWTPayload {
    purpose: "pdf";

    userId: string;

    noteId: string;
}

const ISSUER = "my-nextjs-app";

const AUDIENCE = "internal-pdf";

const secret = process.env.PDF_TOKEN_SECRET;

if (!secret) {
    throw new Error("Missing PDF_TOKEN_SECRET");
}

const SECRET = new TextEncoder().encode(secret);

export class PdfToken {
    static async create(payload: PdfPayload): Promise<string> {
        return await new SignJWT(payload)
            .setProtectedHeader({
                alg: "HS256",
            })
            .setIssuedAt()
            .setIssuer(ISSUER)
            .setAudience(AUDIENCE)
            .setExpirationTime("30s")
            .sign(SECRET);
    }

    static async verify(token: string): Promise<PdfPayload> {
        const { payload } = await jwtVerify<PdfPayload>(token, SECRET, {
            issuer: ISSUER,
            audience: AUDIENCE,
        });

        return payload;
    }
}
