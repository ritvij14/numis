/**
 * Minor Units Only Pattern Parser
 * =================================
 * Handles standalone minor unit expressions like "75 cents", "50 pence", "99 pennies".
 * These patterns represent fractional currency amounts without an explicit major unit.
 *
 * Examples:
 * - "75 cents" -> 0.75 USD
 * - "50 pence" -> 0.50 GBP
 * - "99 pennies" -> 0.99 GBP
 * - "fifty cents" -> 0.50 USD
 */

import { getCurrencyByCode } from "../currencyData";
import { ValueOverflowError } from "../errors";
import { parseWordedNumber } from "./wordedNumbers";

export interface MinorUnitParseResult {
  value: number;
  currency: string;
  raw: string;
}

interface MinorUnitInfo {
  defaultCurrency: string;
}

/**
 * Map of minor unit tokens to their default currencies.
 * "cents" defaults to USD (most common usage), "pence/penny/pennies" to GBP.
 */
const MINOR_UNIT_MAP: Record<string, MinorUnitInfo> = {
  cent: { defaultCurrency: "USD" },
  cents: { defaultCurrency: "USD" },
  penny: { defaultCurrency: "GBP" },
  pennies: { defaultCurrency: "GBP" },
  pence: { defaultCurrency: "GBP" },
};

function normalizeInput(input: string): string {
  return input.toLowerCase().trim().replace(/\s+/g, " ");
}

/**
 * Parses the numeric or worded amount from tokens.
 * Returns null if parsing fails.
 */
function parseAmount(tokens: string[]): number | null {
  if (tokens.length === 0) return null;

  const candidate = tokens.join(" ").trim();
  if (!candidate) return null;

  // Numeric amount: "75", "50"
  if (/^\d+(?:\.\d+)?$/.test(candidate)) {
    return parseFloat(candidate);
  }

  // Worded number amount: "fifty", "seventy-five"
  try {
    return parseWordedNumber(candidate);
  } catch {
    return null;
  }
}

/**
 * Gets the scale factor for converting minor units to major units.
 * For example, USD has 2 decimal places, so scale is 100 (100 cents = 1 dollar).
 * Returns null if the currency doesn't support minor units.
 */
function getMinorUnitScale(currency: string): number | null {
  const currencyInfo = getCurrencyByCode(currency);
  if (!currencyInfo) return null;

  const digits = currencyInfo.digits ?? 2;
  if (digits === 0) return null; // Currency has no minor units (e.g., JPY)

  return 10 ** digits;
}

/**
 * Parses a standalone minor unit expression like "75 cents" or "50 pence".
 *
 * @param input - The text to parse (e.g., "75 cents")
 * @param defaultCurrency - Optional currency override. If not provided, infers from minor unit token.
 * @returns Parsed result with decimal value and currency code
 * @throws Error if input is invalid, amount is missing, or currency doesn't support minor units
 *
 * @example
 * parseMinorUnitOnly("75 cents")
 * // => { value: 0.75, currency: "USD", raw: "75 cents" }
 *
 * @example
 * parseMinorUnitOnly("50 pence")
 * // => { value: 0.50, currency: "GBP", raw: "50 pence" }
 *
 * @example
 * parseMinorUnitOnly("75 cents", "CAD")
 * // => { value: 0.75, currency: "CAD", raw: "75 cents" }
 */
export function parseMinorUnitOnly(
  input: string,
  defaultCurrency?: string
): MinorUnitParseResult {
  if (!input || typeof input !== "string") {
    throw new Error("Input must be a non-empty string");
  }

  const normalized = normalizeInput(input);
  const tokens = normalized.split(" ").filter((t) => t.length > 0);

  // Find the minor unit token
  const minorUnitIndex = tokens.findIndex((t) => t in MINOR_UNIT_MAP);
  if (minorUnitIndex === -1) {
    throw new Error(`Unrecognized minor unit in: "${input}"`);
  }

  const minorUnitToken = tokens[minorUnitIndex];
  const minorUnitInfo = MINOR_UNIT_MAP[minorUnitToken];

  // Determine currency: use provided default, or infer from minor unit token
  const currency = defaultCurrency ?? minorUnitInfo.defaultCurrency;

  // Validate that the currency supports minor units
  const scale = getMinorUnitScale(currency);
  if (!scale) {
    throw new Error(
      `Currency "${currency}" does not support minor units (e.g., JPY has 0 decimal places)`
    );
  }

  // Parse amount tokens (everything before the minor unit token)
  const amountTokens = tokens.slice(0, minorUnitIndex);
  const amount = parseAmount(amountTokens);

  if (amount === null || Number.isNaN(amount)) {
    throw new Error(`Invalid or missing amount in: "${input}"`);
  }

  // Validate that the amount is less than the scale (e.g., 75 cents is valid, 100 cents is not)
  if (amount >= scale) {
    throw new Error(
      `Invalid minor unit amount: ${amount} ${minorUnitToken} >= ${scale} (should be less than ${scale})`
    );
  }

  // Convert minor units to decimal (e.g., 75 cents / 100 = 0.75)
  const value = amount / scale;

  if (value > Number.MAX_SAFE_INTEGER) {
    throw new ValueOverflowError(
      `Number ${value} exceeds maximum safe integer (${Number.MAX_SAFE_INTEGER})`
    );
  }

  return {
    value,
    currency,
    raw: tokens.slice(0, minorUnitIndex + 1).join(" "),
  };
}

/**
 * Builds a regex pattern to match minor-unit-only expressions.
 * Matches patterns like: <number> <minor-unit>
 */
function buildMinorUnitRegex(): RegExp {
  const minorUnitTokens = Object.keys(MINOR_UNIT_MAP).join("|");

  // Amount tokens: numeric or common worded numbers
  const amountTokens = [
    "\\d+(?:\\.\\d+)?",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "ten",
    "eleven",
    "twelve",
    "thirteen",
    "fourteen",
    "fifteen",
    "sixteen",
    "seventeen",
    "eighteen",
    "nineteen",
    "twenty",
    "thirty",
    "forty",
    "fifty",
    "sixty",
    "seventy",
    "eighty",
    "ninety",
  ].join("|");

  // Pattern: <amount> <minor-unit>
  // Example: "75 cents", "fifty pence"
  // Use negative lookbehind to avoid matching "a dollar and 75 cents"
  const pattern = `(?:${amountTokens})(?:[\\s-]+(?:${amountTokens}))*\\s+(?:${minorUnitTokens})`;

  return new RegExp(`\\b(${pattern})\\b`, "gi");
}

const MINOR_UNIT_REGEX = buildMinorUnitRegex();

/**
 * Attempts to match and parse a minor-unit-only expression from text.
 * Returns null if not found or if parsing fails.
 *
 * @param input - Text that may contain a minor unit expression
 * @param defaultCurrency - Optional currency override
 * @returns Parsed result or null if no match
 *
 * @example
 * matchMinorUnitOnly("I found 75 cents on the ground")
 * // => { value: 0.75, currency: "USD", raw: "75 cents" }
 *
 * @example
 * matchMinorUnitOnly("hello world")
 * // => null
 */
export function matchMinorUnitOnly(
  input: string,
  defaultCurrency?: string
): MinorUnitParseResult | null {
  if (!input || typeof input !== "string") {
    return null;
  }

  const normalized = normalizeInput(input);

  // Check for patterns that should NOT match (handled by contextualPhrases)
  // e.g., "a dollar and 75 cents", "5 euros 50 cents"
  // These contain a major currency unit before the minor unit (with numbers/articles)
  // Pattern: <optional article/number> <major currency> <optional "and"> <number> <minor unit>
  const compoundPattern = /\b(?:a|an|the|\d+(?:\.\d+)?|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|million|billion)\s+(?:dollar|dollars|euro|euros|pound|pounds|yen|yuan|peso|pesos|rupee|rupees|franc|francs|krona|kronor|shekel|shekels|dinar|dinars|dirham|dirhams|[A-Z]{3})\s+(?:and\s+)?(?:\d+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)\s+(?:cent|cents|penny|pennies|pence)\b/i;
  if (compoundPattern.test(normalized)) {
    return null;
  }

  MINOR_UNIT_REGEX.lastIndex = 0;
  const match = MINOR_UNIT_REGEX.exec(normalized);
  if (!match) {
    return null;
  }

  try {
    return parseMinorUnitOnly(match[1], defaultCurrency);
  } catch {
    return null;
  }
}
