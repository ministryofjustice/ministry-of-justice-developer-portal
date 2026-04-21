const path = require('path');

// Set NEXT_PUBLIC_BASE_PATH explicitly only when a non-root base path is required.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath,
  assetPrefix: basePath || undefined,
  sassOptions: {
    includePaths: [path.join(__dirname, 'node_modules')],
    quietDeps: true,
  },
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

module.exports = nextConfig;
