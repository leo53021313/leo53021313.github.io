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
