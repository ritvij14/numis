# Testing

> Comprehensive test suite documentation for the numis library.

---

## Test Organization

### Pattern-Specific Tests (`test/patterns/`)

Each pattern parser has its own dedicated test file:

| File | Description |
|------|-------------|
| `abbreviations.test.ts` | ISO-4217 currency codes (USD, EUR, GBP, etc.) |
| `contextualPhrases.test.ts` | Contextual monetary expressions ("a dollar and 23 cents") |
| `negativeNumbers.test.ts` | Negative amount detection ("-$100", "($50)") |
| `numbersWithSeparators.test.ts` | Formatted numbers ("1,234.56", "1.234,56") |
| `numericWordCombos.test.ts` | Abbreviated numbers ("10k", "5m", "2bn") |
| `plainNumbers.test.ts` | Basic numeric values ("123", "45.67") |
| `regionalFormats.test.ts` | International number formats ("€1.234,56", "1'234.56 CHF") |
| `slangTerms.test.ts` | Monetary slang ("bucks", "quid", "fiver", "grand") |
| `symbols.test.ts` | Currency symbols ("$", "€", "£", "¥") |
| `wordedNumbers.test.ts` | Worded numbers ("one hundred", "half a million") |
| `minorUnitsOnly.test.ts` | Minor currency units only ("75 cents", "50 pence") |

### Core Functionality Tests

| File | Description |
|------|-------------|
| `parseMoney.test.ts` | Integration tests for the main `parseMoney()` API |
| `regexPipeline.test.ts` | Tests for the regex pipeline architecture |
| `currencyData.test.ts` | Tests for currency code lookups and validation |
| `errors.test.ts` | Tests for custom error types (ValueOverflowError, MoneyParseError) |

### Feature Tests

| File | Description |
|------|-------------|
| `defaultCurrency.test.ts` | Default currency fallback behavior |
| `lazyInit.test.ts` | Lazy initialization of currency maps |
| `decimalMagnitude.test.ts` | Decimal multipliers (0.5m = 500k) |
| `property.test.ts` | Property-based tests using fast-check |

### Demo Application Tests

| File | Description |
|------|-------------|
| `examplePrompts.test.ts` | Validates all example prompts from `demo/src/examplePromptsData.js`. Contains 118+ test cases covering all supported monetary expression formats. |

---

## Running Tests

```bash
# Run all tests
npm test

# Run a single test file
npx jest test/patterns/slangTerms.test.ts

# Run tests matching a pattern
npx jest --testNamePattern="slang"

# Run tests for example prompts
npx jest test/examplePrompts.test.ts

# Run tests in watch mode
npx jest --watch
```

---

## Test Coverage

- **Unit tests** — Individual pattern parsers and utilities
- **Integration tests** — Full parsing pipeline via `parseMoney()`
- **Property-based tests** — Randomized testing for edge cases
- **Demo validation tests** — All demo application examples
- **Error handling tests** — Invalid inputs and edge cases

---

## Adding New Tests

When adding new features or patterns:

1. Add pattern-specific tests in `test/patterns/`
2. Add integration tests in `test/parseMoney.test.ts`
3. Add example prompts to `demo/src/examplePromptsData.js`
4. Add corresponding tests to `test/examplePrompts.test.ts`
5. Run the full test suite to ensure no regressions

---

## Test Conventions

- Use descriptive test names that document expected behavior
- Group related tests using `describe()` blocks
- Include edge cases and error conditions
- Add comments for non-obvious test scenarios
- Use `toBeCloseTo()` for floating-point comparisons when dealing with fractions
