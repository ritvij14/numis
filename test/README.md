# Test Documentation

This directory contains the comprehensive test suite for the numis library.

## Test Organization

### Pattern-Specific Tests (`test/patterns/`)

Each pattern parser has its own dedicated test file:

- **`abbreviations.test.ts`** - Tests for ISO-4217 currency codes (USD, EUR, GBP, etc.)
- **`contextualPhrases.test.ts`** - Tests for contextual monetary expressions ("a dollar and 23 cents")
- **`negativeNumbers.test.ts`** - Tests for negative amount detection ("-$100", "($50)")
- **`numbersWithSeparators.test.ts`** - Tests for formatted numbers ("1,234.56", "1.234,56")
- **`numericWordCombos.test.ts`** - Tests for abbreviated numbers ("10k", "5m", "2bn")
- **`plainNumbers.test.ts`** - Tests for basic numeric values ("123", "45.67")
- **`regionalFormats.test.ts`** - Tests for international number formats ("€1.234,56", "1'234.56 CHF")
- **`slangTerms.test.ts`** - Tests for monetary slang ("bucks", "quid", "fiver", "grand")
- **`symbols.test.ts`** - Tests for currency symbols ("$", "€", "£", "¥")
- **`wordedNumbers.test.ts`** - Tests for worded numbers ("one hundred", "half a million")
- **`minorUnitsOnly.test.ts`** - Tests for minor currency units only ("75 cents", "50 pence")

### Core Functionality Tests

- **`parseMoney.test.ts`** - Integration tests for the main `parseMoney()` API
- **`regexPipeline.test.ts`** - Tests for the regex pipeline architecture
- **`currencyData.test.ts`** - Tests for currency code lookups and validation
- **`errors.test.ts`** - Tests for custom error types (ValueOverflowError, MoneyParseError)

### Feature Tests

- **`defaultCurrency.test.ts`** - Tests for default currency fallback behavior
- **`lazyInit.test.ts`** - Tests for lazy initialization of currency maps
- **`decimalMagnitude.test.ts`** - Tests for decimal multipliers (0.5m = 500k)
- **`property.test.ts`** - Property-based tests using fast-check

### Demo Application Tests

- **`examplePrompts.test.ts`** - **Comprehensive test suite for all examples shown in the demo application**
  - This file validates every example prompt from `demo/src/examplePromptsData.js`
  - Ensures the demo examples work correctly and don't regress
  - Organized by pattern type (symbols, ISO codes, worded numbers, slang, etc.)
  - Contains 118+ test cases covering all supported monetary expression formats
  - Serves as living documentation of the library's capabilities

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

## Test Coverage

The test suite includes:

- **Unit tests** - Individual pattern parsers and utilities
- **Integration tests** - Full parsing pipeline via `parseMoney()`
- **Property-based tests** - Randomized testing for edge cases
- **Demo validation tests** - All demo application examples
- **Error handling tests** - Invalid inputs and edge cases

## Adding New Tests

When adding new features or patterns:

1. Add pattern-specific tests in `test/patterns/`
2. Add integration tests in `test/parseMoney.test.ts`
3. Add example prompts to `demo/src/examplePromptsData.js`
4. Add corresponding tests to `test/examplePrompts.test.ts`
5. Run the full test suite to ensure no regressions

## Test Conventions

- Use descriptive test names that document expected behavior
- Group related tests using `describe()` blocks
- Include edge cases and error conditions
- Add comments for non-obvious test scenarios
- Use `toBeCloseTo()` for floating-point comparisons when dealing with fractions
