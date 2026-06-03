# Portfolio MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy the Phase-0 MVP of Leo's bilingual (zh-TW + en) minimalist portfolio to `https://leo53021313.github.io`.

**Architecture:** Astro 6 static site. Built-in i18n routing (zh-TW at root, en under `/en/`, `prefixDefaultLocale:false`). Projects are Markdown content collections; locale derived from file path (`/en/` subfolder = English). Design system = CSS custom-property tokens with a light-default / soft-dark toggle and a single teal accent. Deployed via GitHub Actions (`withastro/action@v6` + `actions/deploy-pages@v5`). Interactive logic (theme toggle, language switch) is verified with Playwright smoke tests; everything else gated by `astro check` + `astro build`.

**Tech Stack:** Astro `^6.4.2`, `@astrojs/sitemap ^3.7.2`, Fontsource (Inter / Noto Sans TC / JetBrains Mono, pinned), Web3Forms (contact), Playwright (smoke tests), Node 24 LTS.

**Source of truth:** `docs/portfolio-spec.md` (v2.1). This plan implements it. Where the spec says `待補`, the file is created with confirmed values + a clearly-marked content slot for Leo to fill (data entry, not code placeholder).

---

## File Structure

```
leo53021313.github.io/
├─ .github/workflows/deploy.yml      # GitHub Pages deploy
├─ astro.config.mjs                  # site, i18n, sitemap
├─ package.json / tsconfig.json
├─ playwright.config.ts              # smoke-test runner
├─ public/
│  ├─ favicon.svg                    # "L" monogram
│  ├─ og.png                         # 1200×630 social card
│  └─ robots.txt
├─ src/
│  ├─ content.config.ts              # projects collection (Zod)
│  ├─ content/projects/
│  │  ├─ coolpc-price-tracker.md     # zh-TW
│  │  ├─ rl-sudoku-solver.md
│  │  ├─ ai-news-digest.md
│  │  └─ en/{same three}.md          # English
│  ├─ i18n/{ui.ts, utils.ts}         # dictionary + helpers
│  ├─ styles/global.css              # tokens, base, fonts, reduced-motion
│  ├─ components/
│  │  ├─ BaseHead.astro              # meta/OG/hreflang/canonical/JSON-LD + theme inline script
│  │  ├─ Header.astro                # nav + LanguageToggle + ThemeToggle
│  │  ├─ Footer.astro
│  │  ├─ LanguageToggle.astro
│  │  ├─ ThemeToggle.astro
│  │  ├─ ProjectCard.astro
│  │  └─ ProseSection.astro
│  ├─ layouts/BaseLayout.astro       # html shell, imports fonts + global.css
│  └─ pages/
│     ├─ index.astro                 # zh-TW home
│     ├─ projects/index.astro
│     ├─ projects/[...slug].astro
│     ├─ about.astro
│     ├─ contact.astro
│     └─ en/{index, projects/index, projects/[...slug], about, contact}.astro
└─ tests/smoke.spec.ts               # Playwright
```

**Locale rule:** content-collection entry `id` that starts with `en/` is English; its route slug is the `id` with the `en/` prefix stripped. zh-TW pages live at the root page tree, English under `src/pages/en/`.

---

## Task 1: Scaffold project + pin versions + git init

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `.gitignore`

- [ ] **Step 1: Scaffold an empty Astro project into the current dir**

Run (in `c:\Users\student\Desktop\leo53021313.github.io`):
```bash
npm create astro@latest -- --template minimal --no-install --no-git --yes .
```
Expected: creates `package.json`, `astro.config.mjs`, `tsconfig.json`, `src/`, `public/`.

- [ ] **Step 2: Install pinned dependencies**

```bash
npm install astro@^6.4.2 @astrojs/sitemap@^3.7.2
npm install @fontsource-variable/inter@^5.2.8 @fontsource-variable/noto-sans-tc@^5.2.10 @fontsource/jetbrains-mono@^5.2.8
npm install -D @playwright/test@latest
```

- [ ] **Step 3: Add `engines` + scripts to `package.json`**

Merge into `package.json`:
```json
{
  "engines": { "node": ">=24" },
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check",
    "test": "playwright test"
  }
}
```

- [ ] **Step 4: Create `.gitignore`**

```gitignore
node_modules/
dist/
.astro/
.superpowers/
test-results/
playwright-report/
```

- [ ] **Step 5: Verify the toolchain builds the blank scaffold**

Run: `npm run build`
Expected: "Complete!" with a `dist/` folder, exit 0.

- [ ] **Step 6: git init + first commit**

```bash
git init -b main
git add -A
git commit -m "chore: scaffold Astro project with pinned deps"
```

---

## Task 2: Configure `astro.config.mjs` (site + i18n + sitemap)

**Files:**
- Modify: `astro.config.mjs`

- [ ] **Step 1: Replace config with the verified i18n + sitemap setup**

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://leo53021313.github.io',
  trailingSlash: 'always', // matches GitHub Pages directory-index behaviour
  i18n: {
    locales: ['zh-tw', 'en'],
    defaultLocale: 'zh-tw',
    routing: { prefixDefaultLocale: false, redirectToDefaultLocale: false },
  },
  integrations: [
    sitemap({
      i18n: { defaultLocale: 'zh-tw', locales: { 'zh-tw': 'zh-TW', en: 'en' } },
    }),
  ],
});
```

- [ ] **Step 2: Verify config loads**

Run: `npm run build`
Expected: build succeeds; `dist/sitemap-index.xml` is generated.

- [ ] **Step 3: Commit**

```bash
git add astro.config.mjs
git commit -m "feat: configure site, i18n (zh-tw default, en under /en/), sitemap"
```

---

## Task 3: Design tokens + base styles + fonts (`src/styles/global.css`)

**Files:**
- Create: `src/styles/global.css`

- [ ] **Step 1: Write tokens, base, fonts, reduced-motion**

```css
/* src/styles/global.css */
:root {
  --bg: #FFFFFF;      --surface: #FFFFFF;   --surface-alt: #FAFAFB;
  --text: #111317;    --muted: #6B7280;     --border: #ECECEF;
  --accent: #0F8A5F;  --accent-contrast: #FFFFFF;
  --maxw: 64rem;      --radius: 12px;       --gap: clamp(1rem, 3vw, 2rem);
  --font-sans: 'Inter Variable','Noto Sans TC Variable', system-ui, -apple-system,
               'PingFang TC','Microsoft JhengHei', sans-serif;
  --font-mono: 'JetBrains Mono','Noto Sans TC Variable', ui-monospace, monospace;
}
:root[data-theme='dark'] {
  --bg: #16181C;      --surface: #1D2025;   --surface-alt: #1D2025;
  --text: #CDD2D8;    --muted: #868D96;     --border: #2B2F36;
  --accent: #4FB395;  --accent-contrast: #06231A;
}
* { box-sizing: border-box; }
html { color-scheme: light dark; }
body {
  margin: 0; background: var(--bg); color: var(--text);
  font-family: var(--font-sans); line-height: 1.7;
  -webkit-font-smoothing: antialiased;
}
a { color: var(--accent); text-underline-offset: 3px; }
:where(a, button, input, [tabindex]):focus-visible {
  outline: 2px solid var(--accent); outline-offset: 2px; border-radius: 4px;
}
.container { max-width: var(--maxw); margin-inline: auto; padding-inline: var(--gap); }
.mono { font-family: var(--font-mono); }
.skip-link {
  position: absolute; left: -999px; top: 0; background: var(--surface);
  padding: .5rem 1rem; border: 1px solid var(--border);
}
.skip-link:focus { left: 0; z-index: 100; }
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important; }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/styles/global.css
git commit -m "feat: design tokens (light default + soft dark) + base styles"
```

---

## Task 4: i18n dictionary + helpers (`src/i18n/`)

**Files:**
- Create: `src/i18n/ui.ts`, `src/i18n/utils.ts`

- [ ] **Step 1: Write the dictionary**

```ts
// src/i18n/ui.ts
export const languages = { 'zh-tw': '繁中', en: 'EN' } as const;
export const defaultLang = 'zh-tw';

export const ui = {
  'zh-tw': {
    'site.title': 'Leo — Python / AI + 資料工程',
    'site.tagline': '把 AI 與資料工程落地成實際應用',
    'nav.projects': '作品', 'nav.about': '關於', 'nav.contact': '聯絡',
    'hero.role': 'Python / AI ・ 資料工程應用工程師',
    'cta.viewWork': '查看作品', 'cta.contact': '聯絡我',
    'home.featured': '精選作品', 'home.skills': '技能 / 技術棧',
    'home.aboutTeaser': '關於我', 'home.more': '看更多',
    'projects.title': '作品', 'project.problem': '問題', 'project.solution': '做法',
    'project.arch': '架構', 'project.metrics': '成果數據', 'project.lessons': '踩坑',
    'project.stack': '技術棧', 'project.codeOnRequest': '程式碼可應要求提供',
    'project.live': 'Live 網頁', 'project.back': '返回作品',
    'project.prev': '上一個', 'project.next': '下一個', 'project.wip': '進行中',
    'about.title': '關於', 'contact.title': '聯絡',
    'contact.name': '稱呼', 'contact.email': 'Email', 'contact.message': '訊息',
    'contact.send': '送出', 'contact.or': '或直接寄信給我',
    'theme.toggle': '切換深淺色', 'footer.privacy': '本站使用無 cookie 的流量分析',
  },
  en: {
    'site.title': 'Leo — Python / AI + Data Engineering',
    'site.tagline': 'I turn AI & data engineering into real, shipped applications',
    'nav.projects': 'Work', 'nav.about': 'About', 'nav.contact': 'Contact',
    'hero.role': 'Python / AI · Data-Engineering Applications Engineer',
    'cta.viewWork': 'View work', 'cta.contact': 'Contact me',
    'home.featured': 'Selected work', 'home.skills': 'Skills / Stack',
    'home.aboutTeaser': 'About', 'home.more': 'Read more',
    'projects.title': 'Work', 'project.problem': 'Problem', 'project.solution': 'Approach',
    'project.arch': 'Architecture', 'project.metrics': 'Results', 'project.lessons': 'Lessons',
    'project.stack': 'Stack', 'project.codeOnRequest': 'Source available on request',
    'project.live': 'Live site', 'project.back': 'Back to work',
    'project.prev': 'Previous', 'project.next': 'Next', 'project.wip': 'In progress',
    'about.title': 'About', 'contact.title': 'Contact',
    'contact.name': 'Name', 'contact.email': 'Email', 'contact.message': 'Message',
    'contact.send': 'Send', 'contact.or': 'Or email me directly',
    'theme.toggle': 'Toggle theme', 'footer.privacy': 'Cookieless analytics, no tracking',
  },
} as const;
```

- [ ] **Step 2: Write the helpers**

```ts
// src/i18n/utils.ts
import { ui, defaultLang } from './ui';

export type Lang = keyof typeof ui;

export function getLangFromUrl(url: URL): Lang {
  const [, seg] = url.pathname.split('/');
  return seg === 'en' ? 'en' : defaultLang;
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
```

- [ ] **Step 3: Verify types compile**

Run: `npm run check`
Expected: 0 errors (it will warn about unused until pages exist — 0 *errors* is the gate).

- [ ] **Step 4: Commit**

```bash
git add src/i18n
git commit -m "feat: i18n dictionary (zh-tw/en) + getLangFromUrl/useTranslations helpers"
```

---

## Task 5: Theme toggle (no-FOUC) + BaseHead (`src/components/`)

**Files:**
- Create: `src/components/ThemeToggle.astro`, `src/components/BaseHead.astro`

- [ ] **Step 1: ThemeToggle component**

```astro
---
// src/components/ThemeToggle.astro
import { getLangFromUrl, useTranslations } from '../i18n/utils';
const t = useTranslations(getLangFromUrl(Astro.url));
---
<button id="theme-toggle" type="button" aria-label={t('theme.toggle')} class="mono">◐</button>
<script is:inline>
  const btn = document.getElementById('theme-toggle');
  btn?.addEventListener('click', () => {
    const cur = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = cur;
    localStorage.setItem('theme', cur);
  });
</script>
<style>
  #theme-toggle { background: none; border: 1px solid var(--border); color: var(--text);
    border-radius: 8px; width: 2.25rem; height: 2.25rem; cursor: pointer; }
</style>
```

- [ ] **Step 2: BaseHead — meta, OG, hreflang, canonical, JSON-LD, no-FOUC theme script**

```astro
---
// src/components/BaseHead.astro
import { getLangFromUrl } from '../i18n/utils';
interface Props { title: string; description: string; image?: string; }
const { title, description, image = '/og.png' } = Astro.props;
const lang = getLangFromUrl(Astro.url);
const htmlLang = lang === 'en' ? 'en' : 'zh-Hant-TW';
const canonical = new URL(Astro.url.pathname, Astro.site).href;
const ogImage = new URL(image, Astro.site).href;
// reciprocal hreflang: swap the /en prefix
const path = Astro.url.pathname;
const zhHref = new URL(path.replace(/^\/en\/?/, '/'), Astro.site).href;
const enHref = new URL(path.startsWith('/en') ? path : '/en' + path, Astro.site).href;
const person = {
  '@context': 'https://schema.org', '@type': 'Person', name: 'Leo',
  jobTitle: 'Python / AI + Data Engineering Applications Engineer',
  url: Astro.site?.href,
  knowsAbout: ['Python', 'Reinforcement Learning', 'Web Scraping', 'Data Engineering', 'LLM'],
  sameAs: ['https://github.com/leo53021313'], // add LinkedIn when available
};
---
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>{title}</title>
<meta name="description" content={description} />
<link rel="canonical" href={canonical} />
<link rel="alternate" hreflang="zh-TW" href={zhHref} />
<link rel="alternate" hreflang="en" href={enHref} />
<link rel="alternate" hreflang="x-default" href={zhHref} />
<meta property="og:type" content="website" />
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:url" content={canonical} />
<meta property="og:image" content={ogImage} />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:image" content={ogImage} />
<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
<script is:inline>
  const s = localStorage.getItem('theme');
  const d = s ? s === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.dataset.theme = d ? 'dark' : 'light';
</script>
<script type="application/ld+json" set:html={JSON.stringify(person)} is:inline />
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ThemeToggle.astro src/components/BaseHead.astro
git commit -m "feat: BaseHead (meta/OG/hreflang/JSON-LD) + no-FOUC theme toggle"
```

---

## Task 6: LanguageToggle, Header, Footer (`src/components/`)

**Files:**
- Create: `src/components/LanguageToggle.astro`, `Header.astro`, `Footer.astro`

- [ ] **Step 1: LanguageToggle (EN / 繁中, no flags)**

```astro
---
// src/components/LanguageToggle.astro
import { getLangFromUrl } from '../i18n/utils';
const lang = getLangFromUrl(Astro.url);
const path = Astro.url.pathname;
const toZh = path.replace(/^\/en\/?/, '/');
const toEn = path.startsWith('/en') ? path : '/en' + path;
---
<div class="lang" role="group" aria-label="Language">
  <a href={toZh} aria-current={lang === 'zh-tw' ? 'true' : undefined}>繁中</a>
  <span aria-hidden="true">/</span>
  <a href={toEn} aria-current={lang === 'en' ? 'true' : undefined}>EN</a>
</div>
<style>
  .lang { display: inline-flex; gap: .4rem; font-size: .9rem; }
  .lang a[aria-current='true'] { color: var(--text); font-weight: 600; }
  .lang a:not([aria-current]) { color: var(--muted); }
</style>
```

- [ ] **Step 2: Header**

```astro
---
// src/components/Header.astro
import { getLangFromUrl, useTranslations, localizedPath } from '../i18n/utils';
import LanguageToggle from './LanguageToggle.astro';
import ThemeToggle from './ThemeToggle.astro';
const lang = getLangFromUrl(Astro.url);
const t = useTranslations(lang);
const L = (p: string) => localizedPath(p, lang);
---
<header class="container">
  <a href={L('/')} class="brand mono">Leo</a>
  <nav aria-label="Primary">
    <a href={L('/projects/')}>{t('nav.projects')}</a>
    <a href={L('/about/')}>{t('nav.about')}</a>
    <a href={L('/contact/')}>{t('nav.contact')}</a>
  </nav>
  <div class="actions"><LanguageToggle /><ThemeToggle /></div>
</header>
<style>
  header { display: flex; align-items: center; gap: 1rem; padding-block: 1rem;
    position: sticky; top: 0; background: color-mix(in srgb, var(--bg) 88%, transparent);
    backdrop-filter: blur(6px); border-bottom: 1px solid var(--border); z-index: 10; }
  .brand { font-weight: 700; font-size: 1.1rem; text-decoration: none; color: var(--text); }
  nav { display: flex; gap: 1.25rem; margin-inline-start: auto; }
  nav a { color: var(--muted); text-decoration: none; }
  nav a:hover { color: var(--text); }
  .actions { display: flex; gap: .75rem; align-items: center; }
  @media (max-width: 640px) { nav { gap: .9rem; font-size: .9rem; } }
</style>
```

- [ ] **Step 3: Footer (GitHub link lives here, not as headline proof)**

```astro
---
// src/components/Footer.astro
import { getLangFromUrl, useTranslations } from '../i18n/utils';
const t = useTranslations(getLangFromUrl(Astro.url));
---
<footer class="container">
  <p>© Leo · <a href="https://github.com/leo53021313">GitHub</a></p>
  <p class="muted">{t('footer.privacy')}</p>
</footer>
<style>
  footer { border-top: 1px solid var(--border); margin-top: 4rem; padding-block: 2rem;
    display: flex; justify-content: space-between; flex-wrap: wrap; gap: .5rem; }
  .muted { color: var(--muted); font-size: .85rem; }
</style>
```

- [ ] **Step 4: Commit**

```bash
git add src/components/LanguageToggle.astro src/components/Header.astro src/components/Footer.astro
git commit -m "feat: header (nav + lang/theme toggles), footer, language switcher"
```

---

## Task 7: BaseLayout (`src/layouts/BaseLayout.astro`)

**Files:**
- Create: `src/layouts/BaseLayout.astro`

- [ ] **Step 1: Layout shell — imports fonts + global css, sets html lang, skip-link**

```astro
---
// src/layouts/BaseLayout.astro
import '@fontsource-variable/inter';
import '@fontsource-variable/noto-sans-tc';
import '@fontsource/jetbrains-mono';
import '../styles/global.css';
import BaseHead from '../components/BaseHead.astro';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
import { getLangFromUrl } from '../i18n/utils';
interface Props { title: string; description: string; image?: string; }
const { title, description, image } = Astro.props;
const htmlLang = getLangFromUrl(Astro.url) === 'en' ? 'en' : 'zh-Hant-TW';
---
<!doctype html>
<html lang={htmlLang}>
  <head><BaseHead title={title} description={description} image={image} /></head>
  <body>
    <a href="#main" class="skip-link">Skip to content</a>
    <Header />
    <main id="main" class="container"><slot /></main>
    <Footer />
  </body>
</html>
```

- [ ] **Step 2: Commit**

```bash
git add src/layouts/BaseLayout.astro
git commit -m "feat: BaseLayout shell with fonts, head, header/footer, skip-link"
```

---

## Task 8: Content collection + project Markdown (`src/content.config.ts`, `src/content/projects/`)

**Files:**
- Create: `src/content.config.ts`, `src/content/projects/*.md`, `src/content/projects/en/*.md`

- [ ] **Step 1: content.config.ts (verified schema, no `lang` field)**

```ts
// src/content.config.ts
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const projects = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    oneLiner: z.string(),
    role: z.string(),
    status: z.enum(['done', 'wip']),
    timeframe: z.string(),
    tech: z.array(z.string()),
    repoUrl: z.string().url().optional(),
    demoUrl: z.string().url().optional(),
    evidence: z.string().optional(),
    metrics: z.array(z.string()).default([]),
    lessons: z.string().optional(),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    order: z.number().default(0),
    cover: z.string().optional(),
  }),
});
export const collections = { projects };
```

- [ ] **Step 2: Create the 3 zh-TW project files (confirmed data; 待補 slots marked for Leo)**

`src/content/projects/coolpc-price-tracker.md`:
```md
---
title: 原價屋全站商品歷史價格庫
oneLiner: 每日爬全站商品價格，建立歷史價格資料庫並以網頁呈現
role: 個人專案・資料工程 + 前端
status: done
timeframe: 2026-04-24 ~ 至今
tech: [Python, requests, BeautifulSoup, Supabase (PostgreSQL), Vercel]
demoUrl: https://coolpc-tracker.vercel.app/
metrics:
  - 每日更新（最後 2026-06-01 10:09）
  # 待補：SKU 總數 / 累積筆數（Supabase COUNT(*)）、涵蓋類別數、最大漲跌幅
tags: [資料工程, 爬蟲, 資料視覺化]
featured: true
order: 0
# 待補：cover（站截圖路徑，作 LCP 首圖）
---
## 問題
想追蹤 PC 零組件的降價時機，但官網沒有歷史價格。

## 做法
排程爬蟲（requests + BeautifulSoup）抓全站 → 正規化寫入 Supabase（PostgreSQL）→ Vercel 上的網頁查詢與走勢圖。

## 架構
（建站時用 Mermaid）排程爬蟲 → 解析 → Supabase（歷史價）→ API/輸出 → 網頁圖表

## 踩坑
（待補實際內容）
```

`src/content/projects/rl-sudoku-solver.md`:
```md
---
title: 用強化學習訓練 AI 解數獨
oneLiner: 不靠回溯法，讓 agent 從零學會解數獨的填格策略
role: 個人專案・獨立開發
status: done
timeframe: 待補
tech: [Python, TensorBoard]
evidence: TensorBoard 訓練曲線截圖 + 輸入/解出盤面對照圖
metrics:
  - 訓練收斂曲線（TensorBoard：reward / loss vs episodes）
  # 待補：解題成功率（solved X/100）、平均步數、框架(PyTorch?)、訓練環境(Gymnasium?)
tags: [強化學習, RL]
featured: true
order: 1
---
## 問題
數獨通常用回溯/約束傳播暴力解；我想驗證 RL 能否學到「策略」而非窮舉。

## 做法
將盤面建為環境（state=9×9，action=填格），用獎勵設計鼓勵合法填入並訓練 agent。

## 架構
環境(盤面) → 策略網路 → Reward → 訓練迴圈 → 評估（TensorBoard 紀錄）

## 踩坑
（待補實際內容）
```

`src/content/projects/ai-news-digest.md`:
```md
---
title: AI 新聞與教學每日自動摘要推送
oneLiner: 每日爬 AI 新聞與教學，自動摘要後推送到 Discord（網頁版開發中）
role: 個人專案・LLM 應用 + 自動化
status: wip
timeframe: 2026-05 ~ 至今
tech: [Python, Google Gemini API, GitHub Actions, Discord Webhook]
evidence: Discord 摘要訊息截圖（+ 可選短 GIF）
metrics:
  - 58 個來源
  - 每日 1 次推送 × 10 則
  - 排程：GitHub Actions（每日定時）
lessons: GitHub Actions 排程偶發延遲 → 規劃加重試 / 告警 / 調整排程
tags: [LLM, 自動化, 資料管線]
featured: false
order: 2
---
## 問題
AI 資訊量爆炸，想每天自動過濾出值得讀的內容。

## 做法
多來源爬取 → 去重 → Google Gemini 摘要/分類 → 每日定時（GitHub Actions）推送 Discord；下一步做網頁版。

## 架構
多來源爬蟲 → 去重 → Gemini 摘要 → Discord 推送（未來：→ 網頁）

## 踩坑
GitHub Actions 排程偶發延遲 → 規劃加入重試 / 告警 / 調整排程。
```

- [ ] **Step 3: Create the 3 English files** under `src/content/projects/en/` with the same frontmatter keys but English `title`/`oneLiner`/`role`/body. (Keep `demoUrl`, `tech`, `metrics` identical; translate prose. Same `order`/`featured`.)

Example `src/content/projects/en/coolpc-price-tracker.md` frontmatter:
```md
---
title: Coolpc Full-Catalogue Price-History Database
oneLiner: Daily crawl of every product price, built into a historical price DB with a web view
role: Solo project · Data engineering + front end
status: done
timeframe: 2026-04-24 ~ now
tech: [Python, requests, BeautifulSoup, Supabase (PostgreSQL), Vercel]
demoUrl: https://coolpc-tracker.vercel.app/
metrics:
  - Updated daily (last 2026-06-01 10:09)
tags: [Data Engineering, Scraping, Data Viz]
featured: true
order: 0
---
## Problem
... (translate the zh-TW body)
```

- [ ] **Step 4: Verify the collection type-checks and entries load**

Run: `npm run check`
Expected: 0 errors (Zod schema validates all 6 files; if a file fails, the error names the field).

- [ ] **Step 5: Commit**

```bash
git add src/content.config.ts src/content/projects
git commit -m "feat: projects content collection + 3 bilingual project entries (confirmed data)"
```

---

## Task 9: ProjectCard component (`src/components/ProjectCard.astro`)

**Files:**
- Create: `src/components/ProjectCard.astro`

- [ ] **Step 1: Card with title, one-liner, tech chips, status, link**

```astro
---
// src/components/ProjectCard.astro
import { getLangFromUrl, useTranslations, localizedPath } from '../i18n/utils';
interface Props { slug: string; title: string; oneLiner: string; tech: string[]; status: 'done'|'wip'; featured?: boolean; }
const { slug, title, oneLiner, tech, status, featured } = Astro.props;
const lang = getLangFromUrl(Astro.url);
const t = useTranslations(lang);
const href = localizedPath(`/projects/${slug}/`, lang);
---
<a class:list={["card", { featured }]} href={href}>
  <h3>{title} {status === 'wip' && <span class="badge mono">{t('project.wip')}</span>}</h3>
  <p>{oneLiner}</p>
  <ul class="chips">{tech.slice(0, 4).map((x) => <li class="mono">{x}</li>)}</ul>
</a>
<style>
  .card { display: block; background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--radius); padding: 1.25rem 1.5rem; text-decoration: none; color: inherit;
    transition: transform .15s ease, border-color .15s ease; }
  .card:hover { transform: translateY(-2px); border-color: var(--accent); }
  .card.featured { grid-column: 1 / -1; }
  .card h3 { margin: 0 0 .35rem; }
  .card p { margin: 0 0 .75rem; color: var(--muted); }
  .chips { display: flex; flex-wrap: wrap; gap: .4rem; padding: 0; margin: 0; list-style: none; }
  .chips li { font-size: .75rem; border: 1px solid var(--border); border-radius: 6px; padding: .1rem .5rem; color: var(--muted); }
  .badge { font-size: .7rem; color: var(--accent); border: 1px solid var(--accent); border-radius: 6px; padding: 0 .4rem; }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ProjectCard.astro
git commit -m "feat: ProjectCard with tech chips + wip badge"
```

---

## Task 10: Home page (zh-TW + en) (`src/pages/index.astro`, `src/pages/en/index.astro`)

**Files:**
- Create: `src/pages/index.astro`, `src/pages/en/index.astro`

- [ ] **Step 1: zh-TW home — hero, featured projects, skills, about teaser, contact CTA**

```astro
---
// src/pages/index.astro
import { getCollection } from 'astro:content';
import BaseLayout from '../layouts/BaseLayout.astro';
import ProjectCard from '../components/ProjectCard.astro';
import { getLangFromUrl, useTranslations, localizedPath } from '../i18n/utils';
const lang = getLangFromUrl(Astro.url);
const t = useTranslations(lang);
const L = (p: string) => localizedPath(p, lang);
const all = await getCollection('projects');
const mine = all
  .filter((p) => (lang === 'en' ? p.id.startsWith('en/') : !p.id.startsWith('en/')))
  .sort((a, b) => a.data.order - b.data.order);
const slugOf = (id: string) => id.replace(/^en\//, '');
---
<BaseLayout title={t('site.title')} description={t('site.tagline')}>
  <section class="hero">
    <h1>Leo</h1>
    <p class="role">{t('hero.role')}</p>
    <p class="tagline">{t('site.tagline')}</p>
    <div class="cta">
      <a class="btn primary" href={L('/projects/')}>{t('cta.viewWork')}</a>
      <a class="btn ghost" href={L('/contact/')}>{t('cta.contact')}</a>
    </div>
  </section>

  <section>
    <h2>{t('home.featured')}</h2>
    <div class="grid">
      {mine.map((p) => <ProjectCard slug={slugOf(p.id)} title={p.data.title}
        oneLiner={p.data.oneLiner} tech={p.data.tech} status={p.data.status} featured={p.data.featured} />)}
    </div>
  </section>

  <section>
    <h2>{t('home.skills')}</h2>
    <p class="mono muted">Python · 爬蟲 · 資料管線 · LLM · RL · Supabase · GitHub Actions</p>
  </section>

  <section>
    <h2>{t('home.aboutTeaser')}</h2>
    <p>{t('site.tagline')}。<a href={L('/about/')}>{t('home.more')} →</a></p>
  </section>
</BaseLayout>

<style>
  .hero { padding-block: clamp(2rem, 8vw, 5rem); }
  .hero h1 { font-size: clamp(2.5rem, 8vw, 4rem); margin: 0; letter-spacing: -.02em; }
  .role { font-size: 1.1rem; margin: .75rem 0 .25rem; }
  .tagline { color: var(--muted); margin: 0 0 1.5rem; }
  .cta { display: flex; gap: .75rem; flex-wrap: wrap; }
  .btn { padding: .6rem 1.1rem; border-radius: 10px; text-decoration: none; font-weight: 600; }
  .btn.primary { background: var(--accent); color: var(--accent-contrast); }
  .btn.ghost { border: 1px solid var(--border); color: var(--text); }
  .btn.ghost:hover { background: color-mix(in srgb, var(--accent) 8%, transparent); }
  .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--gap); }
  section { margin-block: 2.5rem; }
  @media (max-width: 640px) { .grid { grid-template-columns: 1fr; } }
</style>
```

- [ ] **Step 2: English home** — copy `index.astro` to `src/pages/en/index.astro`; the only change is the skills line text (translate to "Python · Scraping · Data pipelines · LLM · RL · Supabase · GitHub Actions"). All labels come from `t()` automatically because `getLangFromUrl` reads `/en`.

- [ ] **Step 3: Verify both build + render**

Run: `npm run build`
Expected: `dist/index.html` and `dist/en/index.html` exist; both list 3 project cards.

- [ ] **Step 4: Commit**

```bash
git add src/pages/index.astro src/pages/en/index.astro
git commit -m "feat: bilingual home page (hero, featured projects, skills, about teaser)"
```

---

## Task 11: Projects index + project detail route (zh-TW + en)

**Files:**
- Create: `src/pages/projects/index.astro`, `src/pages/projects/[...slug].astro`, and the `en/` equivalents.

- [ ] **Step 1: Projects index (zh-TW)** `src/pages/projects/index.astro`

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import ProjectCard from '../../components/ProjectCard.astro';
import { getLangFromUrl, useTranslations } from '../../i18n/utils';
const lang = getLangFromUrl(Astro.url);
const t = useTranslations(lang);
const mine = (await getCollection('projects'))
  .filter((p) => (lang === 'en' ? p.id.startsWith('en/') : !p.id.startsWith('en/')))
  .sort((a, b) => a.data.order - b.data.order);
const slugOf = (id: string) => id.replace(/^en\//, '');
---
<BaseLayout title={`${t('projects.title')} · Leo`} description={t('site.tagline')}>
  <h1>{t('projects.title')}</h1>
  <div class="grid">
    {mine.map((p) => <ProjectCard slug={slugOf(p.id)} title={p.data.title}
      oneLiner={p.data.oneLiner} tech={p.data.tech} status={p.data.status} />)}
  </div>
</BaseLayout>
<style>.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:var(--gap);margin-top:1.5rem}@media(max-width:640px){.grid{grid-template-columns:1fr}}</style>
```
Copy to `src/pages/en/projects/index.astro` (adjust relative import depth: `../../../`).

- [ ] **Step 2: Project detail route (zh-TW)** `src/pages/projects/[...slug].astro`

```astro
---
import { getCollection, render } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import { getLangFromUrl, useTranslations, localizedPath } from '../../i18n/utils';

export async function getStaticPaths() {
  const all = await getCollection('projects');
  const zh = all.filter((p) => !p.id.startsWith('en/')).sort((a, b) => a.data.order - b.data.order);
  return zh.map((entry, i) => ({
    params: { slug: entry.id },
    props: { entry, prev: zh[i - 1], next: zh[i + 1] },
  }));
}
const { entry, prev, next } = Astro.props;
const { Content } = await render(entry);
const lang = getLangFromUrl(Astro.url);
const t = useTranslations(lang);
const L = (p: string) => localizedPath(p, lang);
const d = entry.data;
---
<BaseLayout title={`${d.title} · Leo`} description={d.oneLiner} image={d.cover ?? '/og.png'}>
  <a href={L('/projects/')}>← {t('project.back')}</a>
  <h1>{d.title}</h1>
  <p class="lead">{d.oneLiner}</p>
  <ul class="chips">{d.tech.map((x) => <li class="mono">{x}</li>)}</ul>
  <p class="mono muted">{d.status === 'wip' ? t('project.wip') : ''} {d.timeframe}</p>
  <div class="cta">
    {d.demoUrl && <a class="btn primary" href={d.demoUrl}>{t('project.live')} ↗</a>}
    <span class="muted mono">{t('project.codeOnRequest')}</span>
  </div>
  {d.evidence && <p class="evidence muted">{d.evidence}</p>}
  <article class="prose"><Content /></article>
  {d.metrics.length > 0 && (
    <section><h2>{t('project.metrics')}</h2>
      <ul class="mono">{d.metrics.map((m) => <li>{m}</li>)}</ul></section>)}
  <nav class="pager">
    {prev && <a href={L(`/projects/${prev.id}/`)}>← {t('project.prev')}</a>}
    {next && <a href={L(`/projects/${next.id}/`)}>{t('project.next')} →</a>}
  </nav>
</BaseLayout>
<style>
  .lead{font-size:1.15rem;color:var(--muted)} .chips{display:flex;flex-wrap:wrap;gap:.4rem;list-style:none;padding:0}
  .chips li{font-size:.75rem;border:1px solid var(--border);border-radius:6px;padding:.1rem .5rem;color:var(--muted)}
  .cta{display:flex;gap:1rem;align-items:center;margin:1rem 0} .btn.primary{background:var(--accent);color:var(--accent-contrast);padding:.5rem 1rem;border-radius:10px;text-decoration:none}
  .prose{margin-top:1.5rem} .prose :where(h2){margin-top:2rem;border-top:1px solid var(--border);padding-top:1rem}
  .pager{display:flex;justify-content:space-between;margin-top:3rem}
</style>
```

- [ ] **Step 3: English detail route** `src/pages/en/projects/[...slug].astro` — same as Step 2 but in `getStaticPaths` filter `p.id.startsWith('en/')`, and `params: { slug: entry.id.replace(/^en\//, '') }`, and `localizedPath(`/projects/${slugOf}`, 'en')` for pager. (Import depth `../../../`.)

- [ ] **Step 4: Verify routes build**

Run: `npm run build`
Expected: `dist/projects/coolpc-price-tracker/index.html` and `dist/en/projects/coolpc-price-tracker/index.html` (× all 3) exist.

- [ ] **Step 5: Commit**

```bash
git add src/pages/projects src/pages/en/projects
git commit -m "feat: bilingual projects index + project detail route with prev/next"
```

---

## Task 12: About + Contact pages (zh-TW + en)

**Files:**
- Create: `src/pages/about.astro`, `src/pages/contact.astro`, and `en/` equivalents.

- [ ] **Step 1: About (zh-TW)** `src/pages/about.astro` — skill matrix + timeline + intro (carries the résumé role; no PDF yet)

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import { getLangFromUrl, useTranslations } from '../i18n/utils';
const t = useTranslations(getLangFromUrl(Astro.url));
const skills = ['Python','資料工程 / 爬蟲','資料管線','強化學習 (RL)','LLM 應用 (Gemini)','Supabase / PostgreSQL','GitHub Actions','Astro / 前端'];
---
<BaseLayout title={`${t('about.title')} · Leo`} description={t('site.tagline')}>
  <h1>{t('about.title')}</h1>
  <p>正在轉職進入業界的工程師，專注把 AI 與資料工程落地成實際應用。日常以 AI 輔助開發，持續累積專長。</p>
  <h2>{t('home.skills')}</h2>
  <ul class="matrix">{skills.map((s) => <li class="mono">{s}</li>)}</ul>
  <h2>歷程</h2>
  <ul class="timeline">
    <li>2026 — 原價屋價格庫上線（每日更新）、RL 解數獨、AI 新聞 Discord 摘要</li>
    <!-- 待補：學經歷時間軸 -->
  </ul>
</BaseLayout>
<style>.matrix{display:flex;flex-wrap:wrap;gap:.5rem;list-style:none;padding:0}.matrix li{border:1px solid var(--border);border-radius:8px;padding:.3rem .7rem;font-size:.85rem}.timeline{color:var(--muted)}</style>
```
Copy to `src/pages/en/about.astro` with translated prose + skills.

- [ ] **Step 2: Contact (zh-TW)** `src/pages/contact.astro` — Web3Forms form + honeypot + mailto fallback

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import { getLangFromUrl, useTranslations } from '../i18n/utils';
const t = useTranslations(getLangFromUrl(Astro.url));
const ACCESS_KEY = 'WEB3FORMS_ACCESS_KEY'; // 待補：建站時填 Web3Forms 發的 key
---
<BaseLayout title={`${t('contact.title')} · Leo`} description={t('site.tagline')}>
  <h1>{t('contact.title')}</h1>
  <form action="https://api.web3forms.com/submit" method="POST" class="form">
    <input type="hidden" name="access_key" value={ACCESS_KEY} />
    <input type="checkbox" name="botcheck" class="hp" tabindex="-1" autocomplete="off" />
    <label>{t('contact.name')}<input name="name" required /></label>
    <label>{t('contact.email')}<input type="email" name="email" required /></label>
    <label>{t('contact.message')}<textarea name="message" rows="5" required></textarea></label>
    <button type="submit" class="btn primary">{t('contact.send')}</button>
  </form>
  <p class="muted">{t('contact.or')}：<a id="mail" href="#">click</a></p>
  <script is:inline>
    // lightly obfuscated mailto (待補：替換成求職專用 email 的 user/domain)
    const u='hello', d='example.com';
    const a=document.getElementById('mail'); if(a){a.href=`mailto:${u}@${d}`; a.textContent=`${u}@${d}`;}
  </script>
</BaseLayout>
<style>
  .form{display:grid;gap:1rem;max-width:32rem} label{display:grid;gap:.35rem}
  input,textarea{font:inherit;padding:.6rem;border:1px solid var(--border);border-radius:8px;background:var(--surface);color:var(--text)}
  .btn.primary{background:var(--accent);color:var(--accent-contrast);border:none;padding:.6rem 1.1rem;border-radius:10px;cursor:pointer;font-weight:600}
  .hp{position:absolute;left:-9999px}
</style>
```
Copy to `src/pages/en/contact.astro` (translated prose; same form).

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: `dist/about/`, `dist/contact/`, `dist/en/about/`, `dist/en/contact/` all generated.

- [ ] **Step 4: Commit**

```bash
git add src/pages/about.astro src/pages/contact.astro src/pages/en/about.astro src/pages/en/contact.astro
git commit -m "feat: bilingual About (skills/timeline) + Contact (Web3Forms + mailto fallback)"
```

---

## Task 13: SEO/static assets — robots.txt, favicon, OG image

**Files:**
- Create: `public/robots.txt`, `public/favicon.svg`, `public/og.png`

- [ ] **Step 1: robots.txt**

```txt
User-agent: *
Allow: /
Sitemap: https://leo53021313.github.io/sitemap-index.xml
```

- [ ] **Step 2: favicon.svg ("L" monogram, teal)**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="7" fill="#0F8A5F"/>
  <text x="16" y="22" font-family="Inter, sans-serif" font-size="18" font-weight="700" fill="#fff" text-anchor="middle">L</text>
</svg>
```

- [ ] **Step 3: OG image** — create a 1200×630 `public/og.png` (name "Leo" + role + teal accent on white). Can be exported from any tool; keep < 200 KB. (Content task — no code.)

- [ ] **Step 4: Verify they ship**

Run: `npm run build`
Expected: `dist/robots.txt`, `dist/favicon.svg`, `dist/og.png` present.

- [ ] **Step 5: Commit**

```bash
git add public/robots.txt public/favicon.svg public/og.png
git commit -m "feat: robots.txt, favicon monogram, OG social image"
```

---

## Task 14: Playwright smoke tests (the interactive logic)

**Files:**
- Create: `playwright.config.ts`, `tests/smoke.spec.ts`

- [ ] **Step 1: Write the failing tests first**

`tests/smoke.spec.ts`:
```ts
import { test, expect } from '@playwright/test';

test('home renders 3 project cards', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.card')).toHaveCount(3);
});

test('language toggle switches zh-TW <-> en', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'EN' }).click();
  await expect(page).toHaveURL(/\/en\/?$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});

test('theme toggle persists across reload', async ({ page }) => {
  await page.goto('/');
  const html = page.locator('html');
  const before = await html.getAttribute('data-theme');
  await page.locator('#theme-toggle').click();
  await page.reload();
  await expect(html).not.toHaveAttribute('data-theme', before!);
});
```

- [ ] **Step 2: playwright.config.ts (builds + previews the static site)**

```ts
import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests',
  webServer: { command: 'npm run build && npm run preview', url: 'http://localhost:4321', timeout: 120_000 },
  use: { baseURL: 'http://localhost:4321' },
});
```

- [ ] **Step 3: Run — verify tests pass against the built site**

Run: `npx playwright install --with-deps chromium && npm test`
Expected: 3 passed.

- [ ] **Step 4: Commit**

```bash
git add playwright.config.ts tests/smoke.spec.ts
git commit -m "test: Playwright smoke tests (cards, language switch, theme persistence)"
```

---

## Task 15: a11y + performance pass

**Files:**
- Modify: as needed based on findings.

- [ ] **Step 1: Keyboard-only walk** — Tab through home → projects → detail → contact. Verify visible focus ring everywhere and the skip-link works. Fix any `outline:none` without replacement.

- [ ] **Step 2: Contrast check** — verify `--text`/`--accent`/`--muted` on `--bg`/`--surface` meet WCAG AA in BOTH themes (e.g. with the browser devtools contrast checker). Adjust token values if any pair fails (do not put `--accent` on small body text).

- [ ] **Step 3: Lighthouse** — run Lighthouse (or `npx unlighthouse` / PageSpeed) on the built site. Target Performance/Best-Practices/SEO/Accessibility ≥ 95. Note: ensure the 原價屋 `cover` image (when added) has explicit width/height and `fetchpriority="high"`, not `loading="lazy"`.

- [ ] **Step 4: Commit any fixes**

```bash
git add -A
git commit -m "fix: a11y (focus/contrast) + perf pass to Lighthouse 95+"
```

---

## Task 16: Deploy to GitHub Pages

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: Deploy workflow (verified versions)**

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages
on:
  push: { branches: [main] }
  workflow_dispatch:
permissions: { contents: read, pages: write, id-token: write }
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: withastro/action@v6
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: { name: github-pages, url: "${{ steps.deployment.outputs.page_url }}" }
    steps:
      - id: deployment
        uses: actions/deploy-pages@v5
```

- [ ] **Step 2: Create the GitHub repo and push**

```bash
gh repo create leo53021313.github.io --public --source=. --remote=origin --push
```
(If `gh` is unavailable, create `leo53021313.github.io` on github.com, then `git remote add origin … && git push -u origin main`.)

- [ ] **Step 3: Enable Pages via Actions** — In GitHub → Settings → Pages → Build and deployment → Source = **GitHub Actions**. (One-time; the Action runs but nothing goes live until this is set.)

- [ ] **Step 4: Verify deploy**

After the Action finishes, open `https://leo53021313.github.io/` and `https://leo53021313.github.io/en/`.
Expected: both render; language toggle, theme toggle, all 5 pages, and the 原價屋 live link work; CSS/fonts load (no 404s).

- [ ] **Step 5: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: GitHub Pages deploy (withastro/action@v6 + deploy-pages@v5)"
git push
```

---

## Self-Review (run against `docs/portfolio-spec.md` v2.1)

**Spec coverage:**
- §1 tech/deploy → Tasks 1, 2, 16. ✓
- §2 visual system (tokens, fonts, components, motion) → Tasks 3, 5, 6, 9, 10. ✓
- §3 IA / sitemap (5 pages + /en mirror) → Tasks 10–12 + sitemap in Task 2. ✓
- §4 i18n (path-based locale, dictionary, switcher, hreflang, lang) → Tasks 2, 4, 5, 6. ✓
- §5 project presentation + schema + 3 entries + display-only tags → Tasks 8, 9, 11. ✓
- §6 a11y/SEO/JSON-LD/OG/perf → Tasks 5, 13, 15. ✓
- §7 contact (Web3Forms + mailto) + repos private ("code on request") → Tasks 6, 12. ✓
- §8 Phase-0 roadmap items → all tasks; Phase 1/2 intentionally deferred to later plans.
- §10 wireframes (home + project detail) → Tasks 10, 11 match the wireframe block order.

**Placeholder scan:** Code steps contain real, runnable code. The only `待補` markers are **content slots** (Web3Forms key, mailto address, project metrics/cover, About timeline) — these are Leo's data to fill, called out explicitly, not code TODOs.

**Type consistency:** `getLangFromUrl`/`useTranslations`/`localizedPath` signatures match across Tasks 4–12; `slugOf`/`entry.id` stripping of the `en/` prefix is consistent in home, index, and detail routes; `ProjectCard` prop names match its call sites.

**Known follow-ups (Phase 1, separate plan):** Mermaid rendering for architecture diagrams, GoatCounter analytics, real metrics + cover images, LinkedIn link + `sameAs`, `ui-ux-pro-max-skill` de-AI audit, custom domain.
