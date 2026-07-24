import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "welvors.com" }],
        destination: "https://www.welvors.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;