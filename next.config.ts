import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Route Handler /api/ingest accepts PDFs up to 50 MB
    proxyClientMaxBodySize: '55mb',
  },
};

export default nextConfig;
