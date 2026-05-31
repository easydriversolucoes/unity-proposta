import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Server-side env vars (never exposed to the browser)
  serverExternalPackages: ['@react-pdf/renderer'],
  // Image domains if you add Lidiane's photo via external URL
  images: {
    remotePatterns: [],
  },
}

export default nextConfig
