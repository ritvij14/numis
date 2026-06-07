# ReDoS Audit Report — numis

**Date:** 2026-06-07T19:01:04Z  
**Scope:** `src/patterns/*.ts`, `src/regexPipeline.ts`  
**Methodology:** Static extraction + payload testing (10k–50k char strings) + structural analysis for dynamic regexes. Timeout threshold: 3000 ms.

---

## Executive Summary

| Category | Count |
|----------|-------|
| **SAFE** (no backtracking under tested payloads) | ~55 |
| **NEEDS REVIEW / ATTENTION** (structural risk or borderline times) | 7 |
| **VULNERABLE** (>3000 ms on a payload) | **0** |

**No catastrophic ReDoS vulnerabilities were found** in the current codebase under the tested payloads.  
However, **two patterns show borderline execution times (~140–277 ms)** on pathological inputs, and **two dynamic regexes have structural risk** that warrants defensive coding.

---

## Patterns Flagged for Attention

### 1. `src/regexPipeline.ts:302` — `rangeSeparatorRegex`
```typescript
const rangeSeparatorRegex = /\s*(?:-|–|—|to|through)\s*/i;
```
- **Worst-case time:** 166 ms on 10k spaces
- **Risk:** The `\s*` quantifier can backtrack on very long whitespace-only inputs. While 166 ms is below the catastrophic threshold, it is **orders of magnitude slower** than typical parsing and scales linearly with whitespace length.
- **Remediation:** Replace with a non-backtracking split or trim the input before matching. If the input is user-controlled, cap input length or pre-trim whitespace.

---

### 2. `src/patterns/ranges.ts:43` — `rangeSeparatorRegex` (duplicate)
```typescript
export const rangeSeparatorRegex: RegExp = /\s*(?:-|–|—|to|through)\s*/i;
```
- **Worst-case time:** 139 ms on 10k spaces
- **Risk:** Same structural issue as #1. Used for splitting range expressions.
- **Remediation:** Same as #1.

---

### 3. `src/patterns/ranges.ts:437` — Currency suffix detection
```typescript
const currencyCodeMatch = normalized.match(/\s+([a-z]{3})$/);
```
- **Worst-case time:** 277 ms on 10k trailing spaces
- **Risk:** `\s+` backtracks across a long whitespace suffix before the `$` anchor fails to match `[a-z]{3}`.
- **Remediation:** Pre-trim the input before matching, or use `String.prototype.trimEnd()` to strip trailing whitespace first.

---

### 4. `src/patterns/ranges.ts:447` — Currency word suffix detection
```typescript
const currencyWordMatch = normalized.match(/\s+(dollars?|euros?|pounds?|cents?)$/);
```
- **Worst-case time:** 206 ms on 10k trailing spaces
- **Risk:** Same as #3 — `\s+` backtracks on long whitespace before `$`.
- **Remediation:** Trim input before matching.

---

### 5. `src/patterns/contextualPhrases.ts:279` — **Dynamic regex** (runtime-built)
```typescript
const pattern = new RegExp(
  `\b(((?:a|an|the)\s+${amountPattern}\s*${currencyPattern}|...`,
  "gi"
);
```
- **Risk level:** MEDIUM
- **Reason:** Built from `getNameToCodeMap()` keys (~100+ currency names) plus number-word alternations. The outer `(?:\s+...)*` quantifiers combined with a massive alternation create **polynomial backtracking potential** on long inputs with repeated tokens.
- **Remediation:**
  - Replace the catch-all regex with a **tokenizer-based parser** (split by whitespace, match tokens against a `Set`/`Map`).
  - Or adopt the `re2` library (guarantees linear-time matching).
  - Add an **input length cap** (e.g., reject inputs > 1 KB for contextual-phrase matching).

---

### 6. `src/patterns/wordedNumbers.ts:416` — **Dynamic regex** (runtime-built)
```typescript
const pattern = `(?:(?:${wordsPattern})(?:[\\s-](?:and[\\s-])?(?:${wordsPattern}))*)`;
return new RegExp(`\\b(${pattern})\\b`, "gi");
```
- **Risk level:** MEDIUM
- **Reason:** ~40-word alternation inside a `(?:[\s-](?:and[\s-])?(?:words))*` repeated group. Long hyphenated / space-separated inputs (e.g., `one-two-three-...`) can trigger backtracking as the engine tries every split point.
- **Remediation:**
  - Rewrite without the inner alternation on separators: use a **two-pass approach** — first split the string on spaces/hyphens, then validate each token against the word map.
  - Or use `re2` for this pattern.

---

### 7. `src/patterns/abbreviations.ts:52` — **Dynamic regex** (runtime-built)
```typescript
const ABBREVIATION_PATTERN_REGEX = buildAbbreviationRegex();
// internally: new RegExp(`(?:(?<codeBefore>${codePattern})\s+(?<amountAfterCode>${numberPattern}))|...`, 'i')
```
- **Risk level:** LOW
- **Reason:** Large alternation of all ISO-4217 codes (~180 codes) but no nested quantifiers. Structurally safe for backtracking, but creates a **very large regex** that may slow down startup and use more memory.
- **Remediation:** Optional — cache the regex at module load time (already done). Consider replacing with a `Set` lookup for codes + a simple number matcher if startup time becomes an issue.

---

## Full Inventory — Static Regexes (Scope-Only Files)

| File | Line | Pattern | Worst Time | Worst Payload | Status |
|------|------|---------|------------|---------------|--------|
| `src/regexPipeline.ts` | 196 | `/-/g` | 0.24 ms | long-digits | SAFE |
| `src/regexPipeline.ts` | 197 | `/ and /g` | 0.11 ms | padded | SAFE |
| `src/regexPipeline.ts` | 199 | `/\s+/` | 0.01 ms | long-spaces | SAFE |
| `src/regexPipeline.ts` | 278 | `/^<\|>\s*/i` | 0.05 ms | long-a | SAFE |
| `src/regexPipeline.ts` | 302 | `/\s*(?:-\|–\|—\|to\|through)\s*/i` | **166 ms** | long-spaces | **ATTENTION** |
| `src/regexPipeline.ts` | 338 | `/\b[A-Za-z]{3}\b/g` | 0.21 ms | long-a | SAFE |
| `src/regexPipeline.ts` | 353 | `/\b[A-Za-z]{3,}\b/g` | 0.06 ms | long-a | SAFE |
| `src/regexPipeline.ts` | 395 | `/[,']/g` | 0.05 ms | long-a | SAFE |
| `src/regexPipeline.ts` | 466 | `/(?:\b\|^)(\d+(?:\.\d+)?)(?:\b\|$)/` | 0.08 ms | long-a | SAFE |
| `src/regexPipeline.ts` | 482 | `/\b((?:zero\|one\|two\|...\|billion)...` | 0.43 ms | long-a | SAFE |
| `src/patterns/abbreviations.ts` | 94 | `/,/g` | 0.01 ms | padded | SAFE |
| `src/patterns/abbreviations.ts` | 148 | `/^(\w+)/` | 0.64 ms | padded | SAFE |
| `src/patterns/contextualPhrases.ts` | 37 | `/\s+/g` | 0.06 ms | long-a | SAFE |
| `src/patterns/contextualPhrases.ts` | 53 | `/^\d+(?:\.\d+)?$/` | 0.04 ms | long-a | SAFE |
| `src/patterns/contextualPhrases.ts` | 58 | `/^\d+(?:\.\d+)?$/` | 0.03 ms | long-digits | SAFE |
| `src/patterns/contextualPhrases.ts` | 81 | `/^[a-z]{3}$/i` | 0.07 ms | long-a | SAFE |
| `src/patterns/contextualPhrases.ts` | 125 | `/^\d+$/` | 0.03 ms | long-a | SAFE |
| `src/patterns/contextualPhrases.ts` | 296 | `/^(\d+(?:\.\d+)?)\s+(hundred\|thousand\|...` | 0.11 ms | long-a | SAFE |
| `src/patterns/minorUnitsOnly.ts` | 30 | `/penny/` | 0.02 ms | repeated-word | SAFE |
| `src/patterns/minorUnitsOnly.ts` | 41 | `/\s+/g` | 0.06 ms | long-spaces | SAFE |
| `src/patterns/minorUnitsOnly.ts` | 55 | `/^\d+(?:\.\d+)?$/` | 0.03 ms | long-digits | SAFE |
| `src/patterns/minorUnitsOnly.ts` | 208 | `RegExp(\`\\b(${pattern})\\b\`, "gi")` | 0.06 ms | long-a | SAFE |
| `src/patterns/minorUnitsOnly.ts` | 243 | `/\b(?:a\|an\|the\|...\|cents)\b/i` | 3.88 ms | long-digits | SAFE |
| `src/patterns/negativeNumbers.ts` | 33 | `/^\(([^)]+)\)(.*)$/` | 0.11 ms | long-a | SAFE |
| `src/patterns/negativeNumbers.ts` | 51 | `/^(?:[-−–—]\|minus\b\|negative\b)\s*/i` | 0.07 ms | long-a | SAFE |
| `src/patterns/negativeNumbers.ts` | 73 | `/^\([^)]+\)$/` | 0.03 ms | long-a | SAFE |
| `src/patterns/negativeNumbers.ts` | 83 | `/^(?:[-−–—]\|minus\b\|negative\b)\s*/i` | 0.01 ms | padded | SAFE |
| `src/patterns/numbersWithSeparators.ts` | 26 | `/^(\d{1,3}(,\d{3})*(\.\d+)?\|\d+\.\d+\|\d+)$/` | 0.08 ms | long-a | SAFE |
| `src/patterns/numbersWithSeparators.ts` | 50 | `/,/g` | 0.02 ms | long-spaces | SAFE |
| `src/patterns/numbersWithSeparators.ts` | 80 | `/\b(\d{1,3}(?:,\d{3})+(?:\.\d+)?\|\d+\.\d+)\b/` | 0.12 ms | ambiguous-sep | SAFE |
| `src/patterns/numericWordCombos.ts` | 45 | `/\s+/g` | 0.38 ms | nested-periods | SAFE |
| `src/patterns/numericWordCombos.ts` | 74 | `/^(\d+(?:,\d{3})*(?:\.\d+)?)(bn\|[kmb])$/i` | 0.11 ms | long-a | SAFE |
| `src/patterns/numericWordCombos.ts` | 82 | `/,/g` | 0.01 ms | repeated-word | SAFE |
| `src/patterns/numericWordCombos.ts` | 109 | `RegExp(\`\\b${pattern}\\b\`, "gi")` | 0.07 ms | long-a | SAFE |
| `src/patterns/plainNumbers.ts` | 35 | `/^\d+$/` | 0.01 ms | long-digits | SAFE |
| `src/patterns/plainNumbers.ts` | 65 | `/\b(\d+)\b/` | 0.05 ms | long-a | SAFE |
| `src/patterns/ranges.ts` | 43 | `/\s*(?:-\|–\|—\|to\|through)\s*/i` | **139 ms** | long-spaces | **ATTENTION** |
| `src/patterns/ranges.ts` | 49 | `/^<\|>\s*/i` | 0.01 ms | ambiguous-sep | SAFE |
| `src/patterns/ranges.ts` | 69 | `/^</` | 0.07 ms | long-a | SAFE |
| `src/patterns/ranges.ts` | 72 | `/^>/` | 0.02 ms | long-a | SAFE |
| `src/patterns/ranges.ts` | 91 | `/^(<\|>)(\s*)(.+)/` | 0.07 ms | long-a | SAFE |
| `src/patterns/ranges.ts` | 202 | `/(\b(hundred\|thousand\|...\|k\|m\|b)\b|...)/i` | 0.54 ms | hyphen-bomb | SAFE |
| `src/patterns/ranges.ts` | 214 | `/(\b(hundred\|thousand\|...\|k\|m\|b)\b|...)/i` | 0.45 ms | hyphen-bomb | SAFE |
| `src/patterns/ranges.ts` | 318 | `/\b(\d+(?:\.\d+)?)\s*(k\|thousand\|...` | 0.29 ms | mixed-format | SAFE |
| `src/patterns/ranges.ts` | 322 | `/\b(\d+(?:\.\d+)?)\s*(k\|thousand\|...` | 0.29 ms | nested-periods | SAFE |
| `src/patterns/ranges.ts` | 328 | `/^(\d+(?:\.\d+)?)/` | 0.06 ms | long-a | SAFE |
| `src/patterns/ranges.ts` | 408 | `/^([a-z]{3})\s+/` | 0.03 ms | long-a | SAFE |
| `src/patterns/ranges.ts` | 418 | `/^([^\w\s]+)\s*/` | 0.03 ms | long-a | SAFE |
| `src/patterns/ranges.ts` | 437 | `/\s+([a-z]{3})$/` | **277 ms** | long-spaces | **ATTENTION** |
| `src/patterns/ranges.ts` | 447 | `/\s+(dollars?\|euros?\|pounds?\|cents?)$/` | **206 ms** | long-spaces | **ATTENTION** |
| `src/patterns/ranges.ts` | 753 | `/\s+/` | 0.03 ms | long-a | SAFE |
| `src/patterns/ranges.ts` | 757 | `/[^a-z]/g` | 0.88 ms | padded | SAFE |
| `src/patterns/regionalFormats.ts` | 65 | `/[.*+?^${}()\|[\]\\]/g` | 0.08 ms | long-a | SAFE |
| `src/patterns/regionalFormats.ts` | 74 | `/[a-zA-Z]/` | 0.37 ms | long-spaces | SAFE |
| `src/patterns/regionalFormats.ts` | 122 | `/\s/` | 0.04 ms | long-a | SAFE |
| `src/patterns/regionalFormats.ts` | 156 | `/,(\d+)$/` | 0.08 ms | ambiguous-sep | SAFE |
| `src/patterns/regionalFormats.ts` | 166 | `/,/g` | 0.02 ms | long-digits | SAFE |
| `src/patterns/regionalFormats.ts` | 175 | `/,/g` | 0.01 ms | dollar-trail | SAFE |
| `src/patterns/regionalFormats.ts` | 185 | `/\./g` | 0.02 ms | nested-periods | SAFE |
| `src/patterns/regionalFormats.ts` | 193 | `/\.(\d+)$/` | 0.10 ms | long-a | SAFE |
| `src/patterns/regionalFormats.ts` | 230 | `/^\d{1,2},\d{2}(?:,\d{2})*,\d{3}(?:\.\d+)?$/` | 0.04 ms | long-a | SAFE |
| `src/patterns/regionalFormats.ts` | 247 | `/[\s\u00A0]/g` | 0.03 ms | long-a | SAFE |
| `src/patterns/regionalFormats.ts` | 249 | `/[.*+?^${}()\|[\]\\]/g` | 0.01 ms | repeated-word | SAFE |
| `src/patterns/regionalFormats.ts` | 255 | `/[.*+?^${}()\|[\]\\]/g` | 0.01 ms | nested-commas | SAFE |
| `src/patterns/regionalFormats.ts` | 372 | `/^\d/` | 0.02 ms | long-a | SAFE |
| `src/patterns/regionalFormats.ts` | 378 | `/[.,'\s]{2,}/` | 0.04 ms | long-spaces | SAFE |
| `src/patterns/regionalFormats.ts` | 383 | `/\d$/` | 0.27 ms | repeated-word | SAFE |
| `src/patterns/slangTerms.ts` | 49 | `/\s+/g` | 0.02 ms | long-spaces | SAFE |
| `src/patterns/slangTerms.ts` | 68 | `/^\d+(?:\.\d+)?$/` | 0.01 ms | long-digits | SAFE |
| `src/patterns/slangTerms.ts` | 205 | `RegExp(\`\\b(${pattern})\\b\`, "gi")` | 0.02 ms | repeated-word | SAFE |
| `src/patterns/symbols.ts` | 373 | `/[.*+?^${}()\|[\]\\]/g` | 0.02 ms | mixed-format | SAFE |
| `src/patterns/symbols.ts` | 423 | `/,/g` | 0.01 ms | repeated-word | SAFE |
| `src/patterns/wordedNumbers.ts` | 125 | `/\s+/g` | 0.02 ms | long-spaces | SAFE |
| `src/patterns/wordedNumbers.ts` | 126 | `/\band\b/g` | 0.12 ms | long-a | SAFE |
| `src/patterns/wordedNumbers.ts` | 138 | `/\s+/` | 0.02 ms | ambiguous-sep | SAFE |
| `src/patterns/wordedNumbers.ts` | 386 | `RegExp(\`\\b(${pattern})\\b\`, "gi")` | 0.02 ms | repeated-word | SAFE |
| `src/patterns/wordedNumbers.ts` | 411 | `RegExp(\`\\b(${pattern})\\b\`, "gi")` | 0.02 ms | repeated-word | SAFE |
| `src/regexPipeline.ts` | 178 | `RegExp with escaped currency symbols` | N/A | N/A | SAFE (8 symbols, trivial) |
| `src/patterns/abbreviations.ts` | 52 | `RegExp(codes.join("|"))` | N/A | N/A | LOW RISK (large but flat alternation) |
| `src/patterns/regionalFormats.ts` | 104 | `RegExp with all currency symbols` | N/A | N/A | LOW RISK (large but flat alternation) |
| `src/patterns/symbols.ts` | 391 | `RegExp with all currency symbols` | N/A | N/A | LOW RISK (large but flat alternation) |
| `src/patterns/minorUnitsOnly.ts` | 208 | `RegExp with amount + minor unit tokens` | N/A | N/A | LOW RISK (small alternation) |
| `src/patterns/slangTerms.ts` | 208 | `RegExp with slang + quantity tokens` | N/A | N/A | LOW RISK (small alternation) |

---

## Remediation Recommendations

### Immediate (defensive, no code changes needed)
1. **Add input-length guards** at the public API boundary (`parseMoney`, `parseAll`). Reject or truncate inputs longer than a sensible threshold (e.g., 1 KB) before any regex is executed. This is the single most effective ReDoS defense.

### Short-term (low-risk refactors)
2. **Trim before matching** in `ranges.ts` lines 437 and 447. Replace:
   ```typescript
   normalized.match(/\s+([a-z]{3})$/)
   ```
   with:
   ```typescript
   normalized.trimEnd().match(/\s+([a-z]{3})$/)
   ```
   This eliminates the backtracking path entirely.

3. **Replace the `\s*` range separator** in `regexPipeline.ts:302` and `ranges.ts:43` with a non-backtracking equivalent. Since the separator is only used for `.split()`, you can split on a simpler literal or use `String.prototype.replace` to normalize whitespace first.

### Medium-term (structural improvements)
4. **Contextual phrases parser** (`contextualPhrases.ts:279`): Consider rewriting the regex-based matcher as a **token pipeline** — split the string on whitespace, then walk the token array looking for currency names and number words. This eliminates the large alternation entirely.

5. **Worded numbers parser** (`wordedNumbers.ts:416`): Rewrite the regex matcher to first split on spaces/hyphens, then validate each token against the `BASIC_NUMBERS` / `TENS` / `SCALES` maps. This removes the nested quantifier + alternation combo.

6. **Optional: Adopt `re2`** for all user-facing regexes. `re2` guarantees linear-time matching and is a drop-in replacement for the native `RegExp` constructor. Trade-off: it does not support all JavaScript regex features (e.g., lookbehind), but none of the current patterns use unsupported features.

---

*Report generated by automated ReDoS audit. No fixes were implemented — research only.*
