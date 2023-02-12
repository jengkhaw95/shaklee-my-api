/**@type {import('next').NextConfig} */

const nextConfig = {
  async headers() {
    return [
      {
        source: "/api/(.*)",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
          {key: "Access-Control-Allow-Methods", value: "GET,OPTIONS"},
        ],
      },
    ];
  },
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
