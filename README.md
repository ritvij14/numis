# numis

Natural-language parser for monetary and numeric values. Parse money from text like a human would read it.

```ts
// "I paid $20 for lunch" → { amount: 20, currency: "USD" }
// "Cost was fifty quid" → { amount: 50, currency: "GBP" }
```

## Getting Started

```bash
npm install numis
```

```ts
import { parseMoney } from "numis";

parseMoney("$12.50");
// => { original: "$12.50", currency: "USD", amount: 12.5 }
```

## Options

### Default Currency

When parsing text that contains a numeric amount but no currency indicator, you can specify a default currency to use:

```ts
import { parseMoney } from "numis";

// Without default currency - no currency in result
parseMoney("I have 100");
// => { original: "I have 100", amount: 100, currency: undefined }

// With default currency
parseMoney("I have 100", { defaultCurrency: "EUR" });
// => { original: "I have 100", amount: 100, currency: "EUR", currencyWasDefault: true }

// Detected currency always takes precedence over default
parseMoney("$50", { defaultCurrency: "EUR" });
// => { original: "$50", amount: 50, currency: "USD" }
```

The `defaultCurrency` option accepts any valid [ISO-4217](https://en.wikipedia.org/wiki/ISO_4217) currency code (e.g., `"USD"`, `"EUR"`, `"GBP"`, `"JPY"`). An invalid code will throw a `MoneyParseError`.

The result includes a `currencyWasDefault` flag (set to `true`) when the default currency was applied, helping you distinguish between detected and defaulted currencies.

## Supported Patterns (high level)

- **Plain numbers and separators**: `$100`, `1,234.56` — Basic numeric formats with or without thousand separators
- **ISO codes**: `USD 100`, `50 EUR` — Standard 3-letter currency codes before or after amounts
- **Worded numbers**: `one hundred dollars` — Write out numbers in words instead of digits
- **Fractional magnitudes**: `quarter million dollars`, `half of a billion euros` — Fractions like "quarter" or "two thirds" with magnitude words
- **Numeric-word combos**: `10k`, `$5m`, `2.5 billion` — Numbers with k/m/b suffixes for thousands, millions, billions
- **Slang terms**: `buck`, `quid`, `fiver`, `tenner` — Informal currency terms (bucks for dollars, quid for pounds)
- **Contextual phrases**: Compound amounts and article-based phrases:
  - `a hundred dollars` — Articles like "a" or "the" with amounts
  - `the fifty euros` —
  - `a quarter million dollars` → $250,000
  - `half a billion euros` → €500,000,000
  - `two thirds of a million pounds` → £666,666.67
  - `a dollar and 23 cents` — Major and minor unit combinations
  - `five euros and fifty cents` —
  - `10 pounds and 5 pence` —

## API Reference

### `parseMoney(text, options?)`

Extracts a monetary value from your text.

**Parameters:**
- `text` (string): The text to parse
- `options.defaultCurrency` (string, optional): ISO-4217 currency code to use when no currency is detected (e.g., `"USD"`, `"EUR"`)

**Returns:**
```ts
{
  original: string;      // The original input text
  currency?: string;     // ISO-4217 currency code (e.g., "USD", "EUR")
  amount?: number;       // The numeric value
  currencyWasDefault?: boolean;  // true if defaultCurrency was used
}
```

**Examples:**

```ts
// Basic parsing
parseMoney("The total is $49.99");
// => { original: "The total is $49.99", currency: "USD", amount: 49.99 }

// With default currency
parseMoney("I have 100", { defaultCurrency: "EUR" });
// => { original: "I have 100", amount: 100, currency: "EUR", currencyWasDefault: true }

// Detected currency takes precedence over default
parseMoney("£50", { defaultCurrency: "EUR" });
// => { original: "£50", amount: 50, currency: "GBP" }
```

## Common Gotchas

### Numbers That Are Too Large

JavaScript can't safely handle integers larger than `Number.MAX_SAFE_INTEGER` (about 9 quadrillion). If you try to parse a number that's too big, numis will throw a `ValueOverflowError` instead of giving you incorrect data.

```ts
import { ValueOverflowError } from "numis";

try {
  parseMoney("$999999999999999999");
} catch (err) {
  if (err instanceof ValueOverflowError) {
    console.log("That number is too large!");
  }
}
```

### Text Without Currency Indicators

If your text only has plain numbers without any currency symbols, codes, or words, the parser won't know what currency to use.

```ts
// No currency detected
parseMoney("I have 100");
// => { original: "I have 100", amount: 100, currency: undefined }

// Use defaultCurrency option to handle this
parseMoney("I have 100", { defaultCurrency: "USD" });
// => { original: "I have 100", amount: 100, currency: "USD", currencyWasDefault: true }
```

### Ambiguous Number Formats

Some number formats can be ambiguous. For example, `"1.500"` could mean:
- 1.5 (one and a half) in US/UK format
- 1,500 (one thousand five hundred) in European format

When numis encounters ambiguous formats, it uses currency context to make an educated guess:

```ts
parseMoney("€1.500");  // European currency → interprets as 1,500 euros
parseMoney("$1.500");  // US currency → could be ambiguous, interprets as 1.5 dollars

// Less ambiguous formats work as expected:
parseMoney("€1.500,00");  // Clearly European format → 1,500.00 euros
parseMoney("$1,500.00");  // Clearly US format → 1,500.00 dollars
```

When in doubt, use unambiguous formats with both thousand separators and decimal points.

## Upcoming Features

### Monetary Range Parsing

Support for parsing monetary ranges is coming soon. This will enable the parser to extract min/max values from expressions like:

- `$500 - $1000`
- `200k - 1M USD`
- `between €50 and €100`
- `five to ten dollars`

The output will include `isRange`, `min`, and `max` fields to represent the range boundaries.

### GitHub Pages Demo

The demo site is automatically deployed to GitHub Pages on every push to `main`:

- **Live URL:** https://numis.ritvij.dev
- **Automatic:** Triggered on `main` branch pushes
- **Manual trigger:** Use GitHub Actions "Deploy Demo to GitHub Pages" workflow for on-demand deployments
