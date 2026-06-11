/**
 * ParseAll Module
 * ===============
 * Provides functionality to find all monetary expressions in text,
 * including range expressions, as single parsed results.
 */

import { MoneyParseError } from "./errors";
import { parseAbbreviation } from "./patterns/abbreviations";
import { parseContextualPhrase } from "./patterns/contextualPhrases";
import { matchNumericWordCombo } from "./patterns/numericWordCombos";
import { parseRange, parseComparisonOperator, parseSingleValue } from "./patterns/ranges";
import { parseSymbol } from "./patterns/symbols";

export { RangeParseResult } from "./types";

/**
 * A parsed monetary expression that can be either a single value or a range.
 */
export interface MonetaryExpression {
  /** The type of expression */
  type: "single" | "range";
  /** The original raw text that was matched */
  raw: string;
  /** The start index in the original input string */
  startIndex: number;
  /** The end index in the original input string */
  endIndex: number;
  /** For single values: the numeric amount */
  amount?: number;
  /** For range values: the minimum value */
  min?: number;
  /** For range values: the maximum value */
  max?: number;
  /** The ISO currency code (e.g., 'USD', 'EUR') */
  currency?: string;
  /** Flag indicating if this is a range expression */
  isRange?: boolean;
}

/**
 * Pattern types for MONETARY_PATTERNS array
 */
export type PatternType =
  | "symbolRange"
  | "isoCodeRange"
  | "magnitudeRange"
  | "magnitudeRangeRightOnly"
  | "contextualRange"
  | "comparison"
  | "symbol"
  | "isoCode"
  | "magnitude"
  | "contextual";

/**
 * A regex pattern entry for matching monetary expressions.
 */
export interface MonetaryPattern {
  /** Unique identifier for the pattern */
  type: PatternType;
  /** The regex to match */
  regex: RegExp;
  /** Whether this is a range pattern (must come before single-value patterns) */
  isRange: boolean;
  /** Function to parse the matched text */
  parser: (match: string) => {
    amount?: number;
    min?: number;
    max?: number;
    currency?: string;
    isRange?: boolean;
  } | null;
}

/**
 * MONETARY_PATTERNS array containing regex patterns for different monetary types.
 * Range patterns are placed BEFORE single-value patterns to ensure ranges
 * are detected as single expressions.
 */
export const MONETARY_PATTERNS: MonetaryPattern[] = [
  // ============================================
  // RANGE PATTERNS (placed before single-value)
  // ============================================

  // 1. Symbol ranges: "$500 - $1000", "$5–$10", "€100 to €200"
  {
    type: "symbolRange",
    regex:
      /([$€£¥₹₽₩₺₣₱₦₴₸₫₪])(?:\s*)(\d+(?:,\d{3})*(?:\.\d+)?|\d+)(?:\s*)(?:-|–|—|to|through)(?:\s*)(?:\1)?(?:\s*)(\d+(?:,\d{3})*(?:\.\d+)?|\d+)/gi,
    isRange: true,
    parser: (match: string) => {
      const result = parseRange(match);
      if (result && result.min !== null && result.max !== null) {
        return {
          min: result.min,
          max: result.max,
          currency: result.currency ?? undefined,
          isRange: true,
        };
      }
      return null;
    },
  },

  // 2. ISO code ranges: "USD 500 - USD 1000", "EUR 100 to EUR 200"
  {
    type: "isoCodeRange",
    regex:
      /\b([A-Z]{3})(?:\s*)(\d+(?:,\d{3})*(?:\.\d+)?|\d+)(?:\s*)(?:-|–|—|to|through)(?:\s*)(\1)(?:\s*)(\d+(?:,\d{3})*(?:\.\d+)?|\d+)/gi,
    isRange: true,
    parser: (match: string) => {
      const result = parseRange(match);
      if (result && result.min !== null && result.max !== null) {
        return {
          min: result.min,
          max: result.max,
          currency: result.currency ?? undefined,
          isRange: true,
        };
      }
      return null;
    },
  },

  // 3. Magnitude suffix ranges: "10k - 1M", "5 million to 10 million"
  {
    type: "magnitudeRange",
    regex:
      /\b(\d+(?:\.\d+)?)\s*(k|thousand|m|mn|million|b|bn|billion)(?:\s*)(?:-|–|—|to|through)(?:\s*)(\d+(?:\.\d+)?)\s*(k|thousand|m|mn|million|b|bn|billion)\b/gi,
    isRange: true,
    parser: (match: string) => {
      const result = parseRange(match);
      if (result && result.min !== null && result.max !== null) {
        return {
          min: result.min,
          max: result.max,
          currency: result.currency ?? undefined,
          isRange: true,
        };
      }
      return null;
    },
  },

  // 3b. Magnitude on right side only: "1-3 Million dirhams", "5 to 10 million euros"
  // This handles cases where only the right side has the magnitude suffix
  {
    type: "magnitudeRangeRightOnly",
    regex:
      /\b(\d+(?:\.\d+)?)\s*(?:-|–|—|to|through)\s*(\d+(?:\.\d+)?)\s*(k|thousand|m|mn|million|b|bn|billion)(?:\s+(?:dollars?|euros?|pounds?|dirhams?|rupees?| francs?|yen|yuan|usd|eur|gbp|chf|inr|cny|jpy|krw))?\b/gi,
    isRange: true,
    parser: (match: string) => {
      const result = parseRange(match);
      if (result && result.min !== null && result.max !== null) {
        return {
          min: result.min,
          max: result.max,
          currency: result.currency ?? undefined,
          isRange: true,
        };
      }
      return null;
    },
  },

  // 4. Contextual phrase ranges: "between $100 and $200", "from $50 to $100"
  {
    type: "contextualRange",
    regex:
      /\b(?:between|from|range\s+of)\s*([$€£¥₹]|\b[A-Z]{3}\b|\d+(?:\s*\w+)?)(?:\s*)(?:-|–|—|to|through|and)\s*(?:\1|\d+(?:\s*\w+)?|[\w\s]+?dollars?|[\w\s]+?euros?|[\w\s]+?pounds?)\b/gi,
    isRange: true,
    parser: (match: string) => {
      const result = parseRange(match);
      if (result && result.min !== null && result.max !== null) {
        return {
          min: result.min,
          max: result.max,
          currency: result.currency ?? undefined,
          isRange: true,
        };
      }
      return null;
    },
  },

  // 4. Comparison operators: "< 30k", "> 2 million", "< 1,000 USD"
  // These are treated as bounded ranges where one side is null
  {
    type: "comparison",
    regex: /(<|>)(\s*)(\d+(?:,\d{3})*(?:\.\d+)?|\d+)(?:\s*(?:k|thousand|m|mn|million|b|bn|billion|usd|eur|gbp|chf|inr|cny|jpy|krw|dollars?|euros?|pounds?))?/gi,
    isRange: true,
    parser: (match: string) => {
      const result = parseComparisonOperator(match);
      if (result) {
        return {
          min: result.min ?? undefined,
          max: result.max ?? undefined,
          currency: result.currency ?? undefined,
          isRange: true,
        };
      }
      return null;
    },
  },

  // ============================================
  // SINGLE VALUE PATTERNS
  // ============================================

  // 5. Currency symbols: "$100", "€50", "£25"
  {
    type: "symbol",
    regex: /([$€£¥₹₽₩₺₣₱₦₴₸₫₪])\s*(\d+(?:,\d{3})*(?:\.\d+)?|\d+)/g,
    isRange: false,
    parser: (match: string) => {
      const result = parseSymbol(match);
      if (result) {
        return {
          amount: result.amount,
          currency: result.currencyCode,
        };
      }
      return null;
    },
  },

  // 6. ISO currency codes: "USD 100", "EUR 50"
  {
    type: "isoCode",
    regex: /\b([A-Z]{3})\s+(\d+(?:,\d{3})*(?:\.\d+)?|\d+)\b/g,
    isRange: false,
    parser: (match: string) => {
      const result = parseAbbreviation(match);
      if (result) {
        return {
          amount: result.amount,
          currency: result.currencyCode,
        };
      }
      return null;
    },
  },

  // 7. Magnitude suffixes: "10k", "5M", "2bn"
  {
    type: "magnitude",
    regex: /\b(\d+(?:\.\d+)?)\s*(k|thousand|m|mn|million|b|bn|billion)\b/gi,
    isRange: false,
    parser: (match: string) => {
      const result = matchNumericWordCombo(match);
      if (result) {
        return {
          amount: result.value,
        };
      }
      return null;
    },
  },

  // 8. Contextual phrases: "100 dollars", "50 euros", "25 pounds"
  {
    type: "contextual",
    regex:
      /\b(\d+(?:,\d{3})*(?:\.\d+)?|\d+)\s*(dollars?|euros?|pounds?|cents?|bucks?|quid)\b/gi,
    isRange: false,
    parser: (match: string) => {
      const result = parseContextualPhrase(match);
      if (result) {
        return {
          amount: result.value,
          currency: result.currency,
        };
      }
      return null;
    },
  },
];

/**
 * Parses all monetary expressions in the given text.
 *
 * @param input - The text to search for monetary expressions
 * @returns An array of MonetaryExpression objects found in the text
 *
 * @example
 * ```ts
 * const results = parseAll("Price is $100-$200 or $500");
 * // Returns range and single value expressions
 * ```
 */
export function parseAll(input: string): MonetaryExpression[] {
  // Defense-in-depth: reject pathologically long inputs before any regex runs
  const MAX_INPUT_LENGTH = 5000;
  if (input.length > MAX_INPUT_LENGTH) {
    throw new MoneyParseError(
      `Input length (${input.length}) exceeds maximum allowed (${MAX_INPUT_LENGTH}).`
    );
  }

  const results: MonetaryExpression[] = [];
  const processedRanges: { start: number; end: number }[] = [];

  // First, handle contextual phrase ranges: "between X and Y", "from X to Y"
  // Use a generous capture and let parseSingleValue extract the actual value+currency
  const contextualRangeRegex =
    /\b(?:between|from|range\s+of)\s+(.{1,40}?)\s+(?:and|to|through)\s+(.{1,40}?)(?=\s|$|,|\.|;)/gi;
  let match: RegExpExecArray | null;

  while ((match = contextualRangeRegex.exec(input)) !== null) {
    let rangeText = match[0];
    let startIndex = match.index;
    let endIndex = startIndex + rangeText.length;

    const leftParsed = parseSingleValue(match[1].trim());
    const rightParsed = parseSingleValue(match[2].trim());

    if (leftParsed && rightParsed) {
      // Extend the match to include trailing currency words (e.g., "200 dollars")
      const suffixMatch = input
        .slice(endIndex)
        .match(
          /^(\s+(?:dollars?|euros?|pounds?|cents?|bucks?|quid|dirhams?|rupees?|francs?|yen|yuan|usd|eur|gbp|chf|inr|cny|jpy|krw))/i
        );
      if (suffixMatch) {
        rangeText += suffixMatch[1];
        endIndex += suffixMatch[1].length;
      }

      results.push({
        type: "range",
        raw: rangeText,
        startIndex,
        endIndex,
        min: Math.min(leftParsed.value, rightParsed.value),
        max: Math.max(leftParsed.value, rightParsed.value),
        currency: leftParsed.currency ?? rightParsed.currency ?? undefined,
        isRange: true,
      });
      processedRanges.push({ start: startIndex, end: endIndex });
    }
  }

  // Then, find all range expressions using parseRange
  const rangeMatches = findRangeMatches(input);
  for (const rangeMatch of rangeMatches) {
    // Skip if this position overlaps with a range we already found
    if (isOverlapping(rangeMatch.startIndex, rangeMatch.endIndex, processedRanges)) {
      continue;
    }

    results.push({
      type: "range",
      raw: rangeMatch.raw,
      startIndex: rangeMatch.startIndex,
      endIndex: rangeMatch.endIndex,
      min: rangeMatch.min ?? undefined,
      max: rangeMatch.max ?? undefined,
      currency: rangeMatch.currency ?? undefined,
      isRange: true,
    });
    processedRanges.push({
      start: rangeMatch.startIndex,
      end: rangeMatch.endIndex,
    });
  }

  // Then, find single value expressions, skipping ranges
  // Include negative variants: prefix with -, minus, negative, or parentheses notation
  // IMPORTANT: only match when a currency symbol or word is present — plain numbers
  // like "10 - 20" must NOT be captured as negative values.
  const negativeSingleRegex =
    /(?:^|(?<=\s))(?:[-−–—]|minus\s+|negative\s+|\()\s*(?:[$€£¥₹₽₩₺₣₱₦₴₸₫₪]\s*(?:\d+(?:,\d{3})*(?:\.\d+)?|\d+)|(?:\d+(?:,\d{3})*(?:\.\d+)?|\d+)\s*(?:dollars?|euros?|pounds?|cents?|bucks?|quid|dirhams?|rupees?|francs?|yen|yuan|usd|eur|gbp|chf|inr|cny|jpy|krw))\b/gi;

  let negMatch: RegExpExecArray | null;
  while ((negMatch = negativeSingleRegex.exec(input)) !== null) {
    const rawText = negMatch[0];
    const startIndex = negMatch.index;
    const endIndex = startIndex + rawText.length;

    if (isOverlapping(startIndex, endIndex, processedRanges)) continue;

    // Determine what kind of negative pattern this is
    const trimmed = rawText.trimStart();
    const isParen = trimmed[0] === "(";
    const isMinusWord = /^minus\b/i.test(trimmed);
    const isNegativeWord = /^negative\b/i.test(trimmed);

    // Strip the negative indicator to get the clean value string
    let cleanValue: string;
    if (isParen) {
      cleanValue = rawText.replace(/^\(/, "").replace(/\)$/, "").trim();
    } else if (isMinusWord) {
      cleanValue = rawText.replace(/^minus\s+/i, "").trim();
    } else if (isNegativeWord) {
      cleanValue = rawText.replace(/^negative\s+/i, "").trim();
    } else {
      cleanValue = rawText.replace(/^[-−–—]\s*/, "").trim();
    }

    // Try to parse the clean value with existing single-value logic
    const parsed = parseSingleValue(cleanValue);
    if (parsed && parsed.value !== undefined) {
      results.push({
        type: "single",
        raw: rawText,
        startIndex,
        endIndex,
        amount: -Math.abs(parsed.value),
        currency: parsed.currency,
        isRange: false,
      });
      processedRanges.push({ start: startIndex, end: endIndex });
    }
  }

  // Standard single value expressions (positive)
  for (const pattern of MONETARY_PATTERNS) {
    if (pattern.isRange) continue; // Already handled above

    const regex = new RegExp(pattern.regex.source, pattern.regex.flags);
    let match: RegExpExecArray | null;

    while ((match = regex.exec(input)) !== null) {
      const startIndex = match.index;
      const endIndex = startIndex + match[0].length;

      // Skip if this position overlaps with a range we already found
      if (isOverlapping(startIndex, endIndex, processedRanges)) {
        continue;
      }

      const parsed = pattern.parser(match[0]);
      if (parsed && parsed.amount !== undefined) {
        results.push({
          type: "single",
          raw: match[0],
          startIndex,
          endIndex,
          amount: parsed.amount,
          currency: parsed.currency,
          isRange: false,
        });

        // Mark this position as processed
        processedRanges.push({ start: startIndex, end: endIndex });
      }
    }
  }

  // Sort results by start index
  return results.sort((a, b) => a.startIndex - b.startIndex);
}

/**
 * Finds all range expressions in the input string.
 * Uses multiple strategies to detect different range formats.
 */
function findRangeMatches(input: string): Array<{
  raw: string;
  startIndex: number;
  endIndex: number;
  min: number | null;
  max: number | null;
  currency: string | null;
}> {
  const matches: Array<{
    raw: string;
    startIndex: number;
    endIndex: number;
    min: number | null;
    max: number | null;
    currency: string | null;
  }> = [];

  // Strategy 1: Look for range patterns with separators
  // Pattern: currency + number + separator + number
  const rangeWithSymbolRegex =
    /([$€£¥₹₽₩₺₣₱₦₴₸₫₪])\s*(\d+(?:,\d{3})*(?:\.\d+)?)\s*(?:-|–|—|to|through)\s*(?:\1)?\s*(\d+(?:,\d{3})*(?:\.\d+)?)/gi;
  let match: RegExpExecArray | null;

  while ((match = rangeWithSymbolRegex.exec(input)) !== null) {
    const rangeText = match[0];
    const parsed = parseRange(rangeText);
    if (parsed && parsed.min !== null && parsed.max !== null) {
      const startIndex = match.index;
      const endIndex = startIndex + rangeText.length;

      // Check for duplicates
      if (
        !matches.some((m) => startIndex < m.endIndex && endIndex > m.startIndex)
      ) {
        matches.push({
          raw: rangeText,
          startIndex,
          endIndex,
          min: parsed.min,
          max: parsed.max,
          currency: parsed.currency,
        });
      }
    }
  }

  // Strategy 2: Look for ISO code ranges (e.g., "USD 500 - USD 1000")
  const isoCodeRangeRegex =
    /\b([A-Z]{3})\s+(\d+(?:,\d{3})*(?:\.\d+)?)\s*(?:-|–|—|to|through)\s*\1\s+(\d+(?:,\d{3})*(?:\.\d+)?)/gi;

  while ((match = isoCodeRangeRegex.exec(input)) !== null) {
    const rangeText = match[0];
    const parsed = parseRange(rangeText);
    if (parsed && parsed.min !== null && parsed.max !== null) {
      const startIndex = match.index;
      const endIndex = startIndex + rangeText.length;

      if (
        !matches.some((m) => startIndex < m.endIndex && endIndex > m.startIndex)
      ) {
        matches.push({
          raw: rangeText,
          startIndex,
          endIndex,
          min: parsed.min,
          max: parsed.max,
          currency: parsed.currency,
        });
      }
    }
  }

  // Strategy 3: Contextual phrase ranges are now handled directly in parseAll()
  // (between/ X and Y / from X to Y) — see the contextualRangeRegex in parseAll().

  // Strategy 3b: Magnitude on BOTH sides (e.g., "5k to 10k", "1M - 2M", "1 million to 10 million")
  const magnitudeBothSidesRegex =
    /\b(\d+(?:\.\d+)?)\s*(k|thousand|m|mn|million|b|bn|billion)(?:\s*)(?:-|–|—|to|through)(?:\s*)(\d+(?:\.\d+)?)\s*(k|thousand|m|mn|million|b|bn|billion)\b/gi;

  while ((match = magnitudeBothSidesRegex.exec(input)) !== null) {
    const rangeText = match[0];
    const parsed = parseRange(rangeText);
    if (parsed && parsed.min !== null && parsed.max !== null) {
      const startIndex = match.index;
      const endIndex = startIndex + rangeText.length;

      if (
        !matches.some((m) => startIndex < m.endIndex && endIndex > m.startIndex)
      ) {
        matches.push({
          raw: rangeText,
          startIndex,
          endIndex,
          min: parsed.min,
          max: parsed.max,
          currency: parsed.currency,
        });
      }
    }
  }

  // Strategy 4: Magnitude on right side only (e.g., "1-3 Million dirhams", "5 to 10 million euros")
  // This handles cases where only the right side has the magnitude suffix
  // IMPORTANT: Must come BEFORE plain number ranges to avoid matching "5 to 10" before "5 to 10 million"
  const magnitudeRightOnlyRegex =
    /\b(\d+(?:\.\d+)?)\s*(?:-|–|—|to|through)\s*(\d+(?:\.\d+)?)\s*(k|thousand|m|mn|million|b|bn|billion)(?:\s+(?:dollars?|euros?|pounds?|dirhams?|rupees?| francs?|yen|yuan|usd|eur|gbp|chf|inr|cny|jpy|krw))?\b/gi;

  while ((match = magnitudeRightOnlyRegex.exec(input)) !== null) {
    const rangeText = match[0];
    const parsed = parseRange(rangeText);
    if (parsed && parsed.min !== null && parsed.max !== null) {
      const startIndex = match.index;
      const endIndex = startIndex + rangeText.length;

      if (
        !matches.some((m) => startIndex < m.endIndex && endIndex > m.startIndex)
      ) {
        matches.push({
          raw: rangeText,
          startIndex,
          endIndex,
          min: parsed.min,
          max: parsed.max,
          currency: parsed.currency,
        });
      }
    }
  }

  // Strategy 5: Look for plain number ranges (e.g., "100 - 200")
  const plainNumberRangeRegex =
    /\b(\d+(?:,\d{3})*(?:\.\d+)?)\s*(?:-|–|—|to|through)\s*(\d+(?:,\d{3})*(?:\.\d+)?)\b/g;

  while ((match = plainNumberRangeRegex.exec(input)) !== null) {
    const rangeText = match[0];
    // Only consider if it looks like a monetary range (has a currency nearby)
    const beforeText = input
      .slice(Math.max(0, match.index - 10), match.index)
      .toLowerCase();
    const afterText = input
      .slice(
        match.index + rangeText.length,
        match.index + rangeText.length + 20
      )
      .toLowerCase();

    if (
      beforeText.includes("$") ||
      beforeText.includes("eur") ||
      beforeText.includes("usd") ||
      afterText.includes("$") ||
      afterText.includes("eur") ||
      afterText.includes("usd") ||
      beforeText.includes("price") ||
      beforeText.includes("cost") ||
      beforeText.includes("amount") ||
      beforeText.includes("between") ||
      beforeText.includes("from")
    ) {
      const parsed = parseRange(rangeText);
      if (parsed && parsed.min !== null && parsed.max !== null) {
        const startIndex = match.index;
        const endIndex = startIndex + rangeText.length;

        if (
          !matches.some(
            (m) => startIndex < m.endIndex && endIndex > m.startIndex
          )
        ) {
          matches.push({
            raw: rangeText,
            startIndex,
            endIndex,
            min: parsed.min,
            max: parsed.max,
            currency: parsed.currency,
          });
        }
      }
    }
  }

  return matches;
}

/**
 * Checks if a range overlaps with any processed ranges.
 */
function isOverlapping(
  start: number,
  end: number,
  processed: Array<{ start: number; end: number }>
): boolean {
  return processed.some((p) => start < p.end && end > p.start);
}

export default parseAll;
