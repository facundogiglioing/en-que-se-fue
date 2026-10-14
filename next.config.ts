import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Los PDF de resúmenes de tarjeta pueden pesar varios MB.
      bodySizeLimit: "15mb",
    },
  },
};

export default nextConfig;
