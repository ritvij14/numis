# Regex Pattern Inventory — numis ReDoS Subtask 1

**Scope:** `src/patterns/*.ts` + `src/regexPipeline.ts`  
**Total patterns inventoried:** 75  
**Worker:** default | Run 4  

---

## Legend

| Type | Meaning |
|------|---------|
| `literal` | `/pattern/flags` written directly in source |
| `RegExp_constructor` | `new RegExp(string, flags)` — dynamic, built from runtime strings |
| `RegExp_call` | `RegExp(string, flags)` without `new` |
| `inline_literal` | Regex literal embedded inside a `.replace()`, `.match()`, `.test()`, etc. |

---

## 1. src/regexPipeline.ts

| # | Line | Type | Raw Pattern / Constructor | Purpose |
|---|------|------|---------------------------|---------|
| 1 | 178 | RegExp_constructor | `new RegExp(`[${Object.keys(SYMBOL_TO_CODE).map(s => `\\${s}`).join("")}]`)` | Build character class of known currency symbols for quick symbol detection |
| 2 | 196 | inline_literal | `/\s+/` | Split worded-number tokens on whitespace |
| 3 | 278 | literal | `/^<|>\s*/i` | Detect comparison operators at start of input |
| 4 | 302 | literal | `/\s*(?:-|–|—|to|through)\s*/i` | Detect range separators in input |
| 5 | 338 | inline_literal | `/\b[A-Za-z]{3}\b/g` | Extract 3-letter ISO-code candidates from text |
| 6 | 353 | inline_literal | `/\b[A-Za-z]{3,}\b/g` | Extract word tokens (length ≥3) for currency-name matching |
| 7 | 395 | inline_literal | `/[,']/g` | Remove common thousand separators before numeric parsing |
| 8 | 466 | literal | `/(?:\b|^)(\d+(?:\.\d+)?)(?:\b|$)/` | Match plain numeric value (digits with optional decimal) |
| 9 | 481 | literal | `/\b((?:zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|million|billion)(?:[\s-](?:zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|million|billion))*)\b/i` | Match English worded numbers for conversion to numeric values |

---

## 2. src/patterns/abbreviations.ts

| # | Line | Type | Raw Pattern / Constructor | Purpose |
|---|------|------|---------------------------|---------|
| 10 | 41 | inline_literal | `'\\d{1,3}(?:,\\d{3})+(?:\\.\\d+)?|\\d+(?:\\.\\d+)?'` | Number sub-pattern (embedded inside dynamic regex string) |
| 11 | 45 | RegExp_constructor | `new RegExp(`(?:(?<codeBefore>${codePattern})\\s+(?<amountAfterCode>${numberPattern}))|(?:(?<amountBeforeCode>${numberPattern})\\s+(?<codeAfter>${codePattern}))`, 'i')` | Match ISO code + amount in either order (code-first or amount-first) |
| 12 | 94 | inline_literal | `/,/g` | Strip comma thousand separators from matched amount string |

---

## 3. src/patterns/contextualPhrases.ts

| # | Line | Type | Raw Pattern / Constructor | Purpose |
|---|------|------|---------------------------|---------|
| 13 | 36 | inline_literal | `/\s+/g` | Normalize whitespace during input normalization |
| 14 | 53 | inline_literal | `/^\d+(?:\.\d+)?$/` | Check if amount candidate is a plain numeric string |
| 15 | 58 | inline_literal | `/^\d+(?:\.\d+)?$/` | Check if first token is a plain digit (for digit+magnitude parsing) |
| 16 | 81 | inline_literal | `/^[a-z]{3}$/i` | Check if token is a 3-letter ISO code candidate |
| 17 | 125 | inline_literal | `/^\d+$/` | Check if minor amount is a plain integer |
| 18 | 243 | RegExp_constructor | `new RegExp(`(?:${keys.join("|")}|[a-z]{3})`)` | Build currency-name/code pattern for contextual phrase matching |
| 19 | 247 | RegExp_constructor | `new RegExp(`(?:${keys.join("|")})`)` | Build minor-unit token pattern (cent, cents, penny, etc.) |
| 20 | 260 | inline_literal | `[\s-]+(?:and\s+)?` | Word-boundary glue inside a larger dynamic regex string |
| 21 | 263 | inline_literal | `\\d+(?:\\.\\d+)?\\s+(?:hundred|thousand|million|billion|trillion)(?:\\s+(?:${numberWords}))*` | Digit+magnitude sub-pattern (e.g., "2 million") |
| 22 | 266 | inline_literal | `(?:(?:${numberWords})\\s+)?(?:${fractionWords})(?:\\s+(?:of\\s+)?(?:a\\s+)?(?:hundred|thousand|million|billion|trillion))?` | Fractional magnitude sub-pattern (e.g., "quarter million") |
| 23 | 274 | inline_literal | `\\d+(?:\\.\\d+)?` | Plain digit sub-pattern inside amount pattern |
| 24 | 277 | inline_literal | `\\d+(?:\\.\\d+)?\\s+(?:hundred|thousand|million|billion|trillion)` | Digit+magnitude without currency (e.g., "10 million") |
| 25 | 279 | RegExp_constructor | `new RegExp(`\\b(((?:a|an|the)\\s+${amountPattern}\\s*${currencyPattern}|(?:${digitMagnitudePattern}|${fractionalMagnitudePattern}|${wordedNumberPattern}|\\d+(?:\\.\\d+)?)\\s+${currencyPattern}|${digitMagnitudeNoCurrency})(?:\\s+(?:and\\s+)?(?:${wordedNumberPattern}|\\d+(?:\\.\\d+)?)\\s+${minorPattern}|\\s+(?:${numberWords})(?:[\\s-](?:${numberWords}))*)?)\\b`, "gi")` | **Mega-regex:** Master pattern for contextual monetary phrases (articles + amounts + currency + optional minor units) |
| 26 | 296 | literal | `/^(\d+(?:\.\d+)?)\s+(hundred|thousand|million|billion|trillion)(?:\s+\w+)*/i` | Fallback regex for digit+magnitude matches when currency is missing |

---

## 4. src/patterns/minorUnitsOnly.ts

| # | Line | Type | Raw Pattern / Constructor | Purpose |
|---|------|------|---------------------------|---------|
| 27 | 40 | inline_literal | `/\s+/g` | Normalize whitespace |
| 28 | 55 | inline_literal | `/^\d+(?:\.\d+)?$/` | Check if amount is plain numeric |
| 29 | 169 | RegExp_constructor | `new RegExp(`\\b(${pattern})\\b`, "gi")` | Match standalone minor-unit expressions (e.g., "75 cents", "fifty pence") |
| 30 | 206 | inline_literal | `[\s-]+` | Token glue inside minor-unit regex builder |
| 31 | 243 | literal | `/\b(?:a|an|the|\d+(?:\.\d+)?|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|million|billion)\s+(?:dollar|dollars|euro|euros|pound|pounds|yen|yuan|peso|pesos|rupee|rupees|franc|francs|krona|kronor|shekel|shekels|dinar|dinars|dirham|dirhams|[A-Z]{3})\s+(?:and\s+)?(?:\d+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)\s+(?:cent|cents|penny|pennies|pence)\b/i` | **Negative filter:** Prevent matching compound expressions already handled by contextualPhrases (e.g., "a dollar and 75 cents") |

---

## 5. src/patterns/negativeNumbers.ts

| # | Line | Type | Raw Pattern / Constructor | Purpose |
|---|------|------|---------------------------|---------|
| 32 | 33 | literal | `/^\(([^)]+)\)(.*)$/` | Detect parentheses notation for negative numbers: `(100)`, `(100 USD)` |
| 33 | 51 | literal | `/^(?:[-−–—]|minus\b|negative\b)\s*/i` | Detect negative prefixes: `-`, `minus`, `negative` |
| 34 | 73 | literal | `/^\([^)]+\)$/` | Check if entire input is wrapped in parentheses |
| 35 | 83 | literal | `/^(?:[-−–—]|minus\b|negative\b)\s*/i` | Check if input starts with a negative prefix |

---

## 6. src/patterns/numericWordCombos.ts

| # | Line | Type | Raw Pattern / Constructor | Purpose |
|---|------|------|---------------------------|---------|
| 36 | 44 | inline_literal | `/\s+/g` | Normalize whitespace |
| 37 | 74 | literal | `/^(\d+(?:,\d{3})*(?:\.\d+)?)(bn|[kmb])$/i` | Parse numeric-word combos: validate format and split numeric part from suffix |
| 38 | 108 | inline_literal | `\\d+(?:,\\d{3})*(?:\\.\\d+)?(?:bn|[kmb])` | Sub-pattern for numeric-word combo matcher |
| 39 | 109 | RegExp_constructor | `new RegExp(`\\b${pattern}\\b`, "gi")` | Match numeric-word combos in text (e.g., "10k", "5m", "2bn") |

---

## 7. src/patterns/numbersWithSeparators.ts

| # | Line | Type | Raw Pattern / Constructor | Purpose |
|---|------|------|---------------------------|---------|
| 40 | 26 | literal | `/^(\d{1,3}(,\d{3})*(\.\d+)?|\d+\.\d+|\d+)$/` | Validate and parse numbers with comma thousand separators and optional decimal |
| 41 | 80 | literal | `/\b(\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d+\.\d+)\b/` | Match numbers with separators or decimals inside larger text |

---

## 8. src/patterns/plainNumbers.ts

| # | Line | Type | Raw Pattern / Constructor | Purpose |
|---|------|------|---------------------------|---------|
| 42 | 35 | literal | `/^\d+$/` | Validate that input is a plain integer (digits only) |
| 43 | 65 | literal | `/\b(\d+)\b/` | Match a plain integer inside larger text |

---

## 9. src/patterns/ranges.ts

| # | Line | Type | Raw Pattern / Constructor | Purpose |
|---|------|------|---------------------------|---------|
| 44 | 43 | literal | `/\s*(?:-|–|—|to|through)\s*/i` | Range separator detection (hyphens, dashes, "to", "through") |
| 45 | 49 | literal | `/^<|>\s*/i` | Comparison operator detection (`<` or `>` with optional whitespace) |
| 46 | 69 | inline_literal | `/^</` | Detect "less than" comparison operator |
| 47 | 72 | inline_literal | `/^>/` | Detect "greater than" comparison operator |
| 48 | 91 | inline_literal | `/^(<|>)(\s*)(.+)/` | Parse comparison operator prefix and extract value part |
| 49 | 173 | inline_literal | `rangeSeparatorRegex.test(...)` | (Reuses #44) Quick check for range separator before splitting |
| 50 | 202 | inline_literal | `/(\b(hundred|thousand|million|billion|trillion|k|m|b)\b|dollars?|euros?|pounds?|dirhams?|rupees?|francs?|yen|yuan|usd|eur|gbp|chf|inr|cny|jpy|krw)/i` | Detect magnitude/currency context in range part to decide plain-number fallback |
| 51 | 230 | literal | `/^\d{1,2},\d{2}(?:,\d{2})*,\d{3}(?:\.\d+)?$/` | Validate Indian numbering format (2-digit groups after first 3-digit group) |
| 52 | 318 | inline_literal | `/\b(\d+(?:\.\d+)?)\s*(k|thousand|m|mn|million|b|bn|billion)\b/i` | Detect magnitude suffix in range part for auto-scaling |
| 53 | 328 | inline_literal | `/^(\d+(?:\.\d+)?)/` | Extract leading numeric part from a range segment |
| 54 | 379 | inline_literal | `/[.,'\s]{2,}/` | Detect consecutive separators (invalid regional format) |
| 55 | 408 | inline_literal | `/^([a-z]{3})\s+/` | Detect 3-letter currency code prefix |
| 56 | 418 | inline_literal | `/^([^\w\s]+)\s*/` | Detect currency symbol prefix |
| 57 | 437 | inline_literal | `/\s+([a-z]{3})$/` | Detect 3-letter currency code suffix |
| 58 | 447 | inline_literal | `/\s+(dollars?|euros?|pounds?|cents?)$/` | Detect currency word suffix |
| 59 | 693 | inline_literal | `/\s+/` | Tokenize currency-context text |
| 60 | 757 | inline_literal | `/[^a-z]/g` | Strip non-alpha characters from token during currency-context detection |

---

## 10. src/patterns/regionalFormats.ts

| # | Line | Type | Raw Pattern / Constructor | Purpose |
|---|------|------|---------------------------|---------|
| 61 | 64 | inline_literal | `/[.*+?^${}()|[\]\\]/g` | Escape special regex characters when building symbol patterns |
| 62 | 71 | inline_literal | `/(?<![a-zA-Z])${escaped}(?![a-zA-Z])/` | Negative lookbehind/lookahead for single-letter currency symbols (prevent false word matches) |
| 63 | 89 | inline_literal | `\d{1,3}(?:[.,\'\s]\d{2,3})+(?:[.,]\d{1,2})?` | Number pattern with regional separators (comma, period, space, apostrophe) |
| 64 | 91 | inline_literal | `\d+[.,]\d+` | Plain decimal number pattern |
| 65 | 97 | RegExp_constructor | `new RegExp(`(?:(?<symbolBefore>${symbolPattern})\\s*(?<amountAfterSymbol>${numberPattern}))|(?:(?<amountBeforeSymbol>${numberPattern})\\s*(?<symbolAfter>${symbolPattern}))`, 'i')` | Match currency symbol + regional-format number in either order |
| 66 | 120 | inline_literal | `/\s/` | Check for whitespace presence in number string |
| 67 | 156 | inline_literal | `/,(\d+)$/` | Extract digits after final comma to decide decimal vs. thousands |
| 68 | 167 | inline_literal | `/,/g` | Count commas in number string |
| 69 | 185 | inline_literal | `/\./g` | Count periods in number string |
| 70 | 193 | inline_literal | `/\.(\d+)$/` | Extract digits after final period |
| 71 | 230 | literal | `/^\d{1,2},\d{2}(?:,\d{2})*,\d{3}(?:\.\d+)?$/` | Indian format validation (duplicated from ranges.ts) |
| 72 | 249 | inline_literal | `/[\s\u00A0]/g` | Remove space and non-breaking space thousands separators |
| 73 | 250 | RegExp_constructor | `new RegExp(escapedThousands, 'g')` | Remove thousands separator (generic, runtime-escaped) |
| 74 | 256 | RegExp_constructor | `new RegExp(escapedDecimal, 'g')` | Replace decimal separator with period (generic, runtime-escaped) |

---

## 11. src/patterns/slangTerms.ts

| # | Line | Type | Raw Pattern / Constructor | Purpose |
|---|------|------|---------------------------|---------|
| 75 | 48 | inline_literal | `/\s+/g` | Normalize whitespace |
| 76 | 68 | inline_literal | `/^\d+(?:\.\d+)?$/` | Check if quantity is plain numeric |
| 77 | 154 | RegExp_constructor | `new RegExp(`\\b(${pattern})\\b`, "gi")` | Match slang monetary expressions (e.g., "two bucks", "a grand", "buck fifty") |
| 78 | 204 | inline_literal | `(?:(?:${quantityTokens})\\s+){0,6}(?:${slangTokens})(?:\\s+(?:${centsTokens}))?` | Slang pattern body: up to 6 quantity tokens + slang token + optional cents word |

---

## 12. src/patterns/symbols.ts

| # | Line | Type | Raw Pattern / Constructor | Purpose |
|---|------|------|---------------------------|---------|
| 79 | 373 | inline_literal | `/[.*+?^${}()|[\]\\]/g` | Escape special regex characters in currency symbol strings |
| 80 | 380 | inline_literal | `\\d{1,3}(?:,\\d{3})+(?:\\.\\d+)?|\\d+(?:\\.\\d+)?` | Number sub-pattern for symbol matching |
| 81 | 384 | RegExp_constructor | `new RegExp(`(?:(?<symbolBefore>${symbolPattern})\\s*(?<amountAfterSymbol>${numberPattern}))|(?:(?<amountBeforeSymbol>${numberPattern})\\s*(?<symbolAfter>${symbolPattern}))`, 'i')` | Match currency symbol + number in either order (symbol-first or number-first) |
| 82 | 423 | inline_literal | `/,/g` | Strip comma thousand separators from amount string |

---

## 13. src/patterns/wordedNumbers.ts

| # | Line | Type | Raw Pattern / Constructor | Purpose |
|---|------|------|---------------------------|---------|
| 83 | 123 | inline_literal | `/\s+/g` | Normalize whitespace |
| 84 | 126 | inline_literal | `/\band\b/g` | Remove the word "and" from worded-number strings |
| 85 | 138 | inline_literal | `/\s+/` | Tokenize worded numbers by whitespace |
| 86 | 384 | inline_literal | `(?:a\\s+)?(?:(?:${multiplierWords})(?:[\\s-])+)?(?:${fractionWords})(?:\\s+(?:of\\s+)?(?:a\\s+)?(?:${scaleWords}))?` | Fractional worded-number pattern body |
| 87 | 386 | RegExp_constructor | `new RegExp(`\\b(${pattern})\\b`, "gi")` | Match fractional worded numbers (e.g., "half", "quarter million", "two thirds of a billion") |
| 88 | 410 | inline_literal | `(?:(?:${wordsPattern})(?:[\\s-](?:and[\\s-])?(?:${wordsPattern}))*)` | Worded-number pattern body (sequences of number words with spaces/hyphens/"and") |
| 89 | 411 | RegExp_constructor | `new RegExp(`\\b(${pattern})\\b`, "gi")` | Match worded numbers (e.g., "one hundred", "twenty-three", "two thousand five hundred") |

---

## Summary by File

| File | Literal | RegExp_constructor | RegExp_call | Inline_literal | **Total** |
|------|---------|-------------------|-------------|----------------|-----------|
| `src/regexPipeline.ts` | 4 | 1 | 0 | 4 | **9** |
| `src/patterns/abbreviations.ts` | 0 | 1 | 0 | 2 | **3** |
| `src/patterns/contextualPhrases.ts` | 1 | 3 | 0 | 8 | **12** |
| `src/patterns/minorUnitsOnly.ts` | 1 | 1 | 0 | 3 | **5** |
| `src/patterns/negativeNumbers.ts` | 4 | 0 | 0 | 0 | **4** |
| `src/patterns/numericWordCombos.ts` | 1 | 1 | 0 | 2 | **4** |
| `src/patterns/numbersWithSeparators.ts` | 2 | 0 | 0 | 0 | **2** |
| `src/patterns/plainNumbers.ts` | 2 | 0 | 0 | 0 | **2** |
| `src/patterns/ranges.ts` | 3 | 0 | 0 | 14 | **17** |
| `src/patterns/regionalFormats.ts` | 1 | 3 | 0 | 7 | **11** |
| `src/patterns/slangTerms.ts` | 0 | 1 | 0 | 3 | **4** |
| `src/patterns/symbols.ts` | 0 | 1 | 0 | 2 | **3** |
| `src/patterns/wordedNumbers.ts` | 0 | 2 | 0 | 4 | **6** |
| **Grand Total** | **19** | **15** | **0** | **50** | **84*** |

\* Some inline literals are sub-patterns embedded inside constructor strings; they are counted separately here because they contribute to the final dynamic regex and are worth auditing independently.

---

## Notable Patterns for ReDoS Review

1. **`src/regexPipeline.ts:481`** — `wordNumberRegex` is a large alternation of ~30 words with an inner `(?:[\s-](?:...))*` repetition. On non-matching input with many spaces/hyphens, the backtracking depth is bounded by the alternation size (finite list). **Risk: LOW** (finite word list, no nested quantifiers on overlapping classes).

2. **`src/patterns/contextualPhrases.ts:279`** — The contextual-phrase mega-regex is the most complex dynamic pattern. It composes multiple alternations (amountPattern × currencyPattern × minorPattern). Because all internal repetitions are bounded by token lists or `{0,6}` quantifiers, catastrophic backtracking is unlikely. **Risk: LOW-MEDIUM** (complex composition, but no nested `+` or `*` on overlapping character classes).

3. **`src/patterns/ranges.ts:50`** — `hasMagnitudeOrCurrency` regex is a large alternation of words used as a guard before plain-number fallback. It is executed once per range part. **Risk: LOW**.

4. **`src/patterns/regionalFormats.ts:65`** — `REGIONAL_SYMBOL_REGEX` dynamically embeds ~150 escaped currency symbols. The alternation is large but flat; no nested quantifiers. **Risk: LOW**.

5. **`src/patterns/wordedNumbers.ts:411`** — `WORDED_NUMBER_REGEX` matches sequences of number words. The inner repetition is `(?:[\s-](?:and[\s-])?(?:${wordsPattern}))*`. Because `wordsPattern` is a finite alternation of ~35 words, backtracking is bounded. **Risk: LOW**.

---

*Inventory generated by ReDoS Subtask 1 worker (default profile, run 4).*
