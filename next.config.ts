import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  // basePath removed for Vercel
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  reactStrictMode: false,
};

export default nextConfig;
