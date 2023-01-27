/**@type {import('next').NextConfig} */

const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/",
        destination: "./docs/test.html",
      },
    ];
  },
};

module.exports = nextConfig;
