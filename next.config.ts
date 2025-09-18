import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimize for production
  experimental: {
    optimizePackageImports: ['framer-motion', 'lucide-react'],
  },
  // Remove standalone output for development to prevent header issues
  // output: 'standalone', // Commented out for development
  // Optimize images
  images: {
    formats: ['image/webp', 'image/avif'],
  },
  // Move serverComponentsExternalPackages to root level
  serverExternalPackages: [],
  // Add webpack configuration to handle large headers
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Increase server-side header limits
      config.externals = [...(config.externals || []), 'node:http'];
    }
    return config;
  },
  // Add server configuration
  serverRuntimeConfig: {
    // Increase header size limits
    maxHeaderSize: 32768, // 32KB
  },
  // Add public runtime config
  publicRuntimeConfig: {
    // Disable any features that might cause large headers
  },
};

export default nextConfig;
