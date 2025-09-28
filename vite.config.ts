import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => {
  const isProd = mode === "production";

  return {
    plugins: [
      react(),
      ...(isProd
        ? [
            VitePWA({
              registerType: "autoUpdate",
              manifest: false,
              workbox: { maximumFileSizeToCacheInBytes: 50 * 1024 * 1024 },
            }),
          ]
        : []),
    ],
    server: { host: true, port: 5173 },
    preview: { host: true, port: 5173 },
    // Only expose variables prefixed with VITE_
    envPrefix: "VITE_",
  };
});
