import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/artwork',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  reactStrictMode: false,
};

export default nextConfig;
