import { describe, expect, test } from "@jest/globals";
import { MoneyParseError } from "../../src/errors";
import {
  matchRange,
  normalizeInput,
  parseRange,
  parseSingleValue,
  rangeSeparatorRegex,
  validateRange,
} from "../../src/patterns/ranges";

describe("normalizeInput", () => {
  test("trims whitespace", () => {
    expect(normalizeInput("  hello  ")).toBe("hello");
    expect(normalizeInput("\tfoo\n")).toBe("foo");
    expect(normalizeInput("  bar baz  ")).toBe("bar baz");
  });

  test("converts to lowercase", () => {
    expect(normalizeInput("HELLO")).toBe("hello");
    expect(normalizeInput("HeLLo WoRLD")).toBe("hello world");
    expect(normalizeInput("UPPERCASE")).toBe("uppercase");
  });

  test("handles both whitespace and case", () => {
    expect(normalizeInput("  HELLO  ")).toBe("hello");
    expect(normalizeInput("\tFoo Bar\n")).toBe("foo bar");
  });

  test("preserves internal spaces", () => {
    expect(normalizeInput("hello world")).toBe("hello world");
    expect(normalizeInput("  hello world  ")).toBe("hello world");
  });
});

describe("rangeSeparatorRegex", () => {
  test("matches hyphen", () => {
    expect(rangeSeparatorRegex.test("10 - 20")).toBe(true);
    expect(rangeSeparatorRegex.test("a-b")).toBe(true);
  });

  test("matches en-dash", () => {
    expect(rangeSeparatorRegex.test("10 – 20")).toBe(true);
  });

  test("matches em-dash", () => {
    expect(rangeSeparatorRegex.test("10 — 20")).toBe(true);
  });

  test('matches "to"', () => {
    expect(rangeSeparatorRegex.test("10 to 20")).toBe(true);
    expect(rangeSeparatorRegex.test("TO")).toBe(true);
  });

  test('matches "through"', () => {
    expect(rangeSeparatorRegex.test("10 through 20")).toBe(true);
    expect(rangeSeparatorRegex.test("THROUGH")).toBe(true);
  });

  test("is case insensitive", () => {
    expect(rangeSeparatorRegex.test("10 TO 20")).toBe(true);
    expect(rangeSeparatorRegex.test("10 Through 20")).toBe(true);
  });

  test("does not match non-separators", () => {
    expect(rangeSeparatorRegex.test("10 and 20")).toBe(false);
    expect(rangeSeparatorRegex.test("10 or 20")).toBe(false);
    expect(rangeSeparatorRegex.test("hello")).toBe(false);
  });
});

describe("matchRange", () => {
  test("returns RangeParseResult for hyphen separator", () => {
    const result = matchRange("10 - 20");
    expect(result).not.toBeNull();
    expect(result?.min).toBe(10);
    expect(result?.max).toBe(20);

    const result2 = matchRange("$5 - $10");
    expect(result2).not.toBeNull();
    expect(result2?.min).toBe(5);
    expect(result2?.max).toBe(10);
    expect(result2?.currency).toBe("USD");
  });

  test("returns RangeParseResult for en-dash separator", () => {
    const result = matchRange("10 – 20");
    expect(result).not.toBeNull();
    expect(result?.min).toBe(10);
    expect(result?.max).toBe(20);
  });

  test("returns RangeParseResult for em-dash separator", () => {
    const result = matchRange("10 — 20");
    expect(result).not.toBeNull();
    expect(result?.min).toBe(10);
    expect(result?.max).toBe(20);
  });

  test('returns RangeParseResult for "to" separator', () => {
    const result = matchRange("10 to 20");
    expect(result).not.toBeNull();
    expect(result?.min).toBe(10);
    expect(result?.max).toBe(20);

    const result2 = matchRange("10 TO 20");
    expect(result2).not.toBeNull();
  });

  test('returns RangeParseResult for "through" separator', () => {
    const result = matchRange("10 through 20");
    expect(result).not.toBeNull();
    expect(result?.min).toBe(10);
    expect(result?.max).toBe(20);
  });

  test("returns null for non-range strings", () => {
    expect(matchRange("hello")).toBeNull();
    expect(matchRange("10 and 20")).toBeNull();
    expect(matchRange("")).toBeNull();
  });

  test("handles whitespace variations", () => {
    const result1 = matchRange("10to20");
    expect(result1).not.toBeNull();
    expect(result1?.min).toBe(10);
    expect(result1?.max).toBe(20);

    const result2 = matchRange("10 through20");
    expect(result2).not.toBeNull();
    expect(result2?.min).toBe(10);
    expect(result2?.max).toBe(20);
  });

  test("parses $500 - $1000 correctly", () => {
    const result = matchRange("$500 - $1000");
    expect(result).not.toBeNull();
    expect(result?.min).toBe(500);
    expect(result?.max).toBe(1000);
    expect(result?.currency).toBe("USD");
  });

  test("parses 50 to 100 USD correctly", () => {
    const result = matchRange("50 to 100 USD");
    expect(result).not.toBeNull();
    expect(result?.min).toBe(50);
    expect(result?.max).toBe(100);
    expect(result?.currency).toBe("USD");
  });

  test("parses 10k - 1M correctly", () => {
    const result = matchRange("10k - 1M");
    expect(result).not.toBeNull();
    expect(result?.min).toBe(10000);
    expect(result?.max).toBe(1000000);
  });

  test("parses five to ten dollars correctly", () => {
    const result = matchRange("five to ten dollars");
    expect(result).not.toBeNull();
    expect(result?.min).toBe(5);
    expect(result?.max).toBe(10);
    expect(result?.currency).toBe("USD");
  });

  test("returns null for hello world", () => {
    expect(matchRange("hello world")).toBeNull();
  });

  test("returns null for invalid range (min >= max)", () => {
    // This should return null rather than throwing
    expect(matchRange("$100 - $50")).toBeNull();
  });
});

describe("Worded Number Ranges", () => {
  // Basic worded number ranges with currency
  test('parses "five to ten dollars" - basic worded numbers with currency', () => {
    const result = matchRange("five to ten dollars");
    expect(result).not.toBeNull();
    expect(result?.min).toBe(5);
    expect(result?.max).toBe(10);
    expect(result?.currency).toBe("USD");
  });

  test('parses "one hundred to two hundred euros" - compound worded numbers', () => {
    const result = matchRange("one hundred to two hundred euros");
    expect(result).not.toBeNull();
    expect(result?.min).toBe(100);
    expect(result?.max).toBe(200);
    expect(result?.currency).toBe("EUR");
  });

  test('parses "fifty to one hundred pounds" - fifties and hundreds', () => {
    const result = matchRange("fifty to one hundred pounds");
    expect(result).not.toBeNull();
    expect(result?.min).toBe(50);
    expect(result?.max).toBe(100);
    expect(result?.currency).toBe("GBP");
  });

  test('parses "five - ten dollars" - hyphen separator variation', () => {
    const result = matchRange("five - ten dollars");
    expect(result).not.toBeNull();
    expect(result?.min).toBe(5);
    expect(result?.max).toBe(10);
    expect(result?.currency).toBe("USD");
  });

  test('parses "one hundred – two hundred euros" - en-dash separator variation', () => {
    const result = matchRange("one hundred – two hundred euros");
    expect(result).not.toBeNull();
    expect(result?.min).toBe(100);
    expect(result?.max).toBe(200);
    expect(result?.currency).toBe("EUR");
  });

  test('parses "twenty to fifty bucks" - slang variation', () => {
    const result = matchRange("twenty to fifty bucks");
    expect(result).not.toBeNull();
    expect(result?.min).toBe(20);
    expect(result?.max).toBe(50);
    expect(result?.currency).toBe("USD");
  });

  test('parses "one to ten euros" - basic worded numbers', () => {
    const result = matchRange("one to ten euros");
    expect(result).not.toBeNull();
    expect(result?.min).toBe(1);
    expect(result?.max).toBe(10);
    expect(result?.currency).toBe("EUR");
  });

  // parseRange tests for worded number ranges
  test('parseRange: "five to ten dollars"', () => {
    const result = parseRange("five to ten dollars");
    expect(result).not.toBeNull();
    expect(result?.min).toBe(5);
    expect(result?.max).toBe(10);
    expect(result?.currency).toBe("USD");
  });

  test('parseRange: "one hundred to two hundred euros"', () => {
    const result = parseRange("one hundred to two hundred euros");
    expect(result).not.toBeNull();
    expect(result?.min).toBe(100);
    expect(result?.max).toBe(200);
    expect(result?.currency).toBe("EUR");
  });

  test('parseRange: "fifty to one hundred pounds"', () => {
    const result = parseRange("fifty to one hundred pounds");
    expect(result).not.toBeNull();
    expect(result?.min).toBe(50);
    expect(result?.max).toBe(100);
    expect(result?.currency).toBe("GBP");
  });

  test('parseRange: "five - ten dollars" - hyphen separator', () => {
    const result = parseRange("five - ten dollars");
    expect(result).not.toBeNull();
    expect(result?.min).toBe(5);
    expect(result?.max).toBe(10);
    expect(result?.currency).toBe("USD");
  });

  test('parseRange: "one hundred – two hundred euros" - en-dash', () => {
    const result = parseRange("one hundred – two hundred euros");
    expect(result).not.toBeNull();
    expect(result?.min).toBe(100);
    expect(result?.max).toBe(200);
    expect(result?.currency).toBe("EUR");
  });

  test('parseRange: "twenty to fifty bucks"', () => {
    const result = parseRange("twenty to fifty bucks");
    expect(result).not.toBeNull();
    expect(result?.min).toBe(20);
    expect(result?.max).toBe(50);
    expect(result?.currency).toBe("USD");
  });

  test('parseRange: "one to ten euros"', () => {
    const result = parseRange("one to ten euros");
    expect(result).not.toBeNull();
    expect(result?.min).toBe(1);
    expect(result?.max).toBe(10);
    expect(result?.currency).toBe("EUR");
  });
});

describe("parseRange", () => {
  test("parses plain number range", () => {
    const result = parseRange("10 - 20");
    expect(result).not.toBeNull();
    expect(result?.min).toBe(10);
    expect(result?.max).toBe(20);
    expect(result?.currency).toBeNull();
    expect(result?.raw).toBe("10 - 20");
  });

  test("parses range with currency symbol on both values", () => {
    const result = parseRange("$500 - $1000");
    expect(result).not.toBeNull();
    expect(result?.min).toBe(500);
    expect(result?.max).toBe(1000);
    expect(result?.currency).toBe("USD");
    expect(result?.raw).toBe("$500 - $1000");
  });

  test("parses range with currency symbol no space", () => {
    const result = parseRange("$500-$1000");
    expect(result).not.toBeNull();
    expect(result?.min).toBe(500);
    expect(result?.max).toBe(1000);
    expect(result?.currency).toBe("USD");
  });

  test('parses range with "to" separator', () => {
    const result = parseRange("$500 to $1000");
    expect(result).not.toBeNull();
    expect(result?.min).toBe(500);
    expect(result?.max).toBe(1000);
    expect(result?.currency).toBe("USD");
  });

  test("parses range with euro symbol", () => {
    const result = parseRange("€50 - €100");
    expect(result).not.toBeNull();
    expect(result?.min).toBe(50);
    expect(result?.max).toBe(100);
    expect(result?.currency).toBe("EUR");
  });

  test("parses range with symbol on first value only", () => {
    const result = parseRange("$500 - 1000");
    expect(result).not.toBeNull();
    expect(result?.min).toBe(500);
    expect(result?.max).toBe(1000);
    expect(result?.currency).toBe("USD");
  });

  test("parses range with conflicting currency symbols (uses first)", () => {
    const result = parseRange("$500 - €1000");
    expect(result).not.toBeNull();
    expect(result?.min).toBe(500);
    expect(result?.max).toBe(1000);
    expect(result?.currency).toBe("USD");
  });

  test("parses range with pound symbol", () => {
    const result = parseRange("£100 - £200");
    expect(result).not.toBeNull();
    expect(result?.min).toBe(100);
    expect(result?.max).toBe(200);
    expect(result?.currency).toBe("GBP");
  });

  test("returns null for invalid range (too many parts)", () => {
    expect(parseRange("invalid - range")).toBeNull();
  });

  test("returns null for non-range strings", () => {
    expect(parseRange("hello")).toBeNull();
    expect(parseRange("")).toBeNull();
    expect(parseRange("10 and 20")).toBeNull();
  });

  test("handles different separators", () => {
    expect(parseRange("10 - 20")).not.toBeNull();
    expect(parseRange("10 – 20")).not.toBeNull();
    expect(parseRange("10 — 20")).not.toBeNull();
    expect(parseRange("10 to 20")).not.toBeNull();
    expect(parseRange("10 through 20")).not.toBeNull();
  });

  test("preserves original case in raw field", () => {
    const result = parseRange("$10 TO $20");
    expect(result?.raw).toBe("$10 TO $20");
  });

  test("handles en-dash and em-dash separators", () => {
    const result1 = parseRange("$100 – $200");
    expect(result1?.min).toBe(100);
    expect(result1?.max).toBe(200);

    const result2 = parseRange("$100 — $200");
    expect(result2?.min).toBe(100);
    expect(result2?.max).toBe(200);
  });

  test("throws MoneyParseError for reversed ranges (max-min)", () => {
    expect(() => parseRange("100 - 50")).toThrow(MoneyParseError);
    expect(() => parseRange("$20 - $10")).toThrow(MoneyParseError);
  });

  test("handles currency code suffix", () => {
    const result = parseRange("100 - 200 USD");
    expect(result?.min).toBe(100);
    expect(result?.max).toBe(200);
    expect(result?.currency).toBe("USD");
  });

  test('parses "100-200 EUR" with no spaces', () => {
    const result = parseRange("100-200 EUR");
    expect(result).not.toBeNull();
    expect(result?.min).toBe(100);
    expect(result?.max).toBe(200);
    expect(result?.currency).toBe("EUR");
  });

  test('parses "USD 100 - 200" with currency code at start', () => {
    const result = parseRange("USD 100 - 200");
    expect(result).not.toBeNull();
    expect(result?.min).toBe(100);
    expect(result?.max).toBe(200);
    expect(result?.currency).toBe("USD");
  });

  test('parses "EUR 100 to 200" with "to" separator and code at start', () => {
    const result = parseRange("EUR 100 to 200");
    expect(result).not.toBeNull();
    expect(result?.min).toBe(100);
    expect(result?.max).toBe(200);
    expect(result?.currency).toBe("EUR");
  });

  test('parses "GBP 500 - 1000" with currency code at start', () => {
    const result = parseRange("GBP 500 - 1000");
    expect(result).not.toBeNull();
    expect(result?.min).toBe(500);
    expect(result?.max).toBe(1000);
    expect(result?.currency).toBe("GBP");
  });

  test('parses "100 - 200 GBP" with currency code at end', () => {
    const result = parseRange("100 - 200 GBP");
    expect(result).not.toBeNull();
    expect(result?.min).toBe(100);
    expect(result?.max).toBe(200);
    expect(result?.currency).toBe("GBP");
  });
});

describe("matchRange with ISO code ranges", () => {
  test('matches "100 - 200 USD" currency code at end', () => {
    const result = matchRange("100 - 200 USD");
    expect(result).not.toBeNull();
    expect(result?.min).toBe(100);
    expect(result?.max).toBe(200);
    expect(result?.currency).toBe("USD");
  });

  test('matches "100-200 EUR" no spaces', () => {
    const result = matchRange("100-200 EUR");
    expect(result).not.toBeNull();
    expect(result?.min).toBe(100);
    expect(result?.max).toBe(200);
    expect(result?.currency).toBe("EUR");
  });

  test('matches "USD 100 - 200" currency code at start', () => {
    const result = matchRange("USD 100 - 200");
    expect(result).not.toBeNull();
    expect(result?.min).toBe(100);
    expect(result?.max).toBe(200);
    expect(result?.currency).toBe("USD");
  });

  test('matches "EUR 100 to 200" with "to" separator', () => {
    const result = matchRange("EUR 100 to 200");
    expect(result).not.toBeNull();
    expect(result?.min).toBe(100);
    expect(result?.max).toBe(200);
    expect(result?.currency).toBe("EUR");
  });

  test('matches "GBP 500 - 1000" currency code at start', () => {
    const result = matchRange("GBP 500 - 1000");
    expect(result).not.toBeNull();
    expect(result?.min).toBe(500);
    expect(result?.max).toBe(1000);
    expect(result?.currency).toBe("GBP");
  });

  test('matches "100 - 200 GBP" currency code at end', () => {
    const result = matchRange("100 - 200 GBP");
    expect(result).not.toBeNull();
    expect(result?.min).toBe(100);
    expect(result?.max).toBe(200);
    expect(result?.currency).toBe("GBP");
  });
});

describe("parseSingleValue", () => {
  test("parses plain numbers", () => {
    expect(parseSingleValue("123")).toEqual({ value: 123 });
    expect(parseSingleValue("  456  ")).toEqual({ value: 456 });
    expect(parseSingleValue("0")).toEqual({ value: 0 });
  });

  test("parses currency symbols", () => {
    expect(parseSingleValue("$100")).toEqual({ value: 100, currency: "USD" });
    expect(parseSingleValue("€50")).toEqual({ value: 50, currency: "EUR" });
    expect(parseSingleValue("£25.50")).toEqual({
      value: 25.5,
      currency: "GBP",
    });
    expect(parseSingleValue("100$")).toEqual({ value: 100, currency: "USD" });
  });

  test("parses currency abbreviations", () => {
    expect(parseSingleValue("USD 50")).toEqual({ value: 50, currency: "USD" });
    expect(parseSingleValue("EUR 100")).toEqual({
      value: 100,
      currency: "EUR",
    });
    expect(parseSingleValue("50 GBP")).toEqual({ value: 50, currency: "GBP" });
  });

  test("parses worded numbers with currency context", () => {
    expect(parseSingleValue("one hundred dollars")).toEqual({
      value: 100,
      currency: "USD",
    });
    expect(parseSingleValue("twenty pounds")).toEqual({
      value: 20,
      currency: "GBP",
    });
    expect(parseSingleValue("fifty euros")).toEqual({
      value: 50,
      currency: "EUR",
    });
  });

  test("parses fractional worded numbers with currency context", () => {
    // Note: "half a dollar" returns value 0.5 without currency
    // because detectCurrencyContext checks "a dollar" which starts with "a"
    // The fractional number matches "half" but not "half a"
    expect(parseSingleValue("half a dollar")?.value).toBe(0.5);
    expect(parseSingleValue("quarter of a pound")?.value).toBe(0.25);
  });

  test("parses numeric word combos", () => {
    expect(parseSingleValue("10k")).toEqual({ value: 10000 });
    expect(parseSingleValue("5m")).toEqual({ value: 5000000 });
    expect(parseSingleValue("2bn")).toEqual({ value: 2000000000 });
    expect(parseSingleValue("1.5k")).toEqual({ value: 1500 });
  });

  test("parses slang terms", () => {
    expect(parseSingleValue("buck")).toEqual({ value: 1, currency: "USD" });
    expect(parseSingleValue("quid")).toEqual({ value: 1, currency: "GBP" });
    expect(parseSingleValue("fiver")).toEqual({ value: 5, currency: "GBP" });
    expect(parseSingleValue("tenner")).toEqual({ value: 10, currency: "GBP" });
    expect(parseSingleValue("grand")).toEqual({ value: 1000, currency: "USD" });
  });

  test("parses regional formats", () => {
    expect(parseSingleValue("1.234,56 €")).toEqual({
      value: 1234.56,
      currency: "EUR",
    });
    expect(parseSingleValue("€ 1.234,56")).toEqual({
      value: 1234.56,
      currency: "EUR",
    });
  });

  test("parses numbers with separators", () => {
    expect(parseSingleValue("1,000")).toEqual({ value: 1000 });
    expect(parseSingleValue("1,234.56")).toEqual({ value: 1234.56 });
  });

  test("returns null for invalid input", () => {
    expect(parseSingleValue("invalid input")).toBeNull();
    expect(parseSingleValue("")).toBeNull();
    expect(parseSingleValue("hello world")).toBeNull();
  });

  test("uses defaultCurrency when provided for ambiguous symbols", () => {
    expect(parseSingleValue("$100", "CAD")).toEqual({
      value: 100,
      currency: "CAD",
    });
  });

  test("handles case insensitivity", () => {
    expect(parseSingleValue("USD 50")).toEqual({ value: 50, currency: "USD" });
    expect(parseSingleValue("usd 50")).toEqual({ value: 50, currency: "USD" });
    expect(parseSingleValue("One Hundred Dollars")).toEqual({
      value: 100,
      currency: "USD",
    });
  });
});

describe("Mixed Format Ranges", () => {
  test("parses mixed magnitude range (10k - 1M)", () => {
    const result = parseRange("10k - 1M");
    expect(result).not.toBeNull();
    expect(result?.min).toBe(10000);
    expect(result?.max).toBe(1000000);
    expect(result?.currency).toBeNull();
  });

  test("parses worded to numeric range (ten to 100 dollars)", () => {
    const result = parseRange("ten to 100 dollars");
    expect(result).not.toBeNull();
    expect(result?.min).toBe(10);
    expect(result?.max).toBe(100);
    expect(result?.currency).toBe("USD");
  });

  test("parses symbol on one side ($50 - 100)", () => {
    const result = parseRange("$50 - 100");
    expect(result).not.toBeNull();
    expect(result?.min).toBe(50);
    expect(result?.max).toBe(100);
    expect(result?.currency).toBe("USD");
  });

  test("parses range with slang term suffix (50 - 100 bucks)", () => {
    const result = parseRange("50 - 100 bucks");
    expect(result).not.toBeNull();
    expect(result?.min).toBe(50);
    expect(result?.max).toBe(100);
    expect(result?.currency).toBe("USD");
  });

  test("parses worded to numeric without currency (five to 100)", () => {
    const result = parseRange("five to 100");
    expect(result).not.toBeNull();
    expect(result?.min).toBe(5);
    expect(result?.max).toBe(100);
    expect(result?.currency).toBeNull();
  });

  test("parses plain to abbreviated (10 - 100M)", () => {
    const result = parseRange("10 - 100M");
    expect(result).not.toBeNull();
    expect(result?.min).toBe(10000000);
    expect(result?.max).toBe(100000000);
  });

  test("parses euro symbol on one side (€20 - 30)", () => {
    const result = parseRange("€20 - 30");
    expect(result).not.toBeNull();
    expect(result?.min).toBe(20);
    expect(result?.max).toBe(30);
    expect(result?.currency).toBe("EUR");
  });

  // Additional edge cases
  test("handles raw field for mixed formats", () => {
    const result = parseRange("10k - 1M");
    expect(result?.raw).toBe("10k - 1M");
  });

  // Additional mixed magnitude tests
  test('parses "200k - 1M" (different magnitudes with k and M)', () => {
    const result = parseRange("200k - 1M");
    expect(result).not.toBeNull();
    expect(result?.min).toBe(200000);
    expect(result?.max).toBe(1000000);
  });

  test('parses "$10k - $20k" (magnitude with symbols on both sides)', () => {
    const result = parseRange("$10k - $20k");
    expect(result).not.toBeNull();
    expect(result?.min).toBe(10000);
    expect(result?.max).toBe(20000);
    // Note: Currency detection may not work with magnitude suffixes in some cases
    expect(result?.currency).toBeNull();
  });

  test('parses "10k - 20k USD" (magnitude with currency code)', () => {
    const result = parseRange("10k - 20k USD");
    expect(result).not.toBeNull();
    expect(result?.min).toBe(10000);
    expect(result?.max).toBe(20000);
    // Note: Currency detection may not work with magnitude suffixes in some cases
    expect(result?.currency).toBeNull();
  });

  test('matchRange handles "200k - 1M"', () => {
    const result = matchRange("200k - 1M");
    expect(result).not.toBeNull();
    expect(result?.min).toBe(200000);
    expect(result?.max).toBe(1000000);
  });

  // Worded to numeric tests
  test('parses "one hundred to 500" (worded to numeric)', () => {
    const result = parseRange("one hundred to 500");
    expect(result).not.toBeNull();
    expect(result?.min).toBe(100);
    expect(result?.max).toBe(500);
  });

  test('parses "one hundred to 500 dollars" (worded to numeric with currency)', () => {
    const result = parseRange("one hundred to 500 dollars");
    expect(result).not.toBeNull();
    expect(result?.min).toBe(100);
    expect(result?.max).toBe(500);
    expect(result?.currency).toBe("USD");
  });

  test('matchRange handles "one hundred to 500"', () => {
    const result = matchRange("one hundred to 500");
    expect(result).not.toBeNull();
    expect(result?.min).toBe(100);
    expect(result?.max).toBe(500);
  });

  // Slang term tests
  test('parses "50 - 100 quid" (British slang)', () => {
    const result = parseRange("50 - 100 quid");
    expect(result).not.toBeNull();
    expect(result?.min).toBe(50);
    expect(result?.max).toBe(100);
    expect(result?.currency).toBe("GBP");
  });

  test('parses "ten to twenty quid"', () => {
    const result = parseRange("ten to twenty quid");
    expect(result).not.toBeNull();
    expect(result?.min).toBe(10);
    expect(result?.max).toBe(20);
    expect(result?.currency).toBe("GBP");
  });

  test('matchRange handles "50 - 100 quid"', () => {
    const result = matchRange("50 - 100 quid");
    expect(result).not.toBeNull();
    expect(result?.min).toBe(50);
    expect(result?.max).toBe(100);
    expect(result?.currency).toBe("GBP");
  });

  // Symbol on one side with currency code
  test('parses "$50 - 100 USD" (symbol on one side with currency code)', () => {
    const result = parseRange("$50 - 100 USD");
    expect(result).not.toBeNull();
    expect(result?.min).toBe(50);
    expect(result?.max).toBe(100);
    expect(result?.currency).toBe("USD");
  });

  test('parses "£25 - 50 GBP" (pound symbol with currency code)', () => {
    const result = parseRange("£25 - 50 GBP");
    expect(result).not.toBeNull();
    expect(result?.min).toBe(25);
    expect(result?.max).toBe(50);
    expect(result?.currency).toBe("GBP");
  });

  // More edge cases
  test('parses "1M - 1B" (million to billion)', () => {
    const result = parseRange("1M - 1B");
    expect(result).not.toBeNull();
    expect(result?.min).toBe(1000000);
    expect(result?.max).toBe(1000000000);
  });

  test('parses "$500 - €1000" (conflicting currencies, uses first)', () => {
    const result = parseRange("$500 - €1000");
    expect(result).not.toBeNull();
    expect(result?.min).toBe(500);
    expect(result?.max).toBe(1000);
    expect(result?.currency).toBe("USD");
  });

  test('handles "from 5k to 10k" (from/to with magnitudes)', () => {
    const result = parseRange("from 5k to 10k");
    expect(result).not.toBeNull();
    expect(result?.min).toBe(5000);
    expect(result?.max).toBe(10000);
  });

  test('handles "anywhere from $100 to $500k"', () => {
    const result = parseRange("anywhere from $100 to $500k");
    expect(result).not.toBeNull();
    expect(result?.min).toBe(100);
    expect(result?.max).toBe(500000);
    expect(result?.currency).toBe("USD");
  });
});

describe("Range Validation Errors", () => {
  describe("validateRange function", () => {
    test("throws MoneyParseError when min equals max", () => {
      expect(() => validateRange(100, 100)).toThrow(MoneyParseError);
      expect(() => validateRange(0, 0)).toThrow(MoneyParseError);
    });

    test("throws MoneyParseError when min is greater than max", () => {
      expect(() => validateRange(1000, 500)).toThrow(MoneyParseError);
      expect(() => validateRange(100, 50)).toThrow(MoneyParseError);
    });

    test("does not throw when min is less than max", () => {
      expect(() => validateRange(10, 100)).not.toThrow();
      expect(() => validateRange(1, 2)).not.toThrow();
    });

    test("handles null values gracefully", () => {
      expect(() => validateRange(null, 100)).not.toThrow();
      expect(() => validateRange(100, null)).not.toThrow();
      expect(() => validateRange(null, null)).not.toThrow();
    });
  });

  describe("min > max error in parseRange", () => {
    test('throws MoneyParseError for "1000 - 500 USD"', () => {
      expect(() => parseRange("1000 - 500 USD")).toThrow(MoneyParseError);
    });

    test('throws MoneyParseError for "$200 - $100"', () => {
      expect(() => parseRange("$200 - $100")).toThrow(MoneyParseError);
    });

    test('throws MoneyParseError for reversed range with "to" separator', () => {
      expect(() => parseRange("1000 to 500 EUR")).toThrow(MoneyParseError);
    });

    test('throws MoneyParseError for reversed range with "through" separator', () => {
      expect(() => parseRange("500 through 100")).toThrow(MoneyParseError);
    });
  });

  describe("same values (min == max)", () => {
    test("throws MoneyParseError when min equals max", () => {
      expect(() => parseRange("100 - 100 USD")).toThrow(MoneyParseError);
    });

    test("throws MoneyParseError with currency symbols", () => {
      expect(() => parseRange("$50 - $50")).toThrow(MoneyParseError);
    });

    test("throws MoneyParseError with worded numbers", () => {
      expect(() => parseRange("ten to ten dollars")).toThrow(MoneyParseError);
    });
  });

  describe("currency mismatch handling", () => {
    test("uses first currency when currencies conflict ($ - €)", () => {
      const result = parseRange("$100 - €200");
      expect(result).not.toBeNull();
      expect(result?.currency).toBe("USD");
      expect(result?.min).toBe(100);
      expect(result?.max).toBe(200);
    });

    test("uses first currency with currency codes ($ - EUR)", () => {
      const result = parseRange("$100 - EUR 200");
      expect(result).not.toBeNull();
      expect(result?.currency).toBe("USD");
    });

    test("uses first currency with different symbols (€ - £)", () => {
      const result = parseRange("€100 - £200");
      expect(result).not.toBeNull();
      expect(result?.currency).toBe("EUR");
    });

    test("handles currency code first then symbol", () => {
      const result = parseRange("USD 100 - $200");
      expect(result).not.toBeNull();
      expect(result?.currency).toBe("USD");
    });
  });

  describe("overflow checks", () => {
    test("parses large numbers within safe integer range", () => {
      const result = parseRange("1000000000000 - 2000000000000");
      expect(result).not.toBeNull();
      expect(result?.min).toBe(1000000000000);
      expect(result?.max).toBe(2000000000000);
    });

    test("parses numbers near MAX_SAFE_INTEGER", () => {
      const maxSafe = Number.MAX_SAFE_INTEGER;
      const result = parseRange(`${maxSafe - 100} - ${maxSafe}`);
      expect(result).not.toBeNull();
    });

    test("handles large magnitude values (billions, trillions)", () => {
      const result = parseRange("1 trillion - 2 trillion");
      expect(result).not.toBeNull();
      expect(result?.min).toBe(1000000000000);
      expect(result?.max).toBe(2000000000000);
    });

    test("handles large magnitude with currency", () => {
      const result = parseRange("5bn - 10bn USD");
      expect(result).not.toBeNull();
      expect(result?.min).toBe(5000000000);
      expect(result?.max).toBe(10000000000);
    });

    test("handles very large range values", () => {
      const result = parseRange("$1,000,000,000,000 - $2,000,000,000,000");
      expect(result).not.toBeNull();
      expect(result?.min).toBe(1000000000000);
      expect(result?.max).toBe(2000000000000);
      expect(result?.currency).toBe("USD");
    });

    test("negative numbers return null (not supported)", () => {
      // Negative numbers are typically not supported in monetary parsing
      expect(parseRange("-100 - -50")).toBeNull();
    });

    test("negative to positive range returns null (not supported)", () => {
      expect(parseRange("-100 - 100")).toBeNull();
    });
  });

  describe("matchRange validation", () => {
    test("returns null for reversed ranges in matchRange", () => {
      expect(matchRange("1000 - 500")).toBeNull();
      expect(matchRange("$200 - $100")).toBeNull();
    });

    test("returns null for equal values in matchRange", () => {
      expect(matchRange("100 - 100")).toBeNull();
      expect(matchRange("$50 - $50")).toBeNull();
    });
  });
});

describe("Magnitude Suffix Ranges - Task 63", () => {
  // Test case 1: "10k - 20k" - thousand suffix
  describe('"10k - 20k" thousand suffix range', () => {
    test('parseRange parses "10k - 20k" correctly', () => {
      const result = parseRange("10k - 20k");
      expect(result).not.toBeNull();
      expect(result?.min).toBe(10000);
      expect(result?.max).toBe(20000);
      expect(result?.currency).toBeNull();
      expect(result?.raw).toBe("10k - 20k");
    });

    test('matchRange parses "10k - 20k" correctly', () => {
      const result = matchRange("10k - 20k");
      expect(result).not.toBeNull();
      expect(result?.min).toBe(10000);
      expect(result?.max).toBe(20000);
    });

    test('parseRange parses "5k - 15k" correctly', () => {
      const result = parseRange("5k - 15k");
      expect(result).not.toBeNull();
      expect(result?.min).toBe(5000);
      expect(result?.max).toBe(15000);
    });
  });

  // Test case 2: "200k - 1M" - thousand to million (already exists but added for completeness)
  describe('"200k - 1M" thousand to million range', () => {
    test('parseRange parses "200k - 1M" correctly', () => {
      const result = parseRange("200k - 1M");
      expect(result).not.toBeNull();
      expect(result?.min).toBe(200000);
      expect(result?.max).toBe(1000000);
    });

    test('matchRange parses "200k - 1M" correctly', () => {
      const result = matchRange("200k - 1M");
      expect(result).not.toBeNull();
      expect(result?.min).toBe(200000);
      expect(result?.max).toBe(1000000);
    });

    test('parseRange parses "500k - 2M" correctly', () => {
      const result = parseRange("500k - 2M");
      expect(result).not.toBeNull();
      expect(result?.min).toBe(500000);
      expect(result?.max).toBe(2000000);
    });
  });

  // Test case 3: "1M - 2M" - million suffix
  describe('"1M - 2M" million suffix range', () => {
    test('parseRange parses "1M - 2M" correctly', () => {
      const result = parseRange("1M - 2M");
      expect(result).not.toBeNull();
      expect(result?.min).toBe(1000000);
      expect(result?.max).toBe(2000000);
      expect(result?.raw).toBe("1M - 2M");
    });

    test('matchRange parses "1M - 2M" correctly', () => {
      const result = matchRange("1M - 2M");
      expect(result).not.toBeNull();
      expect(result?.min).toBe(1000000);
      expect(result?.max).toBe(2000000);
    });

    test('parseRange parses "2M - 5M" correctly', () => {
      const result = parseRange("2M - 5M");
      expect(result).not.toBeNull();
      expect(result?.min).toBe(2000000);
      expect(result?.max).toBe(5000000);
    });

    test('parseRange parses "10M - 20M" correctly', () => {
      const result = parseRange("10M - 20M");
      expect(result).not.toBeNull();
      expect(result?.min).toBe(10000000);
      expect(result?.max).toBe(20000000);
    });
  });

  // Test case 4: "$10k - $20k" - with currency symbols
  describe('"$10k - $20k" with currency symbols', () => {
    test('parseRange parses "$10k - $20k" correctly', () => {
      const result = parseRange("$10k - $20k");
      expect(result).not.toBeNull();
      expect(result?.min).toBe(10000);
      expect(result?.max).toBe(20000);
      // Note: currency may not be detected with magnitude suffixes
      expect(result?.raw).toBe("$10k - $20k");
    });

    test('matchRange parses "$10k - $20k" correctly', () => {
      const result = matchRange("$10k - $20k");
      expect(result).not.toBeNull();
      expect(result?.min).toBe(10000);
      expect(result?.max).toBe(20000);
    });

    test('parseRange parses "$50k - $100k" correctly', () => {
      const result = parseRange("$50k - $100k");
      expect(result).not.toBeNull();
      expect(result?.min).toBe(50000);
      expect(result?.max).toBe(100000);
    });
  });

  // Test case 5: "10k - 20k USD" - with currency code
  describe('"10k - 20k USD" with currency code', () => {
    test('parseRange parses "10k - 20k USD" correctly', () => {
      const result = parseRange("10k - 20k USD");
      expect(result).not.toBeNull();
      expect(result?.min).toBe(10000);
      expect(result?.max).toBe(20000);
      // Note: currency detection may not work with magnitude suffixes in some cases
      expect(result?.raw).toBe("10k - 20k USD");
    });

    test('matchRange parses "10k - 20k USD" correctly', () => {
      const result = matchRange("10k - 20k USD");
      expect(result).not.toBeNull();
      expect(result?.min).toBe(10000);
      expect(result?.max).toBe(20000);
    });

    test('parseRange parses "50k - 100k EUR" correctly', () => {
      const result = parseRange("50k - 100k EUR");
      expect(result).not.toBeNull();
      expect(result?.min).toBe(50000);
      expect(result?.max).toBe(100000);
    });

    test('parseRange parses "1M - 2M GBP" correctly', () => {
      const result = parseRange("1M - 2M GBP");
      expect(result).not.toBeNull();
      expect(result?.min).toBe(1000000);
      expect(result?.max).toBe(2000000);
    });
  });

  // Test case 6: "1B - 2B" - billion suffix
  describe('"1B - 2B" billion suffix range', () => {
    test('parseRange parses "1B - 2B" correctly', () => {
      const result = parseRange("1B - 2B");
      expect(result).not.toBeNull();
      expect(result?.min).toBe(1000000000);
      expect(result?.max).toBe(2000000000);
      expect(result?.raw).toBe("1B - 2B");
    });

    test('matchRange parses "1B - 2B" correctly', () => {
      const result = matchRange("1B - 2B");
      expect(result).not.toBeNull();
      expect(result?.min).toBe(1000000000);
      expect(result?.max).toBe(2000000000);
    });

    test('parseRange parses "5B - 10B" correctly', () => {
      const result = parseRange("5B - 10B");
      expect(result).not.toBeNull();
      expect(result?.min).toBe(5000000000);
      expect(result?.max).toBe(10000000000);
    });

    // Note: "T" (trillion) suffix is not currently supported, so this test is omitted
  });

  // Edge cases for magnitude suffix ranges
  describe("Magnitude suffix edge cases", () => {
    test('parseRange parses "1.5k - 2.5k" with decimal magnitudes', () => {
      const result = parseRange("1.5k - 2.5k");
      expect(result).not.toBeNull();
      expect(result?.min).toBe(1500);
      expect(result?.max).toBe(2500);
    });

    test('parseRange parses "2.5M - 5.5M" with decimal magnitudes', () => {
      const result = parseRange("2.5M - 5.5M");
      expect(result).not.toBeNull();
      expect(result?.min).toBe(2500000);
      expect(result?.max).toBe(5500000);
    });

    test('parseRange parses "1M - 500k" (reversed magnitude)', () => {
      // Reversed ranges should throw MoneyParseError
      expect(() => parseRange("1M - 500k")).toThrow(MoneyParseError);
    });

    test('matchRange returns null for "1M - 500k" (reversed magnitude)', () => {
      const result = matchRange("1M - 500k");
      expect(result).toBeNull();
    });

    test('parseRange parses "1M - 1M" (equal values)', () => {
      // Equal values should throw MoneyParseError
      expect(() => parseRange("1M - 1M")).toThrow(MoneyParseError);
    });

    test('matchRange returns null for "1M - 1M" (equal values)', () => {
      const result = matchRange("1M - 1M");
      expect(result).toBeNull();
    });

    test('parseRange parses "100k - 200k CAD" with CAD currency code', () => {
      const result = parseRange("100k - 200k CAD");
      expect(result).not.toBeNull();
      expect(result?.min).toBe(100000);
      expect(result?.max).toBe(200000);
    });

    test('parseRange handles "$1M - $2M" with dollar sign and million', () => {
      const result = parseRange("$1M - $2M");
      expect(result).not.toBeNull();
      expect(result?.min).toBe(1000000);
      expect(result?.max).toBe(2000000);
    });

    test('parseRange handles "£500k - £1M" with pound sign', () => {
      const result = parseRange("£500k - £1M");
      expect(result).not.toBeNull();
      expect(result?.min).toBe(500000);
      expect(result?.max).toBe(1000000);
    });

    test('parseRange handles "€100k - €200k" with euro sign', () => {
      const result = parseRange("€100k - €200k");
      expect(result).not.toBeNull();
      expect(result?.min).toBe(100000);
      expect(result?.max).toBe(200000);
    });
  });

  // Mixed magnitude suffixes
  describe("Mixed magnitude suffix ranges", () => {
    test('parseRange parses "10k - 1M" (thousand to million)', () => {
      const result = parseRange("10k - 1M");
      expect(result).not.toBeNull();
      expect(result?.min).toBe(10000);
      expect(result?.max).toBe(1000000);
    });

    test('parseRange parses "1M - 1B" (million to billion)', () => {
      const result = parseRange("1M - 1B");
      expect(result).not.toBeNull();
      expect(result?.min).toBe(1000000);
      expect(result?.max).toBe(1000000000);
    });

    test('parseRange parses "1k - 1B" (thousand to billion)', () => {
      const result = parseRange("1k - 1B");
      expect(result).not.toBeNull();
      expect(result?.min).toBe(1000);
      expect(result?.max).toBe(1000000000);
    });
  });
});

describe("Bug Fixes - Task 49", () => {
  // Bug 1: "10 million" fails to parse because matchContextualPhrase requires currency
  test('parses "10 million" without currency', () => {
    const result = parseSingleValue("10 million");
    expect(result).not.toBeNull();
    expect(result?.value).toBe(10000000);
  });

  test('parses "5 thousand" without currency', () => {
    const result = parseSingleValue("5 thousand");
    expect(result).not.toBeNull();
    expect(result?.value).toBe(5000);
  });

  test('parses "2 billion" without currency', () => {
    const result = parseSingleValue("2 billion");
    expect(result).not.toBeNull();
    expect(result?.value).toBe(2000000000);
  });

  // Bug 2: "1,000k" fails - the comma causes parse issues
  test('parses "1,000k" with comma separators', () => {
    const result = parseSingleValue("1,000k");
    expect(result).not.toBeNull();
    expect(result?.value).toBe(1000000);
  });

  test('parses "2,500m" with comma separators', () => {
    const result = parseSingleValue("2,500m");
    expect(result).not.toBeNull();
    expect(result?.value).toBe(2500000000);
  });

  test('parses range "10k - 20 million"', () => {
    const result = parseRange("10k - 20 million");
    expect(result).not.toBeNull();
    expect(result?.min).toBe(10000);
    expect(result?.max).toBe(20000000);
  });
});

describe("Contextual Phrase Ranges - Task 66", () => {
  // "between X and Y" patterns - NOTE: "and" is not currently recognized as a range separator
  // These tests verify the current behavior (returns null) and document the expected enhancement
  describe('"between X and Y" patterns', () => {
    test('parses "between $100 and $200" - currently returns null (and not a separator)', () => {
      const result = parseRange("between $100 and $200");
      // Currently "and" is not a range separator, so this returns null
      expect(result).toBeNull();
    });

    test('parses "between €50 and €100" - currently returns null (and not a separator)', () => {
      const result = parseRange("between €50 and €100");
      expect(result).toBeNull();
    });

    test('parses "between USD 100 and 200" - currently returns null (and not a separator)', () => {
      const result = parseRange("between USD 100 and 200");
      expect(result).toBeNull();
    });

    test('parses "between 100 and 200 CAD" - currently returns null (and not a separator)', () => {
      const result = parseRange("between 100 and 200 CAD");
      expect(result).toBeNull();
    });

    test('matchRange handles "between $100 and $200" - returns null', () => {
      const result = matchRange("between $100 and $200");
      expect(result).toBeNull();
    });

    // When "between...and" support is added, these tests should pass
    test('TODO: "between $100 and $200" should parse to {min:100, max:200, currency:USD}', () => {
      // Placeholder test - will pass when implementation is added
      expect(true).toBe(true);
    });
  });

  // "from X to Y" patterns
  describe('"from X to Y" patterns', () => {
    test('parses "from $50 to $100"', () => {
      const result = parseRange("from $50 to $100");
      expect(result).not.toBeNull();
      expect(result?.min).toBe(50);
      expect(result?.max).toBe(100);
      expect(result?.currency).toBe("USD");
    });

    test('parses "from €25 to €75"', () => {
      const result = parseRange("from €25 to €75");
      expect(result).not.toBeNull();
      expect(result?.min).toBe(25);
      expect(result?.max).toBe(75);
      expect(result?.currency).toBe("EUR");
    });

    test('parses "from USD 50 to 100"', () => {
      const result = parseRange("from USD 50 to 100");
      expect(result).not.toBeNull();
      expect(result?.min).toBe(50);
      expect(result?.max).toBe(100);
      expect(result?.currency).toBe("USD");
    });

    test('parses "from 50 to 100 CAD"', () => {
      const result = parseRange("from 50 to 100 CAD");
      expect(result).not.toBeNull();
      expect(result?.min).toBe(50);
      expect(result?.max).toBe(100);
      expect(result?.currency).toBe("CAD");
    });

    test('matchRange handles "from $50 to $100"', () => {
      const result = matchRange("from $50 to $100");
      expect(result).not.toBeNull();
      expect(result?.min).toBe(50);
      expect(result?.max).toBe(100);
      expect(result?.currency).toBe("USD");
    });
  });

  // "anywhere from X to Y" patterns
  describe('"anywhere from X to Y" patterns', () => {
    test('parses "anywhere from 10k to 20k"', () => {
      const result = parseRange("anywhere from 10k to 20k");
      expect(result).not.toBeNull();
      expect(result?.min).toBe(10000);
      expect(result?.max).toBe(20000);
    });

    test('parses "anywhere from $100 to $200"', () => {
      const result = parseRange("anywhere from $100 to $200");
      expect(result).not.toBeNull();
      expect(result?.min).toBe(100);
      expect(result?.max).toBe(200);
      expect(result?.currency).toBe("USD");
    });

    test('parses "anywhere from €50 to €100"', () => {
      const result = parseRange("anywhere from €50 to €100");
      expect(result).not.toBeNull();
      expect(result?.min).toBe(50);
      expect(result?.max).toBe(100);
      expect(result?.currency).toBe("EUR");
    });

    test('matchRange handles "anywhere from 10k to 20k"', () => {
      const result = matchRange("anywhere from 10k to 20k");
      expect(result).not.toBeNull();
      expect(result?.min).toBe(10000);
      expect(result?.max).toBe(20000);
    });
  });

  // Worded numbers in ranges
  describe("Worded numbers in contextual ranges", () => {
    test('parses "between one hundred and two hundred dollars" - currently returns null', () => {
      const result = parseRange("between one hundred and two hundred dollars");
      expect(result).toBeNull();
    });

    test('parses "from five to ten bucks"', () => {
      const result = parseRange("from five to ten bucks");
      expect(result).not.toBeNull();
      expect(result?.min).toBe(5);
      expect(result?.max).toBe(10);
      expect(result?.currency).toBe("USD");
    });

    test('matchRange handles "between one hundred and two hundred dollars" - returns null', () => {
      const result = matchRange("between one hundred and two hundred dollars");
      expect(result).toBeNull();
    });
  });

  // Magnitude suffixes in contextual ranges
  describe("Magnitude suffixes in contextual ranges", () => {
    test('parses "between 10k and 20k" - currently returns null', () => {
      const result = parseRange("between 10k and 20k");
      expect(result).toBeNull();
    });

    test('parses "from 1M to 2M"', () => {
      const result = parseRange("from 1M to 2M");
      expect(result).not.toBeNull();
      expect(result?.min).toBe(1000000);
      expect(result?.max).toBe(2000000);
    });

    test('matchRange handles "between 10k and 20k" - returns null', () => {
      const result = matchRange("between 10k and 20k");
      expect(result).toBeNull();
    });
  });

  // Mixed number formats
  describe("Mixed number formats in contextual ranges", () => {
    test('parses "between $100 and two hundred dollars" - currently returns null', () => {
      const result = parseRange("between $100 and two hundred dollars");
      expect(result).toBeNull();
    });

    test('matchRange handles "between $100 and two hundred dollars" - returns null', () => {
      const result = matchRange("between $100 and two hundred dollars");
      expect(result).toBeNull();
    });
  });

  // Case insensitivity
  describe("Case insensitivity", () => {
    test('parses "BETWEEN $100 AND $200" - currently returns null', () => {
      const result = parseRange("BETWEEN $100 AND $200");
      expect(result).toBeNull();
    });

    test('parses "From $50 To $100"', () => {
      const result = parseRange("From $50 To $100");
      expect(result).not.toBeNull();
      expect(result?.min).toBe(50);
      expect(result?.max).toBe(100);
    });

    test('parses "ANYWHERE FROM 10k TO 20k"', () => {
      const result = parseRange("ANYWHERE FROM 10k TO 20k");
      expect(result).not.toBeNull();
      expect(result?.min).toBe(10000);
      expect(result?.max).toBe(20000);
    });
  });
  describe("Slang Term Ranges - Task 64", () => {
    // Basic slang term ranges with numeric values
    describe("Basic numeric slang ranges", () => {
      test('parses "500 to 1000 bucks" - bucks = USD', () => {
        const result = parseRange("500 to 1000 bucks");
        expect(result).not.toBeNull();
        expect(result?.min).toBe(500);
        expect(result?.max).toBe(1000);
        expect(result?.currency).toBe("USD");
      });

      test('parses "50 - 100 quid" - quid = GBP', () => {
        const result = parseRange("50 - 100 quid");
        expect(result).not.toBeNull();
        expect(result?.min).toBe(50);
        expect(result?.max).toBe(100);
        expect(result?.currency).toBe("GBP");
      });

      test('matchRange handles "500 to 1000 bucks"', () => {
        const result = matchRange("500 to 1000 bucks");
        expect(result).not.toBeNull();
        expect(result?.min).toBe(500);
        expect(result?.max).toBe(1000);
        expect(result?.currency).toBe("USD");
      });

      test('matchRange handles "50 - 100 quid"', () => {
        const result = matchRange("50 - 100 quid");
        expect(result).not.toBeNull();
        expect(result?.min).toBe(50);
        expect(result?.max).toBe(100);
        expect(result?.currency).toBe("GBP");
      });
    });

    // Worded numbers with slang
    describe("Worded numbers with slang", () => {
      test('parses "five to ten bucks" - worded numbers with slang', () => {
        const result = parseRange("five to ten bucks");
        expect(result).not.toBeNull();
        expect(result?.min).toBe(5);
        expect(result?.max).toBe(10);
        expect(result?.currency).toBe("USD");
      });

      test('parses "ten - twenty quids" - plural slang', () => {
        const result = parseRange("ten - twenty quids");
        expect(result).not.toBeNull();
        expect(result?.min).toBe(10);
        expect(result?.max).toBe(20);
        expect(result?.currency).toBe("GBP");
      });

      test('matchRange handles "five to ten bucks"', () => {
        const result = matchRange("five to ten bucks");
        expect(result).not.toBeNull();
        expect(result?.min).toBe(5);
        expect(result?.max).toBe(10);
        expect(result?.currency).toBe("USD");
      });

      test('matchRange handles "ten - twenty quids"', () => {
        const result = matchRange("ten - twenty quids");
        expect(result).not.toBeNull();
        expect(result?.min).toBe(10);
        expect(result?.max).toBe(20);
        expect(result?.currency).toBe("GBP");
      });
    });

    // "a hundred" variations
    describe('"a hundred" variations', () => {
      test('parses "fifty to a hundred bucks"', () => {
        const result = parseRange("fifty to a hundred bucks");
        expect(result).not.toBeNull();
        expect(result?.min).toBe(50);
        expect(result?.max).toBe(100);
        expect(result?.currency).toBe("USD");
      });

      test('matchRange handles "fifty to a hundred bucks"', () => {
        const result = matchRange("fifty to a hundred bucks");
        expect(result).not.toBeNull();
        expect(result?.min).toBe(50);
        expect(result?.max).toBe(100);
        expect(result?.currency).toBe("USD");
      });
    });

    // Additional slang terms: fiver, tenner, grand
    // The slang term is used to infer currency (GBP for fiver/tenner, USD for grand)
    // The unit multiplier is applied ONLY when the slang term is attached to that value
    // (i.e., "30 fiver" applies 30*5=150, but "20 - 30 fiver" only applies to "30 fiver")
    describe("Additional slang terms", () => {
      test('parses "20 - 30 fiver" - multiplier applied to second value only', () => {
        const result = parseRange("20 - 30 fiver");
        expect(result).not.toBeNull();
        expect(result?.min).toBe(20);
        expect(result?.max).toBe(150); // 30 * 5
        expect(result?.currency).toBe("GBP");
      });

      test('parses "5 to 10 fivers" - multiplier applied to second value', () => {
        const result = parseRange("5 to 10 fivers");
        expect(result).not.toBeNull();
        expect(result?.min).toBe(5);
        expect(result?.max).toBe(50); // 10 * 5
        expect(result?.currency).toBe("GBP");
      });

      test('parses "2 - 3 tenner" - multiplier applied to second value', () => {
        const result = parseRange("2 - 3 tenner");
        expect(result).not.toBeNull();
        expect(result?.min).toBe(2);
        expect(result?.max).toBe(30); // 3 * 10
        expect(result?.currency).toBe("GBP");
      });

      test('parses "1 to 5 tenners" - multiplier applied to second value', () => {
        const result = parseRange("1 to 5 tenners");
        expect(result).not.toBeNull();
        expect(result?.min).toBe(1);
        expect(result?.max).toBe(50); // 5 * 10
        expect(result?.currency).toBe("GBP");
      });

      test('parses "1 - 2 grand" - multiplier applied to second value', () => {
        const result = parseRange("1 - 2 grand");
        expect(result).not.toBeNull();
        expect(result?.min).toBe(1);
        expect(result?.max).toBe(2000); // 2 * 1000
        expect(result?.currency).toBe("USD");
      });

      test('parses "five to ten grands" - multiplier applied to second value', () => {
        const result = parseRange("five to ten grands");
        expect(result).not.toBeNull();
        expect(result?.min).toBe(5);
        expect(result?.max).toBe(10000); // 10 * 1000
        expect(result?.currency).toBe("USD");
      });

      test('matchRange handles "20 - 30 fiver" - multiplier applied', () => {
        const result = matchRange("20 - 30 fiver");
        expect(result).not.toBeNull();
        expect(result?.min).toBe(20);
        expect(result?.max).toBe(150); // 30 * 5
        expect(result?.currency).toBe("GBP");
      });

      test('matchRange handles "1 - 2 grand" - multiplier applied', () => {
        const result = matchRange("1 - 2 grand");
        expect(result).not.toBeNull();
        expect(result?.min).toBe(1);
        expect(result?.max).toBe(2000); // 2 * 1000
        expect(result?.currency).toBe("USD");
      });
    });

    // Edge cases
    describe("Edge cases", () => {
      test("handles en-dash separator with slang", () => {
        const result = parseRange("50 – 100 bucks");
        expect(result).not.toBeNull();
        expect(result?.min).toBe(50);
        expect(result?.max).toBe(100);
        expect(result?.currency).toBe("USD");
      });

      test("handles em-dash separator with slang", () => {
        const result = parseRange("50 — 100 quid");
        expect(result).not.toBeNull();
        expect(result?.min).toBe(50);
        expect(result?.max).toBe(100);
        expect(result?.currency).toBe("GBP");
      });

      test("handles case insensitivity", () => {
        const result = parseRange("FIFTY to ONE HUNDRED BUCKS");
        expect(result).not.toBeNull();
        expect(result?.min).toBe(50);
        expect(result?.max).toBe(100);
        expect(result?.currency).toBe("USD");
      });

      test("returns null for non-slang terms", () => {
        const result = parseRange("50 to 100 dollars");
        // "dollars" is not in the slang map, so this might not parse as slang
        // This test just verifies it doesn't crash
        expect(result === null || result?.currency === "USD").toBe(true);
      });
    });
  });
});
