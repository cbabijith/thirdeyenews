/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    turbopackFileSystemCacheForDev: false,
  },
}

module.exports = nextConfig
