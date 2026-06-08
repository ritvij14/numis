import { describe, test, expect } from "@jest/globals";
import { performance } from "perf_hooks";
import { matchWordedNumber } from "../src/patterns/wordedNumbers";
import { RegexPipeline } from "../src/regexPipeline";

describe("ReDoS regression: wordedNumbers tokenization-first", () => {
  test("matchWordedNumber on 5k repeated 'one' words fast", () => {
    const payload = "one ".repeat(5000) + "zzz";
    const start = performance.now();
    const result = matchWordedNumber(payload);
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(50);
    // The bounded window will match the first 30 "one" words as a valid number.
    expect(result).not.toBeNull();
  });

  test("pipeline on repeated 'one' words under 5k cap fast", () => {
    // Must stay under the 5000-char input cap.
    const payload = "one ".repeat(1249) + "zzz"; // ~4999 chars
    const start = performance.now();
    const result = RegexPipeline.default().run(payload);
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(100);
    expect(result.amount).toBe(30); // bounded window matches 30 ones
  });
});
