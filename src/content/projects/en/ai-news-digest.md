---
title: AI News Daily Picks
oneLiner: Summarises AI news into Chinese daily, pushes to Discord, and publishes a public archive site
role: Solo project · LLM application + automation + front end
status: done
timeframe: 2026-05-24 ~ now
tech: [Python, Google Gemini API, Astro, Cloudflare Pages, GitHub Actions, Playwright, trafilatura, httpx, Discord Webhook]
demoUrl: https://ai-news-c3i.pages.dev/
evidence: An article permalink page showing the Gemini Chinese summary, score, and a link to the original source
metrics:
  - 89 sources
  - 30 articles archived
  - 1 push/day × 10 items
  - Runs at $0/month on free tiers
  - "Schedule: GitHub Actions (daily)"
tags: [LLM, Automation, Scraping, Data Pipeline]
featured: true
order: 1
cover: ../../../assets/ai-news-digest-cover.png
coverAlt: "AI News Daily Picks homepage: today's curated list of 10 picks, each with a number, category, source, and a Chinese rationale"
---
## Problem
AI news and tutorials pile up faster than anyone can read — keeping up with 89 sources by hand isn't realistic, and most of it is fundraising and marketing PR noise. I wanted a daily cut of only the implementation tips and dev-tool updates actually worth reading, not yet another inbox to ignore.

## Approach
A crawler pulls multiple source types (RSS / Sitemap / HTML / Hacker News) and dedupes them, then Gemini Flash-Lite scores and selects articles against scoring rules, a keyword lexicon, and anti-spam filters, and Flash summarises each one into Chinese. A daily GitHub Actions job pushes the digest to Discord, writes every pick as Markdown, and Astro builds a public static site (with search and RSS) deployed to Cloudflare Pages. Gemini's free tier and an all-free stack keep the running cost at $0/month.

## Architecture
Multi-source crawler → dedupe → Gemini scoring / summary → Discord push → Astro static site (Cloudflare Pages)

## Lessons
Early on, when the filter failed to parse a response it silently returned [] and marked every candidate as read. One cold start with 789 candidates blew past the token budget, the JSON output was truncated, and an entire day's digest vanished without a single alert. The fix: cap candidates at 500, and on truncation raise a FilterResponseError so the main program alerts and exits non-zero. The lesson: a parsing failure in a batch job must fail loud — silently swallowing the error is more dangerous than crashing outright.
