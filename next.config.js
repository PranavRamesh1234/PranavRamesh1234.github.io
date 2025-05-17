/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['apbgdwgiqrzarwnicguu.supabase.co'],
  },
  output: 'export',
  basePath: '/bookmarketv2',
  distDir: 'dist',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  }
}

module.exports = nextConfig 