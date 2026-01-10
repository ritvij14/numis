import { describe, expect, test } from "@jest/globals";
import { parseMoney } from "../src/parseMoney";
import { MoneyParseError } from "../src/errors";

describe("defaultCurrency option", () => {
  describe("basic functionality", () => {
    test("applies default currency when no currency detected", () => {
      const res = parseMoney("I have 100", { defaultCurrency: "EUR" });
      expect(res.currency).toBe("EUR");
      expect(res.amount).toBe(100);
      expect(res.currencyWasDefault).toBe(true);
    });

    test("applies default currency with different currencies", () => {
      expect(
        parseMoney("Total: 50", { defaultCurrency: "GBP" }).currency
      ).toBe("GBP");
      expect(
        parseMoney("Price is 1000", { defaultCurrency: "JPY" }).currency
      ).toBe("JPY");
      expect(
        parseMoney("Cost: 500", { defaultCurrency: "INR" }).currency
      ).toBe("INR");
    });

    test("sets currencyWasDefault flag when default is applied", () => {
      const res = parseMoney("Amount: 100", { defaultCurrency: "USD" });
      expect(res.currencyWasDefault).toBe(true);
    });

    test("does not set currencyWasDefault when currency is detected", () => {
      const res = parseMoney("$100", { defaultCurrency: "EUR" });
      expect(res.currencyWasDefault).toBeUndefined();
    });
  });

  describe("detected currency takes precedence", () => {
    test("symbol detection takes precedence over default", () => {
      const res = parseMoney("$50", { defaultCurrency: "EUR" });
      expect(res.currency).toBe("USD");
      expect(res.amount).toBe(50);
      expect(res.currencyWasDefault).toBeUndefined();
    });

    test("euro symbol takes precedence over default", () => {
      const res = parseMoney("€100", { defaultCurrency: "GBP" });
      expect(res.currency).toBe("EUR");
      expect(res.currencyWasDefault).toBeUndefined();
    });

    test("pound symbol takes precedence over default", () => {
      const res = parseMoney("£75", { defaultCurrency: "USD" });
      expect(res.currency).toBe("GBP");
    });

    test("ISO code takes precedence over default", () => {
      const res = parseMoney("100 CAD", { defaultCurrency: "USD" });
      expect(res.currency).toBe("CAD");
      expect(res.currencyWasDefault).toBeUndefined();
    });

    test("currency name takes precedence over default", () => {
      const res = parseMoney("50 euros", { defaultCurrency: "USD" });
      expect(res.currency).toBe("EUR");
    });

    test("slang term currency takes precedence over default", () => {
      const res = parseMoney("10 quid", { defaultCurrency: "USD" });
      expect(res.currency).toBe("GBP");
    });
  });

  describe("backwards compatibility", () => {
    test("works without options parameter", () => {
      const res = parseMoney("$100");
      expect(res.currency).toBe("USD");
      expect(res.amount).toBe(100);
    });

    test("works with undefined options", () => {
      const res = parseMoney("€50", undefined);
      expect(res.currency).toBe("EUR");
      expect(res.amount).toBe(50);
    });

    test("works with empty options object", () => {
      const res = parseMoney("£25", {});
      expect(res.currency).toBe("GBP");
      expect(res.amount).toBe(25);
    });

    test("returns undefined currency when no default and no detection", () => {
      const res = parseMoney("I have 100 apples");
      expect(res.amount).toBe(100);
      expect(res.currency).toBeUndefined();
      expect(res.currencyWasDefault).toBeUndefined();
    });
  });

  describe("validation", () => {
    test("throws MoneyParseError for invalid currency code", () => {
      expect(() =>
        parseMoney("100", { defaultCurrency: "INVALID" })
      ).toThrow(MoneyParseError);
    });

    test("throws MoneyParseError for empty currency code", () => {
      expect(() => parseMoney("100", { defaultCurrency: "" })).toThrow(
        MoneyParseError
      );
    });

    test("error message includes the invalid currency code", () => {
      expect(() =>
        parseMoney("100", { defaultCurrency: "XYZ" })
      ).toThrow(/XYZ/);
    });

    test("error message mentions ISO-4217", () => {
      expect(() =>
        parseMoney("100", { defaultCurrency: "FAKE" })
      ).toThrow(/ISO-4217/);
    });

    test("accepts valid ISO-4217 codes", () => {
      // Common currencies
      expect(() =>
        parseMoney("100", { defaultCurrency: "USD" })
      ).not.toThrow();
      expect(() =>
        parseMoney("100", { defaultCurrency: "EUR" })
      ).not.toThrow();
      expect(() =>
        parseMoney("100", { defaultCurrency: "GBP" })
      ).not.toThrow();
      expect(() =>
        parseMoney("100", { defaultCurrency: "JPY" })
      ).not.toThrow();

      // Less common currencies
      expect(() =>
        parseMoney("100", { defaultCurrency: "CHF" })
      ).not.toThrow();
      expect(() =>
        parseMoney("100", { defaultCurrency: "AUD" })
      ).not.toThrow();
      expect(() =>
        parseMoney("100", { defaultCurrency: "CAD" })
      ).not.toThrow();
      expect(() =>
        parseMoney("100", { defaultCurrency: "INR" })
      ).not.toThrow();
    });

    test("accepts lowercase currency codes", () => {
      const res = parseMoney("100", { defaultCurrency: "eur" });
      // The currency-codes package handles case insensitivity
      expect(res.currency).toBe("eur");
      expect(res.amount).toBe(100);
    });
  });

  describe("edge cases", () => {
    test("applies default to empty input with no amount", () => {
      const res = parseMoney("", { defaultCurrency: "EUR" });
      expect(res.original).toBe("");
      expect(res.amount).toBeUndefined();
      // No amount detected, but default currency should still not apply
      // since there's nothing to apply it to
      expect(res.currency).toBe("EUR");
    });

    test("applies default to whitespace-only input", () => {
      const res = parseMoney("   ", { defaultCurrency: "GBP" });
      expect(res.amount).toBeUndefined();
      expect(res.currency).toBe("GBP");
    });

    test("works with decimal amounts", () => {
      const res = parseMoney("Total: 99.99", { defaultCurrency: "EUR" });
      expect(res.amount).toBe(99.99);
      expect(res.currency).toBe("EUR");
      expect(res.currencyWasDefault).toBe(true);
    });

    test("works with comma-separated amounts", () => {
      const res = parseMoney("Amount: 1,234.56", { defaultCurrency: "GBP" });
      expect(res.amount).toBe(1234.56);
      expect(res.currency).toBe("GBP");
      expect(res.currencyWasDefault).toBe(true);
    });

    test("works with worded numbers", () => {
      const res = parseMoney("one hundred", { defaultCurrency: "JPY" });
      expect(res.amount).toBe(100);
      expect(res.currency).toBe("JPY");
      expect(res.currencyWasDefault).toBe(true);
    });

    test("works with numeric suffixes (k/m/b)", () => {
      const res = parseMoney("Budget: 5m", { defaultCurrency: "USD" });
      expect(res.amount).toBe(5000000);
      expect(res.currency).toBe("USD");
      expect(res.currencyWasDefault).toBe(true);
    });

    test("preserves original input in result", () => {
      const input = "The price is 42";
      const res = parseMoney(input, { defaultCurrency: "EUR" });
      expect(res.original).toBe(input);
    });
  });

  describe("integration with various patterns", () => {
    test("plain number with default currency", () => {
      const res = parseMoney("123", { defaultCurrency: "CHF" });
      expect(res.amount).toBe(123);
      expect(res.currency).toBe("CHF");
    });

    test("large number with default currency", () => {
      const res = parseMoney("1000000", { defaultCurrency: "INR" });
      expect(res.amount).toBe(1000000);
      expect(res.currency).toBe("INR");
    });

    test("contextual phrase without currency gets default", () => {
      // Simple amount without currency word
      const res = parseMoney("the total is 250", {
        defaultCurrency: "AUD",
      });
      expect(res.amount).toBe(250);
      expect(res.currency).toBe("AUD");
      expect(res.currencyWasDefault).toBe(true);
    });
  });
});
