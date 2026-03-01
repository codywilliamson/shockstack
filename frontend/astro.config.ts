import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import vue from "@astrojs/vue";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  output: "server",
  adapter: cloudflare(),
  site: "https://shockstack.dev",
  integrations: [vue(), mdx(), sitemap()],
});
