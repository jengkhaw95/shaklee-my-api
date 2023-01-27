/**@type {import('next').NextConfig} */

const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/",
        destination: "/docs/index.html",
      },
    ];
  },
};

module.exports = nextConfig;
