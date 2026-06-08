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
 * Maximum tokens to look before/after a currency token when scanning text.
 */
const WINDOW_SIZE = 30;

/**
 * Attempts to match and parse a contextual phrase from text.
 * Uses a linear token-scan approach — no dynamic regex.
 * Returns null if not found.
 */
export function matchContextualPhrase(
  input: string
): ContextualParseResult | null {
  if (!input || typeof input !== "string") return null;

  const normalized = normalize(input);
  const tokens = normalized.split(" ").filter(Boolean);
  if (tokens.length === 0) return null;

  // 1. Find every currency token position
  const currencyPositions: { index: number; code: string }[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const code = lookupCurrency(tokens[i]);
    if (code) {
      currencyPositions.push({ index: i, code });
    }
  }

  // 2. Try each currency position, sliding start forward until parse succeeds
  //    This handles leading garbage like "I paid a dollar..."
  for (const { index } of currencyPositions) {
    const earliest = Math.max(0, index - WINDOW_SIZE);
    const furthest = Math.min(tokens.length, index + WINDOW_SIZE + 1);

    for (let start = earliest; start <= index; start++) {
      const windowTokens = tokens.slice(start, furthest);
      const windowText = windowTokens.join(" ");

      try {
        const result = parseContextualPhrase(windowText);
        const rawLen = result.raw.split(" ").length;
        return {
          ...result,
          raw: tokens.slice(start, start + rawLen).join(" "),
        };
      } catch {
        // Try shifting start one token later (narrowing prefix)
        continue;
      }
    }
  }

  // 3. Digit+magnitude without currency (e.g., "10 million", "5 thousand")
  //    These have no currency token, so we scan for digit+magnitude patterns
  const magnitudeValues: Record<string, number> = {
    hundred: 100,
    thousand: 1000,
    million: 1000000,
    billion: 1000000000,
    trillion: 1000000000000,
  };

  for (let i = 0; i < tokens.length - 1; i++) {
    const numMatch = /^\d+(?:\.\d+)?$/.test(tokens[i]);
    const mag = tokens[i + 1];
    if (numMatch && magnitudeValues[mag]) {
      const value = parseFloat(tokens[i]) * magnitudeValues[mag];
      // Capture any trailing words as part of the raw match (up to WINDOW_SIZE)
      const end = Math.min(tokens.length, i + WINDOW_SIZE);
      const raw = tokens.slice(i, end).join(" ");
      return { value, currency: "", raw };
    }
  }

  return null;
}

export type { ContextualParseResult };
