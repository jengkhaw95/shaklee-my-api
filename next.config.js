/** @type {import('next').NextConfig} */

const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/",
        destination: "/docs/output/index.html",
      },
    ];
  },
};

module.exports = nextConfig;
