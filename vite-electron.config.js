import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import { SVELTE_PORT } from "./electron/app.config.cjs";

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.DEV_ENV == "true" ? "/" : "./",
  server: {
    port: SVELTE_PORT,
  },
  build: {
    outDir: "../electron/frontend",
  },
  plugins: [nodePolyfills(), svelte()],
  root: "./electron-frontend",
});
