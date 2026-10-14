import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // lowdb lee el JSON por ruta en runtime y el tracer no lo detecta solo.
  outputFileTracingIncludes: {
    "/**": ["src/data/database.json"],
  },
  experimental: {
    serverActions: {
      // Los PDF de resúmenes de tarjeta pueden pesar varios MB.
      bodySizeLimit: "15mb",
    },
  },
};

export default nextConfig;
