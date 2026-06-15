import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import process from "node:process";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: parseInt(process.env.PORT || "5173", 10),
    host: "0.0.0.0",
    // Leading dot allows the host and any subdomain — covers Railway preview hosts
    // such as web-<project>-pr-<n>.up.railway.app.
    allowedHosts: [".up.railway.app"],
  },
  preview: {
    port: parseInt(process.env.PORT || "3000", 10),
    host: "0.0.0.0",
    allowedHosts: [".up.railway.app"],
  },
  build: {
    outDir: "build",
    sourcemap: false,
  },
});
