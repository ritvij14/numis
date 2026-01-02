import { describe, expect, test } from "@jest/globals";
import { parseMoney } from "../src/parseMoney";
import { ValueOverflowError } from "../src/errors";

describe("parseMoney", () => {
  describe("currency symbols", () => {
    test("parses dollar symbol with amount", () => {
      const res = parseMoney("Paid $10");
      expect(res.currency).toBe("USD");
      expect(res.amount).toBe(10);
    });

    test("parses euro symbol with amount", () => {
      const res = parseMoney("Cost €50");
      expect(res.currency).toBe("EUR");
      expect(res.amount).toBe(50);
    });

    test("parses pound symbol with amount", () => {
      const res = parseMoney("Spent £25.50");
      expect(res.currency).toBe("GBP");
      expect(res.amount).toBe(25.5);
    });

    test("parses yen symbol with amount", () => {
      const res = parseMoney("Price ¥1000");
      expect(res.currency).toBe("JPY");
      expect(res.amount).toBe(1000);
    });

    test("parses rupee symbol with amount", () => {
      const res = parseMoney("₹500 total");
      expect(res.currency).toBe("INR");
      expect(res.amount).toBe(500);
    });
  });

  describe("ISO currency codes", () => {
    test("parses ISO code before amount", () => {
      const res = parseMoney("USD 100");
      expect(res.currency).toBe("USD");
      expect(res.amount).toBe(100);
    });

    test("parses ISO code after amount", () => {
      const res = parseMoney("100 EUR");
      expect(res.currency).toBe("EUR");
      expect(res.amount).toBe(100);
    });

    test("parses lowercase ISO code", () => {
      const res = parseMoney("50 gbp");
      expect(res.currency).toBe("GBP");
      expect(res.amount).toBe(50);
    });

    test("parses various ISO codes", () => {
      expect(parseMoney("100 JPY").currency).toBe("JPY");
      expect(parseMoney("100 CHF").currency).toBe("CHF");
      expect(parseMoney("100 CAD").currency).toBe("CAD");
      expect(parseMoney("100 AUD").currency).toBe("AUD");
    });
  });

  describe("worded numbers", () => {
    test("parses simple worded numbers", () => {
      const res = parseMoney("one hundred dollars");
      expect(res.amount).toBe(100);
      expect(res.currency).toBe("USD");
    });

    test("parses compound worded numbers", () => {
      const res = parseMoney("twenty-three euros");
      expect(res.amount).toBe(23);
      expect(res.currency).toBe("EUR");
    });

    test("parses large worded numbers", () => {
      const res = parseMoney("one million pounds");
      expect(res.amount).toBe(1000000);
      expect(res.currency).toBe("GBP");
    });

    test("parses billion scale", () => {
      const res = parseMoney("one billion dollars");
      expect(res.amount).toBe(1000000000);
      expect(res.currency).toBe("USD");
    });
  });

  describe("slang terms", () => {
    test("parses buck/bucks", () => {
      expect(parseMoney("5 bucks").amount).toBe(5);
      expect(parseMoney("5 bucks").currency).toBe("USD");

      expect(parseMoney("a buck").amount).toBe(1);
    });

    test("parses quid", () => {
      expect(parseMoney("10 quid").amount).toBe(10);
      expect(parseMoney("10 quid").currency).toBe("GBP");
    });

    test("parses fiver and tenner", () => {
      expect(parseMoney("a fiver").amount).toBe(5);
      expect(parseMoney("a fiver").currency).toBe("GBP");

      expect(parseMoney("a tenner").amount).toBe(10);
      expect(parseMoney("a tenner").currency).toBe("GBP");
    });
  });

  describe("numeric suffixes (k/m/b)", () => {
    test("parses k suffix", () => {
      const res = parseMoney("$10k");
      expect(res.amount).toBe(10000);
      expect(res.currency).toBe("USD");
    });

    test("parses m suffix", () => {
      const res = parseMoney("€5m");
      expect(res.amount).toBe(5000000);
      expect(res.currency).toBe("EUR");
    });

    test("parses b suffix", () => {
      const res = parseMoney("£2b");
      expect(res.amount).toBe(2000000000);
      expect(res.currency).toBe("GBP");
    });

    test("parses bn suffix", () => {
      const res = parseMoney("$1bn");
      expect(res.amount).toBe(1000000000);
      expect(res.currency).toBe("USD");
    });

    test("parses decimal with suffix", () => {
      const res = parseMoney("$1.5m");
      expect(res.amount).toBe(1500000);
    });
  });

  describe("currency names", () => {
    test("parses dollars", () => {
      const res = parseMoney("50 dollars");
      expect(res.currency).toBe("USD");
      expect(res.amount).toBe(50);
    });

    test("parses euros", () => {
      const res = parseMoney("100 euros");
      expect(res.currency).toBe("EUR");
      expect(res.amount).toBe(100);
    });

    test("parses pounds", () => {
      const res = parseMoney("75 pounds");
      expect(res.currency).toBe("GBP");
      expect(res.amount).toBe(75);
    });

    test("parses yen", () => {
      const res = parseMoney("1000 yen");
      expect(res.currency).toBe("JPY");
      expect(res.amount).toBe(1000);
    });

    test("parses rupees", () => {
      const res = parseMoney("500 rupees");
      expect(res.currency).toBe("INR");
      expect(res.amount).toBe(500);
    });
  });

  describe("numbers with separators", () => {
    test("parses comma-separated thousands", () => {
      const res = parseMoney("$1,000");
      expect(res.amount).toBe(1000);
    });

    test("parses large comma-separated numbers", () => {
      const res = parseMoney("$1,234,567");
      expect(res.amount).toBe(1234567);
    });

    test("parses comma-separated with decimals", () => {
      const res = parseMoney("$1,234.56");
      expect(res.amount).toBe(1234.56);
    });
  });

  describe("decimal amounts", () => {
    test("parses simple decimals", () => {
      const res = parseMoney("$10.99");
      expect(res.amount).toBe(10.99);
    });

    test("parses cents only", () => {
      const res = parseMoney("$0.99");
      expect(res.amount).toBe(0.99);
    });

    test("parses euro decimals", () => {
      const res = parseMoney("€25.50");
      expect(res.amount).toBe(25.5);
    });
  });

  describe("edge cases", () => {
    test("handles empty string", () => {
      const res = parseMoney("");
      expect(res.original).toBe("");
      expect(res.amount).toBeUndefined();
      expect(res.currency).toBeUndefined();
    });

    test("handles whitespace only", () => {
      const res = parseMoney("   ");
      expect(res.amount).toBeUndefined();
      expect(res.currency).toBeUndefined();
    });

    test("handles text with no monetary expression", () => {
      const res = parseMoney("Hello world");
      expect(res.amount).toBeUndefined();
      expect(res.currency).toBeUndefined();
    });

    test("handles numbers without currency", () => {
      const res = parseMoney("I have 100 apples");
      // Should detect number but no currency context
      expect(res.amount).toBe(100);
      expect(res.currency).toBeUndefined();
    });

    test("handles currency without amount", () => {
      const res = parseMoney("I need some USD");
      expect(res.currency).toBe("USD");
      expect(res.amount).toBeUndefined();
    });

    test("preserves original input", () => {
      const input = "Paid $10 for lunch";
      const res = parseMoney(input);
      expect(res.original).toBe(input);
    });
  });

  describe("return value structure", () => {
    test("returns object with expected properties", () => {
      const res = parseMoney("$100");

      expect(res).toHaveProperty("original");
      expect(res).toHaveProperty("currency");
      expect(res).toHaveProperty("amount");
      expect(res).toHaveProperty("matches");
    });

    test("original property contains input string", () => {
      const input = "Cost is $50";
      const res = parseMoney(input);
      expect(res.original).toBe(input);
    });

    test("currency is a string when detected", () => {
      const res = parseMoney("$100");
      expect(typeof res.currency).toBe("string");
    });

    test("amount is a number when detected", () => {
      const res = parseMoney("$100");
      expect(typeof res.amount).toBe("number");
    });

    test("matches is an object", () => {
      const res = parseMoney("$100");
      expect(typeof res.matches).toBe("object");
    });
  });

  describe("ValueOverflowError handling", () => {
    test("throws ValueOverflowError for numbers exceeding MAX_SAFE_INTEGER", () => {
      const overMax = (Number.MAX_SAFE_INTEGER + 1).toString();

      expect(() => parseMoney(`${overMax} USD`)).toThrow(ValueOverflowError);
      expect(() => parseMoney(`${overMax} USD`)).toThrow(
        /exceeds maximum safe integer/
      );
    });

    test("throws ValueOverflowError for very large numbers with symbols", () => {
      expect(() => parseMoney("$100000000000000000")).toThrow(
        ValueOverflowError
      );
    });

    test("throws ValueOverflowError for very large numbers with currency names", () => {
      expect(() => parseMoney("100000000000000000 dollars")).toThrow(
        ValueOverflowError
      );
    });

    test("accepts numbers at MAX_SAFE_INTEGER", () => {
      const maxSafe = Number.MAX_SAFE_INTEGER.toString();
      const res = parseMoney(`${maxSafe} USD`);
      expect(res.amount).toBe(Number.MAX_SAFE_INTEGER);
    });

    test("accepts large but safe numbers", () => {
      const res = parseMoney("$1000000000000"); // 1 trillion, well below MAX_SAFE_INTEGER
      expect(res.amount).toBe(1000000000000);
    });
  });

  describe("contextual phrases", () => {
    test("parses 'a dollar'", () => {
      const res = parseMoney("a dollar");
      expect(res.amount).toBe(1);
      expect(res.currency).toBe("USD");
    });

    test("parses 'a hundred dollars'", () => {
      const res = parseMoney("a hundred dollars");
      expect(res.amount).toBe(100);
      expect(res.currency).toBe("USD");
    });
  });
});
