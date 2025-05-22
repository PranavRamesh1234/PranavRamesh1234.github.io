/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['apbgdwgiqrzarwnicguu.supabase.co'],
  },
  distDir: '.next',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  }
}

module.exports = nextConfig 