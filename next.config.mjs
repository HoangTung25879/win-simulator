/** @type {import('next').NextConfig} */
import NextBundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = NextBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
  openAnalyzer: false,
});

const nextConfig = {
  webpack: (
    config,
    { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack },
  ) => {
    config.module.rules.push({
      test: /\.mp3|\.ttf$/,
      type: "asset/resource",
    });
    // Important: return the modified config
    return config;
  },
  compiler: {
    removeConsole:
      process.env.ENV === "production" ? { exclude: ["error"] } : false,
  },
};

export default withBundleAnalyzer(nextConfig);
