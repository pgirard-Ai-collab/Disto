import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  // pdf-parse wraps pdf.js, which needs browser globals (DOMMatrix). It polyfills
  // them from @napi-rs/canvas (a native binary dependency). Both must stay external:
  // bundling them into the serverless function strips the native binary, the polyfill
  // fails, and pdf.js throws "DOMMatrix is not defined" on Vercel. Externalizing makes
  // Next use a runtime require() and trace the binary into the function.
  serverExternalPackages: ['pdf-parse', '@napi-rs/canvas'],
  experimental: {
    // Route Handler /api/ingest accepts PDFs up to 50 MB
    proxyClientMaxBodySize: '55mb',
  },
};

export default withNextIntl(nextConfig);
