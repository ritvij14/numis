import { RegexPipeline } from "../src/regexPipeline";
import { MoneyParseError } from "../src/errors";

describe("ReDoS input cap", () => {
  test("throws MoneyParseError for inputs exceeding 5000 chars", () => {
    const pipeline = RegexPipeline.default();
    const longInput = "a".repeat(5001);

    expect(() => pipeline.run(longInput)).toThrow(MoneyParseError);
    expect(() => pipeline.run(longInput)).toThrow(/exceeds maximum/);
  });

  test("accepts inputs at exactly 5000 chars", () => {
    const pipeline = RegexPipeline.default();
    const exact = "$100 " + "x".repeat(4995); // 5 + 4995 = 5000 chars
    expect(() => pipeline.run(exact)).not.toThrow();
  });

  test("normal parsing still works after cap is added", () => {
    const pipeline = RegexPipeline.default();
    const result = pipeline.run("$100");
    expect(result.amount).toBe(100);
    expect(result.currency).toBe("USD");
  });
});
