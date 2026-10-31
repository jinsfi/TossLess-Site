// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://tosslessapp.com',
  output: 'static',
  // /thanks/ is a noindex confirmation page, so keep it out of the sitemap.
  integrations: [sitemap({ filter: (page) => !page.endsWith('/thanks/') })],
});
