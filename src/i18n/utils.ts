// src/i18n/utils.ts
import { getCollection } from 'astro:content';
import { ui, defaultLang } from './ui';

export type Lang = keyof typeof ui;

export function getLangFromUrl(url: URL): Lang {
  const [, seg] = url.pathname.split('/');
  return seg === 'en' ? 'en' : defaultLang;
}

/** The "/en/ = English" rule, in one place. */
export const projectSlug = (id: string): string => id.replace(/^en\//, '');
export const getProjectLang = (id: string): Lang => (id.startsWith('en/') ? 'en' : defaultLang);

/**
 * Projects for one locale, sorted by `order`, each with a precomputed slug.
 * Build-time parity guard: throws if the zh and en slug sets diverge, turning a silent
 * "en shows 2, zh shows 3" content gap into a loud build failure.
 */
export async function getLocalizedProjects(lang: Lang) {
  const all = await getCollection('projects');
  const zh = new Set(all.filter((p) => !p.id.startsWith('en/')).map((p) => projectSlug(p.id)));
  const en = new Set(all.filter((p) => p.id.startsWith('en/')).map((p) => projectSlug(p.id)));
  const missing = [
    ...[...zh].filter((s) => !en.has(s)).map((s) => `en/${s}`),
    ...[...en].filter((s) => !zh.has(s)),
  ];
  if (missing.length) {
    throw new Error(`Project translation parity broken — missing: ${missing.join(', ')}`);
  }
  return all
    .filter((p) => (lang === 'en' ? p.id.startsWith('en/') : !p.id.startsWith('en/')))
    .sort((a, b) => a.data.order - b.data.order)
    .map((entry) => ({ entry, slug: projectSlug(entry.id) }));
}

export function useTranslations(lang: Lang) {
  return function t(key: keyof (typeof ui)[typeof defaultLang]): string {
    return ui[lang][key] ?? ui[defaultLang][key];
  };
}

/** Build a localized href: zh-tw at root, en prefixed with /en. */
export function localizedPath(path: string, lang: Lang): string {
  const clean = '/' + path.replace(/^\/+/, '');
  return lang === 'en' ? `/en${clean === '/' ? '/' : clean}` : clean;
}
