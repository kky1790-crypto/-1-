import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { SITE_URL, BASE_PATH } from './src/data/site.ts';

// SITE_URL (origin) and BASE_PATH (subpath) are defined once in
// src/data/site.ts. Change them there before changing hosting — this file,
// canonical tags, the sitemap, and Open Graph/Twitter image URLs all read
// from those two values. A GitHub Pages *project* site (like this one) is
// served under a /<repo>/ subpath, so BASE_PATH must match the repo name.
// A custom domain at its own root should set BASE_PATH back to '/'.
export default defineConfig({
  site: SITE_URL,
  base: BASE_PATH,
  trailingSlash: 'always',
  integrations: [sitemap()],
  image: {
    responsiveStyles: true,
  },
  build: {
    format: 'directory',
  },
});
