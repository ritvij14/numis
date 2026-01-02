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
});
