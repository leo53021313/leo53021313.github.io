---
title: AI News 每日精選
oneLiner: 每日把 AI 新聞自動摘成中文，推送 Discord 並建成公開存檔網站
role: 個人專案・LLM 應用 + 自動化 + 前端
status: done
timeframe: 2026-05-24 ~ 至今
tech: [Python, Google Gemini API, Astro, Cloudflare Pages, GitHub Actions, Playwright, trafilatura, httpx, Discord Webhook]
demoUrl: https://ai-news-c3i.pages.dev/
evidence: 文章永久連結頁，顯示 Gemini 中文摘要、評分與原文出處連結
metrics:
  - 89 個來源
  - 已存檔 30 篇文章
  - 每日 1 次推送 × 10 則
  - $0/月免費方案運行
  - 排程：GitHub Actions（每日定時）
tags: [LLM, 自動化, 爬蟲, 資料管線]
featured: true
order: 1
cover: ../../assets/ai-news-digest-cover.png
coverAlt: 「AI News 每日精選」首頁今日精選列表，當日 10 則精選含編號、分類、來源與中文理由
---
## 問題
AI 新聞與教學每天爆量，89 個來源逐一追讀並不實際，且多半是商業募資與行銷 PR 雜訊。我要的是每天只留下真正值得讀的實作技巧與開發工具更新，而不是再多開一個會被忽略的收件匣。

## 做法
多來源爬取（RSS／Sitemap／HTML／Hacker News）後去重，交給 Gemini Flash-Lite 依評分規則、詞庫與反垃圾規則打分選文，再用 Flash 逐篇摘成中文。每日定時（GitHub Actions）推送 Discord，同時把每篇寫成 Markdown、由 Astro 建成含搜尋與 RSS 的公開靜態站，部署到 Cloudflare Pages。選 Gemini 免費額度與全免費基礎設施，是為了把營運成本壓到 $0／月。

## 架構
多來源爬蟲 → 去重 → Gemini 打分／摘要 → Discord 推送 → Astro 靜態站（Cloudflare Pages）

## 踩坑
早期 filter 解析失敗時會靜默 return [] 並把候選全標為已讀；某次冷啟動 789 篇候選撐爆 token 預算、JSON 輸出被截斷，整天 digest 無聲消失且毫無告警。修法是把候選上限固定在 500、截斷時改丟 FilterResponseError，讓主程式發告警並以非零退出。學到：批次任務的解析失敗一定要「大聲失敗」，靜默吞錯比直接 crash 更危險。
