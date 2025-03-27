import { resolve } from "path";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        "@/lib": resolve("src/main/lib"),
        "@shared": resolve("src/main/shared"),
      },
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
  },
  renderer: {
    assetsInclude: "src/renderer/assets/**",
    resolve: {
      alias: {
        "@renderer": resolve("src/renderer/src"),
        "@shared": resolve("src/shared"),
      },
    },
    server: {
      host: '127.0.0.1', // استفاده از IPv4 به جای IPv6
      port: 8080, // یا هر پورت دیگری که آزاد است
    },
    plugins: [react()],
  },
});
