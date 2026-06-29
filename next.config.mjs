// import { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig = {
  turbopack: {
    root: process.cwd()
  },
  images: {
    // Cache optimized images for 31 days (Vercel recommended minimum).
    minimumCacheTTL: 2678400, // 31 days
    // Allowlist only the quality values actually used — fewer variants = fewer cache writes.
    qualities: [75, 85],
    deviceSizes: [640, 828, 1080, 1280, 1920],
    imageSizes: [16, 32, 64, 128, 256],
    formats: ['image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'utfs.io',
        port: ''
      },
      {
        protocol: 'https',
        hostname: 'api.slingacademy.com',
        port: ''
      },
      {
        protocol: 'https',
        hostname: 'dev.kacc.mn',
        port: ''
      }
    ]
  },
  transpilePackages: ['geist']
};

export default withNextIntl(nextConfig);
