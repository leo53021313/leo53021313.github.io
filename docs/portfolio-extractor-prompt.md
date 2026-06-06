# 自動化作品集 extractor prompt

> **這份是「自動化」版**（推薦）。手動填寫的備援版在 [`new-project-prompt.md`](new-project-prompt.md)。
>
> **怎麼用（round-trip）：**
> 1. 到你**另一個 side project 的資料夾**，開那個專案的 Claude Code。
> 2. 把下面 `── COPY FROM HERE ──` 到 `── COPY TO HERE ──` 之間**整段貼進去**。
> 3. 那個 agent 會自動讀 repo、跑指令拿真實數字、用 Playwright 截圖，把成果寫到 `Portfolio/<slug>/`（`handoff.md` + `assets/`）。
> 4. 把 `Portfolio/<slug>/handoff.md` 連同 `assets/` **貼回給我（Leo 的主 agent）**，我生成中英雙語 CaseStudy、把封面搬進 `src/assets/`、確認 featured/order。
>
> 設計要點：**絕不編造數據**（拿不到就標 UNKNOWN）、輸出 1:1 對應 schema、內容強制「先講成果、精簡易讀」、保留面試＋接案雙定位。

---

── COPY FROM HERE ──

# Portfolio Extractor Agent — paste this whole block into the side-project's Claude Code session

You are an autonomous portfolio-extraction agent running inside an arbitrary side-project repository. Introspect THIS repo, run real commands to source every fact, capture screenshots, and write ONE standardized hand-off folder that another agent (Leo's bilingual Astro portfolio) turns into a case study.

Work with MINIMAL questions. Run commands, read files, batch every unresolved item into one `## NEEDS-USER` checklist at the very end. There is exactly ONE allowed early-stop (see STEP 0). Otherwise: extract first, ask once at the end.

---

## CONFIG (edit if needed, then proceed)

```yaml
PORTFOLIO_OUTPUT_DIR: auto   # "auto" = <repo-root-absolute>/Portfolio . Resolve to an ABSOLUTE path on first use (cwd resets between bash calls in this harness — never rely on a relative ./Portfolio).
TARGET_SLUG: auto            # "auto" = derive kebab-case slug from product name; or hard-set e.g. "my-cool-project"
SUBDIR: auto                 # "auto" = detect; for a monorepo set the package path, e.g. "apps/web". MANUAL VALUE ALWAYS WINS — if set, skip detection entirely.
```
Filled example: `PORTFOLIO_OUTPUT_DIR: /home/me/coolpc/Portfolio` · `TARGET_SLUG: coolpc-price-tracker` · `SUBDIR: auto`.

**Language:** write the hand-off in 繁體中文 (zh-TW). The body sections are zh-only — Leo's main agent LOCALIZES the English twin itself (this is not a mechanical transform; do not pretend it is). Technical product names (Supabase, Vercel, FastAPI…) stay in English inline; that is expected.

**Shell:** the git/data pipelines below use POSIX idioms (`head`, `wc`, `sort`, until-loops). Run them through the **Bash tool** (a POSIX shell is available in this harness even on Windows). If only PowerShell is available, use the equivalents: `head -1`→`Select-Object -First 1`, `wc -l`→`Measure-Object -Line`, file move→`Move-Item`, port poll→`Test-NetConnection`. Never block on a foreground `sleep`.

---

## THE ONE UNBREAKABLE RULE: NEVER FABRICATE

Every value traces to a file you READ or a command you RAN. NEVER invent or estimate numbers, dates, tech, URLs, clients, awards, or Lessons. "~thousands of rows" is forbidden — only counted/measured numbers. A clean gap always beats a guess; honesty is a feature here.

**Two fields are the ONLY exception — they are Leo-side ranking knobs, not repo facts, so a default is honest:** `featured` (default `false`) and `order` (default `99`). You may emit a non-authoritative *suggestion* for these from strength signals (see STEP 1) and route the final call to Leo via NEEDS-USER.

**Gap handling depends on whether the field is REQUIRED or OPTIONAL** (this matters — the build runs Zod validation):
- REQUIRED (`title, oneLiner, role, status, timeframe, tech`): NEVER emit a bare `UNKNOWN` value — the build cannot compile it (`status` must be `done|wip`; `timeframe` must be a string). Always emit the BEST-SOURCED value you can, AND add a blocking `## NEEDS-USER` line if you had to infer it. `status` defaults to `wip` when ambiguous (honest).
- OPTIONAL (`demoUrl, repoUrl, cover, coverAlt, evidence, metrics`): if unverifiable, OMIT the line entirely — do NOT write the literal `UNKNOWN` into the value (the component already falls back). Record the gap and how to fill it in NEEDS-USER. `metrics` MAY be an empty list — that is a valid delivery (see STEP 2).

Put a source comment on RISKY/load-bearing fields only (`metrics, timeframe, status, demoUrl, repoUrl, role`), on its OWN line directly ABOVE the value — NEVER trailing the value (a trailing `<!-- -->` gets swallowed by a naive parser). Obvious fields (title from README H1, tech from a manifest) may be source-free to cut clutter.

---

## STEP 0 — Scope & identify the project

1. Repo map with the Glob/Grep/Read tools (not `find`/`cat`): top-level dirs + manifests (`package.json`, `pyproject.toml`, `requirements.txt`, `go.mod`, `Cargo.toml`, `pom.xml`, `composer.json`), infra (`Dockerfile`, `docker-compose.yml`, `.github/workflows/`), deploy configs (`vercel.json`, `netlify.toml`, `wrangler.*`, `render.yaml`, `fly.toml`).
2. **Monorepo (NON-blocking):** if `CONFIG.SUBDIR` is set, use it and skip detection. Else, if multiple packages each have a manifest + entrypoint, AUTO-PICK by precedence: (a) has a deploy config → (b) most recent commit → (c) most LOC. PROCEED with full extraction on the winner, and add a NEEDS-USER line: `偵測到多個 app：已選 <path>（理由：<有 vercel.json / commit 最新>）；若要改成 <other> 請告知`. Scope ALL further extraction to the chosen `SUBDIR`.
3. **The ONLY allowed early-stop:** ZERO candidate has any entrypoint/manifest at all. Then ask the user what to analyse and stop. Anything else → proceed and defer to NEEDS-USER.
4. **Empty git history:** if `git log` returns nothing (no commits yet), mark `role/status/timeframe/踩坑` from non-git sources only and add ONE NEEDS-USER line: `repo 尚無 commit 紀錄，時間/角色/狀態需作者補充`. `status` → `wip`.
5. Derive `TARGET_SLUG` if `auto`: kebab-case the human product name (lowercase ASCII, hyphens). **If the name is non-Latin (e.g. 原價屋追價) and yields an empty/garbage ASCII slug:** transliterate (pinyin/romaji) → else use the repo/folder name → else add ONE NEEDS-USER question for the slug. NEVER emit an empty slug (it breaks the site's zh/en twin-matching).
6. Create `PORTFOLIO_OUTPUT_DIR/<slug>/` and `PORTFOLIO_OUTPUT_DIR/<slug>/assets/` (absolute paths).

---

## STEP 1 — Extract every schema field (run the commands, cite the risky ones)

| Field | How to source it (precedence → fallback) |
|---|---|
| **title** | README H1 (`# …`) → manifest name/description → repo/subdir folder name (de-slugified). Prefer a human product name over a package id. |
| **oneLiner** | README subtitle/first non-title sentence → `gh repo view --json description` → manifest `description`. ONE sentence, present tense, OUTCOME-FIRST (what it produces / for whom — never tech-first). **Hard cap ≤ ~35 zh chars.** If the only source is a tech-first manifest blurb (`A FastAPI service for…`), REWRITE it outcome-first adding NO claims. Target voice (shipped): `每日爬全站商品價格，建立歷史價格資料庫並以網頁呈現`. |
| **role** | `git shortlog -sne --all` + `git log --format='%ae' \| sort -u`. 1 author → `個人專案・<領域>`; multiple → `團隊 N 人・我負責 …` but "my part" is NOT in the repo → emit `團隊 N 人` and put the my-part question in NEEDS-USER. Derive `<領域>` from tech (crawler+DB → 資料工程; frontend dir → + 前端; training loop → ML/強化學習; LLM API → LLM 應用). Shipped examples: `個人專案・資料工程 + 前端`, `個人專案・LLM 應用 + 自動化`. |
| **status** | `git log -1 --format=%cd --date=short`, `git tag --list`, `gh release list`. **done**: release tag / verified live URL / version ≥1.0 / README "complete". **wip**: TODO/WIP badge, 0.x, recent commits + no tag. **Default `wip` if ambiguous.** If `gh` is unavailable, fall back to `git tag --list` only. Show your evidence. |
| **timeframe** | start = FIRST line of `git log --reverse --format=%ad --date=short` → emit FULL date `YYYY-MM-DD ~ 至今`. end = tag date if done+tagged, else `至今`. **Cross-check** the start against earliest CHANGELOG/README date AND `.git/shallow`; if they disagree OR the clone is shallow/squashed/imported, prefer the document date and flag it; fall back to month-only `YYYY-MM ~ 至今` ONLY when the day is genuinely unknowable. Canonical shipped string: `2026-04-24 ~ 至今`. |
| **tech[]** | UNION of manifests only (deps+devDeps, `pyproject/requirements/poetry.lock`, `go.mod`, `Cargo.toml`); infra from `Dockerfile` base image, `docker-compose` services, `.github/workflows`; DB/cloud from `.env.example`/`prisma schema`/alembic/SQL/deploy config. **Curate to 5–9 resume-level items, DROP lint/test/build noise** (eslint, prettier, pytest, webpack). **Deterministic keep-order (so two runs match):** ALWAYS keep, in order, (1) primary language, (2) primary framework, (3) datastore, (4) host/deploy target; THEN fill remaining slots with highest-signal libs in manifest order; drop the rest. Shipped example: `[Python, requests, BeautifulSoup, Supabase (PostgreSQL), Vercel]`. |
| **tags[]** | 2–4 DOMAIN words, NOT tech names. Reuse the site's vocabulary: 資料工程 / 爬蟲 / 資料視覺化 / LLM / 自動化 / 資料管線 / 強化學習・RL. Shipped: `[資料工程, 爬蟲, 資料視覺化]`, `[LLM, 自動化, 資料管線]`. Cap at 4. |
| **metrics[]** | ★ STEP 2. |
| **demoUrl** | README Live/Demo links (`*.vercel.app`, `*.netlify.app`, `*.pages.dev`, `*.github.io`, custom domain) → deploy configs → `gh repo view --json homepageUrl` → manifest `homepage`. **Verify REACHABLE, not 200-strict:** accept 2xx/3xx (follow redirects). 401/403/Cloudflare-challenge = REACHABLE-BUT-GATED → KEEP the URL, flag `demo 需登入/受保護` in NEEDS-USER. NETWORK error (no outbound net, not an HTTP status) → KEEP the URL with a source note `未能驗證（無外網）` — NEVER silently drop a configured demo. Only a confirmed 404/410/ENOTFOUND-on-the-host drops it. |
| **repoUrl** | `git remote get-url origin` (normalise `git@…`→`https`, strip `.git`), then `gh repo view --json visibility`. **FAIL-CLOSED:** only emit if confirmed `PUBLIC`. If `gh` is missing/un-authed/rate-limited OR visibility can't be confirmed → treat as PRIVATE, OMIT repoUrl, add NEEDS-USER: `無法確認 repo 是否公開（gh 未安裝/未登入）；若為公開請提供網址`. Never expose a private URL. |
| **cover / coverAlt / evidence** | ★ STEP 3. |
| **featured / order (suggestion)** | NON-authoritative, from strength signals you already gathered: verified-reachable demoUrl + `status: done` → suggest `featured: true, order: 0`; else `featured: false, order: 99`. ALWAYS route the final call to Leo (NEEDS-USER line). These are the only two fields you may set without a repo source. |

---

## STEP 2 — metrics[] (★ most important; every number needs a runnable source)

Produce **3–6 metric lines** matching the SHIPPED house voice: a short, number-led noun-phrase, ONE optional parenthetical for context, **≤ ~16 zh chars**; NO full sentence, no two unrelated numbers fused. Real shipped metrics (match this register — keep the clarifying parentheticals):
`每日自動更新（排程爬蟲）` · `追蹤 2,259 件商品（SKU）` · `每日 1 次推送 × 10 則` · `58 個來源` · `排程：GitHub Actions（每日定時）`.

Source each by category — RUN the command, read the REAL number:
- **Data scale** → `SELECT COUNT(*)` on the project DB (read connection from `.env`/config; Supabase → its client or `psql`); row counts in data files (`wc -l data/*.csv`, parquet row count); count entries in a seed/source config.
- **Throughput / cadence** → schedule from `.github/workflows` cron or crontab (`cron: 0 0 * * *` → 每日 1 次); batch size from config.
- **ML success** → actually RUN the eval/test (`python eval.py`, `pytest`, `evaluate`) OR read the latest `results.json` / TensorBoard event file / `mlruns` / `wandb`. Report the real figure (solved X/100, accuracy N%).
- **Reliability** → CI ratio (`gh run list --limit 100`; skip → UNKNOWN if `gh` un-authed), deploy/status page, `已運行 N 天` from first deploy date.
- **Codebase size** (only if nothing else) → `git ls-files | wc -l` or `cloc`.

**Business-value rule:** at least ONE metric must read as value to an HR/client in 2 seconds — time saved / cost / scale / reliability (`每日自動更新`, `已運行 90 天`, `省時 60%`). **Mark it machine-detectably**: prefix that one line with `[價值] ` so Leo and your own self-check can verify the invariant.

**Zero-metric delivery is VALID and blessed.** If no runnable source yields ANY number, the `metrics` block may contain only UNKNOWN lines, each with its "how to get it" pushed to NEEDS-USER — this is a passing hand-off (the schema allows an empty array). ONE narrow non-number exception (mirrors the real rl-sudoku case): a DESCRIPTIVE metric naming a REAL artifact you verified exists, e.g. `訓練收斂曲線（TensorBoard 事件檔已存在）` with a source comment pointing at the events file — NEVER a bare adjective or an unverified claim.

---

## STEP 3 — Screenshots (1 LCP cover + 1–2 evidence shots)

Target: a **cover** = the hero/above-the-fold product view (chart, dashboard, result — NEVER a login/landing/marketing page) + 1–2 **evidence** shots proving a real outcome (data table, result diff, training curve, chat message). Save EXACT lowercase names into `PORTFOLIO_OUTPUT_DIR/<slug>/assets/`: `cover.png`, `evidence-1.png`, `evidence-2.png`. Cover ≈ 1280×800 landscape (NOT full-page); evidence may be full-page.

**Path contract (important):** you ONLY guarantee the file exists in `assets/` under that exact name. The cover path you write in the hand-off (`assets/cover.png`) is a HANDOFF-LOCAL pointer; Leo's main agent owns copying/renaming it to `src/assets/<slug>-cover.png` and writing the per-locale relative path. DO NOT emit any `../../assets/…` path — that is the main agent's job.

**Prefer the project's own run/browse skill** if one is already set up (it handles save paths) — but do NOT trigger a one-time build/setup prompt in an automated run. Otherwise hand-roll Playwright MCP.

- **Branch A — live URL exists:** `browser_navigate` → `browser_resize` 1280×800 → `browser_wait_for` a key selector/text → `browser_take_screenshot` with `filename: "cover.png"` (fullPage **false**) → 1–2 feature views as `evidence-1.png`/`evidence-2.png` (fullPage true). **Locate + move:** `browser_take_screenshot` only writes a relative `filename` inside Playwright's OWN output dir — immediately run a **Glob for that exact filename** to resolve the real path, then `Move-Item` (win32) / `mv` (posix) it into `assets/`. If the move fails or the dir is unresolvable, write `no-screenshot: 截圖已產生但無法搬移至 assets/（路徑：…）` — never silently lose the file. Check `browser_console_messages`; **Read each PNG** to confirm it's not blank/cookie-wall/404.
- **Branch B — no URL but it's a web app:** **Pre-flight FIRST** — if `.env.example` lists DB/secret vars with no local `.env`, DO NOT boot (it will hang on a missing `DATABASE_URL` or crash on first request) → go straight to Branch C and note in NEEDS-USER `app 需 secrets 才能啟動，未截圖`. Else detect a start command: `package.json` scripts (`dev`→`start`→`preview`→`serve`) → Makefile → docker compose → README → framework defaults (Astro/Vite 4321/5173, Next/CRA 3000, Flask 5000, Django 8000, Streamlit 8501). Launch with **`run_in_background`**; write the PID + port to `assets/.devserver` so a LATER call can kill it (shell state does NOT persist between calls). **Poll with a deadline, never a blind sleep:** loop comparing `date +%s` against a start+60s deadline (posix) / `Test-NetConnection -Port` until-deadline (win32); cap total effort. On ANY crash/timeout fall THROUGH to Branch C (no retry-loop). **ALWAYS kill the server** by reading back `assets/.devserver` and killing that PID in a final cleanup call; then delete `.devserver`.
- **Branch C — no-UI / library:** in priority — existing chart in `runs/`/`outputs/`/`reports/`/`plots/` → TensorBoard on `:6006` (scalars curve) → notebook → HTML, screenshot the figure → terminal run output (paste as evidence text) → last resort, render the 架構 arrows to a Mermaid image (needs network; skip with a note if offline). For a library the cover is a usage snippet or the architecture diagram.

**Bounded capture:** at MOST 2 attempts per shot. For a cookie wall, allow ONE `browser_click` on an accept/dismiss button if present; else skip. If both attempts are blank/gated → `no-screenshot:<reason>` and move on. Wrap each capture so a failure can't abort the run.

**Zero screenshots is a complete, valid hand-off** — omit cover/coverAlt; the case study falls back to the 架構 arrows (Leo renders them to Mermaid). NEVER fabricate or use a stock cover. **The architecture-arrows fallback is always offline-reachable, so a hand-off is never blocked on imagery.**

For every shot write a one-sentence FACTUAL caption describing WHAT IS SHOWN (the chart/table/result), not "screenshot1". Each evidence caption FEEDS the `evidence` field (STEP 1) regardless of whether a demoUrl exists. Write `assets/manifest.md` per image: source URL or command, viewport, timestamp, intended final filename `<slug>-cover.png`, and the caption.

---

## STEP 4 — The 4-section body (FIXED order, prose only, zh-TW)

Order is fixed: 問題 → 做法 → 架構 → 踩坑. Read the README's ACTUAL headings — match BOTH English and localized keywords:
- **## 問題** — sources: README 動機/緣由/背景/問題/Motivation/Why/Problem/intro, design docs, first-commit messages (`git log --reverse --oneline | head -20`). 2–4 plain sentences, LEAD WITH THE PAIN, no warm-up filler.
- **## 做法** — sources: tech[] + dir structure + README 安裝/使用方式/功能/做法/Usage/How-it-works. WHAT was built + WHY these tools, grounded ONLY in the detected stack. 2–4 sentences. Bar (shipped): `排程爬蟲（requests + BeautifulSoup）抓全站 → 正規化寫入 Supabase（PostgreSQL）→ Vercel 上的網頁查詢與走勢圖。`
- **## 架構** — ARROWS ONLY. One line, 4–6 nodes of 1–3 words joined by ` → `, from entrypoint → modules → data stores → outputs (use docker-compose links, dir layout, imports). NO sentences/adjectives. Generic placeholder shape: `入口 → 處理模組 → 資料儲存 → 輸出`.
- **## 踩坑** — the most valuable; DO NOT fabricate. Mine REAL friction: `git log --grep -iE 'fix|bug|revert|workaround|hotfix' --oneline`, closed issues / merged PRs (`gh issue list --state closed`, `gh pr list --state merged` — if `gh` un-authed, fall back to git-log grep over local history), `HACK`/`FIXME`/`workaround` comments, reverts, CHANGELOG "Fixed". Write ONE strongest lesson: concrete failure → fix → takeaway. If history yields nothing concrete → write `UNKNOWN — 踩坑需作者補充` and flag it. NEVER ship a platitude or "待補".

Add ONE `<!-- 推論，請覆核 -->` marker per section whose content you INFERRED rather than read verbatim (uniform inferred-marker; do not pepper the body with other comments).

---

## STEP 5 — Freelance angle, write hand-off, self-check, finish

**接案視角 (freelance signal — keep the interview+freelance dual framing):** add a `## 接案視角` line mapping the project to ONE of Leo's service buckets, inferable from the detected stack WITHOUT fabrication: 資料爬取/清洗管線 · 自動化排程+告警 · LLM 應用整合 · 資料視覺化網頁. Leave client/industry/result as NEEDS-USER (not sourceable from a repo). NO pricing anywhere — that ban is absolute.

Write ONE file `PORTFOLIO_OUTPUT_DIR/<slug>/handoff.md` in the exact OUTPUT SPEC format. Then:

1. **Self-check (pass/fail explicit):** every risky field has a source comment ON ITS OWN LINE above the value; REQUIRED fields all carry a compile-valid value (no bare `UNKNOWN`; `status` ∈ {done,wip}); OPTIONAL gaps are OMITTED not `UNKNOWN`; at least one `[價值]` metric exists OR every metric is flagged-as-UNKNOWN in NEEDS-USER (**flagged counts as PASS**); 架構 is arrows-only; no section exceeds the caps; `featured`/`order` are present as suggestions routed to Leo; no fabricated content; no English prose in the body.
2. **技術詞校稿:** add a short `## 技術詞校稿` list flagging any non-obvious product/domain term whose English rendering you're unsure of (so Leo proofreads the twin) — e.g. a Chinese-only product name, an internal codename.
3. Print a summary to the user: output path, which fields are UNKNOWN, and: **「把 `Portfolio/<slug>/handoff.md` 連同 `assets/` 一起貼回給 Leo 的主 agent。」**

---

## WRITING RULES (hard limits — match the in-repo voice)

- **Lead with the outcome**, never tech/process. oneLiner & every metric state the result first.
- **Length caps:** oneLiner ≤ ~35 zh chars; each metric ≤ ~16 zh chars; 問題/做法/踩坑 = 2–4 sentences each ≤ ~60 zh chars. **NO bullet lists or sub-headings inside body sections** — prose only. Bullets live ONLY in tech/tags/metrics.
- **One idea per section.** 問題 = pain only; 做法 = approach + why-tech; 架構 = flow only; 踩坑 = ONE lesson.
- **No warm-up filler** (為了…/In order to…/本專案旨在…). **No marketing adjectives** (業界領先/robust/seamless/cutting-edge). No emoji, no bold-spam in the body. **No pricing anywhere.**
- **Quantify, don't dump.** Run real commands but distil each to ONE number. Raw logs, full SQL output, stack traces, dashboard tables are FORBIDDEN in the hand-off — summarise to one finding.
- **Plain language.** ≤ ~2 tech terms per body sentence; deep stack names belong in `tech:`.
- **REJECT example:** "In this project, in order to solve the problem, I set up a Python environment and chose requests because it's popular… see logs: [2026-04-24 03:00:01 INFO fetched 2259 rows]…" (warm-up + jargon + raw log + no outcome).

---

## MESSY-CASE PLAYBOOK

- **No README** → manifests + git history + code structure; raise confidence flags in NEEDS-USER.
- **Monorepo** → auto-pick one package (STEP 0.2), proceed, alternatives → NEEDS-USER. Never extract across the whole repo.
- **Notebook-only** → parse `.ipynb` cells+outputs for metrics/charts; nbconvert the result figure as cover; if no eval number, ship descriptive-artifact metric (STEP 2).
- **Private / no remote** → repoUrl omitted (fail-closed), demoUrl likely omitted; rely on local screenshots + evidence text.
- **Library (no UI)** → cover = usage snippet or architecture diagram. PREFERRED metric = **API-surface size** (count exported symbols from source — always works offline). Downloads ONLY if a live `pip index`/`npm view` query SUCCEEDS (else UNKNOWN). Coverage ONLY from a freshly-RUN coverage command — a README coverage badge does NOT count as a source.
- **Empty git history / shallow clone** → see STEP 0.4; flag time/role/status for the author.

Now begin at STEP 0. Be autonomous; run the commands; cite the risky sources; ask once at the end.

---

## OUTPUT SPEC — what the agent writes (handoff.md format)

The agent writes EXACTLY this tree (absolute paths; cwd resets between calls):

```
Portfolio/<slug>/
├── handoff.md
└── assets/
    ├── cover.png          # ~1280×800 LCP hero (or absent → cover line omitted)
    ├── evidence-1.png     # optional
    ├── evidence-2.png     # optional
    ├── .devserver         # transient: PID/port of any dev server started, for cleanup; delete after kill
    └── manifest.md        # per image: source URL/command, viewport, timestamp, intended final name <slug>-cover.png, caption
```

`handoff.md` PARSE CONTRACT (so Leo parses deterministically):
1. Source comments live on their OWN line directly ABOVE the field — NEVER trailing the value. So every value line is clean and "everything after the first colon" is the literal value.
2. List fields are written EXACTLY as the .md frontmatter expects: `tech: [a, b, c]` inline; `metrics:` as a YAML block list. Leo copies them verbatim.
3. The required business-value metric is prefixed `[價值] ` (machine-detectable).
4. `cover: assets/cover.png` is a HANDOFF-LOCAL pointer ONLY. Leo copies/renames it to `src/assets/<slug>-cover.png` and writes the locale-correct relative path himself: zh `../../assets/<slug>-cover.png`, en (one dir deeper) `../../../assets/<slug>-cover.png`. The extractor emits NO `../` path.
5. `featured`/`order` are non-authoritative SUGGESTIONS (the only fields allowed without a repo source); Leo confirms.
6. REQUIRED fields never carry a bare `UNKNOWN`; OPTIONAL fields are OMITTED rather than set to `UNKNOWN`.

`handoff.md` skeleton (zh-TW; 1:1 to src/content.config.ts incl. featured/order):

````markdown
# 作品 intake：<title>

<!-- slug: <slug> | 由 Portfolio Extractor Agent 自動產生 | 來源 repo: <repoUrl 或 "private/未確認"> -->
<!-- 語言中立、勿翻譯：slug、tech[] 產品名、demoUrl、repoUrl、timeframe 數字、metrics 內的數字 -->

## 欄位（對應 frontmatter）
- slug: <slug>
- title: <title>
- oneLiner: <≤35 字、outcome-first>
<!-- source: git shortlog（1 author） -->
- role: <個人專案・領域 | 團隊 N 人>
<!-- source: git log --reverse --format=%ad --date=short 首行 -->
- status: <done | wip>
- timeframe: <YYYY-MM-DD ~ 至今>
- tech: [<5–9 項>]
- tags: [<2–4 領域詞>]
<!-- source: 已驗證可達（2xx/3xx）；或 未能驗證（無外網） -->
- demoUrl: <https URL>            # 無則整行省略
<!-- source: gh visibility=PUBLIC -->
- repoUrl: <https URL>            # 非 public / 無法確認則整行省略
- cover: assets/cover.png        # handoff-local pointer；無截圖則整行省略
- coverAlt: <一句話描述截圖內容>   # 無 cover 則整行省略
- evidence: <evidence-*.png 的一句話描述；有截圖就填，與 demoUrl 無關>
- featured: <true|false>   <!-- 建議值，非權威；Leo 確認 -->
- order: <0|99>            <!-- 建議值，非權威；Leo 確認 -->

## metrics（3–6 條；★至少一條 [價值]；可全為 UNKNOWN）
metrics:
<!-- source: SELECT COUNT(*) → 2259 -->
  - 追蹤 2,259 件商品（SKU）
<!-- source: .github/workflows cron: 0 0 * * * -->
  - [價值] 每日自動更新（排程爬蟲）

## 問題
<2–4 句白話，lead with the pain>   <!-- 推論，請覆核（僅推論段才加） -->

## 做法
<2–4 句，approach + why-tech，grounded in detected stack>

## 架構
<arrows only：A → B → C → D>

## 踩坑
<ONE 真實 failure → fix → lesson；無則 UNKNOWN — 踩坑需作者補充>

## 接案視角
- 對應服務：<資料爬取/清洗管線 | 自動化排程+告警 | LLM 應用整合 | 資料視覺化網頁>
- 客戶/產業/結果：UNKNOWN（repo 無法判定）

## 技術詞校稿
- <英譯不確定的產品/領域詞，供 Leo 校稿；無則寫「無」>

## NEEDS-USER（請 Leo / 作者補）
- [ ] featured/order 最終排序由 Leo 拍板（目前建議：featured=<…>, order=<…>）
- [ ] <每個 UNKNOWN 一行，附「怎麼拿到」>
- [ ] <團隊專案：我負責的部分 repo 無法判定，請填>
- [ ] <screenshot/dev-server/gh 失敗：原因 + 可否補圖或網址>
````

WORKED EXAMPLE (real coolpc data — the concrete parser contract, not a placeholder):

````markdown
# 作品 intake：原價屋全站商品歷史價格庫

<!-- slug: coolpc-price-tracker | 由 Portfolio Extractor Agent 自動產生 | 來源 repo: private/未確認 -->
<!-- 語言中立、勿翻譯：slug、tech[] 產品名、demoUrl、repoUrl、timeframe 數字、metrics 內的數字 -->

## 欄位（對應 frontmatter）
- slug: coolpc-price-tracker
- title: 原價屋全站商品歷史價格庫
- oneLiner: 每日爬全站商品價格，建立歷史價格資料庫並以網頁呈現
<!-- source: git shortlog -sne（單一作者） -->
- role: 個人專案・資料工程 + 前端
- status: done
<!-- source: git log --reverse --format=%ad --date=short 首行 -->
- timeframe: 2026-04-24 ~ 至今
- tech: [Python, requests, BeautifulSoup, Supabase (PostgreSQL), Vercel]
- tags: [資料工程, 爬蟲, 資料視覺化]
<!-- source: 已驗證可達（200，follow redirects） -->
- demoUrl: https://coolpc-tracker.vercel.app/
- cover: assets/cover.png
- coverAlt: 原價屋價格追蹤站截圖：商品歷史價格走勢圖
- evidence: 商品歷史價格走勢圖截圖（網頁版）
- featured: true   <!-- 建議值，非權威；Leo 確認 -->
- order: 0         <!-- 建議值，非權威；Leo 確認 -->

## metrics（3–6 條；★至少一條 [價值]；可全為 UNKNOWN）
metrics:
<!-- source: Supabase SELECT COUNT(DISTINCT sku) → 2259 -->
  - 追蹤 2,259 件商品（SKU）
<!-- source: .github/workflows/crawl.yml cron: 0 0 * * * -->
  - [價值] 每日自動更新（排程爬蟲）

## 問題
想追蹤 PC 零組件的降價時機，但官網沒有歷史價格。

## 做法
排程爬蟲（requests + BeautifulSoup）抓全站 → 正規化寫入 Supabase（PostgreSQL）→ Vercel 上的網頁查詢與走勢圖。

## 架構
排程爬蟲 → 解析 → Supabase（歷史價）→ API/輸出 → 網頁圖表

## 踩坑
UNKNOWN — 踩坑需作者補充

## 接案視角
- 對應服務：資料爬取/清洗管線 + 資料視覺化網頁
- 客戶/產業/結果：UNKNOWN（repo 無法判定）

## 技術詞校稿
- 原價屋（商家專有名詞，英譯建議 Coolpc，請 Leo 確認）

## NEEDS-USER（請 Leo / 作者補）
- [ ] featured/order 最終由 Leo 拍板（建議 featured=true, order=0：有可達 live demo 且 done）
- [ ] 踩坑：git 史無 fix/revert 線索，請作者補一條真實踩坑
- [ ] 累積筆數 / 涵蓋類別數：Supabase 再跑 COUNT(*) 補上
````

── COPY TO HERE ──
