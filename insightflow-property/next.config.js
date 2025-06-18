/** @type {import('next').NextConfig} */
const nextConfig = {
  // App Router is enabled by default in Next.js 14
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Ignore these modules during server-side builds
      config.externals = config.externals || [];
      config.externals.push({
        'pdf-parse': 'commonjs pdf-parse',
        'tesseract.js': 'commonjs tesseract.js',
        'canvas': 'commonjs canvas'
      });
    }
    
    // Handle file loading issues with pdf-parse
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
    };

    return config;
  },
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse', 'tesseract.js', 'canvas']
  }
}

module.exports = nextConfig 