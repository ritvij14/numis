/**
 * Slang Terms Pattern Parser
 * ===========================
 * Handles monetary slang terms (e.g., 'buck', 'quid', 'fiver', 'tenner').
 * Maps slang terms to currency codes and unit values, supporting optional numeric/worded quantities.
 */

import { ValueOverflowError } from "../errors";
import { parseWordedNumber, parseFractionalWordedNumber } from "./wordedNumbers";

interface SlangUnit {
  currency: string;
  unit: number;
}

const SLANG_MAP: Record<string, SlangUnit> = {
  buck: { currency: "USD", unit: 1 },
  bucks: { currency: "USD", unit: 1 },
  quid: { currency: "GBP", unit: 1 },
  quids: { currency: "GBP", unit: 1 },
  fiver: { currency: "GBP", unit: 5 },
  fivers: { currency: "GBP", unit: 5 },
  tenner: { currency: "GBP", unit: 10 },
  tenners: { currency: "GBP", unit: 10 },
  grand: { currency: "USD", unit: 1000 },
  grands: { currency: "USD", unit: 1000 },
};

// Cents word map for "buck fifty" style expressions
const CENTS_WORD_MAP: Record<string, number> = {
  ten: 0.10,
  twenty: 0.20,
  thirty: 0.30,
  forty: 0.40,
  fifty: 0.50,
  sixty: 0.60,
  seventy: 0.70,
  eighty: 0.80,
  ninety: 0.90,
};

export interface SlangParseResult {
  value: number;
  currency: string;
  raw: string;
}

function normalizeInput(input: string): string {
  return input.toLowerCase().trim().replace(/\s+/g, " ");
}

function parseQuantity(tokens: string[]): number | null {
  if (tokens.length === 0) return 1;
  const candidate = tokens.join(" ").trim();
  if (!candidate) return 1;

  // Article implies 1
  if (candidate === "a" || candidate === "an") {
    return 1;
  }

  // "half" or "half a" implies 0.5
  if (candidate === "half" || candidate === "half a") {
    return 0.5;
  }

  // Numeric quantity
  if (/^\d+(?:\.\d+)?$/.test(candidate)) {
    return parseFloat(candidate);
  }

  // Worded number quantity (try fractional first, then regular)
  try {
    return parseFractionalWordedNumber(candidate);
  } catch {
    try {
      return parseWordedNumber(candidate);
    } catch {
      return null;
    }
  }
}

/**
 * Parses a slang monetary expression and returns amount and currency.
 * Examples:
 * - "buck" -> 1 USD
 * - "two bucks" -> 2 USD
 * - "5 quid" -> 5 GBP
 * - "fiver" -> 5 GBP
 * - "three fivers" -> 15 GBP
 * - "a grand" -> 1000 USD
 * - "a buck fifty" -> 1.50 USD
 */
export function parseSlangTerm(input: string): SlangParseResult {
  if (!input || typeof input !== "string") {
    throw new Error("Input must be a non-empty string");
  }

  const normalized = normalizeInput(input);
  const tokens = normalized.split(" ").filter((t) => t.length > 0);

  const slangIndex = tokens.findIndex((t) => t in SLANG_MAP);
  if (slangIndex === -1) {
    throw new Error(`Unrecognized slang term in: "${input}"`);
  }

  const slangToken = tokens[slangIndex];
  const { currency, unit } = SLANG_MAP[slangToken];

  // Consider up to 6 tokens immediately before slang token as quantity
  // (e.g., "two thirds of a million bucks" = 5 tokens before "bucks")
  const quantityTokens = tokens.slice(Math.max(0, slangIndex - 6), slangIndex);
  const quantity = parseQuantity(quantityTokens);

  if (quantity === null || Number.isNaN(quantity)) {
    throw new Error(`Invalid quantity for slang term: "${input}"`);
  }

  let value = quantity * unit;

  // Check for cents suffix (e.g., "buck fifty" -> 1.50)
  // Only applies to buck/bucks with unit=1
  if ((slangToken === "buck" || slangToken === "bucks") && unit === 1) {
    const centsToken = tokens[slangIndex + 1];
    if (centsToken && centsToken in CENTS_WORD_MAP) {
      value += CENTS_WORD_MAP[centsToken];
    }
  }

  if (value > Number.MAX_SAFE_INTEGER) {
    throw new ValueOverflowError(
      `Number ${value} exceeds maximum safe integer (${Number.MAX_SAFE_INTEGER})`
    );
  }

  // Include cents token in raw if present
  const endIndex =
    (slangToken === "buck" || slangToken === "bucks") &&
    tokens[slangIndex + 1] &&
    tokens[slangIndex + 1] in CENTS_WORD_MAP
      ? slangIndex + 2
      : slangIndex + 1;

  return {
    value,
    currency,
    raw: tokens.slice(Math.max(0, slangIndex - 6), endIndex).join(" "),
  };
}

function buildSlangRegex(): RegExp {
  const slangTokens = Object.keys(SLANG_MAP).join("|");
  const centsTokens = Object.keys(CENTS_WORD_MAP).join("|");

  // Quantity tokens: numeric or limited worded numbers / articles
  const quantityTokens = [
    "\\d+(?:\\.\\d+)?",
    "a",
    "an",
    "half",
    "halves",
    "quarter",
    "quarters",
    "third",
    "thirds",
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
    "hundred",
    "thousand",
    "million",
    "billion",
    "trillion",
    "of",
  ].join("|");

  // Up to 6 quantity tokens immediately before the slang term, optionally followed by cents word
  // (e.g., "two thirds of a million bucks" = 5 tokens before "bucks")
  const pattern = `(?:(?:${quantityTokens})\\s+){0,6}(?:${slangTokens})(?:\\s+(?:${centsTokens}))?`;
  return new RegExp(`\\b(${pattern})\\b`, "gi");
}

const SLANG_REGEX = buildSlangRegex();

/**
 * Attempts to match and parse a slang monetary expression from text.
 * Returns null if not found.
 */
export function matchSlangTerm(input: string): SlangParseResult | null {
  if (!input || typeof input !== "string") {
    return null;
  }

  SLANG_REGEX.lastIndex = 0;
  const match = SLANG_REGEX.exec(input);
  if (!match) {
    return null;
  }

  try {
    return parseSlangTerm(match[1]);
  } catch {
    return null;
  }
}
