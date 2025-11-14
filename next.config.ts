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
  async redirects() {
    return [
      {
        source: "/token/:address",
        destination: "/tokens/:address",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
