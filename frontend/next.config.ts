import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    // Use this app as root so PostCSS/Tailwind and lockfile resolve correctly
    root: path.resolve(process.cwd()),
  },
};

export default nextConfig;
