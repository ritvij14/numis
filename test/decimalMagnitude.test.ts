import {
  parseContextualPhrase,
  matchContextualPhrase,
} from "../src/patterns/contextualPhrases";
import { parseMoney } from "../src/index";

describe("Decimal Numbers with Magnitude Words", () => {
  describe("parseContextualPhrase", () => {
    test("parses '2.25 thousand dollars' as 2250", () => {
      const res = parseContextualPhrase("2.25 thousand dollars");
      expect(res.value).toBe(2250);
      expect(res.currency).toBe("USD");
    });

    test("parses '1.5 million dollars' as 1500000", () => {
      const res = parseContextualPhrase("1.5 million dollars");
      expect(res.value).toBe(1500000);
      expect(res.currency).toBe("USD");
    });

    test("parses '0.75 billion euros' as 750000000", () => {
      const res = parseContextualPhrase("0.75 billion euros");
      expect(res.value).toBe(750000000);
      expect(res.currency).toBe("EUR");
    });

    test("parses '3.5 thousand pounds' as 3500", () => {
      const res = parseContextualPhrase("3.5 thousand pounds");
      expect(res.value).toBe(3500);
      expect(res.currency).toBe("GBP");
    });

    test("parses '0.001 million dollars' as 1000", () => {
      const res = parseContextualPhrase("0.001 million dollars");
      expect(res.value).toBe(1000);
      expect(res.currency).toBe("USD");
    });

    test("parses '999.999 million dollars' as 999999000", () => {
      const res = parseContextualPhrase("999.999 million dollars");
      expect(res.value).toBe(999999000);
      expect(res.currency).toBe("USD");
    });

    test("parses '10.5 thousand yen' as 10500", () => {
      const res = parseContextualPhrase("10.5 thousand yen");
      expect(res.value).toBe(10500);
      expect(res.currency).toBe("JPY");
    });

    test("parses '2.25 hundred dollars' as 225", () => {
      const res = parseContextualPhrase("2.25 hundred dollars");
      expect(res.value).toBe(225);
      expect(res.currency).toBe("USD");
    });
  });

  describe("matchContextualPhrase", () => {
    test("matches '2.25 thousand dollars' in text", () => {
      const res = matchContextualPhrase("I paid 2.25 thousand dollars");
      expect(res?.value).toBe(2250);
      expect(res?.currency).toBe("USD");
    });

    test("matches '1.5 million euros' in text", () => {
      const res = matchContextualPhrase("The cost was 1.5 million euros");
      expect(res?.value).toBe(1500000);
      expect(res?.currency).toBe("EUR");
    });

    test("matches '0.75 billion pounds' in text", () => {
      const res = matchContextualPhrase("Revenue: 0.75 billion pounds");
      expect(res?.value).toBe(750000000);
      expect(res?.currency).toBe("GBP");
    });
  });

  describe("parseMoney integration", () => {
    test("parseMoney handles '2.25 thousand dollars'", () => {
      const res = parseMoney("2.25 thousand dollars");
      expect(res?.amount).toBe(2250);
      expect(res?.currency).toBe("USD");
    });

    test("parseMoney handles '1.5 million euros' in text", () => {
      const res = parseMoney("The budget is 1.5 million euros");
      expect(res?.amount).toBe(1500000);
      expect(res?.currency).toBe("EUR");
    });

    test("parseMoney handles '0.75 billion pounds'", () => {
      const res = parseMoney("0.75 billion pounds");
      expect(res?.amount).toBe(750000000);
      expect(res?.currency).toBe("GBP");
    });

    test("parseMoney handles '3.14 thousand yen'", () => {
      const res = parseMoney("3.14 thousand yen");
      expect(res?.amount).toBe(3140);
      expect(res?.currency).toBe("JPY");
    });
  });
});
