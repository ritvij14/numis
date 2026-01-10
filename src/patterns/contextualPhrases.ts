/**
 * Contextual Phrases Pattern Parser
 * =================================
 * Handles monetary phrases that include articles and currency names/ISO codes,
 * plus compound major+minor expressions (e.g., "a dollar and 23 cents").
 */

import { getCurrencyByCode } from "../currencyData";
import { getNameToCodeMap } from "../currencyMapBuilder";
import { ValueOverflowError } from "../errors";
import {
  parseWordedNumber,
  parseFractionalWordedNumber,
} from "./wordedNumbers";

interface ContextualParseResult {
  value: number;
  currency: string;
  raw: string;
}

const ARTICLES = new Set(["a", "an", "the"]);

// Minor unit aliases (by token)
const MINOR_UNIT_ALIASES: Record<
  string,
  { currency: string | null; scale: number }
> = {
  cent: { currency: null, scale: 100 }, // allow any currency with 2 digits
  cents: { currency: null, scale: 100 },
  penny: { currency: "GBP", scale: 100 },
  pennies: { currency: "GBP", scale: 100 },
  pence: { currency: "GBP", scale: 100 },
};

function normalize(input: string): string {
  return input.toLowerCase().trim().replace(/\s+/g, " ");
}

function parseAmountTokens(tokens: string[]): number {
  if (tokens.length === 0) {
    throw new Error("Invalid quantity");
  }

  const stripped = [...tokens];
  while (stripped.length > 0 && ARTICLES.has(stripped[0])) stripped.shift();

  if (stripped.length === 0) {
    return 1;
  }

  const candidate = stripped.join(" ");
  if (/^\d+(?:\.\d+)?$/.test(candidate)) {
    return parseFloat(candidate);
  }

  // Handle hybrid pattern: digit followed by magnitude words (e.g., "2 million", "5 thousand")
  if (stripped.length > 1 && /^\d+(?:\.\d+)?$/.test(stripped[0])) {
    const numericPart = parseFloat(stripped[0]);
    const wordedPart = stripped.slice(1).join(" ");
    try {
      const magnitudeValue = parseWordedNumber(wordedPart);
      return numericPart * magnitudeValue;
    } catch {
      // If parsing the worded part fails, fall back to parsing the whole thing
      // This allows other patterns to be tried
    }
  }

  // Try parsing as fractional magnitude first (e.g., "quarter million", "half of a billion")
  try {
    return parseFractionalWordedNumber(candidate);
  } catch {
    // If fractional parsing fails, fall back to regular worded number parsing
  }

  return parseWordedNumber(candidate);
}

function lookupCurrency(token: string): string | null {
  if (token.length === 3 && /^[a-z]{3}$/i.test(token)) {
    const byCode = getCurrencyByCode(token.toUpperCase());
    if (byCode) return byCode.code;
  }
  const nameToCode = getNameToCodeMap();
  return nameToCode[token] ?? null;
}

function minorScaleForCurrency(
  currency: string,
  minorToken: string
): number | null {
  const minor = MINOR_UNIT_ALIASES[minorToken];
  if (!minor) return null;
  if (minor.currency && minor.currency !== currency) return null;

  const currencyInfo = getCurrencyByCode(currency);
  const digits = currencyInfo?.digits ?? 2;
  if (digits === 0) return null;

  return 10 ** digits;
}

/**
 * Gets the minor unit scale (e.g., 100 for cents) for a currency.
 * Returns null if the currency has no minor units (e.g., JPY).
 */
function getMinorUnitScale(currency: string): number | null {
  const currencyInfo = getCurrencyByCode(currency);
  const digits = currencyInfo?.digits ?? 2;
  if (digits === 0) return null;
  return 10 ** digits;
}

/**
 * Attempts to parse tokens as a minor amount (numeric or worded number).
 * Returns null if parsing fails.
 */
function tryParseMinorAmount(tokens: string[]): number | null {
  if (tokens.length === 0) return null;

  const candidate = tokens.join(" ");

  // Numeric: "50", "75"
  if (/^\d+$/.test(candidate)) {
    return parseInt(candidate, 10);
  }

  // Worded number: "fifty", "seventy-five"
  try {
    return parseWordedNumber(candidate);
  } catch {
    return null;
  }
}

/**
 * Parses contextual phrase containing major (and optional minor) units.
 */
export function parseContextualPhrase(input: string): ContextualParseResult {
  if (!input || typeof input !== "string") {
    throw new Error("Input must be a non-empty string");
  }

  const normalized = normalize(input);
  const tokens = normalized.split(" ").filter(Boolean);
  if (tokens.length === 0) {
    throw new Error("Input must be a non-empty string");
  }

  // Find major currency token
  let currencyIndex = -1;
  let currencyCode: string | null = null;
  for (let i = 0; i < tokens.length; i++) {
    const code = lookupCurrency(tokens[i]);
    if (code) {
      currencyIndex = i;
      currencyCode = code;
      break;
    }
  }
  if (currencyIndex === -1 || !currencyCode) {
    throw new Error(`Unrecognized currency in: "${input}"`);
  }

  const majorAmountTokens = tokens.slice(0, currencyIndex);
  const majorAmount = parseAmountTokens(majorAmountTokens);

  // Check for optional minor part
  let value = majorAmount;
  let rawEndIndex = currencyIndex + 1;

  const afterCurrency = tokens.slice(currencyIndex + 1);

  // Check if there's an explicit minor unit (with or without "and")
  // Pattern: "<major> <currency> [and] <minor> <minorUnit>"
  // e.g., "5 pounds and 20 pence", "5 pounds 20 pence", "a dollar and 23 cents"
  const hasAnd = afterCurrency.length > 0 && afterCurrency[0] === "and";
  const afterConnector = hasAnd ? afterCurrency.slice(1) : afterCurrency;
  const minorIndex = afterConnector.findIndex((t) => t in MINOR_UNIT_ALIASES);

  if (minorIndex !== -1) {
    // Found explicit minor unit
    const minorAmountTokens = afterConnector.slice(0, minorIndex);
    const minorToken = afterConnector[minorIndex];
    const minorAmount = parseAmountTokens(minorAmountTokens);

    const scale = minorScaleForCurrency(currencyCode, minorToken);
    if (!scale) {
      throw new Error(`Minor unit not supported for currency in: "${input}"`);
    }

    // Validate that the minor amount is valid (less than the scale)
    if (minorAmount >= scale) {
      throw new Error(
        `Invalid minor unit amount (${minorAmount} >= ${scale}) in: "${input}"`
      );
    }

    value = majorAmount + minorAmount / scale;
    rawEndIndex = currencyIndex + 1 + (hasAnd ? 1 : 0) + minorIndex + 1;
  } else if (afterCurrency.length > 0 && !hasAnd) {
    // Colloquial pattern: "<major> <currency> <number>"
    // e.g., "a dollar fifty" (= $1.50), "two pounds twenty" (= £2.20)
    // The trailing number is implicitly cents/pence

    const scale = getMinorUnitScale(currencyCode);
    if (scale) {
      // Try to parse trailing tokens as a minor amount
      // We need to be careful to only consume valid number tokens
      const minorAmount = tryParseMinorAmount(afterCurrency);
      if (minorAmount !== null && minorAmount < scale) {
        // Valid minor amount (must be less than 100 for cents, etc.)
        value = majorAmount + minorAmount / scale;
        rawEndIndex = tokens.length;
      }
    }
  }

  if (value > Number.MAX_SAFE_INTEGER) {
    throw new ValueOverflowError(
      `Number ${value} exceeds maximum safe integer (${Number.MAX_SAFE_INTEGER})`
    );
  }

  return {
    value,
    currency: currencyCode,
    raw: tokens.slice(0, rawEndIndex).join(" "),
  };
}

/**
 * Attempts to match and parse a contextual phrase from text.
 * Returns null if not found.
 */
export function matchContextualPhrase(
  input: string
): ContextualParseResult | null {
  if (!input || typeof input !== "string") return null;

  const normalized = normalize(input);
  const currencyPattern = (() => {
    const keys = Array.from(new Set(Object.keys(getNameToCodeMap())));
    return `(?:${keys.join("|")}|[a-z]{3})`;
  })();
  const minorPattern = (() => {
    const keys = Array.from(new Set(Object.keys(MINOR_UNIT_ALIASES)));
    return `(?:${keys.join("|")})`;
  })();

  // Number words for matching amounts (major and minor)
  const numberWords =
    "zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|million|billion|trillion";

  // Fraction words for matching fractional amounts with magnitudes
  const fractionWords = "half|halves|quarter|quarters|third|thirds";

  // Pattern to match worded numbers (one or more number words with spaces/hyphens)
  const wordedNumberPattern = `(?:${numberWords})(?:[\\s-]+(?:and\\s+)?(?:${numberWords}))*`;

  // Pattern to match digit followed by magnitude words (e.g., "2 million", "5 thousand")
  const digitMagnitudePattern = `\\d+(?:\\.\\d+)?\\s+(?:hundred|thousand|million|billion|trillion)(?:\\s+(?:${numberWords}))*`;

  // Pattern to match fractional magnitudes (e.g., "quarter million", "half of a billion")
  const fractionalMagnitudePattern = `(?:(?:${numberWords})\\s+)?(?:${fractionWords})(?:\\s+(?:of\\s+)?(?:a\\s+)?(?:hundred|thousand|million|billion|trillion))?`;

  // The amount pattern allows:
  // 1. Digit + magnitude words: "2 million", "5 thousand"
  // 2. Fractional magnitudes: "quarter million", "half of a billion"
  // 3. Worded numbers: "three thousand", "one hundred fifty"
  // 4. Digits: "100", "3.50"
  // 5. Optional (when preceded by article): "a dollar" means 1 dollar
  const amountPattern = `(?:${digitMagnitudePattern}|${fractionalMagnitudePattern}|${wordedNumberPattern}|\\d+(?:\\.\\d+)?)?`;

  const pattern = new RegExp(
    `\\b(((?:a|an|the)\\s+${amountPattern}\\s*${currencyPattern}|(?:${digitMagnitudePattern}|${fractionalMagnitudePattern}|${wordedNumberPattern}|\\d+(?:\\.\\d+)?)\\s+${currencyPattern})(?:\\s+(?:and\\s+)?(?:${wordedNumberPattern}|\\d+(?:\\.\\d+)?)\\s+${minorPattern}|\\s+(?:${numberWords})(?:[\\s-](?:${numberWords}))*)?)\\b`,
    "gi"
  );

  // Try all matches until we find one that parses successfully
  const matches = normalized.matchAll(pattern);
  for (const match of matches) {
    try {
      return parseContextualPhrase(match[1]);
    } catch {
      // Continue to next match
      continue;
    }
  }

  return null;
}

export type { ContextualParseResult };
