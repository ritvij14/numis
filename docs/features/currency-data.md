# Feature: Currency Data

> **Module doc for currency data.** Read this before working on `currencyData.ts` or `currencyMapBuilder.ts`.
> Part of: numis — see CLAUDE.md for full project context.
> Status: Stable
> Last updated: 2026-03-31

---

## What This Feature Does

Manages currency information — ISO-4217 code lookups, currency name mappings, and lazy-initialized maps. This is the data layer that powers currency detection in the RegexPipeline (Stage 2).

---

## Files & Ownership

```
src/
├── currencyData.ts        # ISO-4217 lookups via currency-codes package
├── currencyMapBuilder.ts  # Lazy-initialized name-to-code map
└── types/currency-codes.d.ts  # Type declarations for currency-codes
```

**What lives here vs. elsewhere:**
- ISO code lookups → `currencyData.ts`
- Name-to-code mapping → `currencyMapBuilder.ts`
- Pattern matching → `src/patterns/*` (consumes currency data)
- Pipeline → `src/regexPipeline.ts` (Stage 2 uses both)

---

## Public API

### currencyData.ts

```typescript
// Get currency info by ISO code
getCurrencyByCode(code: string): CurrencyInfo | null
// getCurrencyByCode("USD") => { code: "USD", number: "840", currency: "US Dollar", countries: ["United States"], digits: 2 }

// Get currency info by ISO numeric code
getCurrencyByNumber(numericCode: string): CurrencyInfo | null
// getCurrencyByNumber("840") => same as above

// Get all currencies
getAllCurrencies(): CurrencyInfo[]
// Returns array of all ISO-4217 currencies
```

### CurrencyInfo Type

```typescript
interface CurrencyInfo {
  code: string;      // ISO 4217 three-letter code (e.g., "USD")
  number: string;    // ISO 4217 numeric code (e.g., "840")
  currency: string;  // Official name (e.g., "US Dollar")
  countries: string[]; // Countries using this currency
  digits?: number;   // Decimal places (e.g., 2 for USD, 0 for JPY)
}
```

### currencyMapBuilder.ts

```typescript
// Get lazy-initialized map of currency names/words to codes
getNameToCodeMap(): Record<string, string>
// Returns: { dollar: "USD", euros: "EUR", pound: "GBP", yen: "JPY", ... }
```

---

## Business Logic

### Data Source

Uses the `currency-codes` npm package, which provides:
- Complete ISO 4217 currency list (170+ currencies)
- Both letter codes (USD, EUR) and numeric codes (840, 978)
- Country associations
- Decimal digit counts

### Lazy Initialization

`getNameToCodeMap()` is lazy-initialized:
1. First call → builds the map and caches it
2. Subsequent calls → returns cached map

**Why lazy?** The map is large (~300+ entries). Building it eagerly would slow down library startup, especially in browser environments where it may not be needed.

### Map Building Process

1. **Full name mapping** — "US Dollar" → USD, "Euro" → EUR
2. **Word extraction** — extracts words ≥3 chars from currency names
   - "US Dollar" → "dollar" → USD
   - Skips stopwords: "and", "the", "of" (to avoid "Trinidad and Tobago Dollar" mapping "and" → TTD)
3. **Plural forms** — adds `s` variant if not already present ("dollar" → "dollars")
4. **Manual overrides** — hard-coded preferences for ambiguous common words:
   - `dollar` → USD (not CAD, AUD, etc.)
   - `euro` → EUR
   - `pound` → GBP
   - `yen` → JPY
   - `rupee` → INR
   - `peso` → MXN
   - `won` → KRW
   - `dirham` → AED (UAE, not Moroccan)

### Stopwords

Words excluded from automatic mapping to prevent false positives:
- `and`, `the`, `of`

These appear in currency names like "Trinidad and Tobago Dollar" but should not map to currency codes.

---

## Currency Detection in Pipeline

The RegexPipeline uses currency data in **Stage 2 (currencyDetectionStep)**:

1. **Symbol detection** — quick symbol → code lookup (hard-coded in pipeline)
2. **ISO code detection** — looks for 3-letter words, validates via `getCurrencyByCode()`
3. **Name detection** — uses `getNameToCodeMap()` to find currency words in text

Example: "new zealand dollar"
- Multi-word phrase detection tries phrases of length 2-4
- "new zealand dollar" matches → returns "NZD"

---

## Dependencies

**This feature depends on:**
- `currency-codes` npm package — source of ISO-4217 data

**Other features that depend on this:**
- `core-parsing` — RegexPipeline Stage 2 uses currency data
- `patterns/*` — Some patterns validate currency codes
- Public API — `parseMoney()` uses `getCurrencyByCode()` to validate `defaultCurrency`

---

## Testing

**Tests cover:**
- `test/currencyData.test.ts` — ISO code lookups, validation
- `test/lazyInit.test.ts` — Lazy initialization behavior

**Test patterns:**
- Valid codes return correct info
- Invalid codes return `null`
- Lazy init only builds map once

**To run:**
```bash
npm test -- --testPathPattern="currencyData|lazyInit"
```

---

## Known Issues & Tech Debt

- **Ambiguous common words** — `dollar`, `peso`, etc. use hard-coded overrides rather than context-based disambiguation
- **No currency validation in parse result** — if a pattern detects a currency, it's accepted without re-validating against ISO data
- **Stopword list may be incomplete** — could add more common false-positive words

---

## Recent Changes

- 2026-03-31: Documentation created to capture currency data architecture