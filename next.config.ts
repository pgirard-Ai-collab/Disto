import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  // pdf-parse wraps pdf.js, which touches browser globals (DOMMatrix) at module
  // load time. Bundling it into the serverless function makes that eager eval
  // throw "DOMMatrix is not defined" on Vercel. Externalizing it so Next uses a
  // native runtime require() avoids the problem.
  serverExternalPackages: ['pdf-parse'],
  experimental: {
    // Route Handler /api/ingest accepts PDFs up to 50 MB
    proxyClientMaxBodySize: '55mb',
  },
};

export default withNextIntl(nextConfig);
