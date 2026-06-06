---
title: 原價屋全站商品歷史價格庫
oneLiner: 每日爬全站商品價格，建立歷史價格資料庫並以網頁呈現
role: 個人專案・資料工程 + 前端
status: done
timeframe: 2026-04-24 ~ 至今
tech: [Python, requests, BeautifulSoup, Supabase (PostgreSQL), Vercel]
demoUrl: https://coolpc-tracker.vercel.app/
metrics:
  - 每日自動更新（排程爬蟲）
  - 追蹤 2,259 件商品（SKU）
  # 待補：SKU 總數 / 累積筆數（Supabase COUNT(*)）、涵蓋類別數、最大漲跌幅
tags: [資料工程, 爬蟲, 資料視覺化]
featured: true
order: 0
cover: ../../assets/coolpc-cover.png
coverAlt: 原價屋價格追蹤站截圖：商品歷史價格走勢圖
---
## 問題
想追蹤 PC 零組件的降價時機，但官網沒有歷史價格。

## 做法
排程爬蟲（requests + BeautifulSoup）抓全站 → 正規化寫入 Supabase（PostgreSQL）→ Vercel 上的網頁查詢與走勢圖。

## 架構
（建站時用 Mermaid）排程爬蟲 → 解析 → Supabase（歷史價）→ API/輸出 → 網頁圖表

## 踩坑
（待補實際內容）
