import { ValueOverflowError } from "../../src/errors";
import {
  matchContextualPhrase,
  parseContextualPhrase,
} from "../../src/patterns/contextualPhrases";

describe("Contextual Phrases Parser", () => {
  describe("parseContextualPhrase", () => {
    test("parses simple article + worded number + currency name", () => {
      const res = parseContextualPhrase("a hundred dollars");
      expect(res.value).toBe(100);
      expect(res.currency).toBe("USD");
    });

    test("parses article + numeric + currency name", () => {
      const res = parseContextualPhrase("the fifty euros");
      expect(res.value).toBe(50);
      expect(res.currency).toBe("EUR");
    });

    test("parses worded number + ISO code", () => {
      const res = parseContextualPhrase("one thousand JPY");
      expect(res.value).toBe(1000);
      expect(res.currency).toBe("JPY");
    });

    test("parses multi-word worded number (three thousand dollars)", () => {
      const res = parseContextualPhrase("three thousand dollars");
      expect(res.value).toBe(3000);
      expect(res.currency).toBe("USD");
    });

    test("parses complex multi-word worded number (one hundred fifty euros)", () => {
      const res = parseContextualPhrase("one hundred fifty euros");
      expect(res.value).toBe(150);
      expect(res.currency).toBe("EUR");
    });

    test("parses article + numeric + ISO code", () => {
      const res = parseContextualPhrase("a 20 usd");
      expect(res.value).toBe(20);
      expect(res.currency).toBe("USD");
    });

    test("parses compound major+minor with cents", () => {
      const res = parseContextualPhrase("a dollar and 23 cents");
      expect(res.value).toBeCloseTo(1.23);
      expect(res.currency).toBe("USD");
    });

    test("parses compound major+minor with worded minor", () => {
      const res = parseContextualPhrase("five euros and fifty cents");
      expect(res.value).toBeCloseTo(5.5);
      expect(res.currency).toBe("EUR");
    });

    test("parses pounds and pence", () => {
      const res = parseContextualPhrase("10 pounds and 5 pence");
      expect(res.value).toBeCloseTo(10.05);
      expect(res.currency).toBe("GBP");
    });

    test("throws on unknown currency", () => {
      expect(() => parseContextualPhrase("a hundred foobars")).toThrow(
        /Unrecognized currency/i
      );
    });

    test("throws on invalid minor unit for currency", () => {
      expect(() => parseContextualPhrase("one yen and 5 cents")).toThrow(
        /Minor unit not supported/i
      );
    });

    test("throws ValueOverflowError on overflow", () => {
      expect(() => parseContextualPhrase("9007199254740993 dollars")).toThrow(
        ValueOverflowError
      );
    });

    // Colloquial patterns: "<major> <currency> <number>" (implicit cents)
    test("parses colloquial 'a dollar fifty' as 1.50", () => {
      const res = parseContextualPhrase("a dollar fifty");
      expect(res.value).toBeCloseTo(1.5);
      expect(res.currency).toBe("USD");
    });

    test("parses colloquial 'two dollars seventy-five' as 2.75", () => {
      const res = parseContextualPhrase("two dollars seventy-five");
      expect(res.value).toBeCloseTo(2.75);
      expect(res.currency).toBe("USD");
    });

    test("parses colloquial 'five pounds twenty' as 5.20", () => {
      const res = parseContextualPhrase("five pounds twenty");
      expect(res.value).toBeCloseTo(5.2);
      expect(res.currency).toBe("GBP");
    });

    test("parses colloquial 'ten euros ninety-nine' as 10.99", () => {
      const res = parseContextualPhrase("ten euros ninety-nine");
      expect(res.value).toBeCloseTo(10.99);
      expect(res.currency).toBe("EUR");
    });

    test("parses colloquial with numeric minor 'a dollar 50' as 1.50", () => {
      const res = parseContextualPhrase("a dollar 50");
      expect(res.value).toBeCloseTo(1.5);
      expect(res.currency).toBe("USD");
    });

    // Fractional magnitude patterns
    test("parses 'a quarter million dollars'", () => {
      const res = parseContextualPhrase("a quarter million dollars");
      expect(res.value).toBe(250000);
      expect(res.currency).toBe("USD");
    });

    test("parses 'half a million euros'", () => {
      const res = parseContextualPhrase("half a million euros");
      expect(res.value).toBe(500000);
      expect(res.currency).toBe("EUR");
    });

    test("parses 'quarter of a million pounds'", () => {
      const res = parseContextualPhrase("quarter of a million pounds");
      expect(res.value).toBe(250000);
      expect(res.currency).toBe("GBP");
    });

    test("parses 'half of a billion dollars'", () => {
      const res = parseContextualPhrase("half of a billion dollars");
      expect(res.value).toBe(500000000);
      expect(res.currency).toBe("USD");
    });

    test("parses 'two thirds of a million yen'", () => {
      const res = parseContextualPhrase("two thirds of a million yen");
      expect(res.value).toBeCloseTo((2 / 3) * 1000000, 2);
      expect(res.currency).toBe("JPY");
    });

    test("parses 'three quarters million euros'", () => {
      const res = parseContextualPhrase("three quarters million euros");
      expect(res.value).toBe(750000);
      expect(res.currency).toBe("EUR");
    });

    test("parses 'quarter thousand usd'", () => {
      const res = parseContextualPhrase("quarter thousand usd");
      expect(res.value).toBe(250);
      expect(res.currency).toBe("USD");
    });

    test("parses 'a third of a billion dollars'", () => {
      const res = parseContextualPhrase("a third of a billion dollars");
      expect(res.value).toBeCloseTo(1000000000 / 3, 2);
      expect(res.currency).toBe("USD");
    });

    // Tests for optional 'and' connector with explicit minor units
    test("parses '5 pounds 20 pence' (without and)", () => {
      const res = parseContextualPhrase("5 pounds 20 pence");
      expect(res.value).toBeCloseTo(5.2);
      expect(res.currency).toBe("GBP");
    });

    test("parses '2 euros 50 cents' (without and)", () => {
      const res = parseContextualPhrase("2 euros 50 cents");
      expect(res.value).toBeCloseTo(2.5);
      expect(res.currency).toBe("EUR");
    });

    test("parses 'ten dollars 25 cents' (without and)", () => {
      const res = parseContextualPhrase("ten dollars 25 cents");
      expect(res.value).toBeCloseTo(10.25);
      expect(res.currency).toBe("USD");
    });

    test("parses '5 pounds and 20 pence' (with and)", () => {
      const res = parseContextualPhrase("5 pounds and 20 pence");
      expect(res.value).toBeCloseTo(5.2);
      expect(res.currency).toBe("GBP");
    });

    test("parses '10 dollars and 99 cents' (with and)", () => {
      const res = parseContextualPhrase("10 dollars and 99 cents");
      expect(res.value).toBeCloseTo(10.99);
      expect(res.currency).toBe("USD");
    });

    test("parses '3 euros and 75 cents' (with and)", () => {
      const res = parseContextualPhrase("3 euros and 75 cents");
      expect(res.value).toBeCloseTo(3.75);
      expect(res.currency).toBe("EUR");
    });

    test("parses 'twenty pounds 50 pence' (worded major, numeric minor)", () => {
      const res = parseContextualPhrase("twenty pounds 50 pence");
      expect(res.value).toBeCloseTo(20.5);
      expect(res.currency).toBe("GBP");
    });

    test("parses 'five dollars and ninety-nine cents' (both worded)", () => {
      const res = parseContextualPhrase("five dollars and ninety-nine cents");
      expect(res.value).toBeCloseTo(5.99);
      expect(res.currency).toBe("USD");
    });

    // Validation tests for invalid minor amounts
    test("throws on invalid minor amount (100 cents)", () => {
      expect(() => parseContextualPhrase("5 dollars 100 cents")).toThrow(
        /Invalid minor unit amount/i
      );
    });

    test("throws on invalid minor amount (150 pence)", () => {
      expect(() => parseContextualPhrase("5 pounds 150 pence")).toThrow(
        /Invalid minor unit amount/i
      );
    });

    test("throws on invalid minor amount (200 cents with and)", () => {
      expect(() => parseContextualPhrase("10 dollars and 200 cents")).toThrow(
        /Invalid minor unit amount/i
      );
    });

    test("accepts valid edge case (99 cents)", () => {
      const res = parseContextualPhrase("0 dollars 99 cents");
      expect(res.value).toBeCloseTo(0.99);
      expect(res.currency).toBe("USD");
    });

    test("accepts valid edge case (99 pence)", () => {
      const res = parseContextualPhrase("1 pound 99 pence");
      expect(res.value).toBeCloseTo(1.99);
      expect(res.currency).toBe("GBP");
    });
  });

  describe("matchContextualPhrase", () => {
    test("matches and parses contextual phrase within text", () => {
      const res = matchContextualPhrase("I paid a dollar and 23 cents today");
      expect(res?.value).toBeCloseTo(1.23);
      expect(res?.currency).toBe("USD");
    });

    test("returns null for unsupported minor unit", () => {
      expect(matchContextualPhrase("yen and 5 cents")).toBeNull();
    });

    test("returns null for missing currency", () => {
      expect(matchContextualPhrase("five and twenty")).toBeNull();
    });

    test("matches and parses fractional magnitude patterns", () => {
      const res = matchContextualPhrase(
        "The deal was worth a quarter million dollars"
      );
      expect(res?.value).toBe(250000);
      expect(res?.currency).toBe("USD");
    });

    test("matches and parses 'half of a billion' in text", () => {
      const res = matchContextualPhrase(
        "They raised half of a billion euros in funding"
      );
      expect(res?.value).toBe(500000000);
      expect(res?.currency).toBe("EUR");
    });

    test("matches and parses 'three quarters million' in text", () => {
      const res = matchContextualPhrase(
        "The company is valued at three quarters million pounds"
      );
      expect(res?.value).toBe(750000);
      expect(res?.currency).toBe("GBP");
    });

    // Tests for optional 'and' connector in text matching
    test("matches '5 pounds 20 pence' without and", () => {
      const res = matchContextualPhrase("The item costs 5 pounds 20 pence");
      expect(res?.value).toBeCloseTo(5.2);
      expect(res?.currency).toBe("GBP");
    });

    test("matches '2 euros 50 cents' without and", () => {
      const res = matchContextualPhrase("I paid 2 euros 50 cents for coffee");
      expect(res?.value).toBeCloseTo(2.5);
      expect(res?.currency).toBe("EUR");
    });

    test("matches 'ten dollars 25 cents' without and", () => {
      const res = matchContextualPhrase(
        "The fee is ten dollars 25 cents exactly"
      );
      expect(res?.value).toBeCloseTo(10.25);
      expect(res?.currency).toBe("USD");
    });

    test("matches '5 pounds and 20 pence' with and", () => {
      const res = matchContextualPhrase("It cost 5 pounds and 20 pence total");
      expect(res?.value).toBeCloseTo(5.2);
      expect(res?.currency).toBe("GBP");
    });

    test("matches '10 dollars and 99 cents' with and", () => {
      const res = matchContextualPhrase(
        "The price was 10 dollars and 99 cents"
      );
      expect(res?.value).toBeCloseTo(10.99);
      expect(res?.currency).toBe("USD");
    });

    test("returns null for invalid minor amount in text", () => {
      const res = matchContextualPhrase("5 dollars 150 cents is invalid");
      expect(res).toBeNull();
    });
  });
});
