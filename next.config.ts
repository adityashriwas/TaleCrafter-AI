import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.pollinations.ai",
      },
      {
        protocol: "https",
        hostname: "gen.pollinations.ai",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/sitemap-stories-:page.xml",
        destination: "/api/sitemap/stories/:page",
      },
    ];
  },
};

export default nextConfig;
