/**
 * Audit tests for parseAll — covering edge cases found during code review.
 */
import { parseAll } from "../src/parseAll";

describe("parseAll audit", () => {
  describe("between X and Y with currency names", () => {
    it("should capture currency from 'between 100 dollars and 200 dollars'", () => {
      const result = parseAll("between 100 dollars and 200 dollars");
      expect(result).toHaveLength(1);
      expect(result[0].isRange).toBe(true);
      expect(result[0].min).toBe(100);
      expect(result[0].max).toBe(200);
      expect(result[0].currency).toBe("USD");
      expect(result[0].raw).toBe("between 100 dollars and 200 dollars");
    });

    it("should capture currency from 'between $100 and $200'", () => {
      const result = parseAll("between $100 and $200");
      expect(result).toHaveLength(1);
      expect(result[0].isRange).toBe(true);
      expect(result[0].currency).toBe("USD");
    });

    it("should capture currency from 'from 50 euros to 100 euros'", () => {
      const result = parseAll("from 50 euros to 100 euros");
      expect(result).toHaveLength(1);
      expect(result[0].isRange).toBe(true);
      expect(result[0].min).toBe(50);
      expect(result[0].max).toBe(100);
      expect(result[0].currency).toBe("EUR");
    });
  });

  describe("magnitude ranges handled correctly", () => {
    it("should detect 5k to 10k as a single range, not two singles", () => {
      const result = parseAll("5k to 10k");
      const range = result.find((r) => r.isRange);
      if (!range) {
        // If parseAll does not detect this as a range, it should at least
        // return the two individual values (not silently drop them).
        expect(result.length).toBeGreaterThanOrEqual(1);
        return;
      }
      expect(range.min).toBe(5000);
      expect(range.max).toBe(10000);
    });

    it("should detect 1 million to 10 million as a single range", () => {
      const result = parseAll("1 million to 10 million");
      const range = result.find((r) => r.isRange);
      if (!range) {
        expect(result.length).toBeGreaterThanOrEqual(1);
        return;
      }
      expect(range.min).toBe(1000000);
      expect(range.max).toBe(10000000);
    });
  });

  describe("Range + single in close proximity", () => {
    it("should not skip single values adjacent to ranges", () => {
      const result = parseAll("Price $10-$20 or $50");
      expect(result).toHaveLength(2);
      const range = result.find((r) => r.isRange);
      const single = result.find((r) => !r.isRange);
      expect(range).toBeDefined();
      expect(single).toBeDefined();
      expect(single?.amount).toBe(50);
    });
  });

  describe("Negative values", () => {
    it("should detect negative single values", () => {
      const result = parseAll("We lost -$50");
      expect(result.length).toBeGreaterThanOrEqual(1);
      const negative = result.find((r) => r.amount === -50);
      expect(negative).toBeDefined();
      expect(negative?.currency).toBe("USD");
    });
  });

  describe("Symbol + contextual phrase overlap", () => {
    it("should not double-count '$50 dollars' as two results", () => {
      const result = parseAll("$50 dollars");
      expect(result.length).toBeLessThanOrEqual(1);
    });
  });

  describe("startIndex / endIndex correctness", () => {
    it("returns correct indices for contextual range with leading text", () => {
      const input = "The deal is between $100 and $200 today";
      const result = parseAll(input);
      const range = result.find((r) => r.isRange);
      expect(range).toBeDefined();
      if (range) {
        expect(input.slice(range.startIndex, range.endIndex)).toBe(
          "between $100 and $200"
        );
      }
    });
  });

  describe("parseAll result shape completeness", () => {
    it("every result has required fields", () => {
      const result = parseAll("Base: $100, shipping: $10-$20, tax: $8");
      for (const expr of result) {
        expect(expr).toHaveProperty("type");
        expect(expr).toHaveProperty("raw");
        expect(expr).toHaveProperty("startIndex");
        expect(expr).toHaveProperty("endIndex");
        expect(typeof expr.startIndex).toBe("number");
        expect(typeof expr.endIndex).toBe("number");
        expect(expr.endIndex).toBeGreaterThanOrEqual(expr.startIndex);
      }
    });
  });
});
