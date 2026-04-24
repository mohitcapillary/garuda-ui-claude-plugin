---
description: Run Jest with coverage against tests written by /write-tests and gate against thresholds from skills/config.md. On below-threshold, writes a gaps list so /write-tests can be re-invoked to fill the holes.
argument-hint: "<feature-slug>"
allowed-tools: Read, Write, Bash, Agent, AskUserQuestion
---

Run the **test-evaluator** agent to execute Jest with coverage for a feature's tests and gate against thresholds.

## Instructions

1. Read and follow `.claude/agents/test-evaluator.md`.
2. If `<feature-slug>` is not provided, ask the user for it.
3. Verify `claudeOutput/tests/<feature>/test-write-log.jsonl` exists (run `/write-tests` first). If not, halt and instruct the user.
4. Execute the 6 steps (identify targets → run Jest → categorize failures → compare coverage → write gaps → write report).
5. Do NOT auto-fix anything. Do NOT re-run Jest. Report only.

## Examples

```bash
/test-eval benefits-listing
```

## Gate semantics

| Outcome | Coverage | Failures | Next action |
|---|---|---|---|
| **PASS** | All targets met | Zero | Pipeline continues |
| **PARTIAL** | Below target but ≥ `coverage_partial_threshold` (70) | Few | Writes `gaps.json`; suggests `/write-tests <feature> --gaps <path>` — user decides to loop |
| **FAIL** | Below `coverage_partial_threshold` | Many | Halts via `AskUserQuestion` — test suite needs human review |

Loop cap: at most ONE automatic loop-back suggestion. If `loop_count >= 1` and coverage still partial/failing, the agent halts and asks the user rather than recommending a third attempt.

## Thresholds (from `skills/config.md`)

| Metric | Default | Key |
|---|---|---|
| Line coverage | 85 | `coverage_line_target` |
| Branch coverage in reducers | 100 | `coverage_branch_reducer_target` |
| Saga worker coverage | 100 | `coverage_worker_saga_target` |
| Component coverage | 80 | `coverage_component_target` |
| Partial-vs-fail split | 70 | `coverage_partial_threshold` |

Change the numbers in `skills/config.md` — do not edit this command.

## Prerequisites

- `/write-tests <feature>` has run and produced `claudeOutput/tests/<feature>/test-write-log.jsonl`
- Jest + coverage tooling installed in target garuda-ui
- Node 12 available via `nvm`

## Outputs

| Artifact | Location |
|---|---|
| Report | `claudeOutput/tests/<feature>/test-report.json` |
| Gaps (on PARTIAL/FAIL, first loop only) | `claudeOutput/tests/<feature>/gaps.json` |

## When NOT to use

- Before `/write-tests` has run (there are no tests to evaluate)
- As the primary way to discover what tests to write — use `/write-tests` for that; `/test-eval` is only a gate
