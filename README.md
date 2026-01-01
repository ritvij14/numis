# Monet.js

Natural-language monetary parser for JavaScript/TypeScript.

## Getting Started

```bash
npm install monet
```

```ts
import { parseMoney } from "monet";

parseMoney("$12.50");
// => { value: 12.5, currency: 'USD' }
```

## Supported Patterns (high level)

- Plain numbers, numbers with separators, symbols (e.g., `$100`, `1,234.56`)
- ISO abbreviations (e.g., `USD 100`, `50 EUR`)
- Worded numbers (e.g., `one hundred dollars`)
- Numeric-word combos (e.g., `10k`)
- Slang terms (e.g., `buck`, `quid`, `fiver`, `tenner`)
- Contextual phrases, including compound major+minor amounts:
  - `a hundred dollars`
  - `the fifty euros`
  - `a dollar and 23 cents`
  - `five euros and fifty cents`
  - `10 pounds and 5 pence`

## Publishing

### Manual Publishing to NPM

1. Update the version in `package.json` manually
2. Commit and push your changes
3. Run `npm run publish:npm` to publish the package

### GitHub Pages Demo

The demo site is automatically deployed to GitHub Pages on every push to `main`:
- **Live URL:** https://ritvij14.github.io/monet-js/
- **Automatic:** Triggered on `main` branch pushes
- **Manual trigger:** Use GitHub Actions "Deploy Demo to GitHub Pages" workflow for on-demand deployments
