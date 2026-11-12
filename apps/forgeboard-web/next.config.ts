import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@backend-journey/ui", "@backend-journey/api-client"],
};

export default nextConfig;
