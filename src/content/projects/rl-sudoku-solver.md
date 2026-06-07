---
title: 用強化學習訓練 AI 解數獨
oneLiner: 不靠回溯法，讓 agent 從零學會解數獨的填格策略
role: 個人專案・獨立開發
status: done
timeframe: 待補
tech: [Python, TensorBoard]
evidence: TensorBoard 訓練曲線截圖 + 輸入/解出盤面對照圖
metrics:
  - 訓練收斂曲線（TensorBoard：reward / loss vs episodes）
  # 待補：解題成功率（solved X/100）、平均步數、框架(PyTorch?)、訓練環境(Gymnasium?)
tags: [強化學習, RL]
featured: false
order: 2
---
## 問題
數獨通常用回溯/約束傳播暴力解；我想驗證 RL 能否學到「策略」而非窮舉。

## 做法
將盤面建為環境（state=9×9，action=填格），用獎勵設計鼓勵合法填入並訓練 agent。

## 架構
環境(盤面) → 策略網路 → Reward → 訓練迴圈 → 評估（TensorBoard 紀錄）

## 踩坑
（待補實際內容）
