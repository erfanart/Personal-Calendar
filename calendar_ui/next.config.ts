import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export',  // Required for static export
  distDir: 'out',    // Explicitly set output directory
  images: {
    unoptimized: true // Required for static export
  },
  // Other Next.js configuration options...
}

export default nextConfig