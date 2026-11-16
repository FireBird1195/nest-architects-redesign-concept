import { defineConfig } from 'astro/config';

// The preview is hosted as a GitHub Pages *project* site, so everything is
// served from /<repo-name>/. The workflow passes the real values in; the
// defaults keep local builds identical to production.
const base = process.env.BASE_PATH || '/nest-architects-redesign-concept';
const site = process.env.SITE_URL || 'https://example.github.io';

export default defineConfig({
  site,
  base,
  trailingSlash: 'always',
  build: { format: 'directory' },
});
