---
title: Daily AI-News Auto-Summary to Discord
oneLiner: Crawls AI news & tutorials daily, auto-summarises, and pushes to Discord (web version in progress)
role: Solo project · LLM application + automation
status: wip
timeframe: 2026-05 ~ now
tech: [Python, Google Gemini API, GitHub Actions, Discord Webhook]
evidence: Screenshot of a real Discord summary message (+ optional short GIF)
metrics:
  - 58 sources
  - 1 push/day × 10 items
  - "Schedule: GitHub Actions (daily)"
lessons: GitHub Actions schedule is occasionally delayed → plan retries / alerting / schedule tuning
tags: [LLM, Automation, Data Pipeline]
featured: false
order: 2
---
## Problem
The volume of AI information is overwhelming; I wanted to automatically filter down to what's worth reading each day.

## Approach
Crawl multiple sources → dedupe → summarise/classify with Google Gemini → push to Discord on a daily schedule (GitHub Actions); a web version is the next step.

## Architecture
Multi-source crawler → dedupe → Gemini summary → Discord push (future: → web)

## Lessons
GitHub Actions schedule is occasionally delayed → plan to add retries / alerting / schedule tuning.
