/**
 * Tests for parseAll function
 */
import { MONETARY_PATTERNS, parseAll } from "../src/parseAll";

describe("parseAll", () => {
  describe("MONETARY_PATTERNS", () => {
    it("should have range patterns before single value patterns", () => {
      const rangePatterns = MONETARY_PATTERNS.filter((p) => p.isRange);
      const singlePatterns = MONETARY_PATTERNS.filter((p) => !p.isRange);

      const firstRangeIndex = MONETARY_PATTERNS.findIndex((p) => p.isRange);
      const lastSingleIndex =
        MONETARY_PATTERNS.map((p, i) => (!p.isRange ? i : -1))
          .filter((i) => i >= 0)
          .pop() ?? -1;

      expect(firstRangeIndex).toBeLessThan(lastSingleIndex);
    });

    it("should have correct pattern types", () => {
      const types = MONETARY_PATTERNS.map((p) => p.type);
      expect(types).toContain("symbolRange");
      expect(types).toContain("isoCodeRange");
      expect(types).toContain("magnitudeRange");
      expect(types).toContain("magnitudeRangeRightOnly");
      expect(types).toContain("contextualRange");
    });
  });

  describe("parseAll", () => {
    it("should detect symbol ranges", () => {
      const result = parseAll("Price: $500 - $1000");
      expect(result).toHaveLength(1);
      expect(result[0].isRange).toBe(true);
      expect(result[0].min).toBe(500);
      expect(result[0].max).toBe(1000);
    });

    it("should detect ISO code ranges", () => {
      const result = parseAll("USD 500 - USD 1000");
      expect(result).toHaveLength(1);
      expect(result[0].isRange).toBe(true);
      expect(result[0].currency).toBe("USD");
    });

    it("should detect contextual ranges", () => {
      const result = parseAll("between $100 and $200");
      expect(result).toHaveLength(1);
      expect(result[0].isRange).toBe(true);
    });

    it("should detect magnitude ranges with magnitude on right side only", () => {
      const result = parseAll("1-3 Million dirhams");
      expect(result).toHaveLength(1);
      expect(result[0].isRange).toBe(true);
      expect(result[0].min).toBe(1000000);
      expect(result[0].max).toBe(3000000);
      expect(result[0].currency).toBe("AED");
    });

    it('should detect magnitude ranges with "to" separator and magnitude on right', () => {
      const result = parseAll("5 to 10 million euros");
      expect(result).toHaveLength(1);
      expect(result[0].isRange).toBe(true);
      expect(result[0].min).toBe(5000000);
      expect(result[0].max).toBe(10000000);
      expect(result[0].currency).toBe("EUR");
    });

    it("should detect single values", () => {
      const result = parseAll("Price is $100");
      expect(result).toHaveLength(1);
      expect(result[0].isRange).toBe(false);
      expect(result[0].amount).toBe(100);
    });

    it("should detect mixed range and single values", () => {
      const result = parseAll("The price is $100-$200 or $500");

      expect(result).toHaveLength(2);

      // First result should be the range
      expect(result[0].type).toBe("range");
      expect(result[0].isRange).toBe(true);
      expect(result[0].min).toBe(100);
      expect(result[0].max).toBe(200);
      expect(result[0].currency).toBe("USD");
      expect(result[0].raw).toBe("$100-$200");

      // Second result should be the single value
      expect(result[1].type).toBe("single");
      expect(result[1].isRange).toBe(false);
      expect(result[1].amount).toBe(500);
      expect(result[1].currency).toBe("USD");
      expect(result[1].raw).toBe("$500");
    });

    it("should return empty array for text without monetary values", () => {
      const result = parseAll("Hello world");
      expect(result).toHaveLength(0);
    });
  });
});
