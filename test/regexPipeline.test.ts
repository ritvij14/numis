import { describe, expect, test } from "@jest/globals";
import { RegexPipeline } from "../src/regexPipeline";
import { ValueOverflowError } from "../src/errors";

describe("RegexPipeline", () => {
  test("detects currency symbol and numeric amount", () => {
    const pipeline = RegexPipeline.default();
    const result = pipeline.run("I paid $10 yesterday");

    expect(result.currency).toBe("USD");
    expect(result.amount).toBe(10);
  });

  test("detects ISO currency code and amount", () => {
    const pipeline = RegexPipeline.default();
    const result = pipeline.run("Total: 25 USD");

    expect(result.currency).toBe("USD");
    expect(result.amount).toBe(25);
  });

  test("detects additional currency symbols", () => {
    const pipeline = RegexPipeline.default();
    const euro = pipeline.run("Cost was €50");
    expect(euro.currency).toBe("EUR");
    expect(euro.amount).toBe(50);

    const pound = pipeline.run("Paid £30 last week");
    expect(pound.currency).toBe("GBP");
    expect(pound.amount).toBe(30);
  });

  test("detects lowercase iso code", () => {
    const pipeline = RegexPipeline.default();
    const res = pipeline.run("saved 100 gbp");
    expect(res.currency).toBe("GBP");
    expect(res.amount).toBe(100);
  });

  test("detects worded numbers", () => {
    const pipeline = RegexPipeline.default();
    const result = pipeline.run("I owe you one hundred forty five GBP");

    expect(result.currency).toBe("GBP");
    expect(result.amount).toBe(145);
  });

  test("detects numeric shorthand suffix (k/m/b)", () => {
    const pipeline = RegexPipeline.default();
    const result = pipeline.run("He won 10k USD");

    expect(result.currency).toBe("USD");
    expect(result.amount).toBe(10000);
  });

  test("detects currency by full name", () => {
    const pipeline = RegexPipeline.default();

    const euro = pipeline.run("He spent 50 Euro on dinner");
    expect(euro.currency).toBe("EUR");
    expect(euro.amount).toBe(50);

    const yen = pipeline.run("Tickets cost 200 yen");
    expect(yen.currency).toBe("JPY");
    expect(yen.amount).toBe(200);

    const dollar = pipeline.run("He paid 100 dollars");
    expect(dollar.currency).toBe("USD");
    expect(dollar.amount).toBe(100);

    const pound = pipeline.run("He paid 100 pounds");
    expect(pound.currency).toBe("GBP");
    expect(pound.amount).toBe(100);

    const rupee = pipeline.run("He paid 100 rupees");
    expect(rupee.currency).toBe("INR");
    expect(rupee.amount).toBe(100);
  });

  describe("Value Overflow Detection", () => {
    test("throws ValueOverflowError for plain numbers exceeding MAX_SAFE_INTEGER", () => {
      const pipeline = RegexPipeline.default();
      const maxSafe = Number.MAX_SAFE_INTEGER.toString();
      const overMax = (Number.MAX_SAFE_INTEGER + 1).toString();

      expect(() => pipeline.run(`I paid ${overMax} USD`)).toThrow(
        ValueOverflowError
      );
      expect(() => pipeline.run(`I paid ${overMax} USD`)).toThrow(
        /exceeds maximum safe integer/
      );
    });

    test("accepts numbers at MAX_SAFE_INTEGER", () => {
      const pipeline = RegexPipeline.default();
      const maxSafe = Number.MAX_SAFE_INTEGER.toString();

      const result = pipeline.run(`I paid ${maxSafe} USD`);
      expect(result.amount).toBe(Number.MAX_SAFE_INTEGER);
    });

    test("throws ValueOverflowError for contextual phrases with large numbers", () => {
      const pipeline = RegexPipeline.default();

      // Use a number that actually exceeds MAX_SAFE_INTEGER (9,007,199,254,740,991)
      // 100 quadrillion = 100,000,000,000,000,000
      expect(() =>
        pipeline.run("100000000000000000 dollars")
      ).toThrow(ValueOverflowError);

      // Also test with currency symbol
      expect(() =>
        pipeline.run("$100000000000000000")
      ).toThrow(ValueOverflowError);
    });

    test("throws ValueOverflowError for large numeric values", () => {
      const pipeline = RegexPipeline.default();

      // String representation of a number exceeding MAX_SAFE_INTEGER
      expect(() => pipeline.run("9007199254740992 USD")).toThrow(
        ValueOverflowError
      );

      expect(() => pipeline.run("10000000000000000 dollars")).toThrow(
        ValueOverflowError
      );
    });

    test("accepts worded numbers below MAX_SAFE_INTEGER", () => {
      const pipeline = RegexPipeline.default();

      // "one billion" = 1,000,000,000 which is well below MAX_SAFE_INTEGER
      const result = pipeline.run("I have one billion dollars");
      expect(result.amount).toBe(1_000_000_000);
      expect(result.currency).toBe("USD");
    });

    test("handles decimal numbers without overflow", () => {
      const pipeline = RegexPipeline.default();

      const result = pipeline.run("9007199254740990.99 EUR");
      expect(result.amount).toBe(9007199254740990.99);
      expect(result.currency).toBe("EUR");
    });
  });

  describe("Regional Format Integration", () => {
    describe("European format (period thousands, comma decimal)", () => {
      test("should parse '1.234,56 €' correctly", () => {
        const pipeline = RegexPipeline.default();
        const result = pipeline.run("I paid 1.234,56 € yesterday");

        expect(result.currency).toBe("EUR");
        expect(result.amount).toBeCloseTo(1234.56);
      });

      test("should parse '€ 1.234,56' with prefix symbol", () => {
        const pipeline = RegexPipeline.default();
        const result = pipeline.run("Total: € 1.234,56");

        expect(result.currency).toBe("EUR");
        expect(result.amount).toBeCloseTo(1234.56);
      });

      test("should parse large European format '1.234.567,89 €'", () => {
        const pipeline = RegexPipeline.default();
        const result = pipeline.run("The cost was 1.234.567,89 €");

        expect(result.currency).toBe("EUR");
        expect(result.amount).toBeCloseTo(1234567.89);
      });

      test("should parse European format with multiple separators '1.234.567 €'", () => {
        // Single period is ambiguous, use multiple periods for unambiguous EU format
        const pipeline = RegexPipeline.default();
        const result = pipeline.run("Price: 1.234.567 €");

        expect(result.currency).toBe("EUR");
        expect(result.amount).toBe(1234567);
      });

      test("should parse small European decimal '0,99 €'", () => {
        const pipeline = RegexPipeline.default();
        const result = pipeline.run("Only 0,99 €");

        expect(result.currency).toBe("EUR");
        expect(result.amount).toBeCloseTo(0.99);
      });
    });

    describe("US format (comma thousands, period decimal)", () => {
      test("should parse '$1,234.56' correctly", () => {
        const pipeline = RegexPipeline.default();
        const result = pipeline.run("I paid $1,234.56 yesterday");

        expect(result.currency).toBe("USD");
        expect(result.amount).toBeCloseTo(1234.56);
      });

      test("should parse large US format '$1,234,567.89'", () => {
        const pipeline = RegexPipeline.default();
        const result = pipeline.run("Total: $1,234,567.89");

        expect(result.currency).toBe("USD");
        expect(result.amount).toBeCloseTo(1234567.89);
      });
    });

    describe("Swiss format (apostrophe thousands)", () => {
      test("should parse Swiss format \"1'234.56 CHF\"", () => {
        const pipeline = RegexPipeline.default();
        const result = pipeline.run("Price: 1'234.56 CHF");

        expect(result.currency).toBe("CHF");
        expect(result.amount).toBeCloseTo(1234.56);
      });

      test("should parse Swiss format with Fr symbol \"Fr 1'234.56\"", () => {
        const pipeline = RegexPipeline.default();
        const result = pipeline.run("Cost: Fr 1'234.56");

        expect(result.currency).toBe("CHF");
        expect(result.amount).toBeCloseTo(1234.56);
      });
    });

    describe("French format (space thousands, comma decimal)", () => {
      test("should parse French format '1 234,56 €'", () => {
        const pipeline = RegexPipeline.default();
        const result = pipeline.run("Prix: 1 234,56 €");

        expect(result.currency).toBe("EUR");
        expect(result.amount).toBeCloseTo(1234.56);
      });

      test("should parse large French format '1 234 567,89 €'", () => {
        const pipeline = RegexPipeline.default();
        const result = pipeline.run("Total: 1 234 567,89 €");

        expect(result.currency).toBe("EUR");
        expect(result.amount).toBeCloseTo(1234567.89);
      });
    });

    describe("Indian format", () => {
      test("should parse Indian format '₹1,23,456.78'", () => {
        const pipeline = RegexPipeline.default();
        const result = pipeline.run("Cost: ₹1,23,456.78");

        expect(result.currency).toBe("INR");
        expect(result.amount).toBeCloseTo(123456.78);
      });
    });

    describe("Multiple currencies with regional formats", () => {
      test("should parse British Pound with EU format '£1.234,56'", () => {
        const pipeline = RegexPipeline.default();
        const result = pipeline.run("Price: £1.234,56");

        expect(result.currency).toBe("GBP");
        expect(result.amount).toBeCloseTo(1234.56);
      });

      test("should parse Brazilian Real 'R$ 1.234,56'", () => {
        const pipeline = RegexPipeline.default();
        const result = pipeline.run("Cost: R$ 1.234,56");

        expect(result.currency).toBe("BRL");
        expect(result.amount).toBeCloseTo(1234.56);
      });

      test("should parse Polish Zloty '1 234,56 zł'", () => {
        const pipeline = RegexPipeline.default();
        const result = pipeline.run("Price: 1 234,56 zł");

        expect(result.currency).toBe("PLN");
        expect(result.amount).toBeCloseTo(1234.56);
      });
    });

    describe("Ambiguous symbols with defaultCurrency", () => {
      test("should use defaultCurrency for ambiguous $ symbol", () => {
        const pipeline = RegexPipeline.default();
        const result = pipeline.run("Total: $1,234.56", { defaultCurrency: "CAD" });

        expect(result.currency).toBe("CAD");
        expect(result.amount).toBeCloseTo(1234.56);
      });

      test("should use defaultCurrency for kr symbol", () => {
        const pipeline = RegexPipeline.default();
        const result = pipeline.run("Price: kr 1 234,56", { defaultCurrency: "NOK" });

        expect(result.currency).toBe("NOK");
        expect(result.amount).toBeCloseTo(1234.56);
      });
    });
  });

  describe("Ambiguous Format Handling", () => {
    test("should parse '1.000.000' as European millions (unambiguous with multiple periods)", () => {
      const pipeline = RegexPipeline.default();
      const result = pipeline.run("Cost: 1.000.000 €");

      expect(result.currency).toBe("EUR");
      expect(result.amount).toBe(1000000);
    });

    test("should parse '1,000' as US thousands (1000)", () => {
      const pipeline = RegexPipeline.default();
      const result = pipeline.run("Price: $1,000");

      expect(result.currency).toBe("USD");
      expect(result.amount).toBe(1000);
    });

    test("should parse '1,000,000' as US millions", () => {
      const pipeline = RegexPipeline.default();
      const result = pipeline.run("Cost: $1,000,000");

      expect(result.currency).toBe("USD");
      expect(result.amount).toBe(1000000);
    });

    test("should parse '1.23' as US decimal", () => {
      const pipeline = RegexPipeline.default();
      const result = pipeline.run("Price: $1.23");

      expect(result.currency).toBe("USD");
      expect(result.amount).toBeCloseTo(1.23);
    });

    test("should parse '1,23' as European decimal", () => {
      const pipeline = RegexPipeline.default();
      const result = pipeline.run("Price: 1,23 €");

      expect(result.currency).toBe("EUR");
      expect(result.amount).toBeCloseTo(1.23);
    });

    test("should handle single period with 3 digits as decimal (ambiguous case)", () => {
      const pipeline = RegexPipeline.default();

      // Single period with 3 digits is now treated as decimal (US format)
      // This is ambiguous, but decimal is the default for single period
      const euroResult = pipeline.run("€1.500");
      expect(euroResult.amount).toBeCloseTo(1.5);

      const dollarResult = pipeline.run("$1.500");
      expect(dollarResult.amount).toBeCloseTo(1.5);
    });
  });

  describe("Negative Number Support", () => {
    describe("Negative prefixes", () => {
      test('should parse "-100 EUR" as negative', () => {
        const pipeline = RegexPipeline.default();
        const result = pipeline.run("-100 EUR");

        expect(result.currency).toBe("EUR");
        expect(result.amount).toBe(-100);
        expect(result.isNegative).toBe(true);
      });

      test('should parse "minus 50 USD" as negative', () => {
        const pipeline = RegexPipeline.default();
        const result = pipeline.run("minus 50 USD");

        expect(result.currency).toBe("USD");
        expect(result.amount).toBe(-50);
        expect(result.isNegative).toBe(true);
      });

      test('should parse "negative 25 GBP" as negative', () => {
        const pipeline = RegexPipeline.default();
        const result = pipeline.run("negative 25 GBP");

        expect(result.currency).toBe("GBP");
        expect(result.amount).toBe(-25);
        expect(result.isNegative).toBe(true);
      });

      test('should parse "-$100" with currency symbol', () => {
        const pipeline = RegexPipeline.default();
        const result = pipeline.run("-$100");

        expect(result.currency).toBe("USD");
        expect(result.amount).toBe(-100);
        expect(result.isNegative).toBe(true);
      });

      test('should parse "minus €50.50" with decimal', () => {
        const pipeline = RegexPipeline.default();
        const result = pipeline.run("minus €50.50");

        expect(result.currency).toBe("EUR");
        expect(result.amount).toBeCloseTo(-50.5);
        expect(result.isNegative).toBe(true);
      });

      test("should be case insensitive for word prefixes", () => {
        const pipeline = RegexPipeline.default();

        const minus = pipeline.run("MINUS 100 USD");
        expect(minus.amount).toBe(-100);

        const negative = pipeline.run("Negative 50 EUR");
        expect(negative.amount).toBe(-50);
      });
    });

    describe("Parentheses notation", () => {
      test('should parse "(100) USD" as negative', () => {
        const pipeline = RegexPipeline.default();
        const result = pipeline.run("(100) USD");

        expect(result.currency).toBe("USD");
        expect(result.amount).toBe(-100);
        expect(result.isNegative).toBe(true);
      });

      test('should parse "(50.50) EUR" with decimal', () => {
        const pipeline = RegexPipeline.default();
        const result = pipeline.run("(50.50) EUR");

        expect(result.currency).toBe("EUR");
        expect(result.amount).toBeCloseTo(-50.5);
        expect(result.isNegative).toBe(true);
      });

      test('should parse "($100)" with currency symbol inside', () => {
        const pipeline = RegexPipeline.default();
        const result = pipeline.run("($100)");

        expect(result.currency).toBe("USD");
        expect(result.amount).toBe(-100);
        expect(result.isNegative).toBe(true);
      });

      test('should parse "(€50)" with currency symbol inside', () => {
        const pipeline = RegexPipeline.default();
        const result = pipeline.run("(€50)");

        expect(result.currency).toBe("EUR");
        expect(result.amount).toBe(-50);
        expect(result.isNegative).toBe(true);
      });
    });

    describe("Negative with formatted numbers", () => {
      test('should parse "-$1,234.56" with thousands separator', () => {
        const pipeline = RegexPipeline.default();
        const result = pipeline.run("-$1,234.56");

        expect(result.currency).toBe("USD");
        expect(result.amount).toBeCloseTo(-1234.56);
        expect(result.isNegative).toBe(true);
      });

      test('should parse "(1,234.56) USD" with thousands separator', () => {
        const pipeline = RegexPipeline.default();
        const result = pipeline.run("(1,234.56) USD");

        expect(result.currency).toBe("USD");
        expect(result.amount).toBeCloseTo(-1234.56);
        expect(result.isNegative).toBe(true);
      });

      test('should parse "minus 1,000 EUR"', () => {
        const pipeline = RegexPipeline.default();
        const result = pipeline.run("minus 1,000 EUR");

        expect(result.currency).toBe("EUR");
        expect(result.amount).toBe(-1000);
        expect(result.isNegative).toBe(true);
      });
    });

    describe("Negative with regional formats", () => {
      test('should parse "-1.234,56 €" European format', () => {
        const pipeline = RegexPipeline.default();
        const result = pipeline.run("-1.234,56 €");

        expect(result.currency).toBe("EUR");
        expect(result.amount).toBeCloseTo(-1234.56);
        expect(result.isNegative).toBe(true);
      });

      test('should parse "(1.234,56 €)" European format with parentheses', () => {
        const pipeline = RegexPipeline.default();
        const result = pipeline.run("(1.234,56 €)");

        expect(result.currency).toBe("EUR");
        expect(result.amount).toBeCloseTo(-1234.56);
        expect(result.isNegative).toBe(true);
      });

      test('should parse "minus 1 234,56 €" French format', () => {
        const pipeline = RegexPipeline.default();
        const result = pipeline.run("minus 1 234,56 €");

        expect(result.currency).toBe("EUR");
        expect(result.amount).toBeCloseTo(-1234.56);
        expect(result.isNegative).toBe(true);
      });

      test("should parse \"negative 1'234.56 CHF\" Swiss format", () => {
        const pipeline = RegexPipeline.default();
        const result = pipeline.run("negative 1'234.56 CHF");

        expect(result.currency).toBe("CHF");
        expect(result.amount).toBeCloseTo(-1234.56);
        expect(result.isNegative).toBe(true);
      });
    });

    describe("Negative with worded numbers", () => {
      test('should parse "minus one hundred dollars"', () => {
        const pipeline = RegexPipeline.default();
        const result = pipeline.run("minus one hundred dollars");

        expect(result.currency).toBe("USD");
        expect(result.amount).toBe(-100);
        expect(result.isNegative).toBe(true);
      });

      test('should parse "negative fifty euros"', () => {
        const pipeline = RegexPipeline.default();
        const result = pipeline.run("negative fifty euros");

        expect(result.currency).toBe("EUR");
        expect(result.amount).toBe(-50);
        expect(result.isNegative).toBe(true);
      });
    });

    describe("Negative with shorthand suffixes", () => {
      test('should parse "-10k USD"', () => {
        const pipeline = RegexPipeline.default();
        const result = pipeline.run("-10k USD");

        expect(result.currency).toBe("USD");
        expect(result.amount).toBe(-10000);
        expect(result.isNegative).toBe(true);
      });

      test('should parse "(5m) EUR"', () => {
        const pipeline = RegexPipeline.default();
        const result = pipeline.run("(5m) EUR");

        expect(result.currency).toBe("EUR");
        expect(result.amount).toBe(-5000000);
        expect(result.isNegative).toBe(true);
      });

      test('should parse "minus 2.5k GBP"', () => {
        const pipeline = RegexPipeline.default();
        const result = pipeline.run("minus 2.5k GBP");

        expect(result.currency).toBe("GBP");
        expect(result.amount).toBe(-2500);
        expect(result.isNegative).toBe(true);
      });
    });

    describe("Negative with slang terms", () => {
      test('should parse "-5 bucks"', () => {
        const pipeline = RegexPipeline.default();
        const result = pipeline.run("-5 bucks");

        expect(result.currency).toBe("USD");
        expect(result.amount).toBe(-5);
        expect(result.isNegative).toBe(true);
      });

      test('should parse "(10 quid)"', () => {
        const pipeline = RegexPipeline.default();
        const result = pipeline.run("(10 quid)");

        expect(result.currency).toBe("GBP");
        expect(result.amount).toBe(-10);
        expect(result.isNegative).toBe(true);
      });
    });

    describe("Positive numbers should not be affected", () => {
      test("should parse positive numbers normally", () => {
        const pipeline = RegexPipeline.default();

        const plain = pipeline.run("100 USD");
        expect(plain.amount).toBe(100);
        expect(plain.isNegative).toBeUndefined();

        const symbol = pipeline.run("$50");
        expect(symbol.amount).toBe(50);
        expect(symbol.isNegative).toBeUndefined();

        const formatted = pipeline.run("1,234.56 EUR");
        expect(formatted.amount).toBeCloseTo(1234.56);
        expect(formatted.isNegative).toBeUndefined();
      });
    });

    describe("Edge cases", () => {
      test("should handle zero as negative", () => {
        const pipeline = RegexPipeline.default();
        const result = pipeline.run("-0 USD");

        // -0 in JavaScript is technically a thing, but mathematically equals 0
        expect(result.amount).toBe(-0);
        expect(result.isNegative).toBe(true);
      });

      test("should handle various dash characters", () => {
        const pipeline = RegexPipeline.default();

        // Regular hyphen
        const hyphen = pipeline.run("-100 USD");
        expect(hyphen.amount).toBe(-100);

        // Minus sign (U+2212)
        const minusSign = pipeline.run("−100 USD");
        expect(minusSign.amount).toBe(-100);

        // En dash
        const enDash = pipeline.run("–100 USD");
        expect(enDash.amount).toBe(-100);

        // Em dash
        const emDash = pipeline.run("—100 USD");
        expect(emDash.amount).toBe(-100);
      });
    });
  });
});
