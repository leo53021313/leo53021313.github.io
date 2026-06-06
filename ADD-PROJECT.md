# Adding a project

The site stays consistent because **every project flows through the same Zod schema,
the shared `CaseStudy.astro` component, and shared `global.css` primitives** — there is
no per-project layout or styling to get out of sync.

## Steps

1. Copy `src/content/projects/_template.md` → `src/content/projects/<slug>.md`.
2. Copy `src/content/projects/en/_template.md` → `src/content/projects/en/<slug>.md`
   (the **same** `<slug>` — the build fails otherwise, see below).
3. Fill the frontmatter in both files and keep the four `##` sections
   (問題/做法/架構/踩坑 · Problem/Approach/Architecture/Lessons).
4. (Optional) drop a cover screenshot in `src/assets/<slug>-cover.png`, then set
   `cover:` + `coverAlt:` in both files.
5. Run `npm run build` and `npm test`.

## What keeps it consistent

- **Slug = filename.** zh-TW files live at the root of `projects/`; English mirrors live
  under `projects/en/`. The locale is derived from the path, never a frontmatter field.
- **Parity guard:** `getLocalizedProjects()` in `src/i18n/utils.ts` throws at build time if
  a zh slug has no en twin (or vice-versa) — no silent "en shows 2, zh shows 3".
- **Layout is centralized:** the detail page is `src/components/CaseStudy.astro`. Don't add
  page-level markup or `<style>` to the `[...slug].astro` routes — they're just thin wrappers.
- **Styling is shared:** chips, buttons, and the project grid live in `src/styles/global.css`
  (`.chips`, `.btn`, `.project-grid`). Reuse them; don't redefine.
- **Fields:** `tags` → kicker chips; `tech` → Stack section; `role` → meta line;
  `repoUrl` → a link when set, otherwise "code on request" (going public is a one-line edit);
  `metrics` → Results section. The narrative (incl. Lessons) lives in the Markdown body.
