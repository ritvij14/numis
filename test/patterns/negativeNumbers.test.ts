import {
  detectNegative,
  hasParenthesesNotation,
  hasNegativePrefix,
  removeNegativeIndicators,
} from "../../src/patterns/negativeNumbers";

describe("negativeNumbers", () => {
  describe("detectNegative", () => {
    describe("parentheses notation", () => {
      it("should detect simple parentheses notation", () => {
        const result = detectNegative("(100)");
        expect(result.isNegative).toBe(true);
        expect(result.cleanedInput).toBe("100");
      });

      it("should detect parentheses with decimal", () => {
        const result = detectNegative("(50.50)");
        expect(result.isNegative).toBe(true);
        expect(result.cleanedInput).toBe("50.50");
      });

      it("should detect parentheses with currency symbol", () => {
        const result = detectNegative("($100)");
        expect(result.isNegative).toBe(true);
        expect(result.cleanedInput).toBe("$100");
      });

      it("should detect parentheses with ISO code", () => {
        const result = detectNegative("(100 USD)");
        expect(result.isNegative).toBe(true);
        expect(result.cleanedInput).toBe("100 USD");
      });

      it("should detect parentheses with formatted number", () => {
        const result = detectNegative("(1,234.56)");
        expect(result.isNegative).toBe(true);
        expect(result.cleanedInput).toBe("1,234.56");
      });

      it("should not detect incomplete parentheses", () => {
        expect(detectNegative("(100").isNegative).toBe(false);
        expect(detectNegative("100)").isNegative).toBe(false);
      });

      it("should handle whitespace around parentheses", () => {
        const result = detectNegative("  (100)  ");
        expect(result.isNegative).toBe(true);
        expect(result.cleanedInput).toBe("100");
      });
    });

    describe("negative prefixes", () => {
      it('should detect hyphen "-"', () => {
        const result = detectNegative("-100");
        expect(result.isNegative).toBe(true);
        expect(result.cleanedInput).toBe("100");
      });

      it('should detect "minus" keyword', () => {
        const result = detectNegative("minus 100");
        expect(result.isNegative).toBe(true);
        expect(result.cleanedInput).toBe("100");
      });

      it('should detect "negative" keyword', () => {
        const result = detectNegative("negative 100");
        expect(result.isNegative).toBe(true);
        expect(result.cleanedInput).toBe("100");
      });

      it("should detect minus with currency symbol", () => {
        const result = detectNegative("-$100");
        expect(result.isNegative).toBe(true);
        expect(result.cleanedInput).toBe("$100");
      });

      it("should detect minus with ISO code", () => {
        const result = detectNegative("-100 EUR");
        expect(result.isNegative).toBe(true);
        expect(result.cleanedInput).toBe("100 EUR");
      });

      it("should be case insensitive for word prefixes", () => {
        expect(detectNegative("MINUS 100").isNegative).toBe(true);
        expect(detectNegative("Negative 100").isNegative).toBe(true);
        expect(detectNegative("MinUs 100").isNegative).toBe(true);
      });

      it("should handle various dash characters", () => {
        expect(detectNegative("−100").isNegative).toBe(true); // minus sign (U+2212)
        expect(detectNegative("–100").isNegative).toBe(true); // en dash
        expect(detectNegative("—100").isNegative).toBe(true); // em dash
      });

      it("should handle whitespace after prefix", () => {
        const result = detectNegative("-  100");
        expect(result.isNegative).toBe(true);
        expect(result.cleanedInput).toBe("100");
      });
    });

    describe("positive numbers", () => {
      it("should not detect positive plain number", () => {
        expect(detectNegative("100").isNegative).toBe(false);
      });

      it("should not detect positive with currency", () => {
        expect(detectNegative("$100").isNegative).toBe(false);
        expect(detectNegative("100 USD").isNegative).toBe(false);
      });

      it("should not detect empty string", () => {
        expect(detectNegative("").isNegative).toBe(false);
      });
    });

    describe("edge cases", () => {
      it("should handle hyphen in the middle of text", () => {
        // Hyphen not at the start shouldn't be detected as negative
        expect(detectNegative("100-200").isNegative).toBe(false);
      });

      it("should handle text with 'minus' not at start", () => {
        // "minus" not at the start shouldn't be detected
        expect(detectNegative("100 minus fees").isNegative).toBe(false);
      });
    });
  });

  describe("hasParenthesesNotation", () => {
    it("should return true for parentheses notation", () => {
      expect(hasParenthesesNotation("(100)")).toBe(true);
      expect(hasParenthesesNotation("($100)")).toBe(true);
      expect(hasParenthesesNotation("(100 USD)")).toBe(true);
    });

    it("should return false for no parentheses", () => {
      expect(hasParenthesesNotation("100")).toBe(false);
      expect(hasParenthesesNotation("-100")).toBe(false);
    });

    it("should return false for incomplete parentheses", () => {
      expect(hasParenthesesNotation("(100")).toBe(false);
      expect(hasParenthesesNotation("100)")).toBe(false);
    });
  });

  describe("hasNegativePrefix", () => {
    it("should return true for negative prefixes", () => {
      expect(hasNegativePrefix("-100")).toBe(true);
      expect(hasNegativePrefix("minus 100")).toBe(true);
      expect(hasNegativePrefix("negative 100")).toBe(true);
    });

    it("should return false for no prefix", () => {
      expect(hasNegativePrefix("100")).toBe(false);
      expect(hasNegativePrefix("(100)")).toBe(false);
    });

    it("should return false for prefix in middle", () => {
      expect(hasNegativePrefix("100-200")).toBe(false);
    });
  });

  describe("removeNegativeIndicators", () => {
    it("should remove parentheses", () => {
      expect(removeNegativeIndicators("(100)")).toBe("100");
      expect(removeNegativeIndicators("($100)")).toBe("$100");
    });

    it("should remove negative prefixes", () => {
      expect(removeNegativeIndicators("-100")).toBe("100");
      expect(removeNegativeIndicators("minus 100")).toBe("100");
      expect(removeNegativeIndicators("negative 100")).toBe("100");
    });

    it("should return input unchanged if no indicators", () => {
      expect(removeNegativeIndicators("100")).toBe("100");
      expect(removeNegativeIndicators("$100")).toBe("$100");
    });
  });
});
