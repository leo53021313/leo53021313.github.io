---
title: Reinforcement-Learning Sudoku Solver
oneLiner: No backtracking — an agent that learns a cell-filling strategy from scratch
role: Solo project · Independent build
status: done
timeframe: TBD
tech: [Python, TensorBoard]
evidence: TensorBoard training-curve screenshots + an input→solved board comparison
metrics:
  - "Training convergence curves (TensorBoard: reward / loss vs episodes)"
tags: [Reinforcement Learning, RL]
featured: true
order: 1
---
## Problem
Sudoku is usually brute-forced with backtracking / constraint propagation; I wanted to test whether RL can learn a strategy rather than exhaustively search.

## Approach
Model the board as an environment (state = 9×9, action = fill a cell), with a reward design that encourages legal placements, and train an agent.

## Architecture
Environment (board) → policy network → reward → training loop → evaluation (logged in TensorBoard)

## Lessons
(to be filled in)
