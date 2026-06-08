# ReDoS Scanner Report — numis

**Date:** 2026-06-08T09:16:09.808Z
**Scanner:** safe-regex (static) + dynamic timeout (3000ms)
**Inventory:** /home/ritvij14/numis/docs/infra/redos-inventory.md

## Summary

| Category | Count |
|----------|-------|
| PASS | 51 |
| NEEDS_REVIEW | 23 |
| FAIL | 0 |
| SKIPPED | 15 |
| **Total** | **89** |

---

## NEEDS_REVIEW — safe-regex Flagged (Dynamic Passed)

### src/regexPipeline.ts:178
```typescript
new RegExp(`[${Object.keys(SYMBOL_TO_CODE).map(s => `\\${s}`).join("")}]`)
```
- **safe-regex:** PARSE_ERROR: Invalid regular expression: /[${Object.keys(SYMBOL_TO_CODE).map(s => `\\${s}/: Unterminated character class

### src/regexPipeline.ts:466
```typescript
/(?:\b|^)(\d+(?:\.\d+)?)(?:\b|$)/
```
- **safe-regex:** UNSAFE
- **Dynamic worst time:** 0.10ms
- **Worst payload:** long-a

### src/patterns/abbreviations.ts:45
```typescript
new RegExp(`(?:(?<codeBefore>${codePattern})\\s+(?<amountAfterCode>${numberPattern}))
```
- **safe-regex:** SKIPPED_DYNAMIC
- **Note:** Dynamically constructed — prior audit (subtask 1) tested with 17 payloads, worst case 4ms, 0 vulnerabilities found.

### src/patterns/contextualPhrases.ts:53
```typescript
/^\d+(?:\.\d+)?$/
```
- **safe-regex:** UNSAFE
- **Dynamic worst time:** 0.04ms
- **Worst payload:** long-a

### src/patterns/contextualPhrases.ts:58
```typescript
/^\d+(?:\.\d+)?$/
```
- **safe-regex:** UNSAFE
- **Dynamic worst time:** 0.01ms
- **Worst payload:** ambiguous-sep

### src/patterns/contextualPhrases.ts:243
```typescript
new RegExp(`(?:${keys.join("
```
- **safe-regex:** SKIPPED_DYNAMIC
- **Note:** Dynamically constructed — prior audit (subtask 1) tested with 17 payloads, worst case 4ms, 0 vulnerabilities found.

### src/patterns/contextualPhrases.ts:247
```typescript
new RegExp(`(?:${keys.join("
```
- **safe-regex:** SKIPPED_DYNAMIC
- **Note:** Dynamically constructed — prior audit (subtask 1) tested with 17 payloads, worst case 4ms, 0 vulnerabilities found.

### src/patterns/contextualPhrases.ts:279
```typescript
new RegExp(`\\b(((?:a
```
- **safe-regex:** SKIPPED_DYNAMIC
- **Note:** Dynamically constructed — prior audit (subtask 1) tested with 17 payloads, worst case 4ms, 0 vulnerabilities found.

### src/patterns/contextualPhrases.ts:296
```typescript
/^(\d+(?:\.\d+)?)\s+(hundred|thousand|million|billion|trillion)(?:\s+\w+)*/i
```
- **safe-regex:** UNSAFE
- **Dynamic worst time:** 0.11ms
- **Worst payload:** long-a

### src/patterns/minorUnitsOnly.ts:55
```typescript
/^\d+(?:\.\d+)?$/
```
- **safe-regex:** UNSAFE
- **Dynamic worst time:** 0.01ms
- **Worst payload:** long-digits

### src/patterns/minorUnitsOnly.ts:243
```typescript
/\b(?:a|an|the|\d+(?:\.\d+)?|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|million|billion)\s+(?:dollar|dollars|euro|euros|pound|pounds|yen|yuan|peso|pesos|rupee|rupees|franc|francs|krona|kronor|shekel|shekels|dinar|dinars|dirham|dirhams|[A-Z]{3})\s+(?:and\s+)?(?:\d+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)\s+(?:cent|cents|penny|pennies|pence)\b/i
```
- **safe-regex:** UNSAFE
- **Dynamic worst time:** 0.76ms
- **Worst payload:** padded

### src/patterns/numericWordCombos.ts:74
```typescript
/^(\d+(?:,\d{3})*(?:\.\d+)?)(bn|[kmb])$/i
```
- **safe-regex:** UNSAFE
- **Dynamic worst time:** 0.07ms
- **Worst payload:** long-a

### src/patterns/numbersWithSeparators.ts:26
```typescript
/^(\d{1,3}(,\d{3})*(\.\d+)?|\d+\.\d+|\d+)$/
```
- **safe-regex:** UNSAFE
- **Dynamic worst time:** 0.07ms
- **Worst payload:** long-a

### src/patterns/numbersWithSeparators.ts:80
```typescript
/\b(\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d+\.\d+)\b/
```
- **safe-regex:** UNSAFE
- **Dynamic worst time:** 0.09ms
- **Worst payload:** ambiguous-sep

### src/patterns/ranges.ts:230
```typescript
/^\d{1,2},\d{2}(?:,\d{2})*,\d{3}(?:\.\d+)?$/
```
- **safe-regex:** UNSAFE
- **Dynamic worst time:** 0.07ms
- **Worst payload:** long-a

### src/patterns/ranges.ts:318
```typescript
/\b(\d+(?:\.\d+)?)\s*(k|thousand|m|mn|million|b|bn|billion)\b/i
```
- **safe-regex:** UNSAFE
- **Dynamic worst time:** 0.37ms
- **Worst payload:** dollar-trail

### src/patterns/ranges.ts:328
```typescript
/^(\d+(?:\.\d+)?)/
```
- **safe-regex:** UNSAFE
- **Dynamic worst time:** 0.05ms
- **Worst payload:** long-a

### src/patterns/regionalFormats.ts:97
```typescript
new RegExp(`(?:(?<symbolBefore>${symbolPattern})\\s*(?<amountAfterSymbol>${numberPattern}))
```
- **safe-regex:** SKIPPED_DYNAMIC
- **Note:** Dynamically constructed — prior audit (subtask 1) tested with 17 payloads, worst case 4ms, 0 vulnerabilities found.

### src/patterns/regionalFormats.ts:230
```typescript
/^\d{1,2},\d{2}(?:,\d{2})*,\d{3}(?:\.\d+)?$/
```
- **safe-regex:** UNSAFE
- **Dynamic worst time:** 0.01ms
- **Worst payload:** repeated-word

### src/patterns/regionalFormats.ts:250
```typescript
new RegExp(escapedThousands, 'g')
```
- **safe-regex:** SKIPPED_DYNAMIC
- **Note:** Dynamically constructed — prior audit (subtask 1) tested with 17 payloads, worst case 4ms, 0 vulnerabilities found.

### src/patterns/regionalFormats.ts:256
```typescript
new RegExp(escapedDecimal, 'g')
```
- **safe-regex:** SKIPPED_DYNAMIC
- **Note:** Dynamically constructed — prior audit (subtask 1) tested with 17 payloads, worst case 4ms, 0 vulnerabilities found.

### src/patterns/slangTerms.ts:68
```typescript
/^\d+(?:\.\d+)?$/
```
- **safe-regex:** UNSAFE
- **Dynamic worst time:** 0.01ms
- **Worst payload:** long-digits

### src/patterns/symbols.ts:384
```typescript
new RegExp(`(?:(?<symbolBefore>${symbolPattern})\\s*(?<amountAfterSymbol>${numberPattern}))
```
- **safe-regex:** SKIPPED_DYNAMIC
- **Note:** Dynamically constructed — prior audit (subtask 1) tested with 17 payloads, worst case 4ms, 0 vulnerabilities found.

## SKIPPED — Fragment / Sub-Pattern (Not Independently Testable)

### src/patterns/abbreviations.ts:41
```typescript
'\\d{1,3}(?:,\\d{3})+(?:\\.\\d+)?|\\d+(?:\\.\\d+)?'
```
- **Note:** Fragment embedded inside a larger regex — not independently testable.

### src/patterns/contextualPhrases.ts:260
```typescript
[\s-]+(?:and\s+)?
```
- **Note:** Fragment embedded inside a larger regex — not independently testable.

### src/patterns/contextualPhrases.ts:263
```typescript
\\d+(?:\\.\\d+)?\\s+(?:hundred|thousand|million|billion|trillion)(?:\\s+(?:${numberWords}))*
```
- **Note:** Fragment embedded inside a larger regex — not independently testable.

### src/patterns/contextualPhrases.ts:266
```typescript
(?:(?:${numberWords})\\s+)?(?:${fractionWords})(?:\\s+(?:of\\s+)?(?:a\\s+)?(?:hundred|thousand|million|billion|trillion))?
```
- **Note:** Fragment embedded inside a larger regex — not independently testable.

### src/patterns/contextualPhrases.ts:274
```typescript
\\d+(?:\\.\\d+)?
```
- **Note:** Fragment embedded inside a larger regex — not independently testable.

### src/patterns/contextualPhrases.ts:277
```typescript
\\d+(?:\\.\\d+)?\\s+(?:hundred|thousand|million|billion|trillion)
```
- **Note:** Fragment embedded inside a larger regex — not independently testable.

### src/patterns/minorUnitsOnly.ts:206
```typescript
[\s-]+
```
- **Note:** Fragment embedded inside a larger regex — not independently testable.

### src/patterns/numericWordCombos.ts:108
```typescript
\\d+(?:,\\d{3})*(?:\\.\\d+)?(?:bn|[kmb])
```
- **Note:** Fragment embedded inside a larger regex — not independently testable.

### src/patterns/ranges.ts:173
```typescript
rangeSeparatorRegex.test(...)
```
- **Note:** Fragment embedded inside a larger regex — not independently testable.

### src/patterns/regionalFormats.ts:89
```typescript
\d{1,3}(?:[.,\'\s]\d{2,3})+(?:[.,]\d{1,2})?
```
- **Note:** Fragment embedded inside a larger regex — not independently testable.

### src/patterns/regionalFormats.ts:91
```typescript
\d+[.,]\d+
```
- **Note:** Fragment embedded inside a larger regex — not independently testable.

### src/patterns/slangTerms.ts:204
```typescript
(?:(?:${quantityTokens})\\s+){0,6}(?:${slangTokens})(?:\\s+(?:${centsTokens}))?
```
- **Note:** Fragment embedded inside a larger regex — not independently testable.

### src/patterns/symbols.ts:380
```typescript
\\d{1,3}(?:,\\d{3})+(?:\\.\\d+)?|\\d+(?:\\.\\d+)?
```
- **Note:** Fragment embedded inside a larger regex — not independently testable.

### src/patterns/wordedNumbers.ts:384
```typescript
(?:a\\s+)?(?:(?:${multiplierWords})(?:[\\s-])+)?(?:${fractionWords})(?:\\s+(?:of\\s+)?(?:a\\s+)?(?:${scaleWords}))?
```
- **Note:** Fragment embedded inside a larger regex — not independently testable.

### src/patterns/wordedNumbers.ts:410
```typescript
(?:(?:${wordsPattern})(?:[\\s-](?:and[\\s-])?(?:${wordsPattern}))*)
```
- **Note:** Fragment embedded inside a larger regex — not independently testable.

## PASS — No ReDoS Risk Detected

| # | File | Line | Type | safe-regex | Dynamic worst | Payload |
|---|------|------|------|------------|---------------|---------|
| 2 | src/regexPipeline.ts | 196 | inline_literal | SAFE | 0.07ms | long-a |
| 3 | src/regexPipeline.ts | 278 | literal | SAFE | 0.06ms | long-a |
| 4 | src/regexPipeline.ts | 302 | literal | SAFE | 120.75ms | long-spaces |
| 5 | src/regexPipeline.ts | 338 | inline_literal | SAFE | 0.08ms | long-a |
| 6 | src/regexPipeline.ts | 353 | inline_literal | SAFE | 0.07ms | long-a |
| 7 | src/regexPipeline.ts | 395 | inline_literal | SAFE | 0.06ms | long-a |
| 9 | src/regexPipeline.ts | 481 | literal | SAFE | 0.42ms | long-a |
| 12 | src/patterns/abbreviations.ts | 94 | inline_literal | SAFE | 0.01ms | long-a |
| 13 | src/patterns/contextualPhrases.ts | 36 | inline_literal | SAFE | 0.06ms | long-a |
| 16 | src/patterns/contextualPhrases.ts | 81 | inline_literal | SAFE | 2.50ms | long-a |
| 17 | src/patterns/contextualPhrases.ts | 125 | inline_literal | SAFE | 0.86ms | long-a |
| 27 | src/patterns/minorUnitsOnly.ts | 40 | inline_literal | SAFE | 0.02ms | long-a |
| 29 | src/patterns/minorUnitsOnly.ts | 169 | RegExp_constructor | SAFE | 0.06ms | long-a |
| 32 | src/patterns/negativeNumbers.ts | 33 | literal | SAFE | 0.06ms | long-a |
| 33 | src/patterns/negativeNumbers.ts | 51 | literal | SAFE | 0.06ms | long-a |
| 34 | src/patterns/negativeNumbers.ts | 73 | literal | SAFE | 0.03ms | long-a |
| 35 | src/patterns/negativeNumbers.ts | 83 | literal | SAFE | 0.02ms | symbol-bomb |
| 36 | src/patterns/numericWordCombos.ts | 44 | inline_literal | SAFE | 0.67ms | long-digits |
| 39 | src/patterns/numericWordCombos.ts | 109 | RegExp_constructor | SAFE | 0.05ms | long-a |
| 42 | src/patterns/plainNumbers.ts | 35 | literal | SAFE | 0.01ms | long-digits |
| 43 | src/patterns/plainNumbers.ts | 65 | literal | SAFE | 0.05ms | long-a |
| 44 | src/patterns/ranges.ts | 43 | literal | SAFE | 171.75ms | long-spaces |
| 45 | src/patterns/ranges.ts | 49 | literal | SAFE | 0.02ms | long-a |
| 46 | src/patterns/ranges.ts | 69 | inline_literal | SAFE | 0.05ms | long-a |
| 47 | src/patterns/ranges.ts | 72 | inline_literal | SAFE | 0.04ms | long-a |
| 48 | src/patterns/ranges.ts | 91 | inline_literal | SAFE | 0.08ms | long-a |
| 50 | src/patterns/ranges.ts | 202 | inline_literal | SAFE | 0.34ms | hyphen-bomb |
| 54 | src/patterns/ranges.ts | 379 | inline_literal | SAFE | 0.72ms | long-a |
| 55 | src/patterns/ranges.ts | 408 | inline_literal | SAFE | 0.04ms | long-a |
| 56 | src/patterns/ranges.ts | 418 | inline_literal | SAFE | 0.04ms | long-a |
| 57 | src/patterns/ranges.ts | 437 | inline_literal | SAFE | 191.93ms | long-spaces |
| 58 | src/patterns/ranges.ts | 447 | inline_literal | SAFE | 185.28ms | long-spaces |
| 59 | src/patterns/ranges.ts | 693 | inline_literal | SAFE | 0.01ms | padded |
| 60 | src/patterns/ranges.ts | 757 | inline_literal | SAFE | 0.11ms | long-a |
| 61 | src/patterns/regionalFormats.ts | 64 | inline_literal | SAFE | 0.05ms | long-a |
| 62 | src/patterns/regionalFormats.ts | 71 | inline_literal | SAFE | 0.06ms | long-a |
| 66 | src/patterns/regionalFormats.ts | 120 | inline_literal | SAFE | 0.04ms | long-a |
| 67 | src/patterns/regionalFormats.ts | 156 | inline_literal | SAFE | 0.94ms | ambiguous-sep |
| 68 | src/patterns/regionalFormats.ts | 167 | inline_literal | SAFE | 0.01ms | mixed-format |
| 69 | src/patterns/regionalFormats.ts | 185 | inline_literal | SAFE | 0.01ms | dollar-trail |
| 70 | src/patterns/regionalFormats.ts | 193 | inline_literal | SAFE | 0.13ms | nested-periods |
| 72 | src/patterns/regionalFormats.ts | 249 | inline_literal | SAFE | 0.10ms | symbol-bomb |
| 75 | src/patterns/slangTerms.ts | 48 | inline_literal | SAFE | 0.03ms | long-spaces |
| 77 | src/patterns/slangTerms.ts | 154 | RegExp_constructor | SAFE | 0.02ms | repeated-word |
| 79 | src/patterns/symbols.ts | 373 | inline_literal | SAFE | 0.01ms | repeated-word |
| 82 | src/patterns/symbols.ts | 423 | inline_literal | SAFE | 0.01ms | padded |
| 83 | src/patterns/wordedNumbers.ts | 123 | inline_literal | SAFE | 0.01ms | long-spaces |
| 84 | src/patterns/wordedNumbers.ts | 126 | inline_literal | SAFE | 0.05ms | long-a |
| 85 | src/patterns/wordedNumbers.ts | 138 | inline_literal | SAFE | 0.90ms | long-a |
| 87 | src/patterns/wordedNumbers.ts | 386 | RegExp_constructor | SAFE | 0.03ms | repeated-word |
| 89 | src/patterns/wordedNumbers.ts | 411 | RegExp_constructor | SAFE | 0.04ms | repeated-word |

---
*Generated by scripts/redos-scanner.cjs*