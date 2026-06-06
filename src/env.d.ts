/// <reference types="astro/client" />

// Fontsource packages are CSS-only and have no TypeScript declarations.
// Inter + JetBrains now load via the native font API; only Noto Sans TC is imported directly.
declare module '@fontsource-variable/noto-sans-tc';
