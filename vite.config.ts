import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@ops/core": path.resolve(__dirname, "./packages/core/src/index.ts"),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
  worker: {
    format: "es",
  },
  build: {
    target: "es2022",
    outDir: "dist",
    sourcemap: true,
  },
});
