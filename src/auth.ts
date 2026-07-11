import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "./lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [
        Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
        }),
    ],

    session: {
        strategy: "jwt",
    },

    callbacks: {
        async jwt({ token, user }) {
            if (user && user.id) {
                const dbUser = await prisma.user.findUnique({
                    where: { id: user.id },
                    select: {
                        role: true,
                    },
                });

                token.id = user.id;
                token.role = dbUser?.role ?? "USER";
            }

            return token;
        },

        async session({ session, token }) {
            session.user.id = token.id;
            session.user.role = token.role;

            return session;
        },
    },
    // secret: process.env.AUTH_SECRET
});
