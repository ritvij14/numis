# numis

Natural-language monetary parser for JavaScript/TypeScript.

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

- Plain numbers, numbers with separators, symbols (e.g., `$100`, `1,234.56`)
- ISO abbreviations (e.g., `USD 100`, `50 EUR`)
- Worded numbers (e.g., `one hundred dollars`)
- Fractional magnitudes (e.g., `quarter million dollars`, `half of a billion euros`)
- Numeric-word combos (e.g., `10k`)
- Slang terms (e.g., `buck`, `quid`, `fiver`, `tenner`)
- Contextual phrases, including compound major+minor amounts:
  - `a hundred dollars`
  - `the fifty euros`
  - `a quarter million dollars` → $250,000
  - `half a billion euros` → €500,000,000
  - `two thirds of a million pounds` → £666,666.67
  - `a dollar and 23 cents`
  - `five euros and fifty cents`
  - `10 pounds and 5 pence`

### GitHub Pages Demo

The demo site is automatically deployed to GitHub Pages on every push to `main`:

- **Live URL:** https://numis.ritvij.dev
- **Automatic:** Triggered on `main` branch pushes
- **Manual trigger:** Use GitHub Actions "Deploy Demo to GitHub Pages" workflow for on-demand deployments
