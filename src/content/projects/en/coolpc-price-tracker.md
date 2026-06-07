---
title: Coolpc Price Tracker
oneLiner: Tracks daily PC-component price changes with historical trends and multi-platform drop alerts
role: Solo project · Data engineering + front end
status: done
timeframe: 2026-04-24 ~ now
tech: [Python, BeautifulSoup, Next.js, TypeScript, Supabase (PostgreSQL), Recharts, Vercel]
demoUrl: https://coolpc-tracker.vercel.app/
evidence: A product detail page's historical price-trend chart (with all-time-low / average stats), and the GPU (VGA) category page listing all 354 sortable variants
metrics:
  - Auto-updates 4×/day (GitHub Actions)
  - Tracking 2,281 product variants (SKUs)
  - 2,749 price-history records accumulated
  - Covers 8 major component categories
  - Three-platform drop alerts (Discord / Telegram / LINE)
tags: [Data Engineering, Scraping, Data Viz, Automation]
featured: true
order: 0
cover: ../../../assets/coolpc-price-tracker-cover.png
coverAlt: "Coolpc Price Tracker homepage: a dark ledger-style table listing the biggest price drops with product name, drop %, and current/original price"
---
## Problem
Coolpc's PC-component prices change several times a day, but the site keeps no history. Shoppers hunting for a dip have to flip between windows, copy prices down, and track them by hand — tedious, and easy to miss the low.

## Approach
A scheduled crawler (requests + BeautifulSoup) pulls the full catalogue 4× a day, cleans the messy product names, and writes normalised rows into Supabase — appending to price history only when a price actually changes. A Next.js front end renders trend charts and fuzzy search read-only, and a Vercel Cron job sends daily drop alerts to three platforms.

## Architecture
GitHub Actions scheduled crawler → parse & clean → Supabase (price history) → Next.js web / trend charts → multi-platform alerts

## Lessons
After adding new parameters to the homepage's three RPCs, the front end suddenly returned 0 rows — yet running the same query directly in the Supabase SQL Editor worked fine, with no error and no stack trace. The root cause: PostgREST resolves a POST body against a cached function signature, and after the schema changed the cache wasn't reloaded, so the new parameters were dropped as unknown columns. Switching to `{ get: true }` — a GET with the parameters in the URL query string — bypassed the cache and fixed it. The lesson: when an abstraction runs too "cleanly," debugging means deliberately peeling back one layer at a time to find the boundary where things break.
