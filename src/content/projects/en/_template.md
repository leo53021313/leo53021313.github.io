---
# Copy to en/<slug>.md with the SAME <slug> as the zh-TW file.
# Underscore-prefixed files are excluded from the collection, so this template never ships.
title: Project title
oneLiner: One-line description (shown under the title)
role: Solo project · your role        # recruiter signal, shown on the meta line
status: wip                           # done | wip
timeframe: 2026-01 ~ now
tech: [Python, ...]                   # stack, rendered in the "Stack" section
tags: [Tag A, Tag B]                  # display-only kicker chips (under the title)
metrics:                              # quantified results, may be empty
  - Metric one
featured: false
order: 9                              # list order, lower = earlier
# Optional — uncomment as needed:
# demoUrl: https://...                # only a real live URL
# repoUrl: https://...               # add once public; set → Repo link, unset → "Source available on request"
# cover: ../../../assets/<slug>-cover.png   # LCP hero, lives in src/assets/, auto AVIF/WebP
# coverAlt: what the screenshot shows  # required when cover is set (a11y)
# evidence: proof when there's no live demo (screenshot/GIF)
---
## Problem
What problem are you solving?

## Approach
How you did it, and why these tools.

## Architecture
Data/flow (swap in a Mermaid diagram later).

## Lessons
Honest engineering reflection — the most persuasive section for a tech lead. Never ship "to be filled in".
