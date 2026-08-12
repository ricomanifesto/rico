import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  site: "https://ricomanifesto.com",
  trailingSlash: "always",
  integrations: [react()],
  vite: {
    resolve: {
      alias: {
        "@": path.resolve(projectRoot, "src"),
      },
    },
  },
});
