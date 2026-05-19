# Changelog

> Session-by-session record of changes to the project.

---

## 2026-04-06 — Add comparison operator parsing (< and >)

**Changed:** src/patterns/ranges.ts, src/regexPipeline.ts, src/parseAll.ts, src/index.ts, test/compare.test.ts
**Why:** Users requested support for parsing comparison expressions like "< 30k" and "> 2 million" where one bound is null. Treated as inclusive (< = <=, > = >=).

**How:**
1. Added `matchComparisonOperator()` and `parseComparisonOperator()` to src/patterns/ranges.ts
2. Added `comparisonDetectionStep` pipeline step in src/regexPipeline.ts (runs before range detection)
3. Added "comparison" pattern to MONETARY_PATTERNS in src/parseAll.ts
4. Exported new functions from src/index.ts
5. Added test file test/compare.test.ts - all tests pass (13,111 total)
6. Note: Currency symbol + comparison (e.g., "$< 30k") is intentionally NOT supported

---

## 2026-04-06 — Fix magnitude-right-only range parsing bugs

**Changed:** src/parseAll.ts, src/patterns/ranges.ts
**Why:** Two bugs in range parsing: (1) "1-3 Million dirhams" and "5 to 10 million euros" weren't being detected by parseAll() because findRangeMatches() lacked a strategy for magnitude-on-right-only patterns; (2) magnitude from the second value wasn't being applied to the first, causing "1-3 Million" to parse as min=1 instead of min=10000000

**How:**
1. Added Strategy 5 to findRangeMatches() in src/parseAll.ts to detect "X-Y [magnitude] [currency]" patterns
2. Moved strategy before plain number ranges to prevent premature matching of "5 to 10" before "5 to 10 million"
3. Fixed parseRange() in src/patterns/ranges.ts to detect magnitude on first part using `\b` anchor (anywhere) instead of `^\s*` (start only), so "from 5k" correctly detects the "k" magnitude
4. Removed unused RANGE_SEPARATOR constant from src/parseAll.ts
5. All 1303 tests pass

---

## 2026-04-05 — Documentation sync: fix discrepancies, export numericWordCombos

**Changed:** src/types.ts, src/index.ts, CLAUDE.md, docs/features/patterns.md
**Why:** Code analysis revealed documentation gaps: ParseOptions defaultCurrency said @default "USD" but actually defaults to undefined; numericWordCombos module used internally but not exported; MONETARY_PATTERNS undocumented.
**How:**
1. Fixed src/types.ts JSDoc - changed @default "USD" to @default "undefined (no fallback applied)"
2. Exported NumericWordComboParseResult, matchNumericWordCombo, parseNumericWordCombo from index.ts
3. Added parseMoney Options section to CLAUDE.md with code examples showing defaultCurrency behavior
4. Added Pattern Modules section documenting all 9 public and 3 internal-only patterns
5. Added MONETARY_PATTERNS documentation explaining pattern array and ordering
6. All 13,000 tests pass

---

## 2026-04-05 — Fix browser compatibility: "require is not defined" error

**Changed:** src/regexPipeline.ts, test/lazyInit.test.ts
**Why:** Parsing "100 - 200 usd" in the demo website threw "Error: require is not defined" because rangeDetectionStep used `require()` for lazy loading, which doesn't exist in browsers.
**How:**
1. Replaced `require("./patterns/ranges")` with top-level import of `matchRange`
2. Updated lazyInit.test.ts to reflect earlier currency data loading (acceptable trade-off for browser compatibility)
3. All 1300 tests pass

---

## 2026-04-05 — Update CLAUDE.md with range parsing documentation

**Changed:** CLAUDE.md
**Why:** Task 74 - Document the range parsing feature
**How:** Added comprehensive range parsing documentation including supported patterns, output format, validation behavior, and usage examples for parseMoney() and parseAll()

---

## 2026-04-05 — Add worded number range tests, run test suite and build

**Changed:** test/patterns/ranges.test.ts, dist/
**Why:** Tasks 65, 72, 73 - Add worded number range tests, verify all tests pass, run build
**How:**
1. Added 14 test cases for worded number ranges ("five to ten dollars", "one hundred to two hundred euros")
2. Full test suite passes: 1300 tests across 25 test suites
3. Build succeeds with no errors - ESM/CJS/UMD bundles generated
4. Range parsing exports (RangeParseResult, matchRange, parseRange) included in built output

---

## 2026-04-05 — Add ISO code, magnitude suffix, and slang term range tests

**Changed:** test/patterns/ranges.test.ts
**Why:** Tasks 62, 63, 64 - Add unit tests for ISO code ranges, magnitude suffix ranges, and slang term ranges
**How:**
1. Added 12 test cases for ISO code ranges (currency codes before/after range: "USD 100-200", "100-200 EUR")
2. Added 36 test cases for magnitude suffix ranges ("10k-20k", "200k-1M", "1M-2M", "$10k-$20k", "10k-20k USD")
3. Added 22 test cases for slang term ranges ("500 to 1000 bucks", "50-100 quid", "five to ten bucks", "fiver", "tenner", "grand")
4. All 1264+ tests pass

---

## 2026-04-05 — Add contextual, mixed format range tests and demo updates

**Changed:** test/patterns/ranges.test.ts, demo/src/examplePromptsData.js, demo/src/App.jsx
**Why:** Tasks 66, 67, 71 - Add tests for contextual phrase ranges, mixed format ranges, and update demo site with range examples
**How:**
1. Added 26 test cases for contextual phrase ranges ("from X to Y", "anywhere from X to Y") - these work; "between X and Y" needs "and" as separator
2. Added 21 test cases for mixed format ranges (different magnitudes, worded + numeric, symbol on one side, slang terms)
3. Added 10 range examples to demo site: "$500 to $1000", "200k - 1M USD", "between 50 and 100 euros", etc.
4. Updated demo output panel to display isRange, min, max fields with purple info banner

---

## 2026-04-05 — Add comprehensive test coverage for range parsing

**Changed:** test/patterns/ranges.test.ts, test/parseMoney.range.test.ts, test/parseAll.range.test.ts
**Why:** Tasks 68-70 - Add unit and integration tests for range validation errors, parseMoney() with ranges, and parseAll() with ranges
**How:**
1. Added 21 validation error tests to ranges.test.ts covering min > max errors, same values (min == max), currency mismatches, overflow checks
2. Created parseMoney.range.test.ts with 43 integration tests covering isRange flag, min/max values, amount undefined for ranges, currency detection, defaultCurrency option, magnitude suffixes, worded numbers, contextual phrases
3. Created parseAll.range.test.ts with 49 integration tests covering single/multiple ranges in text, start/end indices, mixed with single values, different formats
4. All 1178 tests pass

---

## 2026-04-05 — Add parseAll function with MONETARY_PATTERNS array

**Changed:** src/parseAll.ts (new), src/index.ts, docs/features/patterns.md
**Why:** Tasks 59-61 - Add ability to parse all monetary expressions in text including ranges as single expressions
**How:**
1. Created src/parseAll.ts with MONETARY_PATTERNS array containing range patterns BEFORE single-value patterns
2. Added parseAll function that finds all monetary expressions in text
3. Range patterns cover: symbol ranges ($500-$1000), ISO code ranges (USD 500-USD 1000), magnitude ranges (10k-1M), contextual ranges (between $100 and $200)
4. Exported matchRange, parseRange, parseAll, MonetaryExpression, MonetaryPattern, MONETARY_PATTERNS, RangeParseResult from index.ts
5. Updated docs/features/patterns.md with parseAll.ts documentation

---

## 2026-04-05 — Implement range detection pipeline integration

**Changed:** src/regexPipeline.ts, docs/features/patterns.md, docs/infra/decisions.md
**Why:** Tasks 56-58 - Integrate range detection into the RegexPipeline to enable parsing monetary ranges like "$10 - $20" or "50 to 100 USD"
**How:** 
1. Extended PipelineContext with isRange, min, max fields
2. Created rangeDetectionStep that runs before numericDetectionStep
3. Updated numericDetectionStep to skip when ctx.isRange is true (prevents double processing)
4. Used lazy loading with require() to maintain lazy initialization behavior
5. Added ranges.ts pattern documentation to docs/features/patterns.md

---

## 2026-04-04 — Fix magnitude suffix range parsing bugs

**Changed:** src/patterns/contextualPhrases.ts, src/patterns/numericWordCombos.ts
**Why:** Task Master task #49 (Magnitude Suffix Range Parsing) had bugs: "10 million" failed (digit + magnitude without currency), and "1,000k" failed (comma handling)
**How:** 
1. Added regex pattern `digitMagnitudeNoCurrency` to match digit + magnitude WITHOUT requiring a currency (e.g., "10 million", "5 thousand")
2. Updated error handling in matchContextualPhrase to catch "Unrecognized currency" and compute value directly from magnitude
3. Updated numericWordCombos.ts regex to support comma separators: `(\d+(?:,\d{3})*(?:\.\d+)?)(bn|[kmb])`

---

## 2026-04-01 — Add RangeParseResult interface for range parsing feature

**Changed:** src/types.ts
**Why:** Task Master task #44 - Add RangeParseResult interface to types.ts. This is the first of 29 tasks to implement monetary range parsing (e.g., "$500 - $1000", "10k to 20k").
**How:** Added `RangeParseResult` interface with `min`, `max`, `currency`, and `raw` properties. Follows existing pattern interface conventions (e.g., SymbolParseResult).

---

## 2026-03-30 — Documentation structure setup

**Changed:** docs/infra/decisions.md, docs/features/documentation.md
**Why:** Needed to create stub docs/ folder structure to enable Claude Code hooks (Stop, SubagentStop) without blocking sessions
**How:** Created placeholder files matching project-template pattern. docs/features/documentation.md now tracks the documentation revamp work.

---

## 2026-03-30 — Align with project template configuration

**Changed:** .taskmaster/CLAUDE.md, .taskmaster/templates/, .taskmaster/config.json
**Why:** Align current project with project-template for consistent Task Master setup
**How:** Copied Task Master CLAUDE.md reference file and PRD templates from template. Updated config.json to use Claude Code (sonnet) instead of Google Gemini for all model types.

---

## 2026-03-31 — CLAUDE.md follows project-template structure

**Changed:** CLAUDE.md
**Why:** Align CLAUDE.md with project-template conventions for consistent project setup across all projects
**How:** Restructured CLAUDE.md to match all 11 template sections (Project Identity, Tech Stack, Repository Structure, Architecture Overview, Conventions, Environment & Configuration, Development Setup, PRDs, Feature Index, Infrastructure Index, Working With Claude Code). Added Taskmaster import at end.

---

## 2026-03-31 — README.md follows project-template structure

**Changed:** README.md
**Why:** Align README.md with project-template conventions for consistent project documentation
**How:** Added sections: "What It Does" (overview), "Tech Stack", "Requirements", "Project Structure", "Documentation", "License". Reorganized content following template pattern while keeping existing detailed sections (Supported Patterns, API Reference, Common Gotchas, Upcoming Features).

---

## 2026-03-31 — Migrate test README to docs/infra/testing.md

**Changed:** docs/infra/testing.md
**Why:** Replaced generic testing template with numis-specific test documentation
**How:** Converted test/README.md content into structured format with tables matching the project doc style. No feature docs to update (library has no features per CLAUDE.md section 9).

---

## 2026-03-31 — Create feature documentation

**Changed:** docs/features/ (4 new files)
**Why:** Provide Claude with persistent context about the library's architecture, so it never loses track of how parsing works, what patterns exist, how currency detection works, and error semantics
**How:** Created 4 feature docs:
- `core-parsing.md` — parseMoney() API, RegexPipeline three-stage architecture, PipelineContext type
- `patterns.md` — All 11 pattern matchers with priority order, interface contract, how to add new patterns
- `currency-data.md` — ISO-4217 lookups via currency-codes, lazy-init name-to-code map, stopwords
- `errors.md` — MoneyParseError vs ValueOverflowError semantics, when each is thrown

**No changes to infra docs needed** — these feature docs replace the need for detailed infra documentation on parsing internals.

---

---

## 2026-05-18 — Redesign demo/landing page

**Changed:** demo/index.html, demo/style.css, demo/src/main.jsx, demo/src/App.jsx, demo/src/ExamplePrompts.jsx, demo/src/Documentation.jsx, demo/src/SyntaxHighlighter.jsx (new)
**Why:** The demo site was functional but visually dated, missing key feature documentation (parseAll, ranges, isNegative), and lacked modern design patterns seen in the sample.html reference.

**How:**
1. Added Google Fonts (Inter, JetBrains Mono, Manrope) to index.html for modern typography
2. Rewrote style.css with base font mappings, smooth scrolling, and custom scrollbar styling
3. Created SyntaxHighlighter.jsx — a zero-dependency JSON syntax highlighter for the output panel
4. Redesigned App.jsx with: sticky glass navigation bar, hero section with version badge and CTAs, side-by-side playground (input left / JSON output right), status badges for defaulted/detected/range/negative, feature grid showcasing all capabilities, footer
5. Updated ExamplePrompts.jsx with slate palette and cleaner pill buttons
6. Completely rewrote Documentation.jsx with: sticky sidebar navigation, parseAll() interactive example, range parsing interactive example, isNegative in output type documentation, quick reference table, all interactive examples use SyntaxHighlighter
7. Switched entire demo from blue/gray palette to slate palette for a more modern, cohesive look
8. Build succeeds cleanly; lint passes

---

## 2026-05-18 — Fix lint errors in ranges.ts

**Changed:** src/patterns/ranges.ts
**Why:** `npm run lint` reported 2 errors — `prefer-const` on `currency` and unused variable `withoutArticle` (with its dependency `trimmed`) in `detectCurrencyContext()`.
**How:** Changed `let currency` to `const currency` (line 245, never reassigned). Removed `trimmed` and `withoutArticle` variables from `detectCurrencyContext()` (lines 698–699, assigned but never used). No functional changes; lint now passes cleanly.

---

## 2026-05-19 — SEO and crawler visibility overhaul for demo site

**Changed:** demo/index.html, demo/public/robots.txt (new), demo/public/llms.txt (new), demo/scripts/noscript-template.html (new), demo/scripts/inject-noscript.cjs (new), demo/package.json, demo/src/Documentation.jsx
**Why:** The demo SPA had no crawler-visible content, no structured data, and no AI-crawler directives, making it invisible to search engines and LLMs.

**How:**
1. Added JSON-LD `SoftwareApplication` and `WebSite` schema with `SearchAction` potentialAction to index.html
2. Added Open Graph and Twitter Card meta tags with OG image reference
3. Created `public/robots.txt` with explicit `Allow` directives for GPTBot, OAI-SearchBot, ClaudeBot, and PerplexityBot
4. Created `public/llms.txt` with project overview, capabilities, quick start, and author attribution
5. Created `scripts/noscript-template.html` as the source of truth for static fallback content
6. Created `scripts/inject-noscript.cjs` build-time script that injects the template into `index.html`'s `<noscript>` block
7. Added `"prebuild": "node scripts/inject-noscript.cjs"` to demo/package.json so injection runs automatically before every Vite build
8. Added sync reminder comment to the top of `demo/src/Documentation.jsx`
9. Escaped `<` characters in template text content to `&lt;` to avoid parse5 HTML parsing errors during Vite build
10. Build succeeds cleanly; noscript injection verified in dist/index.html

---

## Pre-2026-03-30

See git history for earlier changes.