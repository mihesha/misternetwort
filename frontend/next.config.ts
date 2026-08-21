import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/api/:path*', // Proxy to Laravel Backend
      },
      {
        source: '/storage/:path*',
        destination: 'http://localhost:8000/storage/:path*', // Proxy storage files to Laravel
      },
    ];
  },
};

export default nextConfig;
