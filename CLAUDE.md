# numis

> **Master context file. Single source of truth for this project. All docs/ files are modules that extend this. README.md is a public-facing summary derived from this. PRDs live in `.taskmaster/docs/` — use `mcp__task-master-ai__parse_prd` MCP tool to generate tasks.**

---

## 1. Project Identity

**Name:** numis
**Purpose:** Natural-language monetary parser for JavaScript/TypeScript that converts free-form text containing monetary expressions into structured data with `{ amount: number, currency: string }`
**Type:** Library (npm package)
**Primary Users:** JavaScript/TypeScript developers needing to parse monetary values from user input
**Stage:** Production
**Repo:** https://github.com/ritvij14/numis

---

## 2. Tech Stack

> Do not contradict this section anywhere else. If a technology decision changes, update here first.

**Language:** TypeScript
**Runtime / Platform:** Node.js >= 18, modern browsers
**Framework:** None (pure library)
**Package Manager:** npm

**Testing:** Jest

**Key Dependencies:**

- `currency-codes` — ISO-4217 currency code lookups

---

## 3. Repository Structure

> Auto-generated summary of top-level structure. Full tree in `docs/infra/file-tree.md`.
> Updated automatically when top-level directories change.

```
├── .claude
│   ├── commands
│   ├── settings.json
│   └── settings.local.json
├── .forge
├── .github
│   └── workflows
├── .scripts
│   └── update_structure.sh
├── .taskmaster
│   ├── docs
│   ├── reports
│   ├── tasks
│   ├── templates
│   ├── CLAUDE.md
│   ├── config.json
│   └── state.json
├── .windsurf
│   └── rules
├── demo
│   ├── src
│   ├── .DS_Store
│   ├── index.html
│   ├── main.js
│   ├── package-lock.json
│   ├── package.json
│   ├── postcss.config.mjs
│   ├── README.md
│   ├── style.css
│   ├── tailwind.config.js
│   └── vite.config.mjs
├── docs
│   ├── features
│   └── infra
├── scripts
│   ├── generate-tree.sh
│   ├── generateCurrencyFixtures.cjs
│   └── on-session-stop.sh
├── src
│   ├── patterns
│   ├── types
│   ├── .DS_Store
│   ├── currencyData.ts
│   ├── currencyMapBuilder.ts
│   ├── errors.ts
│   ├── index.ts
│   ├── parseAll.ts
│   ├── parseMoney.ts
│   ├── regexPipeline.ts
│   └── types.ts
├── test
│   ├── patterns
│   ├── .DS_Store
│   ├── compare.test.ts
│   ├── currencyData.test.ts
│   ├── decimalMagnitude.test.ts
│   ├── defaultCurrency.test.ts
│   ├── errors.test.ts
│   ├── examplePrompts.test.ts
│   ├── lazyInit.test.ts
│   ├── parseAll.range.test.ts
│   ├── parseAll.test.ts
│   ├── parseMoney.range.test.ts
│   ├── parseMoney.test.ts
│   ├── property.test.ts
│   ├── regexPipeline.test.ts
│   ├── test_cents_only.test.ts
│   └── uncommonCurrencies.test.ts
├── .DS_Store
├── .gitignore
├── CLAUDE.md
├── eslint.config.cjs
├── jest.config.js
├── package-lock.json
├── package.json
├── README.md
├── rollup.config.js
├── sample.html
├── tsconfig.cjs.json
└── tsconfig.json
```

---

## 4. Architecture Overview

> How this system is structured at a high level. For deep dives, see docs/features/ and docs/infra/.

**Pattern:** Regex Pipeline with Extensible Stages

### Core modules and what each owns:

- `src/regexPipeline.ts` — Core three-stage parsing engine
- `src/patterns/` — Individual pattern matchers/parsers for different formats
- `src/currencyData.ts` — ISO-4217 currency lookups
- `src/errors.ts` — Custom error types

**Data flow (parsing a monetary string):**

1. `parseMoney()` receives input string
2. `RegexPipeline` runs currency detection (symbols, ISO codes)
3. Numeric/word detection parses the value
4. Pattern-specific parsing extracts final result
5. Returns `{ amount: number, currency: string }`

---

## 5. Conventions

> Claude must follow these at all times. These are non-negotiable.

### Naming

- Files: kebab-case (e.g., `currencyData.ts`, `regexPipeline.ts`)
- Classes: PascalCase (e.g., `RegexPipeline`, `MoneyParseError`)
- Functions: camelCase (e.g., `parseMoney()`, `matchSymbol()`)

### Code Style

- Write as little code as possible to accomplish the task.
- Only do things you are more than 90% sure about. If unsure, use the AskUserQuestion tool to ask a series of MCQ questions before writing any code.
- No over- complication. Prefer simple, obvious solutions over clever abstractions. If a simpler approach exists, take it.

### Code Structure

- Each pattern type has its own module in `src/patterns/` with `match*` and `parse*` functions
- Public API exports through `src/index.ts`
- Custom errors in `src/errors.ts`

### Module Boundaries

- Never import from another pattern module's internal files. Cross-pattern access goes through public exports in `src/index.ts`.

### Error Handling

- Use custom errors from `src/errors.ts`: `MoneyParseError`, `ValueOverflowError`
- Always return structured results, never throw for parse failures (return null/undefined instead)

### Testing

- Test files co-located in `test/` directory
- Use Jest as test runner
- Test pattern matchers with both valid and invalid inputs

### Debugging

- **NEVER use Node.js `require()` directly on .ts files** — Node.js cannot execute TypeScript files directly
- **For debugging**: Use Jest via `npm test -- --testPathPattern="<pattern>"` to run tests
- **For importing built modules**: Use `dist/cjs/` (CommonJS) or `dist/esm/` (ESM) — these are the compiled outputs
- If you need to inspect runtime behavior, add `console.log` statements to test files and run the test
- Do NOT try `node -e "require('./src/...')"` — this will fail with module resolution errors

### Git

- Branch naming: `feature/*`, `fix/*`, `chore/*`
- Commit format: conventional commits — `feat:`, `fix:`, `chore:`, `docs:`
- Never commit directly to main

---

## 6. Environment & Configuration

**Required environment variables:**
None — this is a library with no runtime configuration.

**Key configuration files:**

- `tsconfig.json` — TypeScript config for ESM
- `tsconfig.cjs.json` — TypeScript config for CJS
- `rollup.config.js` — Bundle configuration for ESM/CJS/UMD
- `eslint.config.cjs` — Linting rules
- `jest.config.js` — Test configuration

---

## 7. Development Setup

> How to get this running from scratch.

```bash
# 1. Install dependencies
npm install

# 2. Run tests
npm test

# 3. Build
npm run build

# 4. Lint
npm run lint
```

**Key scripts:**

- `npm run build` — Clean + ESM + CJS + UMD
- `npm run lint` — Lint src only
- `npm test` — Run all tests
- `npm run dev:demo` — Demo site development
- `npm run build:demo` — Build demo site
- `npm run changeset` — Create changeset for versioning
- `bash scripts/generate-tree.sh` — Regenerate file tree in docs/infra/file-tree.md

---

## 8. Project Requirements (PRDs)

> PRDs live as standalone files in `.taskmaster/docs/`. Task Master parses them directly to generate tasks.
> Never embed requirements in this file — write a PRD document instead.

**How to use PRDs:**

- **Starting a project:** Write your PRD in `.taskmaster/docs/prd.md`, then use `mcp__task-master-ai__parse_prd` MCP tool with path `.taskmaster/docs/prd.md`
- **Adding a feature later:** Write a focused PRD in `.taskmaster/docs/<feature-name>.md`, then use `mcp__task-master-ai__parse_prd` with append mode
- **PRD templates:** See `.taskmaster/templates/` — `example_prd.txt` (simple) and `example_prd_rpg.txt` (detailed with dependency graphs). Use simple for small projects, RPG for complex ones.

**Writing good PRDs:**

- Write requirements as clear functional statements: "Users can filter contacts by tag" — not "The experience should feel intuitive"
- Include explicit dependencies between features — this is what makes Task Master's task ordering accurate
- Keep each PRD focused on one scope (the whole project, or one feature area)

### PRD Index

> For small projects with one PRD, a single row is fine. Add rows as feature PRDs are created.

| PRD        | Scope | Status |
| ---------- | ----- | ------ |
| (none yet) | —     | —      |

---

## 9. Feature Documentation Index

> Each feature has its own doc in docs/features/. Read the relevant doc before working on a feature.
> When a feature doc exceeds ~400 lines, it is promoted to a directory (docs/features/[feature]/).

| Feature       | Doc                       | Status     |
| ------------- | ------------------------- | ---------- |
| Range parsing | (documented in this file) | Production |

### Range Parsing

> Parse monetary range expressions like "$10 - $20", "5 to 10 EUR", "between $100 and $200"

The library supports parsing monetary range expressions through the `parseMoney()` and `parseAll()` functions. Range parsing detects expressions containing two values with a separator between them.

#### parseMoney Options

The `parseMoney()` function accepts an optional `ParseOptions` object:

```typescript
interface ParseOptions {
  /** Default currency to use when none is detected in the input */
  defaultCurrency?: string;
}
```

**Important:** If `defaultCurrency` is not provided, no fallback currency is applied. When a currency is explicitly detected (symbol, ISO code, or name), it always takes precedence over the default.

```typescript
import { parseMoney } from "numis";

// No default - returns undefined currency if none detected
parseMoney("I have 100");
// => { original: "I have 100", amount: 100, currency: undefined }

// With default - uses EUR when no currency detected
parseMoney("I have 100", { defaultCurrency: "EUR" });
// => { original: "I have 100", amount: 100, currency: "EUR", currencyWasDefault: true }

// Detected currency takes precedence over default
parseMoney("$50", { defaultCurrency: "EUR" });
// => { original: "$50", amount: 50, currency: "USD" }
```

#### Supported Range Patterns

**Symbol ranges** — Currency symbols with numeric values:

- `"$500 - $1000"` — hyphen separator
- `"$5–$10"` — en-dash separator
- `"€100 to €200"` — "to" separator
- `"£50 through £100"` — "through" separator

**ISO code ranges** — Currency codes (USD, EUR, GBP):

- `"USD 500 - USD 1000"`
- `"EUR 100 to EUR 200"`

**Magnitude suffix ranges** — Numbers with magnitude suffixes:

- `"10k - 1M"` — k, thousand, m, million, b, billion
- `"5 million to 10 million"`

**Contextual phrase ranges** — Natural language ranges:

- `"between $100 and $200"`
- `"from $50 to $100"`
- `"range of $50 - $100"`

**Worded number ranges** — Written numbers:

- `"ten to twenty dollars"`
- `"one hundred through five hundred euros"`

**Comparison operator ranges** — Less-than or greater-than expressions (treated as inclusive, i.e., `<` = `<=` and `>` = `>=`):
- `"< 30k"` — max: 30000, min: null
- `"> 2 Million"` — min: 2000000, max: null
- `"< 1,000 USD"` — with currency detection
- `"> 50 dollars"` — currency from word

Note: Currency symbol + comparison (e.g., `$< 30k`) is not supported.

#### Output Format

**RangeParseResult** (returned by `matchRange` and `parseRange` in `src/patterns/ranges.ts`):

```typescript
interface RangeParseResult {
  min: number | null; // Minimum value of the range
  max: number | null; // Maximum value of the range
  currency: string | null; // ISO 4217 currency code (e.g., "USD", "EUR")
  raw: string; // Original input string
}
```

**PipelineContext** (returned by `parseMoney()` for ranges):

```typescript
{
  original: string; // Original input
  amount: undefined; // Undefined for ranges (use min/max instead)
  currency: string; // Detected currency code
  isRange: true; // Indicates this is a range
  min: number; // Minimum value
  max: number; // Maximum value
}
```

**MonetaryExpression** (returned by `parseAll()` for ranges):

```typescript
interface MonetaryExpression {
  type: "range"; // Always 'range' for ranges
  raw: string; // Original matched text
  startIndex: number; // Position in input string
  endIndex: number;
  min?: number; // Minimum value
  max?: number; // Maximum value
  currency?: string; // Detected currency
  isRange: true; // Indicates this is a range
}
```

#### Validation Behavior

- **Range validation**: The library validates that `min < max`. If min >= max, the parser returns `null` and falls back to single value parsing (returning just the first value as a regular amount).
- **Currency consistency**: If both values have currency indicators, the first value's currency takes precedence.
- **Invalid ranges**: Return `null` from `parseRange()` / `matchRange()`, fall back to single value in `parseMoney()`.

#### Usage Examples

**parseMoney() with ranges:**

```typescript
import { parseMoney } from "numis";

// Basic range with symbol
const result = parseMoney("$500 - $1000");
// { isRange: true, min: 500, max: 1000, currency: 'USD', amount: undefined }

const result2 = parseMoney("€50 - €100");
// { isRange: true, min: 50, max: 100, currency: 'EUR' }

const result3 = parseMoney("10 to 20 dollars");
// { isRange: true, min: 10, max: 20, currency: 'USD' }

const result4 = parseMoney("50 through 100 USD");
// { isRange: true, min: 50, max: 100, currency: 'USD' }

// Invalid range falls back to single value
const result5 = parseMoney("$1000 - $500");
// { isRange: false, amount: 1000, currency: 'USD' }
```

**parseAll() with ranges:**

```typescript
import { parseAll } from "numis";

const results = parseAll("Price is $50 - $100 or $500");
// [
//   {
//     type: 'range',
//     raw: '$50 - $100',
//     min: 50,
//     max: 100,
//     currency: 'USD',
//     isRange: true,
//     startIndex: 8,
//     endIndex: 19
//   },
//   {
//     type: 'single',
//     raw: '$500',
//     amount: 500,
//     currency: 'USD',
//     isRange: false,
//     startIndex: 23,
//     endIndex: 27
//   }
// ]

// Various range formats
parseAll("The price is €50 to €100");
// [{ type: 'range', min: 50, max: 100, currency: 'EUR', isRange: true }]

parseAll("USD 500 - USD 1000");
// [{ type: 'range', min: 500, max: 1000, currency: 'USD', isRange: true }]

parseAll("between $100 and $200");
// [{ type: 'range', min: 100, max: 200, currency: 'USD', isRange: true }]
```

#### Implementation

- **Main module**: `src/patterns/ranges.ts` — Contains `matchRange()`, `parseRange()`, `matchComparisonOperator()`, `parseComparisonOperator()`, and `parseSingleValue()` functions
- **Integration**: Range and comparison detection is integrated into `src/regexPipeline.ts` for `parseMoney()` and `src/parseAll.ts` for `parseAll()`
- **Range separators**: Regex pattern `/\s*(?:-|–|—|to|through)\s*/i` matches hyphen, en-dash, em-dash, "to", and "through"
- **Comparison operators**: Regex pattern `/^(<|>)(\s*)(.+)/` matches `<` or `>` with optional whitespace and a value

#### Pattern Modules

The library uses individual pattern matchers/parsers located in `src/patterns/`. All public pattern modules are re-exported from `src/index.ts`.

**Publicly exported patterns:**

| Module                     | Exports                                                                                           | Purpose                                          |
| -------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| `abbreviations.ts`         | `matchAbbreviation`, `parseAbbreviation`                                                          | ISO currency codes (USD, EUR, etc.) with amounts |
| `contextualPhrases.ts`     | `matchContextualPhrase`, `parseContextualPhrase`                                                  | Natural language ("100 dollars", "50 euros")     |
| `minorUnitsOnly.ts`        | `matchMinorUnitOnly`, `parseMinorUnitOnly`                                                        | Cents/pence only ("75 cents", "50 pence")        |
| `numericWordCombos.ts`     | `matchNumericWordCombo`, `parseNumericWordCombo`                                                  | Magnitude suffixes ("10k", "5M", "2bn")          |
| `numbersWithSeparators.ts` | `matchNumberWithSeparators`, `parseNumberWithSeparators`                                          | Numbers with thousand separators                 |
| `plainNumbers.ts`          | `matchPlainNumber`, `parsePlainNumber`                                                            | Simple numeric values                            |
| `ranges.ts`                | `matchRange`, `parseRange`, `matchComparisonOperator`, `parseComparisonOperator`, `parseSingleValue` | Range and comparison expressions ("$10 - $20", "< 30k") |
| `regionalFormats.ts`       | `detectRegionalFormat`, `isValidRegionalFormat`, `matchRegionalFormat`, `normalizeRegionalNumber` | Locale-specific formats ("1.234,56 €")           |
| `symbols.ts`               | `matchSymbol`, `parseSymbol`                                                                      | Currency symbols ("$", "€", "£")                 |

**Internal-only patterns** (used internally but not exported as public API):

| Module               | Purpose                                                   |
| -------------------- | --------------------------------------------------------- |
| `negativeNumbers.ts` | Detects negative indicators ("minus $50", "negative 100") |
| `slangTerms.ts`      | Slang currency terms ("buck", "quid", "fiver", "tenner")  |
| `wordedNumbers.ts`   | Fractional worded numbers ("half", "three quarters")      |

#### MONETARY_PATTERNS

The `parseAll()` function uses an ordered array of `MonetaryPattern` objects to find all monetary expressions in text. This array is exported as `MONETARY_PATTERNS` for inspection and extensibility.

```typescript
import { MONETARY_PATTERNS, MonetaryPattern } from "numis";

// View all patterns
console.log(MONETARY_PATTERNS.map((p) => p.type));
// ['symbolRange', 'isoCodeRange', 'magnitudeRange', 'magnitudeRangeRightOnly',
//  'contextualRange', 'comparison', 'symbol', 'isoCode', 'magnitude', 'contextual']
```

Range patterns are placed before single-value patterns to ensure ranges are detected as complete expressions.

---

## 10. Infrastructure Documentation Index

> Cross-cutting infrastructure docs. Referenced by feature docs when needed.

| Topic                  | Doc                                                |
| ---------------------- | -------------------------------------------------- |
| File tree              | [docs/infra/file-tree.md](docs/infra/file-tree.md) |
| Architecture decisions | [docs/infra/decisions.md](docs/infra/decisions.md) |
| Changelog              | [docs/infra/changelog.md](docs/infra/changelog.md) |
| Testing                | [test/README.md](test/README.md)                   |

---

## 11. Working With Claude Code

> Instructions Claude must follow in every session.
> Task Master command reference is in `.taskmaster/CLAUDE.md` (auto-imported below).
> This section covers project-specific session rules only.

**At the start of every session:**

1. Read this file fully
2. Use `mcp__task-master-ai__next_task` to understand what to work on (if tasks exist)

**Before starting any task:**

- If `.taskmaster/reports/task-complexity-report.json` does not exist and tasks exist, consider using `mcp__task-master-ai__analyze_project_complexity`

**New Chat Session Rule:**
Before exploring code or doing any work in a fresh chat session, read this file and the key feature documentation first. Do NOT use explore tools immediately — use the documentation to understand the codebase first.

**Documentation Discrepancy = Urgent:**
If you discover any documentation that contradicts actual code behavior, STOP immediately and report to user. This is high-priority — fix the documentation before anything else. Do not continue working on any other task until resolved.

**During a session:**

- Update task status via TaskMaster as work progresses - do not leave tasks in stale states
- The file tree hook will auto-update docs/infra/file-tree.md
- The moment you discover something that changes how a future task should be implemented, stop and use `mcp__task-master-ai__update` with the task ID and prompt BEFORE continuing. Do not defer this. Stale task descriptions compound.

**Failure Recovery (3-Retry Limit):**
If any tool, command, MCP tool, skill, or sub-agent fails 3 times in a single chat, even if they are separate tools, 3 failures in the same chat session, STOP immediately:

1. Delete `.claude/session-changed` to cancel pending stop hooks
2. Do NOT invoke /wrap-up
3. Report to user: "Hit 3-retry limit on [operation]. Need your help to proceed. Note: I've cleared session-changed — once resolved, remind me to recreate it for documentation review at session end."
4. Wait for user input — do not attempt anything else.

**At the end of every session:**

- Mark completed tasks done: use `mcp__task-master-ai__set_task_status` with status "done"
- Update any future tasks affected by discoveries made this session
- The file tree hook will auto-update docs/infra/file-tree.md
- Run `/wrap-up` to complete documentation review and clear hooks

---

## Task Master AI Instructions

**Import Task Master's command reference and guidelines. Treat as part of this file.**
@./.taskmaster/CLAUDE.md
