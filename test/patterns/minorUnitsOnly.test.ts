import {
  parseMinorUnitOnly,
  matchMinorUnitOnly,
} from "../../src/patterns/minorUnitsOnly";

describe("parseMinorUnitOnly", () => {
  describe("Basic numeric patterns", () => {
    test("parses '75 cents' as 0.75 USD", () => {
      const result = parseMinorUnitOnly("75 cents");
      expect(result.value).toBeCloseTo(0.75);
      expect(result.currency).toBe("USD");
      expect(result.raw).toBe("75 cents");
    });

    test("parses '50 pence' as 0.50 GBP", () => {
      const result = parseMinorUnitOnly("50 pence");
      expect(result.value).toBeCloseTo(0.5);
      expect(result.currency).toBe("GBP");
      expect(result.raw).toBe("50 pence");
    });

    test("parses '99 pennies' as 0.99 GBP", () => {
      const result = parseMinorUnitOnly("99 pennies");
      expect(result.value).toBeCloseTo(0.99);
      expect(result.currency).toBe("GBP");
      expect(result.raw).toBe("99 pennies");
    });

    test("parses '25 cents' as 0.25 USD", () => {
      const result = parseMinorUnitOnly("25 cents");
      expect(result.value).toBeCloseTo(0.25);
      expect(result.currency).toBe("USD");
      expect(result.raw).toBe("25 cents");
    });

    test("parses '10 pence' as 0.10 GBP", () => {
      const result = parseMinorUnitOnly("10 pence");
      expect(result.value).toBeCloseTo(0.1);
      expect(result.currency).toBe("GBP");
      expect(result.raw).toBe("10 pence");
    });
  });

  describe("Singular forms", () => {
    test("parses '1 cent' (singular) as 0.01 USD", () => {
      const result = parseMinorUnitOnly("1 cent");
      expect(result.value).toBeCloseTo(0.01);
      expect(result.currency).toBe("USD");
      expect(result.raw).toBe("1 cent");
    });

    test("parses '1 penny' (singular) as 0.01 GBP", () => {
      const result = parseMinorUnitOnly("1 penny");
      expect(result.value).toBeCloseTo(0.01);
      expect(result.currency).toBe("GBP");
      expect(result.raw).toBe("1 penny");
    });
  });

  describe("Worded numbers", () => {
    test("parses 'fifty cents' as 0.50 USD", () => {
      const result = parseMinorUnitOnly("fifty cents");
      expect(result.value).toBeCloseTo(0.5);
      expect(result.currency).toBe("USD");
      expect(result.raw).toBe("fifty cents");
    });

    test("parses 'seventy five cents' as 0.75 USD", () => {
      const result = parseMinorUnitOnly("seventy five cents");
      expect(result.value).toBeCloseTo(0.75);
      expect(result.currency).toBe("USD");
      expect(result.raw).toBe("seventy five cents");
    });

    test("parses 'twenty pence' as 0.20 GBP", () => {
      const result = parseMinorUnitOnly("twenty pence");
      expect(result.value).toBeCloseTo(0.2);
      expect(result.currency).toBe("GBP");
      expect(result.raw).toBe("twenty pence");
    });

    test("parses 'ninety nine pennies' as 0.99 GBP", () => {
      const result = parseMinorUnitOnly("ninety nine pennies");
      expect(result.value).toBeCloseTo(0.99);
      expect(result.currency).toBe("GBP");
      expect(result.raw).toBe("ninety nine pennies");
    });

    test("parses 'ten cents' as 0.10 USD", () => {
      const result = parseMinorUnitOnly("ten cents");
      expect(result.value).toBeCloseTo(0.1);
      expect(result.currency).toBe("USD");
      expect(result.raw).toBe("ten cents");
    });
  });

  describe("defaultCurrency override", () => {
    test("uses defaultCurrency when provided for cents", () => {
      const result = parseMinorUnitOnly("75 cents", "CAD");
      expect(result.value).toBeCloseTo(0.75);
      expect(result.currency).toBe("CAD");
      expect(result.raw).toBe("75 cents");
    });

    test("uses defaultCurrency when provided for pence", () => {
      const result = parseMinorUnitOnly("50 pence", "GBP");
      expect(result.value).toBeCloseTo(0.5);
      expect(result.currency).toBe("GBP");
      expect(result.raw).toBe("50 pence");
    });

    test("overrides default USD with EUR for cents", () => {
      const result = parseMinorUnitOnly("75 cents", "EUR");
      expect(result.value).toBeCloseTo(0.75);
      expect(result.currency).toBe("EUR");
      expect(result.raw).toBe("75 cents");
    });
  });

  describe("Edge cases", () => {
    test("parses '0 cents' as 0.00 USD", () => {
      const result = parseMinorUnitOnly("0 cents");
      expect(result.value).toBeCloseTo(0);
      expect(result.currency).toBe("USD");
      expect(result.raw).toBe("0 cents");
    });

    test("handles extra whitespace", () => {
      const result = parseMinorUnitOnly("  75   cents  ");
      expect(result.value).toBeCloseTo(0.75);
      expect(result.currency).toBe("USD");
      expect(result.raw).toBe("75 cents");
    });

    test("handles uppercase", () => {
      const result = parseMinorUnitOnly("75 CENTS");
      expect(result.value).toBeCloseTo(0.75);
      expect(result.currency).toBe("USD");
      expect(result.raw).toBe("75 cents");
    });

    test("handles mixed case", () => {
      const result = parseMinorUnitOnly("75 CeNtS");
      expect(result.value).toBeCloseTo(0.75);
      expect(result.currency).toBe("USD");
      expect(result.raw).toBe("75 cents");
    });
  });

  describe("Invalid inputs", () => {
    test("throws on currency without minor units (JPY)", () => {
      expect(() => parseMinorUnitOnly("75 cents", "JPY")).toThrow(
        /does not support minor units/i
      );
    });

    test("throws on missing amount", () => {
      expect(() => parseMinorUnitOnly("cents")).toThrow(
        /Invalid or missing amount/i
      );
    });

    test("throws on missing minor unit", () => {
      expect(() => parseMinorUnitOnly("75")).toThrow(
        /Unrecognized minor unit/i
      );
    });

    test("throws on empty string", () => {
      expect(() => parseMinorUnitOnly("")).toThrow(
        /must be a non-empty string/i
      );
    });

    test("throws on invalid amount (100 cents or more)", () => {
      expect(() => parseMinorUnitOnly("100 cents")).toThrow(
        /Invalid minor unit amount/i
      );
    });

    test("throws on invalid amount (200 cents)", () => {
      expect(() => parseMinorUnitOnly("200 cents")).toThrow(
        /Invalid minor unit amount/i
      );
    });

    test("throws on non-numeric, non-worded amount", () => {
      expect(() => parseMinorUnitOnly("abc cents")).toThrow(
        /Invalid or missing amount/i
      );
    });
  });
});

describe("matchMinorUnitOnly", () => {
  describe("Basic matching", () => {
    test("matches '75 cents' in text", () => {
      const result = matchMinorUnitOnly("I found 75 cents on the ground");
      expect(result?.value).toBeCloseTo(0.75);
      expect(result?.currency).toBe("USD");
      expect(result?.raw).toBe("75 cents");
    });

    test("matches '50 pence' in text", () => {
      const result = matchMinorUnitOnly("It costs 50 pence");
      expect(result?.value).toBeCloseTo(0.5);
      expect(result?.currency).toBe("GBP");
      expect(result?.raw).toBe("50 pence");
    });

    test("matches 'fifty cents' in text", () => {
      const result = matchMinorUnitOnly("That will be fifty cents please");
      expect(result?.value).toBeCloseTo(0.5);
      expect(result?.currency).toBe("USD");
      expect(result?.raw).toBe("fifty cents");
    });
  });

  describe("No match cases", () => {
    test("returns null for non-matching text", () => {
      expect(matchMinorUnitOnly("hello world")).toBeNull();
    });

    test("returns null for just a number", () => {
      expect(matchMinorUnitOnly("75")).toBeNull();
    });

    test("returns null for 'a dollar and 75 cents' (handled by contextualPhrases)", () => {
      // Should NOT match - contains major currency unit
      expect(matchMinorUnitOnly("a dollar and 75 cents")).toBeNull();
    });

    test("returns null for '5 euros 50 cents' (handled by contextualPhrases)", () => {
      // Should NOT match - contains major currency unit
      expect(matchMinorUnitOnly("5 euros 50 cents")).toBeNull();
    });

    test("returns null for '2 dollars 25 cents' (handled by contextualPhrases)", () => {
      // Should NOT match - contains major currency unit
      expect(matchMinorUnitOnly("2 dollars 25 cents")).toBeNull();
    });

    test("returns null for '10 USD 50 cents' (handled by contextualPhrases)", () => {
      // Should NOT match - contains ISO currency code
      expect(matchMinorUnitOnly("10 USD 50 cents")).toBeNull();
    });

    test("returns null for invalid amount (100 cents or more)", () => {
      expect(matchMinorUnitOnly("I have 100 cents")).toBeNull();
    });
  });

  describe("Multiple occurrences", () => {
    test("matches first occurrence when multiple present", () => {
      const result = matchMinorUnitOnly("25 cents and 50 cents");
      expect(result?.value).toBeCloseTo(0.25);
      expect(result?.currency).toBe("USD");
      expect(result?.raw).toBe("25 cents");
    });

    test("matches first valid occurrence", () => {
      const result = matchMinorUnitOnly("found 10 cents and 75 pence");
      expect(result?.value).toBeCloseTo(0.1);
      expect(result?.currency).toBe("USD");
      expect(result?.raw).toBe("10 cents");
    });
  });

  describe("defaultCurrency with matching", () => {
    test("uses defaultCurrency when provided", () => {
      const result = matchMinorUnitOnly("I found 75 cents", "EUR");
      expect(result?.value).toBeCloseTo(0.75);
      expect(result?.currency).toBe("EUR");
      expect(result?.raw).toBe("75 cents");
    });
  });

  describe("Edge cases", () => {
    test("returns null for empty string", () => {
      expect(matchMinorUnitOnly("")).toBeNull();
    });

    test("handles text with punctuation", () => {
      const result = matchMinorUnitOnly("Cost: 75 cents.");
      expect(result?.value).toBeCloseTo(0.75);
      expect(result?.currency).toBe("USD");
      expect(result?.raw).toBe("75 cents");
    });

    test("handles text at start", () => {
      const result = matchMinorUnitOnly("75 cents is all I have");
      expect(result?.value).toBeCloseTo(0.75);
      expect(result?.currency).toBe("USD");
      expect(result?.raw).toBe("75 cents");
    });

    test("handles text at end", () => {
      const result = matchMinorUnitOnly("The price is 75 cents");
      expect(result?.value).toBeCloseTo(0.75);
      expect(result?.currency).toBe("USD");
      expect(result?.raw).toBe("75 cents");
    });
  });
});
