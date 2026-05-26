import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  experimental: {
    // Route Handler /api/ingest accepts PDFs up to 50 MB
    proxyClientMaxBodySize: '55mb',
  },
};

export default withNextIntl(nextConfig);
