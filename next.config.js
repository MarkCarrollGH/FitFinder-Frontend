/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/recom/:path*',
        destination: 'http://localhost:8000/:path*'
      },
      {
        source: '/clothes/:path*',
        destination: 'http://localhost:8001/:path*'
      },
      {
        source: '/user/:path*',
        destination: 'http://localhost:8003/:path*'
      }
    ];
  },
};

module.exports = nextConfig;
