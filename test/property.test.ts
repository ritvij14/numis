import { describe, expect, test } from "@jest/globals";
import * as fc from "fast-check";
import { parseMoney } from "../src/parseMoney";
import { parseAll, ParseAllResult } from "../src/parseAll";
import { ValueOverflowError } from "../src/errors";

/**
 * Property-Based Fuzzing Tests using fast-check
 *
 * These tests verify invariants that should hold for any input,
 * helping discover edge cases that traditional unit tests might miss.
 */

// ============================================================================
// Custom Arbitraries (Generators)
// ============================================================================

/** Currency symbols commonly used */
const currencySymbols = ["$", "€", "£", "¥", "₹", "₽", "₩", "฿"] as const;

/** ISO 4217 currency codes */
const isoCodes = [
  "USD",
  "EUR",
  "GBP",
  "JPY",
  "INR",
  "CAD",
  "AUD",
  "CHF",
  "CNY",
  "RUB",
] as const;

/** Currency names */
const currencyNames = [
  "dollars",
  "dollar",
  "euros",
  "euro",
  "pounds",
  "pound",
  "yen",
  "rupees",
  "rupee",
] as const;

/** Slang terms for money */
const slangTerms = [
  "bucks",
  "buck",
  "quid",
  "quids",
  "fiver",
  "fivers",
  "tenner",
  "tenners",
] as const;

/** Numeric suffixes */
const numericSuffixes = ["k", "m", "b", "bn"] as const;

/** Generator for safe positive integers (within JS safe integer range) */
const safePositiveInteger = fc.integer({ min: 0, max: 9007199254740991 });

/** Generator for safe positive numbers with decimals */
const safePositiveNumber = fc.double({
  min: 0,
  max: 1000000000,
  noNaN: true,
  noDefaultInfinity: true,
});

/** Generator for currency symbols */
const currencySymbolArb = fc.constantFrom(...currencySymbols);

/** Generator for ISO codes */
const isoCodeArb = fc.constantFrom(...isoCodes);

/** Generator for currency names */
const currencyNameArb = fc.constantFrom(...currencyNames);

/** Generator for slang terms */
const slangTermArb = fc.constantFrom(...slangTerms);

/** Generator for numeric suffixes */
const numericSuffixArb = fc.constantFrom(...numericSuffixes);

/**
 * Generator for monetary expressions with symbols
 * e.g., "$100", "€50.99", "£1,234"
 */
const symbolAmountArb = fc
  .tuple(
    currencySymbolArb,
    fc.integer({ min: 0, max: 999999 }),
    fc.option(fc.integer({ min: 0, max: 99 }), { nil: undefined })
  )
  .map(([symbol, whole, decimal]) => {
    if (decimal !== undefined) {
      return `${symbol}${whole}.${decimal.toString().padStart(2, "0")}`;
    }
    return `${symbol}${whole}`;
  });

/**
 * Generator for monetary expressions with ISO codes
 * e.g., "USD 100", "100 EUR"
 */
const isoAmountArb = fc
  .tuple(
    isoCodeArb,
    fc.integer({ min: 0, max: 999999 }),
    fc.boolean() // true = code before, false = code after
  )
  .map(([code, amount, codeBefore]) => {
    return codeBefore ? `${code} ${amount}` : `${amount} ${code}`;
  });

/**
 * Generator for monetary expressions with currency names
 * e.g., "100 dollars", "50 euros"
 */
const nameAmountArb = fc
  .tuple(fc.integer({ min: 0, max: 999999 }), currencyNameArb)
  .map(([amount, name]) => `${amount} ${name}`);

/**
 * Generator for amounts with k/m/b suffixes
 * e.g., "$10k", "5m EUR"
 */
const suffixAmountArb = fc
  .tuple(
    fc.option(currencySymbolArb, { nil: undefined }),
    fc.integer({ min: 1, max: 999 }),
    numericSuffixArb
  )
  .map(([symbol, amount, suffix]) => {
    return symbol ? `${symbol}${amount}${suffix}` : `${amount}${suffix}`;
  });

/**
 * Generator for slang expressions
 * e.g., "5 bucks", "a fiver", "10 quid"
 */
const slangAmountArb = fc
  .tuple(
    fc.oneof(
      fc.integer({ min: 1, max: 100 }).map(String),
      fc.constant("a"),
      fc.constant("one"),
      fc.constant("two"),
      fc.constant("five"),
      fc.constant("ten")
    ),
    slangTermArb
  )
  .map(([amount, slang]) => `${amount} ${slang}`);

/**
 * Combined generator for valid monetary expressions
 */
const validMonetaryExpressionArb = fc.oneof(
  symbolAmountArb,
  isoAmountArb,
  nameAmountArb,
  suffixAmountArb,
  slangAmountArb
);

// ============================================================================
// Property Tests for parseMoney
// ============================================================================

describe("parseMoney - Property-Based Tests", () => {
  describe("Invariant: Always returns an object with 'original' property", () => {
    test("for any string input, result contains original input", () => {
      fc.assert(
        fc.property(fc.string(), (input) => {
          try {
            const result = parseMoney(input);
            expect(result.original).toBe(input);
            expect(result).toHaveProperty("matches");
          } catch (e) {
            // ValueOverflowError is acceptable for extremely large numbers
            expect(e).toBeInstanceOf(ValueOverflowError);
          }
        }),
        { numRuns: 500 }
      );
    });
  });

  describe("Invariant: Parsed amount is always a valid number or undefined", () => {
    test("amount is a valid number when present", () => {
      fc.assert(
        fc.property(fc.string(), (input) => {
          try {
            const result = parseMoney(input);
            if (result.amount !== undefined) {
              expect(typeof result.amount).toBe("number");
              expect(Number.isFinite(result.amount)).toBe(true);
              // Amount can be positive, negative, or zero
              expect(Math.abs(result.amount)).toBeGreaterThanOrEqual(0);
            }
          } catch (e) {
            expect(e).toBeInstanceOf(ValueOverflowError);
          }
        }),
        { numRuns: 500 }
      );
    });
  });

  describe("Invariant: Currency is always a string or undefined", () => {
    test("currency is a string when present", () => {
      fc.assert(
        fc.property(fc.string(), (input) => {
          try {
            const result = parseMoney(input);
            if (result.currency !== undefined) {
              expect(typeof result.currency).toBe("string");
              expect(result.currency.length).toBeGreaterThan(0);
            }
          } catch (e) {
            expect(e).toBeInstanceOf(ValueOverflowError);
          }
        }),
        { numRuns: 500 }
      );
    });
  });

  describe("Invariant: Valid monetary expressions are parsed correctly", () => {
    test("symbol + amount expressions yield both currency and amount", () => {
      fc.assert(
        fc.property(symbolAmountArb, (input) => {
          const result = parseMoney(input);
          expect(result.currency).toBeDefined();
          expect(result.amount).toBeDefined();
          expect(typeof result.amount).toBe("number");
        }),
        { numRuns: 200 }
      );
    });

    test("ISO code + amount expressions yield both currency and amount", () => {
      fc.assert(
        fc.property(isoAmountArb, (input) => {
          const result = parseMoney(input);
          expect(result.currency).toBeDefined();
          expect(result.amount).toBeDefined();
        }),
        { numRuns: 200 }
      );
    });

    test("currency name + amount expressions yield both currency and amount", () => {
      fc.assert(
        fc.property(nameAmountArb, (input) => {
          const result = parseMoney(input);
          expect(result.currency).toBeDefined();
          expect(result.amount).toBeDefined();
        }),
        { numRuns: 200 }
      );
    });
  });

  describe("Invariant: Parser does not crash on malformed input", () => {
    test("handles unicode strings without crashing", () => {
      fc.assert(
        fc.property(fc.string(), (input) => {
          try {
            const result = parseMoney(input);
            expect(result).toBeDefined();
            expect(result.original).toBe(input);
          } catch (e) {
            // Only ValueOverflowError is acceptable
            expect(e).toBeInstanceOf(ValueOverflowError);
          }
        }),
        { numRuns: 300 }
      );
    });

    test("handles strings with special characters without crashing", () => {
      fc.assert(
        fc.property(fc.string({ minLength: 0, maxLength: 1000 }), (input) => {
          try {
            const result = parseMoney(input);
            expect(result).toBeDefined();
          } catch (e) {
            expect(e).toBeInstanceOf(ValueOverflowError);
          }
        }),
        { numRuns: 300 }
      );
    });
  });

  describe("Idempotency and Consistency", () => {
    test("parsing the same input twice yields identical results", () => {
      fc.assert(
        fc.property(validMonetaryExpressionArb, (input) => {
          const result1 = parseMoney(input);
          const result2 = parseMoney(input);
          expect(result1.amount).toBe(result2.amount);
          expect(result1.currency).toBe(result2.currency);
          expect(result1.original).toBe(result2.original);
        }),
        { numRuns: 200 }
      );
    });
  });
});

// ============================================================================
// Property Tests for parseAll
// ============================================================================

describe("parseAll - Property-Based Tests", () => {
  describe("Invariant: Returns an array", () => {
    test("always returns an array for any string input", () => {
      fc.assert(
        fc.property(fc.string(), (input) => {
          const result = parseAll(input);
          expect(Array.isArray(result)).toBe(true);
        }),
        { numRuns: 300 }
      );
    });
  });

  describe("Invariant: Each result has required properties", () => {
    test("each result has start, end, match, original, currency, and amount", () => {
      fc.assert(
        fc.property(validMonetaryExpressionArb, (input) => {
          const results = parseAll(input);
          for (const result of results) {
            expect(result).toHaveProperty("start");
            expect(result).toHaveProperty("end");
            expect(result).toHaveProperty("match");
            expect(result).toHaveProperty("original");
            expect(typeof result.start).toBe("number");
            expect(typeof result.end).toBe("number");
            expect(result.start).toBeGreaterThanOrEqual(0);
            expect(result.end).toBeGreaterThan(result.start);
          }
        }),
        { numRuns: 200 }
      );
    });
  });

  describe("Invariant: Results are non-overlapping and sorted", () => {
    test("results are sorted by start position and do not overlap", () => {
      fc.assert(
        fc.property(
          fc.array(validMonetaryExpressionArb, { minLength: 1, maxLength: 5 }),
          (expressions) => {
            const input = expressions.join(" and ");
            const results = parseAll(input);

            // Check sorted order
            for (let i = 1; i < results.length; i++) {
              expect(results[i].start).toBeGreaterThanOrEqual(
                results[i - 1].end
              );
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe("Invariant: Match positions are valid", () => {
    test("start and end positions are within input bounds", () => {
      fc.assert(
        fc.property(fc.string({ minLength: 1, maxLength: 500 }), (input) => {
          const results = parseAll(input);
          for (const result of results) {
            expect(result.start).toBeGreaterThanOrEqual(0);
            expect(result.end).toBeLessThanOrEqual(input.length);
            expect(result.start).toBeLessThan(result.end);
          }
        }),
        { numRuns: 200 }
      );
    });
  });

  describe("Invariant: Found monetary expressions have currency and amount", () => {
    test("each result has both currency and amount defined", () => {
      fc.assert(
        fc.property(validMonetaryExpressionArb, (input) => {
          const results = parseAll(input);
          for (const result of results) {
            expect(result.currency).toBeDefined();
            expect(result.amount).toBeDefined();
          }
        }),
        { numRuns: 200 }
      );
    });
  });
});

// ============================================================================
// Edge Case Tests
// ============================================================================

describe("Edge Cases - Property-Based Tests", () => {
  describe("Very large numbers", () => {
    test("throws ValueOverflowError for numbers exceeding MAX_SAFE_INTEGER", () => {
      fc.assert(
        fc.property(
          fc.bigInt({ min: BigInt(Number.MAX_SAFE_INTEGER) + BigInt(1) }),
          (bigNum) => {
            const input = `$${bigNum.toString()}`;
            expect(() => parseMoney(input)).toThrow(ValueOverflowError);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe("Empty and whitespace strings", () => {
    test("empty string returns undefined currency and amount", () => {
      const result = parseMoney("");
      expect(result.currency).toBeUndefined();
      expect(result.amount).toBeUndefined();
      expect(result.original).toBe("");
    });

    test("whitespace-only strings return undefined currency and amount", () => {
      fc.assert(
        fc.property(
          fc.array(fc.constantFrom(" ", "\t", "\n", "\r"), { minLength: 0, maxLength: 20 }).map(arr => arr.join("")),
          (input) => {
            const result = parseMoney(input);
            expect(result.currency).toBeUndefined();
            expect(result.amount).toBeUndefined();
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe("Numbers without currency context", () => {
    test("plain numbers without currency yield amount but no currency", () => {
      // Using words that cannot be mistaken for ISO codes (which are 3-letter uppercase)
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 999999 }),
          fc.array(fc.constantFrom("x", "y", "z", "w", "v"), {
            minLength: 4, // More than 3 chars to avoid ISO code matches
            maxLength: 10,
          }).map(arr => arr.join("")),
          (num, word) => {
            const input = `${num} ${word}`;
            const result = parseMoney(input);
            // Should detect the number but not currency (word is not an ISO code)
            if (result.amount !== undefined) {
              expect(result.amount).toBe(num);
            }
            expect(result.currency).toBeUndefined();
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe("Multiple currencies in one string", () => {
    test("parseAll finds multiple different currencies", () => {
      fc.assert(
        fc.property(
          fc.tuple(
            fc.integer({ min: 1, max: 999 }),
            fc.integer({ min: 1, max: 999 })
          ),
          ([amount1, amount2]) => {
            const input = `I have $${amount1} and €${amount2}`;
            const results = parseAll(input);
            expect(results.length).toBeGreaterThanOrEqual(2);

            const currencies = results.map((r) => r.currency);
            expect(currencies).toContain("USD");
            expect(currencies).toContain("EUR");
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe("Case insensitivity for ISO codes", () => {
    test("ISO codes work in any case", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 999999 }),
          fc.constantFrom("USD", "usd", "Usd", "EUR", "eur", "Eur"),
          (amount, code) => {
            const input = `${amount} ${code}`;
            const result = parseMoney(input);
            expect(result.currency).toBe(code.toUpperCase());
            expect(result.amount).toBe(amount);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe("Decimal precision", () => {
    test("decimals are preserved within reasonable precision", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 999999 }),
          fc.integer({ min: 0, max: 99 }),
          (whole, cents) => {
            const centsStr = cents.toString().padStart(2, "0");
            const input = `$${whole}.${centsStr}`;
            const result = parseMoney(input);

            expect(result.amount).toBeDefined();
            const expected = parseFloat(`${whole}.${centsStr}`);
            expect(result.amount).toBeCloseTo(expected, 2);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe("Numeric suffix multipliers", () => {
    test("k suffix multiplies by 1000", () => {
      fc.assert(
        fc.property(fc.integer({ min: 1, max: 999 }), (num) => {
          const result = parseMoney(`$${num}k`);
          expect(result.amount).toBe(num * 1000);
        }),
        { numRuns: 50 }
      );
    });

    test("m suffix multiplies by 1,000,000", () => {
      fc.assert(
        fc.property(fc.integer({ min: 1, max: 999 }), (num) => {
          const result = parseMoney(`$${num}m`);
          expect(result.amount).toBe(num * 1000000);
        }),
        { numRuns: 50 }
      );
    });

    test("b suffix multiplies by 1,000,000,000", () => {
      fc.assert(
        fc.property(fc.integer({ min: 1, max: 9 }), (num) => {
          const result = parseMoney(`$${num}b`);
          expect(result.amount).toBe(num * 1000000000);
        }),
        { numRuns: 20 }
      );
    });
  });

  describe("Special characters and injection attempts", () => {
    test("handles regex special characters safely", () => {
      const specialChars = [".", "*", "+", "?", "^", "$", "{", "}", "[", "]", "(", ")", "|", "\\"];

      fc.assert(
        fc.property(
          fc.array(fc.constantFrom(...specialChars), { minLength: 1, maxLength: 10 }),
          (chars) => {
            const input = chars.join("");
            // Should not throw
            const result = parseMoney(input);
            expect(result).toBeDefined();
            expect(result.original).toBe(input);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});

// ============================================================================
// Shrinking Tests (fast-check automatically shrinks failing cases)
// ============================================================================

describe("Shrinking Examples", () => {
  test("demonstrates that fast-check finds minimal failing examples", () => {
    // This test is designed to pass - it documents the shrinking behavior
    fc.assert(
      fc.property(validMonetaryExpressionArb, (input) => {
        const result = parseMoney(input);
        // If this ever fails, fast-check will shrink to find minimal example
        expect(result.original).toBe(input);
      }),
      { numRuns: 100 }
    );
  });
});
