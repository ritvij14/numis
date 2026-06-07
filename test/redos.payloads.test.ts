import { describe, test, expect, beforeAll } from "@jest/globals";
import { performance } from "perf_hooks";

// Pattern matchers
import { matchContextualPhrase } from "../src/patterns/contextualPhrases";
import {
  matchFractionalWordedNumber,
  matchWordedNumber,
} from "../src/patterns/wordedNumbers";
import { matchNumericWordCombo } from "../src/patterns/numericWordCombos";
import { matchSlangTerm } from "../src/patterns/slangTerms";
import { matchSymbol } from "../src/patterns/symbols";
import { matchRegionalFormat } from "../src/patterns/regionalFormats";
import { matchAbbreviation } from "../src/patterns/abbreviations";
import { matchNumberWithSeparators } from "../src/patterns/numbersWithSeparators";
import { matchPlainNumber } from "../src/patterns/plainNumbers";
import { matchMinorUnitOnly } from "../src/patterns/minorUnitsOnly";
import { matchRange, matchComparisonOperator } from "../src/patterns/ranges";
import { detectNegative } from "../src/patterns/negativeNumbers";
import { RegexPipeline } from "../src/regexPipeline";

jest.setTimeout(5000);

const THRESHOLD_MS = 100;
const LONG_PAYLOAD_LEN = 4990; // stays under the 5000-char input cap

function measureMs(fn: () => unknown): number {
  const start = performance.now();
  fn();
  return performance.now() - start;
}

function assertFast(fn: () => unknown, label: string): void {
  const elapsed = measureMs(fn);
  // eslint-disable-next-line no-console
  if (elapsed >= THRESHOLD_MS) {
    console.warn(
      `SLOW: ${label} took ${elapsed.toFixed(2)}ms (threshold ${THRESHOLD_MS}ms)`
    );
  }
  expect(elapsed).toBeLessThan(THRESHOLD_MS);
}

// --- payload generators ---
const repeat = (s: string, n: number): string => Array(n + 1).join(s);
const repeatWords = (word: string, count: number, sep = " "): string =>
  Array.from({ length: count }, () => word).join(sep);

describe("ReDoS payload test suite", () => {
  // Warm up lazy-initialized caches and regex compilation so first-call
  // overhead does not skew the timing assertions.
  beforeAll(() => {
    matchContextualPhrase("one dollar");
    matchWordedNumber("one hundred");
    matchFractionalWordedNumber("half a million");
    matchNumericWordCombo("10k");
    matchSlangTerm("five bucks");
    matchSymbol("$100");
    matchRegionalFormat("1.234,56 €");
    matchAbbreviation("100 USD");
    matchNumberWithSeparators("1,234.56");
    matchPlainNumber("123");
    matchMinorUnitOnly("50 cents");
    matchRange("10 to 20");
    matchComparisonOperator("< 30");
    detectNegative("-100");
    RegexPipeline.default().run("$10 USD");
  });

  describe("wordedNumbers matchers", () => {
    test("matchWordedNumber rejects 10k non-matching repeated words fast", () => {
      const payload = repeatWords("abc", 2500); // ~10k chars
      assertFast(
        () => matchWordedNumber(payload),
        "matchWordedNumber(10k abc)"
      );
    });

    test("matchWordedNumber accepts 2500 repeated 'one' words fast", () => {
      const payload = repeatWords("one", 2500); // ~10k chars
      assertFast(
        () => matchWordedNumber(payload),
        "matchWordedNumber(2500 ones)"
      );
    });

    test("matchWordedNumber handles 10k hyphenated non-matching fast", () => {
      const payload = repeatWords("abc", 2500, "-"); // ~10k chars
      assertFast(
        () => matchWordedNumber(payload),
        "matchWordedNumber(10k hyphenated abc)"
      );
    });

    test("matchFractionalWordedNumber rejects 10k non-matching repeated words fast", () => {
      const payload = repeatWords("abc", 2500);
      assertFast(
        () => matchFractionalWordedNumber(payload),
        "matchFractionalWordedNumber(10k abc)"
      );
    });

    test("matchFractionalWordedNumber accepts long fractional pattern fast", () => {
      const payload = repeatWords("half", 500) + " million"; // ~3.5k chars
      assertFast(
        () => matchFractionalWordedNumber(payload),
        "matchFractionalWordedNumber(500 halves + million)"
      );
    });
  });

  describe("contextualPhrases matcher", () => {
    test("rejects 10k chars of repeated 'a ' fast", () => {
      const payload = repeat("a ", 5000); // 10k chars
      assertFast(
        () => matchContextualPhrase(payload),
        "matchContextualPhrase(10k a)"
      );
    });

    test("rejects 10k chars of repeated 'one ' fast", () => {
      const payload = repeat("one ", 2500);
      assertFast(
        () => matchContextualPhrase(payload),
        "matchContextualPhrase(10k ones)"
      );
    });

    test("accepts long valid contextual phrase fast", () => {
      const payload = repeatWords("one", 500) + " million dollars"; // ~3.5k chars
      assertFast(
        () => matchContextualPhrase(payload),
        "matchContextualPhrase(500 ones + million dollars)"
      );
    });

    test("handles 10k char mixed text with currency at end fast", () => {
      const prefix = repeatWords("hello world", 400); // ~8.8k chars
      const payload = prefix + " one dollar";
      assertFast(
        () => matchContextualPhrase(payload),
        "matchContextualPhrase(prefix + one dollar)"
      );
    });
  });

  describe("numericWordCombos matcher", () => {
    test("rejects 10k digits without suffix fast", () => {
      const payload = repeat("1", 10000);
      assertFast(
        () => matchNumericWordCombo(payload),
        "matchNumericWordCombo(10k 1s)"
      );
    });

    test("accepts 10k prefix + combo fast", () => {
      const prefix = repeat("x ", 2480); // stays under 5k cap with suffix // ~10k chars
      const payload = prefix + "10k";
      assertFast(
        () => matchNumericWordCombo(payload),
        "matchNumericWordCombo(prefix + 10k)"
      );
    });
  });

  describe("slangTerms matcher", () => {
    test("rejects 10k repeated words without slang fast", () => {
      const payload = repeatWords("abc", 2500);
      assertFast(
        () => matchSlangTerm(payload),
        "matchSlangTerm(10k abc)"
      );
    });

    test("accepts long prefix + slang fast", () => {
      const prefix = repeatWords("one two three four five", 600); // ~10k chars
      const payload = prefix + " bucks";
      assertFast(
        () => matchSlangTerm(payload),
        "matchSlangTerm(prefix + bucks)"
      );
    });
  });

  describe("symbols matcher", () => {
    test("rejects 10k chars without symbol fast", () => {
      const payload = repeat("a", 10000);
      assertFast(
        () => matchSymbol(payload),
        "matchSymbol(10k a)"
      );
    });

    test("accepts symbol at end of 10k string fast", () => {
      const prefix = repeat("x ", 2480); // stays under 5k cap with suffix
      const payload = prefix + "$100";
      assertFast(
        () => matchSymbol(payload),
        "matchSymbol(prefix + $100)"
      );
    });
  });

  describe("regionalFormats matcher", () => {
    test("rejects 10k ambiguous separators fast", () => {
      const payload = repeat("1,1", 1666) + "1"; // ~10k chars
      assertFast(
        () => matchRegionalFormat(payload),
        "matchRegionalFormat(10k 1,1)"
      );
    });

    test("accepts regional format at end of 10k string fast", () => {
      const prefix = repeat("x ", 2480); // stays under 5k cap with suffix
      const payload = prefix + "1.234,56 €";
      assertFast(
        () => matchRegionalFormat(payload),
        "matchRegionalFormat(prefix + regional)"
      );
    });
  });

  describe("abbreviations matcher", () => {
    test("rejects 10k chars without abbreviation fast", () => {
      const payload = repeat("abc ", 2500);
      assertFast(
        () => matchAbbreviation(payload),
        "matchAbbreviation(10k abc)"
      );
    });

    test("accepts abbreviation at end of 10k string fast", () => {
      const prefix = repeat("x ", 2480); // stays under 5k cap with suffix
      const payload = prefix + "100 USD";
      assertFast(
        () => matchAbbreviation(payload),
        "matchAbbreviation(prefix + 100 USD)"
      );
    });
  });

  describe("numbersWithSeparators matcher", () => {
    test("rejects 10k non-matching digits fast", () => {
      const payload = repeat("1", 10000);
      assertFast(
        () => matchNumberWithSeparators(payload),
        "matchNumberWithSeparators(10k 1s)"
      );
    });

    test("accepts separators at end of 10k string fast", () => {
      const prefix = repeat("x ", 2480); // stays under 5k cap with suffix
      const payload = prefix + "1,234.56";
      assertFast(
        () => matchNumberWithSeparators(payload),
        "matchNumberWithSeparators(prefix + 1,234.56)"
      );
    });
  });

  describe("plainNumbers matcher", () => {
    test("rejects 10k non-digit chars fast", () => {
      const payload = repeat("a", 10000);
      assertFast(
        () => matchPlainNumber(payload),
        "matchPlainNumber(10k a)"
      );
    });

    test("accepts number at end of 10k string fast", () => {
      const prefix = repeat("x ", 2480); // stays under 5k cap with suffix
      const payload = prefix + "123";
      assertFast(
        () => matchPlainNumber(payload),
        "matchPlainNumber(prefix + 123)"
      );
    });
  });

  describe("minorUnitsOnly matcher", () => {
    test("rejects 10k chars without minor unit fast", () => {
      const payload = repeat("abc ", 2500);
      assertFast(
        () => matchMinorUnitOnly(payload),
        "matchMinorUnitOnly(10k abc)"
      );
    });

    test("accepts minor unit at end of 10k string fast", () => {
      const prefix = repeat("x ", 2480); // stays under 5k cap with suffix
      const payload = prefix + "75 cents";
      assertFast(
        () => matchMinorUnitOnly(payload),
        "matchMinorUnitOnly(prefix + 75 cents)"
      );
    });

    test("rejects compound pattern fast (negative lookahead path)", () => {
      const prefix = repeat("x ", 2480); // stays under 5k cap with suffix
      const payload = prefix + "a dollar and 75 cents";
      assertFast(
        () => matchMinorUnitOnly(payload),
        "matchMinorUnitOnly(compound reject)"
      );
    });
  });

  describe("ranges matchers", () => {
    test("matchRange rejects 10k non-range chars fast", () => {
      const payload = repeat("abc ", 2500);
      assertFast(() => matchRange(payload), "matchRange(10k abc)");
    });

    test("matchRange accepts long range fast", () => {
      const prefix = repeat("x ", 2480); // stays under 5k cap with suffix
      const payload = prefix + "10 to 20";
      assertFast(
        () => matchRange(payload),
        "matchRange(prefix + 10 to 20)"
      );
    });

    test("matchComparisonOperator rejects 10k chars fast", () => {
      const payload = repeat("abc ", 2500);
      assertFast(
        () => matchComparisonOperator(payload),
        "matchComparisonOperator(10k abc)"
      );
    });

    test("matchComparisonOperator accepts long comparison fast", () => {
      const prefix = repeat("x ", 2480); // stays under 5k cap with suffix
      const payload = prefix + "< 30k USD";
      assertFast(
        () => matchComparisonOperator(payload),
        "matchComparisonOperator(prefix + < 30k)"
      );
    });
  });

  describe("negativeNumbers matcher", () => {
    test("detectNegative handles 10k chars fast", () => {
      const payload = repeat("a", 10000);
      assertFast(
        () => detectNegative(payload),
        "detectNegative(10k a)"
      );
    });

    test("detectNegative handles 10k prefix + negative fast", () => {
      const prefix = repeat("x ", 2480); // stays under 5k cap with suffix
      const payload = prefix + "-100";
      assertFast(
        () => detectNegative(payload),
        "detectNegative(prefix + -100)"
      );
    });
  });

  describe("RegexPipeline integration", () => {
    test("runs 10k char no-currency string fast", () => {
      const payload = repeat("hello world ", 416); // ~10k chars
      assertFast(
        () => RegexPipeline.default().run(payload),
        "pipeline(10k no-currency)"
      );
    });

    test("runs 10k char with currency at start fast", () => {
      const payload = "$100 " + repeat("hello world ", 415);
      assertFast(
        () => RegexPipeline.default().run(payload),
        "pipeline(currency at start + 10k)"
      );
    });

    test("runs 10k char with currency at end fast", () => {
      const payload = repeat("hello world ", 415) + " $100";
      assertFast(
        () => RegexPipeline.default().run(payload),
        "pipeline(10k + currency at end)"
      );
    });

    test("runs 10k char with worded number and currency fast", () => {
      const prefix = repeat("hello ", 820); // ~10k chars
      const payload = prefix + "one hundred dollars";
      assertFast(
        () => RegexPipeline.default().run(payload),
        "pipeline(10k + worded currency)"
      );
    });

    test("runs 10k char with repeated number words fast", () => {
      const payload = repeatWords("one two three four five", 200); // ~10k chars
      assertFast(
        () => RegexPipeline.default().run(payload),
        "pipeline(10k repeated number words)"
      );
    });

    test("runs 10k char with contextual phrase fast", () => {
      const prefix = repeat("x ", 2480); // stays under 5k cap with suffix
      const payload = prefix + "a dollar and fifty cents";
      assertFast(
        () => RegexPipeline.default().run(payload),
        "pipeline(prefix + contextual)"
      );
    });

    test("runs 10k char with regional format fast", () => {
      const prefix = repeat("x ", 2480); // stays under 5k cap with suffix
      const payload = prefix + "1.234,56 €";
      assertFast(
        () => RegexPipeline.default().run(payload),
        "pipeline(prefix + regional)"
      );
    });

    test("runs 10k char with range fast", () => {
      const prefix = repeat("x ", 2480); // stays under 5k cap with suffix
      const payload = prefix + "$10 to $20";
      assertFast(
        () => RegexPipeline.default().run(payload),
        "pipeline(prefix + range)"
      );
    });

    test("runs 10k char with comparison fast", () => {
      const prefix = repeat("x ", 2480); // stays under 5k cap with suffix
      const payload = prefix + "> 1000 USD";
      assertFast(
        () => RegexPipeline.default().run(payload),
        "pipeline(prefix + comparison)"
      );
    });
  });

  describe("Edge cases", () => {
    test("empty string is fast", () => {
      assertFast(
        () => matchContextualPhrase(""),
        "matchContextualPhrase(empty)"
      );
      assertFast(() => matchWordedNumber(""), "matchWordedNumber(empty)");
      assertFast(
        () => RegexPipeline.default().run(""),
        "pipeline(empty)"
      );
    });

    test("whitespace-only string is fast", () => {
      const payload = repeat(" ", 4990);
      assertFast(
        () => RegexPipeline.default().run(payload),
        "pipeline(10k spaces)"
      );
    });

    test("special-char-only string is fast", () => {
      const payload = repeat("!@#$%^&*() ", 450); // ~5k chars
      assertFast(
        () => RegexPipeline.default().run(payload),
        "pipeline(10k special chars)"
      );
    });

    test("unicode-heavy string is fast", () => {
      const payload = repeat("你好世界€£¥₹ ", 500); // ~10k chars
      assertFast(
        () => RegexPipeline.default().run(payload),
        "pipeline(10k unicode)"
      );
    });
  });
});
