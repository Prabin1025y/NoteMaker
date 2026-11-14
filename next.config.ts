import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    experimental: {
        agentUpgrade: "security",
    },
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "res.cloudinary.com",
            },
            {
                protocol: "https",
                hostname: "lh3.googleusercontent.com",
            },
        ],
    },
    output: "standalone",
    async headers() {
        const headers = [{
            key: "X-Robots-Tag",
            value: "noindex, nofollow, noarchive, nosnippet, noimageindex",
        }];

        return [
            ...["/dashboard/:path*", "/note/:path*", "/api/:path*", "/internal/:path*"]
                .map((source) => ({ source, headers })),
            ...(process.env.VERCEL_ENV === "preview"
                ? [{ source: "/:path*", headers }]
                : []),
        ];
    },
    allowedDevOrigins: [
        "host.docker.internal",
        "webpage-pdf-exporter.onrender.com",
    ],
};

export default nextConfig;
