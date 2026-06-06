# 個人作品集網站 — 設計規格 (Spec) v2.1

- **Owner**：Leo（GitHub: [leo53021313](https://github.com/leo53021313)）
- **日期**：2026-06-01
- **目標**：求職（台灣 HR／技術主管）為主、未來接案為輔的個人作品集
- **狀態**：規劃定案，待建置（v2.1：經 workflow 驗證版本/一致性，回填真實資料）

> 本檔是建站的單一事實來源（single source of truth）。建站時照此執行；任何變更請更新本檔。

---

## 0. 一句話定位
> 「把 AI 與資料工程**落地成實際應用**的工程師」——用一個**極簡、一目了然**的雙語網站，讓 HR 10 秒看懂角色、讓技術主管往下讀到證據。

設計準則：**完整但不過度**。作品少（3 個）+ 轉職階段 → 一切以「少維護、好擴充、AI 可輔助開發」為準，主動避免用不到的功能。

---

## 1. 技術選型與部署

| 項目 | 決策 |
|---|---|
| 框架 | **Astro 6.x**（釘 `^6.4.2`；內建 i18n + Markdown 內容集合 + 預設近零 JS） |
| Repo | **`leo53021313.github.io`**（User Page）→ 網站在根網址、**無 base path** |
| 部署 | GitHub Actions：`withastro/action@v6` + `actions/deploy-pages@v5`（留 v5）；Settings → Pages → Source 設「GitHub Actions」 |
| Node | 開發/CI 用 **24 LTS**（下限 22；action 預設 24，勿用 26 非 LTS） |
| 表單 | **Web3Forms**（免費 250/月、免帳號）+ 混淆 mailto 備援 |
| 分析 | **GoatCounter**（Phase 1 再加；免費、無 cookie、貼一段 script） |
| 字體 | 自架 via **Fontsource**，中文走 unicode-range 切片 |

**版本釘選**：`astro@^6.4.2`、`@astrojs/sitemap@^3.7.2`、fontsource 三套件（見 §2.2）皆釘版並提交 lockfile。最新穩定大版即可，不追 Astro 7（alpha）。

`astro.config.mjs`（對照 **Astro 6** 官方文件驗證）：
```js
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://leo53021313.github.io',
  i18n: {
    locales: ['zh-tw', 'en'],
    defaultLocale: 'zh-tw',
    // Astro 6：明確設定，不依賴已改動的預設值
    routing: { prefixDefaultLocale: false, redirectToDefaultLocale: false }, // zh-TW 走根網址，en 在 /en/
  },
  integrations: [
    sitemap({
      // hreflang 用 zh-TW（Google 忽略 Hant 子標籤）；zh-Hant-TW 只用在 <html lang>
      i18n: { defaultLocale: 'zh-tw', locales: { 'zh-tw': 'zh-TW', en: 'en' } },
    }),
  ],
});
```

部署 workflow（`.github/workflows/deploy.yml`，重點）：
```yaml
on: { push: { branches: [main] }, workflow_dispatch: {} }
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

---

## 2. 視覺設計系統

**風格定位**：極簡 / 一目了然。近白底、大量留白、清楚層級、易讀無襯線、**單一翠青強調色**。刻意拿掉終端機與裝飾，降低視覺複雜度。

### 2.1 色彩 token（亮 / 暗雙模式）
| Token | 亮色（預設） | 暗色（柔和，可切換） |
|---|---|---|
| `--bg` | `#FFFFFF` | `#16181C` |
| `--surface` | `#FFFFFF` / `#FAFAFB` | `#1D2025` |
| `--text` | `#111317` | `#CDD2D8` |
| `--muted` | `#6B7280` | `#868D96` |
| `--border` | `#ECECEF` | `#2B2F36` |
| `--accent`（翠青） | `#0C7C53` | `#4FB395` |

規則：
- 預設**亮色**；提供暗色切換並 `prefers-color-scheme` 跟隨系統，選擇存 `localStorage`。
- 暗色**不用純黑/純白**（防 halation/刺眼）。
- **翠青只用在**：主要按鈕、連結、少數技術標籤。**不**當小字內文色。
- `--surface` 亮色 `#FFFFFF`（卡片）；`#FAFAFB` 作 `--surface-alt`（區段交替底，可選）。
- 上線前用對比工具確認所有 text/accent 配對過 **WCAG AA**（兩個模式都要）。已用 axe 驗證：亮色 accent 由 `#0F8A5F` 調為 **`#0C7C53`** 以達 4.5:1（白字按鈕/連結）；暗色 `#4FB395` 已通過。favicon/og.png 的裝飾色仍為 `#0F8A5F`（非文字對比，可日後對齊）。

### 2.2 字體
- 標題 / 內文 / UI：**Inter** + **Noto Sans TC**
- 程式碼 / 數據數字 / 技術標籤：**JetBrains Mono**（克制使用，增添「資料感」）
- CSS stack：`font-family: 'Inter','Noto Sans TC', system-ui, -apple-system, 'PingFang TC','Microsoft JhengHei', sans-serif;`
- 來源（自架，釘版）：`@fontsource-variable/inter@^5.2.8`、`@fontsource-variable/noto-sans-tc@^5.2.10`、`@fontsource/jetbrains-mono@^5.2.8`；提交 lockfile。
- **中文交付（最關鍵）**：用 Fontsource/Google CSS 讓 Noto Sans TC 以 **unicode-range 切片**載入（每頁中文僅數百 KB），**絕不** `@font-face` 單一完整檔；`font-display: swap`；只 preload 拉丁切片；fallback 加 `size-adjust` 防 CLS。

### 2.3 元件 / 互動
- **Hero**：大標姓名（**對外暫用「Leo」**）+ 角色一行 + 一句價值主張 + 兩個按鈕（查看作品 / 聯絡）。中文名待補 → 暫不放雙語姓名堆疊，之後有了再加。
- **卡片**：surface 底、1px border、圓角；hover 微上浮 + border 轉翠青；mono kicker 標籤列（如 `資料工程 · 爬蟲`）。
- **按鈕**：primary = 翠青實心（單一主要動作）；secondary = ghost（1px border，hover 填淡翠青）；**所有互動元素有可見 2px focus ring**。
- **動效**：克制——進場淡入上升（IntersectionObserver，一次）、150–200ms hover、200ms 主題切換。無 parallax/scroll-jacking。完整 `prefers-reduced-motion` 靜態路徑。
- **無 logo 品牌**：字體 wordmark（Inter 粗體姓名）+ 字母 favicon；一致的色彩/間距系統就是品牌。

---

## 3. 資訊架構 / Sitemap

```
leo53021313.github.io  (根網址，zh-TW 預設)
├─ /                         首頁
├─ /projects/                作品列表
│   ├─ /projects/coolpc-price-tracker   原價屋價格庫   ★精選・第一順位(有 live 站)
│   ├─ /projects/rl-sudoku-solver       RL 解數獨      ★精選
│   └─ /projects/ai-news-digest         AI 新聞 Discord 摘要 (進行中)
├─ /about/                   關於（技能矩陣 / 時間軸 / 自介；CV 之後）
└─ /contact/                 聯絡（Web3Forms 表單 + email + GitHub）

/en/  ← 英文鏡像（/en/, /en/projects/, /en/projects/<slug>, /en/about/, /en/contact/）

全站：頂欄(導覽 + 繁中/EN 切換 + GitHub) + 頁尾。完整雙語上線。
刻意不做：部落格 / 服務頁 / 標籤過濾頁。
導覽列 4–6 項封頂；GitHub 連結放頁尾（repo 暫 private，不當頭號證據），LinkedIn 待補後再上。
```

---

## 4. 雙語 i18n 實作

- **架構**：Astro 內建 i18n（§1 config）+ 單一字典檔，**不裝第三方 i18n 套件**。
- **UI 字串**：`src/i18n/ui.ts`（`ui` 物件依 locale 分組、dot 命名 key）+ `src/i18n/utils.ts`（`getLangFromUrl`、`useTranslations`，缺 key 自動 fallback 預設語言）。
- **長文**：專案/About 用內容集合，**語系由檔案路徑判斷**（`/en/` 子資料夾為英文，其餘 zh-TW；schema 不放 `lang` 欄位）。
- **切換器**：`getRelativeLocaleUrl` + `Astro.currentLocale`，`EN / 繁中` 並排、**不用國旗**、用語言自身名稱、`aria-current` 標 active。
- **SEO**：head 與 sitemap **統一** `hreflang` = `zh-TW` / `en` / `x-default`（Google 忽略 `Hant`，故 hreflang 不用 `zh-Hant-TW`）+ `canonical` + 每頁 `<html lang>`（`zh-Hant-TW` / `en`，script 子標籤只用在 lang）。
- 靜態站**無瀏覽器語言自動轉址**；提供清楚手動切換，選擇存 `localStorage`。
- **MVP 完整雙語**：上線即 100% 翻譯（英文技術用詞需自行校稿）。

---

## 5. 作品集呈現 + Metadata Schema

**呈現原則**：技術型專案無漂亮 UI → 靠**敘事 + 架構圖(Mermaid) + 量化數據 + 證據**說服。每個作品內頁固定骨架：標題/一句話 → 證據(demo/截圖) → 問題 → 做法+技術棧 → 架構圖 → 成果數據 → 踩坑/工程決策 → Repo/Demo → 上/下一個。

**標籤**：3 個專案**只做展示用 chip**，**不做互動過濾**（過度設計）；作品到 **6–8 個**再加。

`src/content.config.ts`：
`src/content.config.ts`（**現況；2026-06 已實作**）：
```ts
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const projects = defineCollection({
  // 語系由檔案路徑判斷：/en/ 子資料夾為英文，其餘 zh-TW（不用 lang 欄位）
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/projects' }),
  // schema 用函式形式以便使用 image() helper：cover 走 astro:assets，自動 AVIF/WebP + 響應式 + 尺寸
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      oneLiner: z.string(),
      role: z.string(),                       // 顯示在 meta 列
      status: z.enum(['done', 'wip']),
      timeframe: z.string(),
      tech: z.array(z.string()),              // 渲染在「技術棧 / Stack」區塊
      repoUrl: z.url().optional(),            // 有值→連結；無值→「程式碼可應要求提供」
      demoUrl: z.url().optional(),            // 只放真實 live 網址
      evidence: z.string().optional(),        // 無 live demo 時的證據說明
      metrics: z.array(z.string()).default([]),
      tags: z.array(z.string()).default([]),  // 展示用 kicker chips
      featured: z.boolean().default(false),
      order: z.number().default(0),
      cover: image().optional(),              // 路徑相對 .md 檔 → src/assets/…
      coverAlt: z.string().optional(),        // cover 的無障礙描述
    }),
});
export const collections = { projects };
```

> **一致性架構（2026-06 實作，取代手刻）**：案例內頁版面集中在單一 [`src/components/CaseStudy.astro`]，中英共用、語系由 `entry.id` 判斷 → 兩語言版面不會分歧；列表/路由都走 `src/i18n/utils.ts` 的 `getLocalizedProjects()`，內含**建置期雙語對等檢查**（缺翻譯 build 直接失敗）；chip/button/grid 樣式集中在 `global.css`。新增專案照根目錄 **`ADD-PROJECT.md`** + `src/content/projects/_template.md`（中英）。**`lessons` 已不是 schema 欄位** —— 「踩坑 / Lessons」改寫在 Markdown body；`role`/`tags`/`repoUrl` 皆已實際渲染。

### 5.1 三個專案填寫範例（建站初期規劃草稿）

> 註：以下為**規劃草稿**，與現況有兩點差異——(1) `lessons:` 已**不是** frontmatter 欄位，踩坑改寫在 Markdown body；(2) `cover:` 改用相對 `.md` 的 `src/assets/…` 路徑（image() helper）。實際填寫請以 `ADD-PROJECT.md` + `_template.md` 為準。

**① 原價屋價格庫（第一順位・featured）**
```yaml
# 檔名即 slug → coolpc-price-tracker.md（zh-TW）；英文版放 /en/ 子資料夾
title: 原價屋全站商品歷史價格庫
oneLiner: 每日爬全站商品價格，建立歷史價格資料庫並以網頁呈現
role: 個人專案・資料工程 + 前端
status: done
timeframe: 2026-04-24 ~ 至今
tech: [Python, requests, BeautifulSoup, Supabase (PostgreSQL), Vercel, 前端圖表待補]
repoUrl:                                        # 待補（目前 private，見 §7 決策）
demoUrl: https://coolpc-tracker.vercel.app/     # 最強證據（已公開、已確認）
cover:                                          # 待補（站截圖/走勢圖，作 LCP 首圖）
metrics:
  - 每日更新（最後 2026-06-01 10:09）
  - SKU 總數 / 累積筆數：待補（Supabase 查 COUNT(*)）
  - 涵蓋類別數、最大漲跌幅：待補（以實測為準；先前外部估計值不採用）
lessons: 待補（示意：反爬與版面改版讓爬蟲常壞 → 結構容錯 + 失敗告警）
tags: [資料工程, 爬蟲, 資料視覺化]
featured: true
order: 0
```

**② RL 解數獨（featured）**
```yaml
# 檔名即 slug → rl-sudoku-solver.md
title: 用強化學習訓練 AI 解數獨
oneLiner: 不靠回溯法，讓 agent 從零學會解數獨的填格策略
role: 個人專案・獨立開發
status: done
timeframe: 待補
tech: [Python, TensorBoard, 框架待補(PyTorch?), 訓練環境待補(Gymnasium?)]
repoUrl:                                        # 待補（目前 private）
evidence: TensorBoard 訓練曲線截圖 + 輸入/解出盤面對照圖
metrics:
  - 訓練收斂曲線（TensorBoard：reward / loss vs episodes）
  - 解題成功率（solved X/100）、平均步數：待補（建議跑一次 eval）
lessons: 待補（示意：reward shaping 是成敗關鍵，稀疏 reward 難收斂）
tags: [強化學習, RL]
featured: true
order: 1
```

**③ AI 新聞 Discord 摘要（進行中）**
```yaml
# 檔名即 slug → ai-news-digest.md
title: AI 新聞與教學每日自動摘要推送
oneLiner: 每日爬 AI 新聞與教學，自動摘要後推送到 Discord（網頁版開發中）
role: 個人專案・LLM 應用 + 自動化
status: wip
timeframe: 2026-05 ~ 至今
tech: [Python, Google Gemini API, GitHub Actions, Discord Webhook]
repoUrl:                                        # 待補（目前 private）
evidence: Discord 摘要訊息截圖（+ 可選短 GIF）    # 無公開網址
metrics:
  - 58 個來源
  - 每日 1 次推送 × 10 則新聞/消息
  - 排程：GitHub Actions（每日定時）
lessons: GitHub Actions 排程偶發延遲 → 規劃加重試 / 告警 / 調整排程（誠實的工程反思）
tags: [LLM, 自動化, 資料管線]
featured: false
order: 2
```

---

## 6. 橫向議題（優先序：a11y → SEO/JSON-LD → OG → 效能 → 自訂網域）

- **RWD**：mobile-first、導覽手機收漢堡、真手機測（HR 常用手機開）。
- **a11y（WCAG 2.2 AA）**：語意地標、單一標題層級、可見 focus ring、對比達標、不靠顏色單獨表意、圖/截圖 alt、每語言正確 `lang`、`prefers-reduced-motion`。鍵盤走完全站自測。
- **SEO**：每頁唯一 title/description、canonical、`sitemap.xml`、`robots.txt`、雙語 hreflang（`zh-TW`/`en`/`x-default`，head 與 sitemap 一致）。**JSON-LD `Person`**：`name / jobTitle / knowsAbout:[Python, Reinforcement Learning, Web Scraping, Data Engineering] / sameAs:[GitHub, LinkedIn]`（須與可見內容一致；LinkedIn 待補才加入 sameAs）。
- **OG / 社群預覽**：`og:*` + `twitter:summary_large_image`，**一張 1200×630 靜態圖**；不做動態產圖。
- **效能**：`<picture>` AVIF→WebP→JPEG、設 width/height、hero/LCP 不 lazy、其餘 lazy；架構圖用 Mermaid/SVG；中文字體子集化。目標 Lighthouse 95+、LCP<2.5s、INP<200ms、CLS<0.1。
- **自訂網域**（Phase 2 評估）：~US$10–15/年平價註冊商；`www` CNAME + apex A 記錄、驗證網域、Enforce HTTPS。內容紮實後再做。

---

## 7. 聯絡 / 社群
- **Email**：求職專用 email（待建立；過渡可暫用 `he00298902@gmail.com`）→ Web3Forms 收信（**免登入，但需用 email 換 access key**；免費版保留 30 天、email 通知即存檔）+ 混淆 mailto 備援。
- **GitHub repo（已決定：MVP 維持 private）**：三個 repo 暫不公開。配套：
  - 作品頁**不放 repo 連結**，改標「**程式碼可應要求提供**」。
  - GitHub profile 多為 private、對外證據較弱 → **主要證據改靠站內 case study + 原價屋 live demo**；GitHub 連結仍放頁尾，但不當頭號賣點。
  - 日後想公開時：整理 README → 設 public → repo 連結加回作品頁（低成本、可逆）。
- **連結**：導覽列/頁尾先主打 **GitHub**（leo53021313）；**LinkedIn 待補**（網址 + 上線時機未定；建議輕度整理後再 feature）；CV 之後做。
- JSON-LD `sameAs` 待 LinkedIn 網址確定後補。

---

## 8. 路線圖（Q9 = 不急；建議自訂 6–8 週軟性目標日，避免無限打磨）

**Phase 0 — MVP（上線）**
- 5 頁（首頁 / 作品列表 / 3 個作品內頁 / About / 聯絡）
- 完整雙語、淺/暗雙模式、極簡+翠青視覺
- 3 個專案（原價屋第一順位）+ 各自證據
- 基本 SEO/OG/a11y、Web3Forms 表單
- repo 維持 private（作品頁標「程式碼可應要求提供」；日後可公開）
- 部署到 `leo53021313.github.io`

**Phase 1 — 打磨**
- 補各專案量化數據 + Mermaid 架構圖 + 踩坑段
- JSON-LD Person、OG 圖、GoatCounter、Lighthouse 調校
- LinkedIn 整理後上連結、favicon/wordmark
- 用 `nextlevelbuilder/ui-ux-pro-max-skill`（`npm i -g uipro-cli`）**稽核去 AI 感**——steer 它 refine 既定的極簡+翠青，不要重生設計系統

**Phase 2 — 加值**
- 自訂網域、CV PDF
- AI 新聞網頁版 demo 上線（補 live 連結）
- 作品到 6–8 個再加標籤/排序

---

## 9. 待補資料清單（建站前/中補齊）
- [ ] 原價屋：SKU 總數 / 累積筆數（Supabase COUNT(*)）、涵蓋類別數 + 最大漲跌幅（實測）、前端圖表庫、cover 首圖
- [ ] RL：框架（PyTorch?）+ 訓練環境（Gymnasium?）確認、solve-rate eval（solved X/100、平均步數）、timeframe、lessons 實際內容
- [ ] AI 新聞：資料已確認；僅缺 repo 公開
- [x] repo 公開與否 → 決定維持 private（日後想公開再整理 README）
- [ ] 求職專用 email 建立（或定用 gmail）
- [ ] LinkedIn 網址 + 上線時機
- [ ] 中文名（目前對外只用 Leo；雙語姓名堆疊暫不放）

---

## 10. Wireframes（極簡版，無終端機）

### 10.1 首頁
```
┌────────────────────────────────────────────────────────────┐
│ Leo            作品   關於   聯絡       [繁中|EN]  [GitHub]   │  ← sticky 頂欄
├────────────────────────────────────────────────────────────┤
│                                                              │
│   Leo                                                        │  ← Hero：大標姓名(暫用 Leo)
│   Python / AI · 資料工程應用工程師                            │     角色一行
│   把 AI 與資料工程落地成實際應用                               │     價值主張
│                                                              │
│   [ 查看作品 ]   [ 聯絡我 ]                                    │     兩按鈕(翠青/ghost)
│                                                              │  ← 大量留白
├────────────────────────────────────────────────────────────┤
│   精選作品                                                    │
│   ┌──────────────────────────────────┐                      │
│   │ 原價屋價格庫            [live ↗]   │  ← 第一順位、寬卡     │
│   │ 每日更新 · 歷史價格追蹤 · 線上展示 │     (唯一有畫面)      │
│   │ 資料工程 · 爬蟲 · 視覺化           │                      │
│   └──────────────────────────────────┘                      │
│   ┌───────────────────┐  ┌───────────────────┐              │
│   │ RL 解數獨          │  │ AI 新聞摘要 進行中 │              │
│   │ 強化學習 · RL      │  │ LLM · 自動化       │              │
│   └───────────────────┘  └───────────────────┘              │
├────────────────────────────────────────────────────────────┤
│   技能 / 技術棧   Python · 爬蟲 · 資料管線 · LLM · RL         │
├────────────────────────────────────────────────────────────┤
│   關於我（摘要）  一段定位句   [ 看更多 → /about ]             │
├────────────────────────────────────────────────────────────┤
│   想聊聊？  [ 聯絡我 ]    GitHub · Email                       │
├────────────────────────────────────────────────────────────┤
│   頁尾：© Leo · 一行隱私說明 · 語言切換                        │
└────────────────────────────────────────────────────────────┘
手機：頂欄收漢堡；Hero 維持；精選卡單欄堆疊（原價屋寬卡仍在最前）。
```

### 10.2 單一作品頁
```
┌────────────────────────────────────────────────────────────┐
│ Leo            作品   關於   聯絡       [繁中|EN]  [GitHub]   │
├────────────────────────────────────────────────────────────┤
│ ← 返回作品                                                   │
│ 原價屋全站商品歷史價格庫                                       │  ← 標題
│ 每日爬全站價格，建立歷史資料庫並以網頁呈現                      │  ← 一句話
│ 資料工程 · 爬蟲 · 視覺化         狀態：完成 · 2026-04 ~ 至今    │  ← chip + 狀態
│ [ Live 網頁 ↗ ]   (程式碼可應要求提供)                       │  ← 主要證據 CTA
├────────────────────────────────────────────────────────────┤
│ [ 站截圖 / 走勢圖（首圖，LCP，不 lazy） ]                      │
├────────────────────────────────────────────────────────────┤
│ 問題   想追蹤零組件降價，但官網沒有歷史價                       │
│ 做法   排程爬蟲 → 正規化入庫 → 網頁查詢 + 走勢圖               │
├────────────────────────────────────────────────────────────┤
│ 架構（Mermaid）                                              │
│   排程爬蟲 → 解析 → 資料庫(歷史價) → API/輸出 → 網頁圖表        │
├────────────────────────────────────────────────────────────┤
│ 成果數據   每日更新 · 類別/漲跌幅/SKU 皆待補（mono）           │
├────────────────────────────────────────────────────────────┤
│ 踩坑   反爬/改版常壞 → 結構容錯 + 失敗告警                      │
├────────────────────────────────────────────────────────────┤
│ 技術棧   Python · 爬蟲 · 資料庫 · Vercel · 前端圖表           │
│ [ Live ↗ ]                                                   │
├────────────────────────────────────────────────────────────┤
│ ← 上一個專案                              下一個專案 →         │
├────────────────────────────────────────────────────────────┤
│ 頁尾                                                         │
└────────────────────────────────────────────────────────────┘
手機：CTA 全寬堆疊；chip 換行；架構圖水平捲動；數據卡片直排。
（RL 換成 TensorBoard 曲線+對照圖；AI 新聞換成 Discord 截圖，標「進行中」。）
```

---

## 11. 決策紀錄（為什麼）

| 決策 | 選擇 | 理由 / 取捨 |
|---|---|---|
| 框架 | Astro | i18n + 內容集合內建、近零 JS、AI 好上手；勝過手刻(雙語維護痛)、Jekyll(舊版/Windows 痛)、Next SPA(過度設計) |
| Repo | `leo53021313.github.io` | 根網址、無 base path（GitHub Pages 最常見坑） |
| 預設語言 | zh-TW | 主客群台灣 HR/技術主管拿到乾淨根網址 |
| MVP 雙語 | 完整雙語 | 使用者選擇；架構本就 i18n、成本主要在翻譯 |
| 視覺 | 極簡+翠青、淺色預設 | 使用者明確要「一目了然、不複雜」；拒絕終端機(非人人懂指令)與暖色工作台 |
| 暗色 | 柔和版可切換 | 純黑+亮翠青刺眼 → 降彩度、不用純黑白 |
| 標籤 | 僅展示 chip、不做過濾 | 3 個專案做過濾是過度設計，6–8 個再加 |
| 表單 | Web3Forms | 純靜態可用、免費免帳號、一行設定 |
| 分析 | GoatCounter | 免費無 cookie；GA4 改放到專案裡練，不拖累網站 |
| 自訂網域 | 之後 | 加分非必要，內容紮實後再買 |
| 去 AI 感 skill | 建站階段才裝 | 規劃階段無用、且怕它覆蓋既定方向 |
| 專案語系 | 檔案路徑(/en/)判斷、schema 不用 lang | D1=B；較乾淨，避免必填 lang 漏寫導致 build 失敗 |
| deploy-pages 版本 | 留 v5 | D2；現行且官方 Pages 指南採用，雖為 2 個月新的 .0 大版 |
| repo 公開 | MVP 維持 private；作品頁標「程式碼可應要求提供」 | 使用者選擇；日後可公開（可逆）。主要證據改靠站內 case study + live demo |
| 版本策略 | 最新穩定大版 + 釘版 + lockfile | 低維護要可重現；不追 Astro 7 alpha / Node 26 |
