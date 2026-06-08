import { matchContextualPhrase } from "../src/patterns/contextualPhrases";

describe("ReDoS regression — contextualPhrases", () => {
  test("\"dollar 1 \" * 2000 fails fast \u003c100ms", () => {
    const payload = "dollar 1 ".repeat(2000);
    const start = performance.now();
    const result = matchContextualPhrase(payload);
    const elapsed = performance.now() - start;
    console.log("elapsed:", elapsed.toFixed(2) + "ms");
    expect(elapsed).toBeLessThan(100);
  });
});
