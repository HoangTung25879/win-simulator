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
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
    ],
  },
  compiler: {
    reactRemoveProperties: isProduction,
    removeConsole: isProduction,
  },
  devIndicators: {
    buildActivityPosition: "top-right",
  },
  productionBrowserSourceMaps: false,
  reactStrictMode: true,
  swcMinify: true,
};

export default withBundleAnalyzer(nextConfig);
