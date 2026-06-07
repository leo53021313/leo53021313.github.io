---
title: 原價屋價格追蹤
oneLiner: 每日追蹤 PC 零件價格變動，提供歷史走勢與多平台降價通知
role: 個人專案・資料工程 + 前端
status: done
timeframe: 2026-04-24 ~ 至今
tech: [Python, BeautifulSoup, Next.js, TypeScript, Supabase (PostgreSQL), Recharts, Vercel]
demoUrl: https://coolpc-tracker.vercel.app/
evidence: 商品詳細頁的歷史價格走勢圖（含史上最低／均價統計）；分類頁顯示卡 VGA 共 354 個規格的可排序清單
metrics:
  - 每日 4 次自動更新（GitHub Actions）
  - 追蹤 2,281 件商品變體（SKU）
  - 累積 2,749 筆價格歷史
  - 涵蓋 8 大零件分類
  - 三平台降價通知（Discord／Telegram／LINE）
tags: [資料工程, 爬蟲, 資料視覺化, 自動化]
featured: true
order: 0
cover: ../../assets/coolpc-price-tracker-cover.png
coverAlt: 原價屋價格追蹤首頁：暗色帳本式表格列出最大降幅商品，含品名、跌幅與現價／原價
---
## 問題
原價屋的 PC 零件報價每天變動數次，但官網不留歷史價格。想抓降價時機的玩家只能手動切視窗、抄價、自己記，費時又容易錯過低點。

## 做法
排程爬蟲（requests + BeautifulSoup）每日 4 次抓全站報價，清洗髒名稱後正規化寫入 Supabase，價格只在變動時才追加歷史。Next.js 前端唯讀渲染走勢圖與模糊搜尋，Vercel Cron 每日派送三平台降價通知。

## 架構
GitHub Actions 排程爬蟲 → 解析清洗 → Supabase（歷史價）→ Next.js 網頁／走勢圖 → 多平台通知

## 踩坑
替首頁三個 RPC 加上新參數後，前端突然回傳 0 筆，但 Supabase SQL Editor 直接執行卻正常——沒錯誤、沒 stack trace。根因是 PostgREST 依快取的 function signature 處理 POST body，schema 改了快取沒重載，新參數被當未知欄位丟掉。改用 `{ get: true }` 走 GET、把參數放 URL query string 繞過快取後解決。學到：抽象層運作得太「乾淨」時，故障要有意識地逐層剝開找邊界。
