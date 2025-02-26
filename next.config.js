/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ["example.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  // Suppress hydration warnings in production
  reactStrictMode: false,
  // Handle browser extensions adding attributes
  compiler: {
    styledComponents: true,
  },
};

module.exports = nextConfig;
