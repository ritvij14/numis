# ReDoS Audit — numis

> Single source of truth for the numis ReDoS audit.
> This document consolidates findings from the original Subtask 1–3 audit work into one living reference.
>
> **Date:** 2026-06-07 (original audit) / 2026-06-08 (consolidation)  
> **Scope:** `src/patterns/*.ts`, `src/regexPipeline.ts`  
> **Inventory:** [`docs/infra/redos-inventory.md`](./redos-inventory.md)

---

## Executive Summary

numis processes arbitrary user input through ~84 regex patterns across 13 source files. We audited every pattern for ReDoS (Regular Expression Denial of Service) vulnerability using static analysis (`safe-regex`) plus dynamic payload testing.

| Category | Count |
|----------|-------|
| **Catastrophic / FAIL** (exceeded 3000 ms on a payload) | **0** |
| **ATTENTION / NEEDS_REVIEW** (safe-regex flagged or structural concern) | **7** |
| **MEDIUM-RISK dynamic** (runtime-built regex with polynomial potential) | **2** |
| **SAFE** (no risk under tested payloads) | ~77 |

**Key defense:** A **5000-character input cap** was added at the public API boundary (`parseMoney`, `parseAll`). Pathological payloads are rejected *before* any regex runs. This is a pure boundary guard — no regex patterns were modified.

---

## Inventory

The full inventory of all 84 regex patterns lives in [`redos-inventory.md`](./redos-inventory.md). It documents:

- 19 literal patterns (`/…/flags`)
- 15 `new RegExp(…)` constructors
- 50 inline literals / sub-patterns

Summary by file:

| File | Literal | RegExp_constructor | Inline_literal | Total |
|------|---------|-------------------|----------------|-------|
| `src/regexPipeline.ts` | 4 | 1 | 4 | 9 |
| `src/patterns/contextualPhrases.ts` | 1 | 3 | 8 | 12 |
| `src/patterns/ranges.ts` | 3 | 0 | 14 | 17 |
| `src/patterns/regionalFormats.ts` | 1 | 3 | 7 | 11 |
| `src/patterns/wordedNumbers.ts` | 0 | 2 | 4 | 6 |
| Other files | 10 | 6 | 13 | 29 |
| **Grand Total** | **19** | **15** | **50** | **84** |

---

## Methodology

1. **Static extraction:** Every regex literal and `RegExp` constructor was extracted from source.
2. **safe-regex analysis:** Each static regex was evaluated with the `safe-regex` library for quantifier nesting risk.
3. **Dynamic timeout testing:** Each regex was tested against 10k–50k character pathological payloads (repeated spaces, digits, words, separators, etc.). Any execution exceeding **3000 ms** was flagged catastrophic.
4. **Dynamic regex assessment:** Runtime-built regexes (e.g. `new RegExp(keys.join("|"))`) cannot be tested statically. They were scored by structural analysis and cross-referenced against Subtask 1 dynamic results (17 payloads each, worst case 4 ms, 0 vulnerabilities).

---

## Results

### Scanner summary (safe-regex + dynamic)

| Score | Count | Meaning |
|-------|-------|---------|
| PASS | 51 | Static + dynamic clean |
| NEEDS_REVIEW | 23 | safe-regex flagged UNSAFE but dynamic passed (no timeout) |
| FAIL | 0 | Dynamic timeout exceeded |
| SKIPPED | 15 | Sub-pattern fragments or runtime-built regexes |
| **Total** | **89** | |

*Note on count differences:* The inventory counts 84 unique patterns; the scanner report counts 89 because it also tracks sub-pattern fragments and split duplicate appearances separately.

### Patterns requiring attention (7)

| # | File | Line | Pattern | Issue | Worst dynamic time |
|---|------|------|---------|-------|-------------------|
| 1 | `src/regexPipeline.ts` | 302 | `/\s*(?:-\|–\|—\|to\|through)\s*/i` | `\s*` backtracks on long whitespace | 166 ms |
| 2 | `src/patterns/ranges.ts` | 43 | `/\s*(?:-\|–\|—\|to\|through)\s*/i` | Same as #1 (duplicate) | 139 ms |
| 3 | `src/patterns/ranges.ts` | 437 | `/\s+([a-z]{3})$/` | `\s+` backtracks on long trailing whitespace | 277 ms |
| 4 | `src/patterns/ranges.ts` | 447 | `/\s+(dollars?\|euros?\|pounds?\|cents?)$/` | Same as #3 | 206 ms |
| 5 | `src/patterns/contextualPhrases.ts` | 279 | **Dynamic mega-regex** | Large alternation + quantified groups = polynomial potential | N/A (runtime-built) |
| 6 | `src/patterns/wordedNumbers.ts` | 416 | **Dynamic worded-number regex** | 40-word alternation inside repeated group | N/A (runtime-built) |
| 7 | `src/patterns/abbreviations.ts` | 52 | **Dynamic ISO-code regex** | Very large alternation (~180 codes); no nested quantifiers | N/A (runtime-built) |

**None of these exceeded the 3000 ms catastrophic threshold.** They are flagged because structural analysis shows backtracking potential, and the two dynamic patterns (#5–6) are the highest-risk constructs in the codebase.

---

## Remediation Status

### Already shipped

- **5000-character input cap** — Added to `RegexPipeline.run()` and `parseAll()`. Any input > 5000 chars throws `MoneyParseError` immediately. This single guard eliminates the entire class of length-based ReDoS attacks.

### Remaining (blocked kanban tasks)

| Task | Description | Status |
|------|-------------|--------|
| Subtask 1 — Inventory | All 84 patterns inventoried. | **Done** |
| Subtask 2 — Scanner | `safe-regex` + dynamic scanner wired. | **Done** |
| Subtask 3 — Tests | ReDoS payload test suite (45 tests, all pass). | **Done** |
| Low-risk refactors | Trim whitespace before `ranges.ts:437/447`; replace `\s*` separators with non-backtracking splits. | **Open** — blocked by CEO approval |
| Medium-risk refactors | Tokenizer-based rewrite for `contextualPhrases.ts:279` and `wordedNumbers.ts:416`. | **Open** — blocked by CEO approval |

> **Decision:** No regex rewrites have been merged into `src/` yet. The 5K cap is the only defensive code change. Further refactors require a dedicated `src/` change card with CEO approval.

---

## How to run the scanner

```bash
# Requires safe-regex to be installed (already in devDependencies)
npm run redos-scan
```

This executes `scripts/redos-scanner.cjs`, which reads `docs/infra/redos-inventory.md` and produces a fresh `docs/infra/redos-scanner-report.md`.

---

## Historical artifacts

- Original root-level reports (`REDOS_AUDIT_REPORT.md`, `REDOS_SCANNER_REPORT.md`, `REDOS_INVENTORY.md`) were consolidated into this doc and the files above. They were archived (removed) in favor of this single living reference.
- The old `redos_audit.cjs` (root-level extraction script) was superseded by `scripts/redos-scanner.cjs` which reads the inventory directly.

---

*Last updated: 2026-06-08 by kanban worker `default` (task t_6ad6cb5f).*
