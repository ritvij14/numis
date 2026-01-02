import { parseAll } from "../src/parseAll";
import { ValueOverflowError } from "../src/errors";

describe("parseAll", () => {
  describe("basic functionality", () => {
    it("should return an empty array for text with no monetary expressions", () => {
      const results = parseAll("Hello, world!");
      expect(results).toEqual([]);
    });

    it("should find a single monetary expression", () => {
      const results = parseAll("I paid $100");
      expect(results).toHaveLength(1);
      expect(results[0].currency).toBe("USD");
      expect(results[0].amount).toBe(100);
      expect(results[0].match).toContain("$100");
    });

    it("should find multiple monetary expressions with different currencies", () => {
      const results = parseAll("I have $100 and he has €50");
      expect(results).toHaveLength(2);

      expect(results[0].currency).toBe("USD");
      expect(results[0].amount).toBe(100);

      expect(results[1].currency).toBe("EUR");
      expect(results[1].amount).toBe(50);
    });

    it("should return results sorted by position", () => {
      const results = parseAll("First €20, then $30, finally £40");
      expect(results).toHaveLength(3);
      expect(results[0].start).toBeLessThan(results[1].start);
      expect(results[1].start).toBeLessThan(results[2].start);
    });
  });

  describe("currency symbols", () => {
    it("should find expressions with symbol before amount", () => {
      const results = parseAll("Cost is $50.99");
      expect(results).toHaveLength(1);
      expect(results[0].currency).toBe("USD");
      expect(results[0].amount).toBe(50.99);
    });

    it("should find expressions with symbol after amount", () => {
      const results = parseAll("Price: 100€");
      expect(results).toHaveLength(1);
      expect(results[0].currency).toBe("EUR");
      expect(results[0].amount).toBe(100);
    });

    it("should handle multiple symbol-based expressions", () => {
      const results = parseAll("Prices: $10, €20, £30, ¥1000");
      expect(results).toHaveLength(4);
      expect(results.map((r) => r.currency)).toEqual([
        "USD",
        "EUR",
        "GBP",
        "JPY",
      ]);
    });
  });

  describe("ISO codes", () => {
    it("should find expressions with ISO code before amount", () => {
      const results = parseAll("Total: USD 250");
      expect(results).toHaveLength(1);
      expect(results[0].currency).toBe("USD");
      expect(results[0].amount).toBe(250);
    });

    it("should find expressions with ISO code after amount", () => {
      const results = parseAll("That costs 100 EUR");
      expect(results).toHaveLength(1);
      expect(results[0].currency).toBe("EUR");
      expect(results[0].amount).toBe(100);
    });

    it("should handle mixed ISO code formats", () => {
      const results = parseAll("USD 100 plus 50 GBP");
      expect(results).toHaveLength(2);
      expect(results[0].currency).toBe("USD");
      expect(results[0].amount).toBe(100);
      expect(results[1].currency).toBe("GBP");
      expect(results[1].amount).toBe(50);
    });
  });

  describe("slang terms", () => {
    it("should find buck/bucks expressions", () => {
      const results = parseAll("That's 5 bucks");
      expect(results).toHaveLength(1);
      expect(results[0].currency).toBe("USD");
      expect(results[0].amount).toBe(5);
    });

    it("should find quid expressions", () => {
      const results = parseAll("Cost me 10 quid");
      expect(results).toHaveLength(1);
      expect(results[0].currency).toBe("GBP");
      expect(results[0].amount).toBe(10);
    });

    it("should find multiple slang expressions", () => {
      const results = parseAll("He paid 20 bucks and she paid 15 quid");
      expect(results).toHaveLength(2);
      expect(results[0].currency).toBe("USD");
      expect(results[0].amount).toBe(20);
      expect(results[1].currency).toBe("GBP");
      expect(results[1].amount).toBe(15);
    });
  });

  describe("numeric suffixes", () => {
    it("should find k suffix expressions", () => {
      const results = parseAll("Salary is $50k");
      expect(results).toHaveLength(1);
      expect(results[0].currency).toBe("USD");
      expect(results[0].amount).toBe(50000);
    });

    it("should find m suffix expressions", () => {
      const results = parseAll("Revenue was €2m");
      expect(results).toHaveLength(1);
      expect(results[0].currency).toBe("EUR");
      expect(results[0].amount).toBe(2000000);
    });

    it("should find multiple suffix expressions", () => {
      const results = parseAll("Budget: $1m for marketing, $500k for R&D");
      expect(results).toHaveLength(2);
      expect(results[0].amount).toBe(1000000);
      expect(results[1].amount).toBe(500000);
    });
  });

  describe("currency names", () => {
    it("should find expressions with currency names", () => {
      const results = parseAll("That costs 50 dollars");
      expect(results).toHaveLength(1);
      expect(results[0].currency).toBe("USD");
      expect(results[0].amount).toBe(50);
    });

    it("should find expressions with various currency names", () => {
      const results = parseAll("100 euros and 200 pounds");
      expect(results).toHaveLength(2);
      expect(results[0].currency).toBe("EUR");
      expect(results[0].amount).toBe(100);
      expect(results[1].currency).toBe("GBP");
      expect(results[1].amount).toBe(200);
    });
  });

  describe("position tracking", () => {
    it("should correctly track start and end positions", () => {
      const text = "Price: $100";
      const results = parseAll(text);
      expect(results).toHaveLength(1);
      expect(results[0].start).toBe(7);
      expect(results[0].end).toBe(11);
      expect(text.substring(results[0].start, results[0].end)).toBe("$100");
    });

    it("should track positions for multiple expressions", () => {
      const text = "Got $50 and €75 today";
      const results = parseAll(text);
      expect(results).toHaveLength(2);

      expect(text.substring(results[0].start, results[0].end)).toContain("$50");
      expect(text.substring(results[1].start, results[1].end)).toContain("€75");
    });
  });

  describe("edge cases", () => {
    it("should handle empty string", () => {
      const results = parseAll("");
      expect(results).toEqual([]);
    });

    it("should handle text with only numbers (no currency)", () => {
      const results = parseAll("I have 100 apples");
      expect(results).toEqual([]);
    });

    it("should handle decimal amounts", () => {
      const results = parseAll("Total: $99.99 plus €50.50");
      expect(results).toHaveLength(2);
      expect(results[0].amount).toBe(99.99);
      expect(results[1].amount).toBe(50.5);
    });

    it("should handle amounts with thousand separators", () => {
      const results = parseAll("Price: $1,234.56");
      expect(results).toHaveLength(1);
      expect(results[0].amount).toBe(1234.56);
    });
  });

  describe("complex sentences", () => {
    it("should find all expressions in a complex sentence", () => {
      const results = parseAll(
        "The product costs $29.99 in the US, €27.50 in Europe, and £24.99 in the UK"
      );
      expect(results).toHaveLength(3);
      expect(results.map((r) => r.currency)).toEqual(["USD", "EUR", "GBP"]);
    });

    it("should handle expressions in different contexts", () => {
      const results = parseAll(
        "I spent $100 on groceries, another 50 EUR on clothes, and saved 200 GBP"
      );
      expect(results).toHaveLength(3);
    });
  });

  describe("ValueOverflowError handling", () => {
    it("should throw ValueOverflowError for numbers exceeding MAX_SAFE_INTEGER", () => {
      expect(() => parseAll("The price is $100000000000000000")).toThrow(
        ValueOverflowError
      );
    });

    it("should throw ValueOverflowError with currency names", () => {
      expect(() =>
        parseAll("That costs 100000000000000000 dollars")
      ).toThrow(ValueOverflowError);
    });

    it("should throw ValueOverflowError with ISO codes", () => {
      const overMax = (Number.MAX_SAFE_INTEGER + 1).toString();
      expect(() => parseAll(`Total: ${overMax} USD`)).toThrow(
        ValueOverflowError
      );
    });

    it("should process valid amounts before overflow", () => {
      // If the overflow happens on the second expression, it should still throw
      expect(() =>
        parseAll("I have $100 and also $100000000000000000")
      ).toThrow(ValueOverflowError);
    });

    it("should handle safe large numbers", () => {
      const results = parseAll("Budget: $1000000000000"); // 1 trillion
      expect(results).toHaveLength(1);
      expect(results[0].amount).toBe(1000000000000);
    });
  });

  describe("return value structure", () => {
    it("should return results with all expected properties", () => {
      const results = parseAll("Cost: $100");
      expect(results).toHaveLength(1);

      const result = results[0];
      expect(result).toHaveProperty("original");
      expect(result).toHaveProperty("currency");
      expect(result).toHaveProperty("amount");
      expect(result).toHaveProperty("start");
      expect(result).toHaveProperty("end");
      expect(result).toHaveProperty("match");
    });

    it("should have correct types for all properties", () => {
      const results = parseAll("Price: €50.99");
      expect(results).toHaveLength(1);

      const result = results[0];
      expect(typeof result.original).toBe("string");
      expect(typeof result.currency).toBe("string");
      expect(typeof result.amount).toBe("number");
      expect(typeof result.start).toBe("number");
      expect(typeof result.end).toBe("number");
      expect(typeof result.match).toBe("string");
    });

    it("should have start and end within string bounds", () => {
      const text = "The cost is $500 today";
      const results = parseAll(text);
      expect(results).toHaveLength(1);

      const result = results[0];
      expect(result.start).toBeGreaterThanOrEqual(0);
      expect(result.end).toBeLessThanOrEqual(text.length);
      expect(result.start).toBeLessThan(result.end);
    });
  });

  describe("additional edge cases", () => {
    it("should handle null-like inputs gracefully", () => {
      // Empty string
      expect(parseAll("")).toEqual([]);
    });

    it("should handle very long text with few expressions", () => {
      const longText =
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. ".repeat(
          100
        ) + "The total is $99.99.";
      const results = parseAll(longText);
      expect(results).toHaveLength(1);
      expect(results[0].amount).toBe(99.99);
    });

    it("should not find partial matches in words", () => {
      // "DUSK" contains "USD" but shouldn't be matched as currency
      const results = parseAll("Meeting at DUSK");
      expect(results).toEqual([]);
    });

    it("should handle multiple currencies in close proximity", () => {
      const results = parseAll("$50€25£30");
      expect(results.length).toBeGreaterThanOrEqual(1);
    });

    it("should handle whitespace variations", () => {
      const results = parseAll("Price:    $   100");
      // Depending on implementation, may or may not parse
      // Just ensure it doesn't crash
      expect(Array.isArray(results)).toBe(true);
    });
  });
});
