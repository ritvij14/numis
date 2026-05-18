# Feature: Patterns

> **Module doc for pattern matchers.** Read this before adding or modifying any pattern in `src/patterns/`.
> Part of: numis — see CLAUDE.md for full project context.
> Status: Stable
> Last updated: 2026-05-18 (fixed lint errors in ranges.ts — prefer-const and unused vars)

---

## What This Feature Does

Provides 12 independent pattern matchers that recognize different monetary expression formats. Each pattern is a modular unit with `match*` (returns null if no match) and `parse*` (throws if invalid) functions. Patterns are consumed by the RegexPipeline in Stage 3 (numeric detection), except for `ranges.ts` which is consumed in Stage 2 (before numeric detection) to enable early range detection.

---

## Files & Ownership

```
src/patterns/
├── abbreviations.ts           # ISO-4217 currency codes (USD, EUR, GBP)
├── contextualPhrases.ts       # Contextual expressions ("a dollar and 23 cents")
├── minorUnitsOnly.ts          # Minor unit-only values ("75 cents", "50 pence")
├── negativeNumbers.ts         # Negative amount detection ("-$100", "($50)")
├── numbersWithSeparators.ts   # Formatted numbers ("1,234.56")
├── numericWordCombos.ts       # Abbreviated numbers ("10k", "5m", "2bn")
├── plainNumbers.ts            # Basic numeric values ("123", "45.67")
├── regionalFormats.ts         # International formats ("€1.234,56")
├── slangTerms.ts              # Monetary slang ("buck", "quid", "fiver")
├── symbols.ts                 # Currency symbols ("$", "€", "£", "¥")
├── wordedNumbers.ts           # Worded numbers ("one hundred", "half million")
└── ranges.ts                  # Range expressions ("$10 - $20", "50 to 100 USD")

src/
└── parseAll.ts                # parseAll function and MONETARY_PATTERNS array
```

**What lives here vs. elsewhere:**
- Pattern matching logic → individual files in `src/patterns/`
- Pipeline orchestration → `src/regexPipeline.ts` (consumes patterns)
- Public exports → `src/index.ts` (re-exports pattern functions)

---

## Pattern Overview

| Pattern | Description | Examples |
|---------|-------------|----------|
| `symbols` | Currency symbols (Unicode + text) | `$100`, `€50`, `£20.50`, `₹500`, `R$10` |
| `abbreviations` | ISO-4217 codes | `USD 100`, `50 EUR`, `GBP 20.50` |
| `wordedNumbers` | English worded numbers | `one hundred`, `twenty-five`, `half a million` |
| `numericWordCombos` | Number + suffix | `10k`, `5m`, `2bn`, `1.5b` |
| `slangTerms` | Informal currency words | `buck`, `quid`, `fiver`, `tenner`, `grand` |
| `contextualPhrases` | Articles + currency + units | `a hundred dollars`, `the fifty euros`, `five euros and fifty cents` |
| `minorUnitsOnly` | Minor unit expressions | `75 cents`, `50 pence`, `a quarter` |
| `regionalFormats` | Locale-specific number formats | `€1.234,56`, `1'234.56 CHF`, `R$ 1.234,56` |
| `numbersWithSeparators` | Thousand/decimal separators | `1,234.56`, `1.234,56` |
| `plainNumbers` | Basic digits | `123`, `45.67`, `999` |
| `negativeNumbers` | Negative indicators | `-$100`, `($50)`, `-€25.99` |
| `ranges` | Monetary ranges | `$10 - $20`, `50 to 100 USD`, `10k - 1M` |

---

## Pattern Interface Contract

Every pattern follows this interface:

```typescript
// The match function - returns null if no match
export function match<PatternName>(input: string, defaultCurrency?: string): <PatternName>ParseResult | null;

// The parse function - throws if invalid
export function parse<PatternName>(input: string, defaultCurrency?: string): <PatternName>ParseResult;

// Result type
export interface <PatternName>ParseResult {
  value: number;      // The parsed numeric amount
  currency?: string;  // ISO-4217 code (if detected)
  raw: string;        // The matched substring
}
```

**Key conventions:**
- `match*` returns `null` on failure — never throws
- `parse*` throws on failure — never returns null
- Both accept optional `defaultCurrency` for ambiguous cases
- Result includes `raw` for debugging/traceability

---

## Pattern Priority in Pipeline

In RegexPipeline Stage 3, patterns run in this order — **first match wins**:

1. `numericWordCombos` — `10k`, `5m` must match before plain numeric matches `10`
2. `slangTerms` — `buck`, `quid` before other patterns
3. `wordedNumbers` (fractional) — `half`, `three quarters` before plain numeric
4. `contextualPhrases` — complex phrases before simpler ones
5. `minorUnitsOnly` — `75 cents` after contextual (which handles "dollar and 75 cents")
6. `regionalFormats` — checked on original input (not cleaned) to preserve locale info
7. `plainNumbers` — digits and decimals
8. `wordedNumbers` — full worded numbers last

---

## Pattern Details

### symbols.ts

Matches currency symbols (Unicode and text variants).

**Examples:** `$100`, `€50`, `£20.50`, `¥1000`, `₹500`, `₽100`, `R$10`

**Key behavior:**
- Maps 150+ symbols to ISO codes
- Handles symbols before OR after number (`100$`)
- Ambiguous symbols (`$`) default to most common currency (USD)
- Uses `defaultCurrency` to resolve when multiple currencies share a symbol

### abbreviations.ts

Matches ISO-4217 three-letter currency codes.

**Examples:** `USD 100`, `50 EUR`, `GBP 20.50`, `JPY 1000`

**Key behavior:**
- Case-insensitive matching
- Code can appear before or after amount
- Validates code against ISO-4217 data

### wordedNumbers.ts

Converts English words to numbers.

**Examples:** `one hundred`, `twenty-five`, `two thousand five hundred`, `half a million`, `quarter billion`

**Key behavior:**
- Handles 0-19, tens (20-90), scales (hundred, thousand, million, billion, trillion)
- Fractional magnitudes: `half`, `quarter`, `third`, `two thirds`
- Hyphens and `and` are normalized (`twenty-three`, `one hundred and fifty`)

### numericWordCombos.ts

Matches numbers with suffix multipliers.

**Examples:** `10k`, `5m`, `2bn`, `1.5b`, `500K`, `2.5M`, `1,000k`, `2,500m`

**Key behavior:**
- Case-insensitive (k/K, m/M, b/B)
- Decimal multipliers work (`1.5m` = 1,500,000)
- Suffixes: k/K (thousand), m/M (million), b/B (billion)
- **2026-04-04:** Added comma separator support (`1,000k` → 1,000,000, `2,500m` → 2,500,000,000)

### slangTerms.ts

Maps informal currency words to values.

**Examples:** `buck`, `quid`, `fiver` (5), `tenner` (10), `grand` (1000)

**Key behavior:**
- Hard-coded slang → currency mappings
- `buck(s)` → USD $1
- `quid` → GBP £1
- `fiver` → GBP £5
- `tenner` → GBP £10
- `grand` → USD $1000

### contextualPhrases.ts

Complex phrases with articles and optional minor units.

**Examples:** `a hundred dollars`, `the fifty euros`, `five euros and fifty cents`, `a dollar and 23 cents`, `10 million`, `5 thousand`

**Key behavior:**
- Handles articles: `a`, `an`, `the`
- Major + minor unit combinations: `five euros and fifty cents`
- Supports both numeric and worded amounts
- **2026-04-04:** Added support for digit + magnitude without currency (`10 million` → 10,000,000, `5 thousand` → 5,000)

### minorUnitsOnly.ts

Matches only minor currency units.

**Examples:** `75 cents`, `50 pence`, `a quarter`

**Key behavior:**
- Only matches when no major unit is present
- Supports multiple minor unit names (cents, pence, sen, etc.)
- Runs after contextual phrases (which handle "dollar AND cents")

### regionalFormats.ts

Locale-specific number formats.

**Examples:** `€1.234,56` (European), `1'234.56 CHF` (Swiss), `R$ 1.234,56` (Brazilian)

**Key behavior:**
- Detects locale from currency symbol + number pattern
- European: `.` = thousands, `,` = decimal
- US/UK: `,` = thousands, `.` = decimal
- Swiss: `'` = thousands

### numbersWithSeparators.ts

Numbers with thousand/decimal separators.

**Examples:** `1,234.56`, `1.234,56`, `1'234.56`

**Key behavior:**
- Removes separators before parsing
- Returns the numeric value only (no currency detection)

### plainNumbers.ts

Basic digit sequences with optional decimals.

**Examples:** `123`, `45.67`, `999.99`

**Key behavior:**
- Fallback pattern — runs late in priority
- Matches simple digit sequences

### negativeNumbers.ts

Detects negative indicators in input.

**Examples:** `-$100`, `($50)`, `-€25.99`

**Key behavior:**
- Run in Stage 1 (before currency/numeric detection)
- Sets `isNegative` flag in context
- Amount is negated at the end of pipeline

### ranges.ts

Matches monetary range expressions with min/max values.

**Examples:** `$10 - $20`, `$500 - $1000`, `50 to 100 USD`, `10k - 1M`, `100 through 200 EUR`

**Key behavior:**
- Runs in Stage 2 of pipeline (before numeric detection) via `rangeDetectionStep`
- Imported at top level for browser compatibility (works in Node.js and browsers)
- Separators: `-`, `–`, `—`, `to`, `through` (case-insensitive)
- Returns `RangeParseResult` with `min`, `max`, `currency`, and `raw` fields
- Validates that min < max (returns null for invalid ranges like "100 - 50")
- Uses `Math.min/max` to normalize reversed ranges
- When detected, `numericDetectionStep` is skipped to prevent double processing
- Exports `matchRange` and `parseRange` for direct use

---

## parseAll.ts (Standalone Module)

Located at `src/parseAll.ts`, this module provides batch parsing of all monetary expressions in text.

### Exports

- **`parseAll(input: string): MonetaryExpression[]`** — Finds all monetary expressions in text, including ranges
- **`MONETARY_PATTERNS: MonetaryPattern[]`** — Array of regex patterns for different monetary types
- **`MonetaryExpression`** — Interface for parsed expressions (single or range)
- **`MonetaryPattern`** — Interface for pattern entries
- **`RangeParseResult`** — Re-exported from types

### Pattern Order

Range patterns are placed BEFORE single-value patterns in `MONETARY_PATTERNS` to ensure ranges are detected as single expressions:

1. **Symbol ranges:** `$500 - $1000`, `€50 - €100`
2. **ISO code ranges:** `USD 500 - USD 1000`
3. **Magnitude ranges:** `10k - 1M`, `5 million to 10 million`
4. **Contextual ranges:** `between $100 and $200`, `from $50 to $100`
5. Single-value patterns (symbol, ISO code, magnitude, contextual)

### Usage

```typescript
import { parseAll } from 'numis';

const results = parseAll('Price is $100-$200 or $500');
// Returns array of MonetaryExpression with type: 'single' | 'range'
```

---

## Adding a New Pattern

1. Create `src/patterns/<newPattern>.ts`
2. Implement `match<NewPattern>()` returning `null` on failure
3. Implement `parse<NewPattern>()` throwing on failure
4. Export result interface and both functions
5. Add to `src/index.ts` exports
6. Add test file `test/patterns/<newPattern>.test.ts`
7. If needed in pipeline, import in `regexPipeline.ts` and call in appropriate priority position

**Key rule:** Always clone the context in pipeline steps, never mutate in place. See existing patterns for the `clone` helper pattern.

---

## Dependencies

**This feature depends on:**
- `src/currencyData.ts` — ISO-4217 validation
- `src/errors.ts` — `ValueOverflowError`
- `src/regexPipeline.ts` — Consumes patterns in Stage 3

**Other features that depend on this:**
- `core-parsing` — RegexPipeline consumes all patterns

---

## Testing

**Each pattern has:**
- Dedicated test file: `test/patterns/<pattern>.test.ts`
- Tests for valid inputs, invalid inputs, edge cases

**Test conventions:**
- Use descriptive test names (`"returns 100 when given 'one hundred'"`)
- Group with `describe()` blocks
- Include error cases

**To run a specific pattern's tests:**
```bash
npm test -- --testPathPattern="patterns/symbols"
```

**Integration tests for ranges:**
- `test/patterns/ranges.test.ts` — Unit tests for range pattern, including validation errors (min > max, same values, currency mismatches, overflow checks)
- `test/parseMoney.range.test.ts` — Integration tests for parseMoney() with range inputs (isRange flag, min/max values, currency detection, defaultCurrency option)
- `test/parseAll.range.test.ts` — Integration tests for parseAll() with range inputs (start/end indices, multiple ranges, mixed with single values)

---

## Known Issues & Tech Debt

- **Symbol ambiguity** — `$` maps to USD, but could be CAD, AUD, etc.
- **Regional format gaps** — not all locales are covered
- **Worded numbers limited** — only handles English, basic magnitudes

---

## Recent Changes

- 2026-03-31: Documentation created to capture all pattern matchers
- 2026-04-05: Added comprehensive test coverage for ranges — validation error tests, parseMoney() and parseAll() integration tests
- 2026-04-05: Added contextual phrase range tests, mixed format range tests, and demo site updates with range examples
- 2026-04-05: Added ISO code range tests, magnitude suffix range tests (k, M, B), and slang term range tests (bucks, quid, fiver, tenner, grand)
- 2026-04-05: Exported `numericWordCombos` module from index.ts (was internal-only, now public API)
- 2026-04-05: Fixed ParseOptions JSDoc - `defaultCurrency` does not default to "USD", must be explicitly provided