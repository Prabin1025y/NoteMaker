import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "res.cloudinary.com",
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
