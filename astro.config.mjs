// astro.config.mjs
import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://leo53021313.github.io',
  trailingSlash: 'always', // matches GitHub Pages directory-index behaviour
  i18n: {
    locales: ['zh-tw', 'en'],
    defaultLocale: 'zh-tw',
    routing: { prefixDefaultLocale: false, redirectToDefaultLocale: false },
  },
  // Native font API (Astro 6, stable): self-host Inter + JetBrains (latin) with auto
  // preload + metric-adjusted fallbacks. Noto Sans TC stays a fontsource import — the
  // fontsource provider defaults CJK to the latin subset only, which would drop Chinese.
  // We chain 'Noto Sans TC Variable' into each fallbacks list so CJK still resolves to
  // Noto before any generic (a generic in the middle would otherwise swallow CJK glyphs).
  fonts: [
    {
      name: 'Inter',
      cssVariable: '--font-inter',
      provider: fontProviders.fontsource(),
      weights: [400, 600, 700],
      styles: ['normal'],
      subsets: ['latin', 'latin-ext'],
      fallbacks: ['Noto Sans TC Variable', 'system-ui', '-apple-system', 'PingFang TC', 'Microsoft JhengHei', 'sans-serif'],
    },
    {
      name: 'JetBrains Mono',
      cssVariable: '--font-jetbrains',
      provider: fontProviders.fontsource(),
      weights: [400, 700],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['Noto Sans TC Variable', 'ui-monospace', 'monospace'],
    },
  ],
  integrations: [
    sitemap({
      i18n: { defaultLocale: 'zh-tw', locales: { 'zh-tw': 'zh-TW', en: 'en' } },
    }),
  ],
});
