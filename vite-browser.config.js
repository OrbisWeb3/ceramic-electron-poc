import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import { HTTP_SERVER_PORT } from "./electron/app.config.cjs";

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.DEV_ENV == "true" ? "/" : "./",
  server: {
    port: HTTP_SERVER_PORT,
  },
  build: {
    outDir: "../electron/browser",
  },
  plugins: [nodePolyfills(), svelte()],
  root: "./browser-frontend",
});
