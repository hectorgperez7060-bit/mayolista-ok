import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  allowedDevOrigins: [
    "https://preview-chat-5b27cd21-26d2-4aa4-afea-40ddde789e10.space.z.ai",
  ],
};

export default nextConfig;
