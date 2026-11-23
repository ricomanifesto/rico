import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import { satteri } from "@astrojs/markdown-satteri";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  site: "https://ricomanifesto.com",
  trailingSlash: "always",
  integrations: [react()],
  markdown: {
    processor: satteri({
      mdastPlugins: [{
        name: "raw-html-as-text",
        html: (node) => ({ type: "text", value: node.value }),
      }],
    }),
  },
  vite: {
    resolve: {
      alias: {
        "@": path.resolve(projectRoot, "src"),
      },
    },
  },
});
