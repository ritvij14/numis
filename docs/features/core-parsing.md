# Feature: Core Parsing

> **Module doc for core parsing.** Read this before working on `parseMoney()` or `RegexPipeline`.
> Part of: numis — see CLAUDE.md for full project context.
> Status: Stable
> Last updated: 2026-03-31

---

## What This Feature Does

Provides the core parsing engine that extracts monetary values from free-form text. It's the public API (`parseMoney()`) and the underlying regex pipeline that orchestrates pattern matching. This is the heart of the library — all parsing flows through here.

---

## Files & Ownership

```
src/
├── parseMoney.ts         # Public API entry point
├── regexPipeline.ts      # Three-stage parsing pipeline
├── index.ts              # Public exports
├── types.ts              # ParseOptions interface
└── errors.ts             # MoneyParseError, ValueOverflowError
```

**What lives here vs. elsewhere:**
- Public API → `parseMoney.ts` only
- Pipeline orchestration → `regexPipeline.ts` only
- Pattern matchers → `src/patterns/*` (consumed by pipeline, not this feature)
- Currency data → `src/currencyData.ts`, `src/currencyMapBuilder.ts` (consumed by pipeline)

---

## Public API

### `parseMoney(text, options?)`

The main entry point for parsing monetary values from text.

**Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `text` | string | Yes | The text to parse |
| `options.defaultCurrency` | string | No | ISO-4217 code to use when no currency is detected |

**Returns:** `PipelineContext` (see below)

**Throws:**
- `MoneyParseError` — if `defaultCurrency` is provided but is not a valid ISO-4217 code

**Examples:**
```typescript
parseMoney("$12.50");
// => { original: "$12.50", currency: "USD", amount: 12.5 }

parseMoney("I have 100", { defaultCurrency: "EUR" });
// => { original: "I have 100", currency: "EUR", amount: 100, currencyWasDefault: true }

parseMoney("$50", { defaultCurrency: "EUR" });
// => { original: "$50", currency: "USD", amount: 50 } // detected takes precedence
```

### `RegexPipeline`

A configurable pipeline that runs parsing steps in sequence.

**Factory:**
```typescript
RegexPipeline.default()  // Returns pre-configured pipeline with all default steps
```

**Methods:**
| Method | Description |
|--------|-------------|
| `run(input, options?)` | Run input through all pipeline steps |
| `addStep(step)` | Append a custom step to the pipeline |

**Custom step example:**
```typescript
const custom = RegexPipeline.default().addStep(customStep);
const result = custom.run("text");
```

---

## PipelineContext (Return Type)

```typescript
interface PipelineContext {
  original: string;           // Original input text
  currency?: string;          // Detected ISO-4217 code (e.g., "USD", "EUR")
  amount?: number;            // Parsed numeric amount
  currencyWasDefault?: boolean; // true if currency came from defaultCurrency option
  isNegative?: boolean;       // true if negative indicator was detected
  matches?: Record<string, unknown>; // Placeholder for future pattern matches
  defaultCurrency?: string;   // The default currency option passed in
}
```

---

## Business Logic

### Pipeline Stages

The default pipeline runs **4 stages** in sequence:

| Stage | Step | What it does |
|-------|------|--------------|
| 1 | `negativeDetectionStep` | Detects negative indicators (`-`, `($50)`) and sets `isNegative` flag |
| 2 | `currencyDetectionStep` | Detects currency via: symbols → ISO codes → full names |
| 3 | `numericDetectionStep` | Runs 9 sub-patterns in priority order (see below) |
| 4 | `patternSpecificStep` | Placeholder for custom regex logic (currently unused) |

### Currency Detection Priority (Stage 2)

Currency is detected in this order — first match wins:

1. **Currency symbols** — `$`, `€`, `£`, `¥`, `₹`, etc. → mapped to ISO code
2. **ISO codes** — 3-letter codes like `USD`, `EUR`, `GBP` in the text
3. **Full names** — "dollar", "euro", "pound", "yen" (multi-word phrases like "new zealand dollar" supported)

### Numeric Detection Priority (Stage 3)

Within Stage 3, patterns run in this order — first match wins:

1. Numeric-word combos (`10k`, `5m`, `2bn`)
2. Slang terms (`buck`, `quid`, `fiver`, `tenner`)
3. Fractional worded numbers (`half`, `three quarters`, `two thirds`)
4. Contextual phrases (`a hundred dollars`, `five euros and fifty cents`)
5. Minor units only (`75 cents`, `50 pence`)
6. Regional formats (`€1.234,56`, `$1,234.56`)
7. Plain numeric (`123`, `45.67`)
8. Worded numbers (`one hundred twenty`, `two thousand`)

**Why this order matters:**
- `10k` must be checked before plain numeric (which would match just `10`)
- Regional formats need the original input (not cleaned) to detect `,` vs `.` as separators
- Minor units must come after contextual (which handles "dollar and 75 cents") but before plain numeric

### Default Currency Logic

- If no currency detected AND `defaultCurrency` provided → use it, set `currencyWasDefault: true`
- If currency detected → ignore `defaultCurrency` (detected always wins)
- If no currency detected AND no `defaultCurrency` → `currency` is `undefined`

### Negative Number Logic

- Detected in Stage 1, applied to `amount` at the end
- Indicators: `-` prefix, parentheses like `($50)`
- When `isNegative` is true, amount is negated: `amount = -Math.abs(amount)`

---

## Dependencies

**This feature depends on:**
- `src/patterns/*` — All pattern matchers consumed in Stage 3
- `src/currencyData.ts` — ISO-4217 code lookups
- `src/currencyMapBuilder.ts` — Currency name to code mapping
- `src/errors.ts` — Error classes

**Other features that depend on this:**
- All other features ultimately use `parseMoney()` as the entry point

**Infra docs to read when working here:**
- `docs/infra/testing.md` — Test structure and patterns
- `docs/features/patterns.md` — Individual pattern matchers (once created)

---

## Key Flows

### Flow: Parsing "$50 USD"

1. `parseMoney("$50 USD")` is called
2. Validates no defaultCurrency needed
3. Calls `defaultPipeline.run("$50 USD", {})`
4. **Stage 1** — Negative detection: no negative indicator found
5. **Stage 2** — Currency detection:
   - Symbol `$` found → maps to USD
   - ISO code `USD` also found but currency already set, so skipped
6. **Stage 3** — Numeric detection:
   - Numeric-word combos: no match
   - Slang: no match
   - ...through all 9 patterns
   - Plain numeric matches `50` → sets `amount: 50`
7. **End** — Returns `{ original: "$50 USD", currency: "USD", amount: 50 }`

### Flow: Parsing "I have 100" with defaultCurrency

1. `parseMoney("I have 100", { defaultCurrency: "EUR" })` is called
2. Validates EUR is a valid ISO code (via `getCurrencyByCode`)
3. Calls `defaultPipeline.run("I have 100", { defaultCurrency: "EUR" })`
4. **Stage 1** — Negative: none
5. **Stage 2** — Currency: none detected
6. **Stage 3** — Numeric: plain numeric matches `100` → sets `amount: 100`
7. **Post-pipeline** — Applies default currency since none detected
   - `currency = "EUR"`, `currencyWasDefault = true`
8. Returns `{ original: "I have 100", currency: "EUR", amount: 100, currencyWasDefault: true }`

---

## Error Handling

| Scenario | Error | When it happens |
|----------|-------|-----------------|
| Invalid defaultCurrency | `MoneyParseError` | `defaultCurrency` is not a valid ISO-4217 code |
| Number too large | `ValueOverflowError` | Parsed amount exceeds `Number.MAX_SAFE_INTEGER` |

**Important:** Most parse failures return `undefined` values in the result, not errors. The parser is designed to be permissive — it extracts what it can and leaves missing fields undefined.

---

## Testing

**Unit tests cover:**
- `parseMoney()` function with various inputs
- `RegexPipeline` stage execution and ordering
- Default currency logic
- Negative number detection

**Integration tests cover:**
- Full parsing pipeline end-to-end
- All supported pattern types via `test/parseMoney.test.ts`

**To run tests for this feature:**
```bash
npm test -- --testPathPattern="parseMoney|regexPipeline"
```

---

## Known Issues & Tech Debt

- **Stage 4 (`patternSpecificStep`)** is a placeholder with no implementation — could be removed or used for custom regex
- **Currency disambiguation** — when multiple currencies share a symbol (e.g., `$` = USD, CAD, AUD), the pipeline defaults to the first in the list rather than using context
- **No partial matching** — if text contains multiple monetary values, only the first match is returned

---

## Recent Changes

- 2026-03-31: Documentation created to capture pipeline architecture