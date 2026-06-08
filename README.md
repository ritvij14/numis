# numis

[![npm version](https://img.shields.io/npm/v/numis.svg)](https://www.npmjs.com/package/numis)

Natural-language parser for monetary values. Extract money from text like a human would read it.

---

## Quick Start

```bash
npm install numis
```

```ts
import { parseMoney } from "numis";

parseMoney("$12.50");
// => { original: "$12.50", amount: 12.5, currency: "USD" }
```

**Works in:**
- Node.js >= 18
- Modern browsers (ESM and CJS)

---

## Features

### Single Values

Extract one monetary value from text:

```ts
parseMoney("The total is $49.99");
// => { original: "The total is $49.99", amount: 49.99, currency: "USD" }
```

### Multiple Values

Extract **all** monetary values from text:

```ts
import { parseAll } from "numis";

parseAll("Price is $100-$200 or $500");
// => [
//     { type: 'range', min: 100, max: 200, currency: 'USD', isRange: true },
//     { type: 'single', amount: 500, currency: 'USD', isRange: false }
//   ]
```

---

## Supported Formats

### Symbols
`$100`, `€50`, `£20.50`, `¥1000`, `₹500`

### ISO Codes
`USD 100`, `50 EUR`, `GBP 20.50`

### Magnitude Suffixes
`10k`, `$5m`, `2.5 billion`, `500k EUR`

### Worded Numbers
`one hundred dollars`, `fifty euros`, `half a million`

### Fractional Magnitudes
`quarter million dollars`, `half a billion euros`, `two thirds of a million`

### Slang Terms
`buck`, `quid`, `fiver` (5), `tenner` (10), `grand` (1000)

### Minor Units Only
`75 cents`, `50 pence`, `a quarter`

### Compound Expressions
`a dollar and 23 cents`, `five euros and fifty cents`

### Regional Formats
`€1.234,56` (European), `1'234.56 CHF` (Swiss), `R$150` (Brazilian)

### Negative Values
`-$100`, `($50)`, `-€25.99`

### Ranges
`$500 - $1000`, `€50 to €100`, `between $100 and $200`, `10k to 20k`

### Comparison Bounds
`< 30k` (max: 30000), `> 2 Million USD` (min: 2000000)

---

## API Reference

### parseMoney(text, options?)

Extracts **one** monetary value from text.

**Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `text` | string | The text to parse |
| `options.defaultCurrency` | string | ISO-4217 code when none detected (e.g., `"USD"`) |

**Returns:**
```ts
{
  original: string;           // Original input text
  amount?: number;            // Parsed amount
  currency?: string;          // ISO-4217 code (e.g., "USD", "EUR")
  currencyWasDefault?: boolean; // true if currency came from defaultCurrency option
  isRange?: boolean;          // true if value is a range
  min?: number;               // Minimum (for ranges)
  max?: number;               // Maximum (for ranges)
  isNegative?: boolean;        // true if amount is negative
}
```

**Examples:**
```ts
// Basic
parseMoney("$50");
// => { original: "$50", amount: 50, currency: "USD" }

// Range
parseMoney("$500 - $1000");
// => { original: "$500 - $1000", isRange: true, min: 500, max: 1000, currency: "USD" }

// Default currency
parseMoney("I have 100", { defaultCurrency: "EUR" });
// => { original: "I have 100", amount: 100, currency: "EUR", currencyWasDefault: true }

// Negative
parseMoney("-$50");
// => { original: "-$50", amount: -50, currency: "USD", isNegative: true }
```

---

### parseAll(text)

Extracts **all** monetary values from text.

**Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `text` | string | The text to search |

**Returns:** `MonetaryExpression[]`

```ts
interface MonetaryExpression {
  type: "single" | "range";
  raw: string;                // Matched text
  startIndex: number;       // Position in input
  endIndex: number;
  amount?: number;           // For single values
  min?: number;              // For ranges
  max?: number;              // For ranges
  currency?: string;         // ISO-4217 code
  isRange?: boolean;
}
```

**Examples:**
```ts
// Multiple values
parseAll("Base: $100, shipping: $10-$20, tax: $8");
// => [
//     { type: 'single', raw: '$100', amount: 100, currency: 'USD' },
//     { type: 'range', raw: '$10-$20', min: 10, max: 20, currency: 'USD' },
//     { type: 'single', raw: '$8', amount: 8, currency: 'USD' }
//   ]

// Mixed currencies
parseAll("$100 USD or €50 EUR");
// => [
//     { type: 'single', amount: 100, currency: 'USD' },
//     { type: 'single', amount: 50, currency: 'EUR' }
//   ]
```

---

## Options

### defaultCurrency

Use when your text has amounts but no currency indicator:

```ts
// No currency detected
parseMoney("I have 100");
// => { original: "I have 100", amount: 100, currency: undefined }

// With default
parseMoney("I have 100", { defaultCurrency: "USD" });
// => { original: "I have 100", amount: 100, currency: "USD", currencyWasDefault: true }

// Detected currency beats default
parseMoney("$50", { defaultCurrency: "EUR" });
// => { original: "$50", amount: 50, currency: "USD" }
```

---

## Errors

### MoneyParseError

Thrown when you pass an invalid `defaultCurrency`:

```ts
import { MoneyParseError } from "numis";

try {
  parseMoney("test", { defaultCurrency: "INVALID" });
} catch (err) {
  if (err instanceof MoneyParseError) {
    console.log(err.message);
    // => "Invalid defaultCurrency: "INVALID" is not a valid ISO-4217 currency code"
  }
}
```

### ValueOverflowError

Thrown when a number exceeds JavaScript's safe integer limit (~9 quadrillion):

```ts
import { ValueOverflowError } from "numis";

try {
  parseMoney("$999999999999999999");
} catch (err) {
  if (err instanceof ValueOverflowError) {
    console.log("Number too large!");
  }
}
```

---

## Common Gotchas

### No Currency in Text

Plain numbers without currency symbols/codes/names return `currency: undefined`:

```ts
parseMoney("I have 100");
// => { original: "I have 100", amount: 100, currency: undefined }
```

Use `defaultCurrency` option to handle this.

### Input Length Limit

For performance and security, `parseMoney()` and `parseAll()` reject inputs longer than 5000 characters:

```ts
parseMoney("a".repeat(5001));
// throws MoneyParseError: Input length (5001) exceeds maximum allowed (5000).
```

This prevents ReDoS (Regular Expression Denial of Service) attacks on pathological inputs.

### Ambiguous Formats

`"1.500"` could be 1.5 (US) or 1,500 (European):

```ts
parseMoney("€1.500");  // European symbol → 1,500
parseMoney("$1.500");  // US symbol → 1.5
```

Use clear formats: `$1,500.00` or `€1.500,00`.

---

## Demo

Try it live: [https://numis.ritvij.dev](https://numis.ritvij.dev)

The demo site is a Vite + React SPA optimized for search engine and AI crawler visibility:

- **Structured data** — JSON-LD schema for `SoftwareApplication` and `WebSite` (Google Rich Results compatible)
- **Open Graph / Twitter Cards** — Social sharing previews with title, description, and OG image
- **`<noscript>` fallback** — Full documentation content embedded as static HTML for crawlers without JavaScript
- **`robots.txt`** — Explicit `Allow` directives for AI crawlers (GPTBot, ClaudeBot, PerplexityBot)
- **`llms.txt`** — Attribution file for LLM ingestion
- **Preload hints** — `dns-prefetch` and `modulepreload` for faster loading
- **Build-time injection** — `scripts/inject-noscript.cjs` keeps the `<noscript>` block in sync with the React documentation component automatically

---

## License

MIT
