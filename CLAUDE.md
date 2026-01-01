# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

monet is a natural-language monetary parser for JavaScript/TypeScript. It converts free-form text containing monetary expressions into structured data with `{ amount: number, currency: string }`. The library targets Node >= 18 and modern browsers with dual ESM/CJS builds.

## Commands

```bash
# Build (clean + ESM + CJS + UMD)
npm run build

# Lint (src only, test excluded)
npm run lint

# Run all tests
npm test

# Run a single test file
npx jest test/patterns/symbols.test.ts

# Run tests matching a pattern
npx jest --testNamePattern="slang"

# Demo site development
npm run dev:demo

# Build demo site
npm run build:demo

# Create a changeset for versioning
npm run changeset
```

## Architecture

### Regex Pipeline (`src/regexPipeline.ts`)

The core parsing engine uses a three-stage pipeline:

1. **Currency Detection** - Scans for currency symbols (`$`, `€`, `£`, etc.) or ISO-4217 codes first for performance
2. **Numeric/Word Detection** - Parses numeric values including worded numbers ("one hundred"), slang ("buck"), and combos ("10k")
3. **Pattern-Specific Parsing** - Extensible stage for additional pattern matching

`RegexPipeline` orchestrates `PipelineStep` functions that transform a `PipelineContext`. Each step receives the original input and current context, returning an updated context. Steps should clone the context rather than mutate it.

```ts
// Using the default pipeline
const pipeline = RegexPipeline.default();
const result = pipeline.run("I paid $10");
// => { original: "I paid $10", currency: "USD", amount: 10 }

// Adding custom steps
const custom = RegexPipeline.default().addStep(myCustomStep);
```

### Pattern Parsers (`src/patterns/`)

Each pattern type has its own module with `match*` and `parse*` functions:

- `plainNumbers.ts` - "123"
- `numbersWithSeparators.ts` - "1,234.56"
- `symbols.ts` - "$100", "€50"
- `abbreviations.ts` - "USD 100", "50 EUR"
- `wordedNumbers.ts` - "one hundred dollars", "half a dollar"
- `numericWordCombos.ts` - "10k", "5m"
- `slangTerms.ts` - "buck", "quid", "fiver"
- `contextualPhrases.ts` - "a hundred dollars", "a dollar and 23 cents"

### Currency Data (`src/currencyData.ts`)

Wraps the `currency-codes` package for ISO-4217 currency lookups. The regex pipeline builds lazy-initialized lookup maps for currency names/symbols to codes.

### Public API (`src/index.ts`)

Exports `parseMoney()` as the main entry point, plus individual pattern matchers/parsers and the `RegexPipeline` class for custom pipelines.

### Custom Errors (`src/errors.ts`)

- `MoneyParseError` - Base error for parsing failures
- `ValueOverflowError` - When amount exceeds `Number.MAX_SAFE_INTEGER`

## Build Outputs

- `dist/esm/` - ES modules
- `dist/cjs/` - CommonJS modules
- `dist/umd/monet-js.min.js` - Minified UMD bundle for browser/demo

## Releasing

Uses Changesets for automated semantic versioning:
1. Run `npm run changeset` in feature branch
2. Commit the generated `.changeset/` file
3. Merge PR to main
4. GitHub Actions creates a "Version Packages" PR
5. Merging that PR publishes to npm

## Task Management

This project uses Taskmaster for task tracking. Check `.taskmaster/tasks/tasks.json` for current tasks and `.taskmaster/docs/monet_spec.md` for the full specification.
