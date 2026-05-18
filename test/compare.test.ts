import { matchComparisonOperator, parseComparisonOperator, parseMoney } from "../src/index";

describe("comparison operators", () => {
  describe("matchComparisonOperator", () => {
    it("parses < 30k correctly", () => {
      const result = matchComparisonOperator("< 30k");
      expect(result).toEqual({
        min: null,
        max: 30000,
        currency: null,
        raw: "< 30k",
      });
    });

    it("parses > 2 million correctly", () => {
      const result = matchComparisonOperator("> 2 million");
      expect(result).toEqual({
        min: 2000000,
        max: null,
        currency: null,
        raw: "> 2 million",
      });
    });

    it("parses < 1000 USD correctly", () => {
      const result = matchComparisonOperator("< 1000 USD");
      expect(result).toEqual({
        min: null,
        max: 1000,
        currency: "USD",
        raw: "< 1000 USD",
      });
    });

    it("parses > 50 dollars correctly", () => {
      const result = matchComparisonOperator("> 50 dollars");
      expect(result).toEqual({
        min: 50,
        max: null,
        currency: "USD",
        raw: "> 50 dollars",
      });
    });

    it("parses <30 without space", () => {
      const result = matchComparisonOperator("<30");
      expect(result).toEqual({
        min: null,
        max: 30,
        currency: null,
        raw: "<30",
      });
    });

    it("returns null for non-comparison strings", () => {
      expect(matchComparisonOperator("100")).toBeNull();
      expect(matchComparisonOperator("hello")).toBeNull();
      expect(matchComparisonOperator("$100")).toBeNull();
    });
  });

  describe("parseMoney with comparison operators", () => {
    it("parses < 30k", () => {
      const result = parseMoney("< 30k");
      expect(result?.isRange).toBe(true);
      expect(result?.min).toBeUndefined();
      expect(result?.max).toBe(30000);
    });

    it("parses > 2 million", () => {
      const result = parseMoney("> 2 million");
      expect(result?.isRange).toBe(true);
      expect(result?.min).toBe(2000000);
      expect(result?.max).toBeUndefined();
    });

    it("parses < 1000 USD", () => {
      const result = parseMoney("< 1000 USD");
      expect(result?.isRange).toBe(true);
      expect(result?.min).toBeUndefined();
      expect(result?.max).toBe(1000);
      expect(result?.currency).toBe("USD");
    });
  });
});
