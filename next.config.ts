import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.welvors.com" }],
        destination: "https://welvors.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;