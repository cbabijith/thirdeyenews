/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  experimental: {
    turbopackFileSystemCacheForDev: false,
  },
}

module.exports = nextConfig
