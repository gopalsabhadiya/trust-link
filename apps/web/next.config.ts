import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@trustlink/shared"],
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
