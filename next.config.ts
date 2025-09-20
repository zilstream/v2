import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
        pathname: "/Plunderswap/token-lists/refs/heads/main/images/**",
      },
    ],
  },
};

export default nextConfig;
