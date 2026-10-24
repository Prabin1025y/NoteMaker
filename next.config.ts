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
    allowedDevOrigins: [
        "host.docker.internal",
        "webpage-pdf-exporter.onrender.com",
    ],
};

export default nextConfig;
