/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config) => {
    // Fix for PDF.js in Next.js
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    }
    
    // Handle PDF.js worker
    config.module.rules.push({
      test: /\.worker\.(js|ts)$/,
      use: {
        loader: 'worker-loader',
        options: {
          inline: 'fallback',
        },
      },
    })
    
    return config
  },
}

export default nextConfig
