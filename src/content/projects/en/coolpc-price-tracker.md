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
I wanted to track when PC components drop in price, but the retailer's site keeps no price history.

## Approach
A scheduled crawler (requests + BeautifulSoup) pulls the full catalogue, normalises it into Supabase (PostgreSQL), and a Vercel-hosted web view serves queries and trend charts.

## Architecture
Scheduled crawler → parse → Supabase (price history) → API/output → web charts

## Lessons
(to be filled in)
