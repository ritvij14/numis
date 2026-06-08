import { RegexPipeline } from "../src/regexPipeline";
import { parseAll } from "../src/parseAll";
import { MoneyParseError } from "../src/errors";

describe("ReDoS input cap", () => {
  test("throws MoneyParseError for inputs exceeding 5000 chars in RegexPipeline.run()", () => {
    const pipeline = RegexPipeline.default();
    const longInput = "a".repeat(5001);

    expect(() => pipeline.run(longInput)).toThrow(MoneyParseError);
    expect(() => pipeline.run(longInput)).toThrow(/exceeds maximum/);
  });

  test("accepts inputs at exactly 5000 chars in RegexPipeline.run()", () => {
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

  test("throws MoneyParseError for inputs exceeding 5000 chars in parseAll()", () => {
    const longInput = "a".repeat(5001);

    expect(() => parseAll(longInput)).toThrow(MoneyParseError);
    expect(() => parseAll(longInput)).toThrow(/exceeds maximum/);
  });

  test("accepts inputs at exactly 5000 chars in parseAll()", () => {
    const exact = "$100 " + "x".repeat(4995); // 5 + 4995 = 5000 chars
    expect(() => parseAll(exact)).not.toThrow();
  });

  test("normal parseAll still works after cap is added", () => {
    const result = parseAll("Price is $100-$200 or $500");
    expect(result).toHaveLength(2);
    expect(result[0].type).toBe("range");
    expect(result[1].type).toBe("single");
  });
});
