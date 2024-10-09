import NextBundleAnalyzer from "@next/bundle-analyzer";

const isProduction = process.env.ENV === "production";

const withBundleAnalyzer = NextBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
  openAnalyzer: false,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (
    config,
    { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack },
  ) => {
    config.module.rules.push({
      test: /\.mp3|\.ttf$/,
      type: "asset/resource",
    });
    config.module.parser.javascript.dynamicImportFetchPriority = "high";
    // Important: return the modified config
    return config;
  },
  compiler: {
    reactRemoveProperties: isProduction,
    removeConsole: isProduction ? { exclude: ["error"] } : false,
  },
  devIndicators: {
    buildActivityPosition: "top-right",
  },
  output: "export",
  productionBrowserSourceMaps: false,
  reactStrictMode: true,
  swcMinify: true,
};

export default withBundleAnalyzer(nextConfig);
