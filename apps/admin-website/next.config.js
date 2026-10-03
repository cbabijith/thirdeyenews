/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ['sharp'],
  outputFileTracingIncludes: {
    '/api/upload': ['../../node_modules/.pnpm/@img+sharp-linux-x64@*/node_modules/@img/**/*', '../../node_modules/.pnpm/@img+sharp-libvips-linux-x64@*/node_modules/@img/**/*', '../../node_modules/.pnpm/sharp@*/node_modules/sharp/**/*'],
  },
  images: {
    unoptimized: false,
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: '*.r2.dev' },
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: '*.cloudflarestorage.com' },
    ],
  },
  experimental: {
    turbopackFileSystemCacheForDev: false,
  },
}

module.exports = nextConfig
