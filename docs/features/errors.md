# Feature: Errors

> **Module doc for error handling.** Read this before modifying `src/errors.ts`.
> Part of: numis — see CLAUDE.md for full project context.
> Status: Stable
> Last updated: 2026-03-31

---

## What This Feature Does

Defines custom error types for the library. Provides clear error semantics so callers can distinguish between configuration errors (invalid options) and data errors (overflow).

---

## Files & Ownership

```
src/
└── errors.ts   # MoneyParseError, ValueOverflowError
```

**What lives here vs. elsewhere:**
- Error definitions → `errors.ts` only
- Throwing code → `parseMoney.ts`, `regexPipeline.ts`, `patterns/*`

---

## Error Types

### MoneyParseError

Thrown when the caller provides invalid configuration.

```typescript
class MoneyParseError extends Error {
  constructor(message: string, public readonly input?: string) {
    super(message);
    this.name = "MoneyParseError";
  }
}
```

**When thrown:**
| Scenario | Example |
|----------|---------|
| Invalid `defaultCurrency` | `parseMoney("test", { defaultCurrency: "XXX" })` |

**Usage:**
```typescript
import { parseMoney, MoneyParseError } from "numis";

try {
  parseMoney("test", { defaultCurrency: "INVALID" });
} catch (err) {
  if (err instanceof MoneyParseError) {
    console.log(err.message); // "Invalid defaultCurrency: "INVALID" is not a valid ISO-4217 currency code"
    console.log(err.input);   // undefined (not set for this error type)
  }
}
```

### ValueOverflowError

Thrown when a parsed number exceeds JavaScript's safe integer limit.

```typescript
class ValueOverflowError extends Error {
  constructor(message: string, public readonly value?: number) {
    super(message);
    this.name = "ValueOverflowError";
  }
}
```

**When thrown:**
| Scenario | Example |
|----------|---------|
| Number too large | `parseMoney("$999999999999999999")` |

**JavaScript limit:** `Number.MAX_SAFE_INTEGER` ≈ 9 quadrillion (9007199254740991)

**Usage:**
```typescript
import { parseMoney, ValueOverflowError } from "numis";

try {
  parseMoney("$999999999999999999");
} catch (err) {
  if (err instanceof ValueOverflowError) {
    console.log(err.message); // "Number 1e18 exceeds maximum safe integer (9007199254740991)"
    console.log(err.value);   // 999999999999999999
  }
}
```

---

## Error Semantics

**Important:** The parser is designed to be **permissive**. Most parse failures return `undefined` values in the result, not errors:

```typescript
parseMoney("no money here");
// => { original: "no money here", amount: undefined, currency: undefined }
// No error thrown!
```

**Errors are only thrown for:**
1. **Configuration errors** — caller passed invalid options (`MoneyParseError`)
2. **Data limits** — parsed value exceeds JavaScript limits (`ValueOverflowError`)

**Not errors (return partial/undefined result):**
- No amount found → `amount: undefined`
- No currency found → `currency: undefined` (unless `defaultCurrency` provided)
- Invalid pattern → returns what was matched, ignores rest

---

## Throwing Locations

| File | Error Type | When |
|------|------------|------|
| `parseMoney.ts` | `MoneyParseError` | `defaultCurrency` is not valid ISO-4217 |
| `regexPipeline.ts` | `ValueOverflowError` | Worded number exceeds MAX_SAFE_INTEGER |
| `patterns/symbols.ts` | `ValueOverflowError` | Parsed amount exceeds MAX_SAFE_INTEGER |
| `patterns/wordedNumbers.ts` | `ValueOverflowError` | Worded number exceeds MAX_SAFE_INTEGER |
| `patterns/numericWordCombos.ts` | `ValueOverflowError` | Multiplied result exceeds MAX_SAFE_INTEGER |

---

## Dependencies

**This feature depends on:**
- None — pure TypeScript error classes

**Other features that depend on this:**
- All modules that can throw errors import from here

---

## Testing

**Tests cover:**
- `test/errors.test.ts` — Both error types, instanceof checks, message contents

**Test patterns:**
- Invalid defaultCurrency throws MoneyParseError
- Overflow throws ValueOverflowError
- Other parse failures do NOT throw (return partial result)

**To run:**
```bash
npm test -- --testPathPattern="errors"
```

---

## Known Issues & Tech Debt

- **No error codes** — currently only messages. Could add machine-readable codes for programmatic handling.
- **No error recovery** — once an error is thrown, caller cannot recover and retry with modified input

---

## Recent Changes

- 2026-03-31: Documentation created to capture error semantics