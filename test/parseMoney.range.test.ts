import { describe, expect, test } from "@jest/globals";
import { parseMoney } from "../src/parseMoney";

describe("parseMoney - ranges", () => {
  describe("isRange flag", () => {
    test("should set isRange to true for range expressions with hyphen", () => {
      const res = parseMoney("$500 - $1000");
      expect(res.isRange).toBe(true);
    });

    test("should set isRange to true for range expressions with 'to'", () => {
      const res = parseMoney("10 to 20 dollars");
      expect(res.isRange).toBe(true);
    });

    test("should set isRange to true for range expressions with 'through'", () => {
      const res = parseMoney("50 through 100 USD");
      expect(res.isRange).toBe(true);
    });

    test("should set isRange to false for single values", () => {
      const res = parseMoney("$500");
      expect(res.isRange).toBeFalsy();
    });
  });

  describe("min and max values", () => {
    test("should correctly parse min and max with currency symbols on both values", () => {
      const res = parseMoney("$500 - $1000");
      expect(res.min).toBe(500);
      expect(res.max).toBe(1000);
    });

    test("should correctly parse min and max with euro symbol", () => {
      const res = parseMoney("€50 - €100");
      expect(res.min).toBe(50);
      expect(res.max).toBe(100);
      expect(res.currency).toBe("EUR");
    });

    test("should correctly parse min and max with pound symbol", () => {
      const res = parseMoney("£100 - £200");
      expect(res.min).toBe(100);
      expect(res.max).toBe(200);
      expect(res.currency).toBe("GBP");
    });

    test("should handle reversed range order - falls back to single value", () => {
      // When min >= max, range validation fails and falls back to single value parsing
      const res = parseMoney("$1000 - $500");
      expect(res.isRange).toBeFalsy();
      expect(res.amount).toBe(1000);
    });

    test("should handle en-dash separator", () => {
      const res = parseMoney("$500–$1000");
      expect(res.isRange).toBe(true);
      expect(res.min).toBe(500);
      expect(res.max).toBe(1000);
    });

    test("should handle em-dash separator", () => {
      const res = parseMoney("$500—$1000");
      expect(res.isRange).toBe(true);
      expect(res.min).toBe(500);
      expect(res.max).toBe(1000);
    });
  });

  describe("amount is undefined for ranges", () => {
    test("should have undefined amount for range with hyphen", () => {
      const res = parseMoney("$500 - $1000");
      expect(res.amount).toBeUndefined();
    });

    test("should have undefined amount for range with 'to'", () => {
      const res = parseMoney("10 to 20 dollars");
      expect(res.amount).toBeUndefined();
    });

    test("should still have amount for single values", () => {
      const res = parseMoney("$500");
      expect(res.amount).toBe(500);
      expect(res.isRange).toBeFalsy();
    });
  });

  describe("Currency detection", () => {
    test("should detect currency with symbol on both values", () => {
      const res = parseMoney("$500 - $1000");
      expect(res.currency).toBe("USD");
    });

    test("should detect currency with symbol only on first value", () => {
      const res = parseMoney("$500 - 1000");
      expect(res.currency).toBe("USD");
      expect(res.min).toBe(500);
      expect(res.max).toBe(1000);
    });

    test("should detect currency abbreviation before range", () => {
      const res = parseMoney("USD 500 - 1000");
      expect(res.currency).toBe("USD");
      expect(res.min).toBe(500);
      expect(res.max).toBe(1000);
    });

    test("should detect currency abbreviation after range", () => {
      const res = parseMoney("500 to 1000 EUR");
      expect(res.currency).toBe("EUR");
      expect(res.min).toBe(500);
      expect(res.max).toBe(1000);
    });

    test("should detect currency from currency name", () => {
      const res = parseMoney("500 - 1000 dollars");
      expect(res.currency).toBe("USD");
      expect(res.min).toBe(500);
      expect(res.max).toBe(1000);
    });
  });

  describe("defaultCurrency option", () => {
    test("should apply defaultCurrency to range without explicit currency", () => {
      const res = parseMoney("500 - 1000", { defaultCurrency: "USD" });
      expect(res.currency).toBe("USD");
      expect(res.min).toBe(500);
      expect(res.max).toBe(1000);
      expect(res.isRange).toBe(true);
    });

    test("should apply defaultCurrency to range with 'to' separator", () => {
      const res = parseMoney("500 to 1000", { defaultCurrency: "EUR" });
      expect(res.currency).toBe("EUR");
      expect(res.min).toBe(500);
      expect(res.max).toBe(1000);
    });

    test("should not override detected currency with defaultCurrency", () => {
      const res = parseMoney("£500 - £1000", { defaultCurrency: "USD" });
      expect(res.currency).toBe("GBP");
    });
  });

  describe("ranges with magnitude suffixes", () => {
    test("should parse range with k suffix", () => {
      const res = parseMoney("10k - 20k");
      expect(res.min).toBe(10000);
      expect(res.max).toBe(20000);
    });

    test("should parse range with M suffix", () => {
      const res = parseMoney("1M - 2M");
      expect(res.min).toBe(1000000);
      expect(res.max).toBe(2000000);
    });

    test("should parse range with mixed magnitudes", () => {
      const res = parseMoney("10k - 1M");
      expect(res.min).toBe(10000);
      expect(res.max).toBe(1000000);
    });

    test("should parse range with b suffix", () => {
      const res = parseMoney("$1b - $2b");
      expect(res.min).toBe(1000000000);
      expect(res.max).toBe(2000000000);
      expect(res.currency).toBe("USD");
    });

    test("should parse range with bn suffix", () => {
      const res = parseMoney("$1bn - $5bn");
      expect(res.min).toBe(1000000000);
      expect(res.max).toBe(5000000000);
      expect(res.currency).toBe("USD");
    });
  });

  describe("ranges with worded numbers", () => {
    test("should parse range with simple worded numbers", () => {
      const res = parseMoney("five to ten dollars");
      expect(res.min).toBe(5);
      expect(res.max).toBe(10);
      expect(res.currency).toBe("USD");
    });

    test("should parse range with compound worded numbers", () => {
      const res = parseMoney("twenty to thirty euros");
      expect(res.min).toBe(20);
      expect(res.max).toBe(30);
      expect(res.currency).toBe("EUR");
    });

    test("should parse range with large worded numbers", () => {
      const res = parseMoney("one hundred to one thousand pounds");
      expect(res.min).toBe(100);
      expect(res.max).toBe(1000);
      expect(res.currency).toBe("GBP");
    });

    test("should parse 'ten to 100 dollars'", () => {
      const res = parseMoney("ten to 100 dollars");
      expect(res.min).toBe(10);
      expect(res.max).toBe(100);
      expect(res.currency).toBe("USD");
    });
  });

  describe("ranges with contextual phrases", () => {
    test("should parse 'between $100 and $200' as single value (not supported as range)", () => {
      // Note: "between" phrases are not currently detected as ranges
      // This falls back to parsing the first value
      const res = parseMoney("between $100 and $200");
      expect(res.amount).toBe(100);
      expect(res.currency).toBe("USD");
    });

    test("should parse 'from $50 to $100'", () => {
      const res = parseMoney("from $50 to $100");
      expect(res.isRange).toBe(true);
      expect(res.min).toBe(50);
      expect(res.max).toBe(100);
      expect(res.currency).toBe("USD");
    });

    test("should parse 'between 50 and 100 euros' as single value (not supported as range)", () => {
      // Note: "between" phrases are not currently detected as ranges
      // The parser extracts "100 euros" as the monetary expression
      const res = parseMoney("between 50 and 100 euros");
      expect(res.amount).toBe(100);
      expect(res.currency).toBe("EUR");
    });
  });

  describe("invalid ranges", () => {
    test("should return null for invalid range where min >= max with numbers", () => {
      // This should not match as a range - will be parsed as single value or not at all
      const res = parseMoney("100 - 50");
      // The range validation throws an error which is caught and returns null
      // So we expect isRange to be falsy
      expect(res.isRange).toBeFalsy();
    });

    test("should return null for equal min and max", () => {
      const res = parseMoney("100 - 100");
      expect(res.isRange).toBeFalsy();
    });

    test("should handle non-range expressions correctly", () => {
      const res = parseMoney("$500");
      expect(res.isRange).toBeFalsy();
      expect(res.amount).toBe(500);
    });
  });

  describe("mixed formats", () => {
    test("should parse '$50 - 100' correctly", () => {
      const res = parseMoney("$50 - 100");
      expect(res.isRange).toBe(true);
      expect(res.min).toBe(50);
      expect(res.max).toBe(100);
      expect(res.currency).toBe("USD");
    });

    test("should parse '10k - 100' correctly - falls back to single value", () => {
      // When min >= max (10000 > 100), range validation fails
      // Falls back to single value parsing
      const res = parseMoney("10k - 100 dollars");
      expect(res.amount).toBe(10000);
      expect(res.currency).toBe("USD");
    });

    test("should parse range with decimal values", () => {
      const res = parseMoney("$10.50 - $20.99");
      expect(res.min).toBeCloseTo(10.50, 2);
      expect(res.max).toBeCloseTo(20.99, 2);
      expect(res.currency).toBe("USD");
    });
  });

  describe("edge cases", () => {
    test("should handle range with comma separators", () => {
      const res = parseMoney("$1,000 - $5,000");
      expect(res.min).toBe(1000);
      expect(res.max).toBe(5000);
      expect(res.currency).toBe("USD");
    });

    test("should preserve original input", () => {
      const input = "$500 - $1000";
      const res = parseMoney(input);
      expect(res.original).toBe(input);
    });

    test("should handle single digit range", () => {
      const res = parseMoney("1 - 5");
      expect(res.min).toBe(1);
      expect(res.max).toBe(5);
    });

    test("should handle negative numbers in range - falls back to single value", () => {
      // Negative range expressions are not currently supported
      // Falls back to single negative value parsing
      const res = parseMoney("-$100 - -$50");
      expect(res.amount).toBe(-100);
      expect(res.isNegative).toBe(true);
      expect(res.currency).toBe("USD");
    });
  });
});