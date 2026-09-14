import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  // puppeteer-core/@sparticuz/chromium têm binários nativos e lógica de
  // resolução de caminho que não devem ser processados pelo bundler —
  // mantidos como dependência externa de runtime (Node resolve via
  // require/import normal em vez do bundle da rota).
  serverExternalPackages: ["puppeteer-core", "@sparticuz/chromium", "puppeteer"],
};

export default nextConfig;
