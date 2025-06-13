import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn-images.dzcdn.net',
        port: '',
        pathname: '/images/cover/**',
      },
      {
        protocol: 'https',
        hostname: 'api.deezer.com',
        port: '',
        pathname: '/album/*/image',
      },
    ],
  },
};

export default nextConfig;
