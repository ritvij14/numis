/**
 * Ranges Pattern Parser
 * =====================
 * Handles monetary range expressions (e.g., '$10 - $20', '5 to 10 EUR').
 *
 * Pattern Examples:
 * - "10 - 20"
 * - "$5–$10"
 * - "100 to 200"
 * - "50 through 100 USD"
 */

import { MoneyParseError } from "../errors";
import type { RangeParseResult } from "../types";
import { matchAbbreviation } from "./abbreviations";
import { matchContextualPhrase } from "./contextualPhrases";
import { matchNumberWithSeparators } from "./numbersWithSeparators";
import { matchNumericWordCombo } from "./numericWordCombos";
import { matchPlainNumber } from "./plainNumbers";
import { matchRegionalFormat } from "./regionalFormats";
import { matchSlangTerm } from "./slangTerms";
import { matchSymbol } from "./symbols";
import {
  matchFractionalWordedNumber,
  matchWordedNumber,
} from "./wordedNumbers";

/**
 * Result of parsing a single monetary value.
 */
export interface SingleValueParseResult {
  /** The parsed numeric value */
  value: number;
  /** The ISO 4217 currency code, if detected */
  currency?: string;
}

/**
 * Regular expression matching common range separators.
 * Matches: hyphen (-), en-dash (–), em-dash (—), "to", and "through".
 * Case-insensitive.
 *
 * ReDoS-safety note: previously used \s* which backtracks on very long
 * whitespace-only inputs. Replaced with non-backtracking split logic.
 * The regex itself is only used for detection; actual splitting is done
 * with trim() + a fixed-character class.
 */
export const rangeSeparatorRegex: RegExp = /(?:-|–|—|to|through)/i;

/**
 * Regular expression matching comparison operators (< or >) with optional whitespace.
 * Matches: < 30, > 1000, <30k, > 2 million
 */
export const comparisonOperatorRegex: RegExp = /^<|>\s*/i;

/**
 * Normalizes the input string by trimming whitespace and converting to lowercase.
 *
 * @param input - The string to normalize
 * @returns The normalized string
 */
export function normalizeInput(input: string): string {
  return input.trim().toLowerCase();
}

/**
 * Detects if the input contains a comparison operator pattern (< or >).
 *
 * @param input - The string to check
 * @returns 'less' for < pattern, 'greater' for > pattern, or null if no match
 */
export function detectComparisonOperator(input: string): "less" | "greater" | null {
  const normalized = normalizeInput(input);
  if (/^</.test(normalized)) {
    return "less";
  }
  if (/^>/.test(normalized)) {
    return "greater";
  }
  return null;
}

/**
 * Finds and parses a comparison operator expression (< or >).
 * Examples: "< 30k", "> 2 million", "< 1,000 USD"
 *
 * @param input - The string to check for a comparison
 * @returns A RangeParseResult if valid comparison found, null otherwise
 */
export function matchComparisonOperator(
  input: string
): RangeParseResult | null {
  const normalized = normalizeInput(input);

  // Check if input starts with comparison operator
  const operatorMatch = normalized.match(/^(<|>)(\s*)(.+)/);
  if (!operatorMatch) {
    return null;
  }

  const operator = operatorMatch[1];
  const valuePart = operatorMatch[3].trim();

  if (!valuePart) {
    return null;
  }

  // Parse the value part using parseSingleValue
  const parsed = parseSingleValue(valuePart);

  if (!parsed) {
    return null;
  }

  // Build the result based on operator type
  // < value = min: null, max: value (treating as <=)
  // > value = min: value, max: null (treating as >=)
  if (operator === "<") {
    return {
      min: null,
      max: parsed.value,
      currency: parsed.currency ?? null,
      raw: input,
    };
  } else {
    // operator === ">"
    return {
      min: parsed.value,
      max: null,
      currency: parsed.currency ?? null,
      raw: input,
    };
  }
}

/**
 * Parses a comparison operator expression (< or >).
 * This is an alias for matchComparisonOperator for API consistency.
 *
 * @param input - The comparison string to parse (e.g., '< 30k', '> 2 million')
 * @returns A RangeParseResult object with min/max/currency, or null if invalid
 */
export function parseComparisonOperator(
  input: string
): RangeParseResult | null {
  return matchComparisonOperator(input);
}

/**
 * Validates that a range has valid min/max values.
 *
 * @param min - The minimum value (or null if not set)
 * @param max - The maximum value (or null if not set)
 * @throws MoneyParseError if both values are numbers and min >= max
 */
export function validateRange(min: number | null, max: number | null): void {
  // Only validate if both min and max are numbers
  if (min !== null && max !== null) {
    if (min >= max) {
      throw new MoneyParseError(
        `Invalid range: min (${min}) must be less than max (${max})`
      );
    }
  }
}

/**
 * Finds and parses a monetary range from a string.
 *
 * @param input - The string to check for a range
 * @returns A RangeParseResult if a valid range is found, null otherwise
 */
export function matchRange(input: string): RangeParseResult | null {
  const normalized = normalizeInput(input);

  // Check if input contains a range separator using regex directly
  // (avoiding circular dependency with parseRange which calls matchRange)
  if (!rangeSeparatorRegex.test(normalized)) {
    return null;
  }

  // Split by separator to validate we have exactly 2 parts
  const parts = normalized.split(rangeSeparatorRegex).map((p) => p.trim());
  const nonEmptyParts = parts.filter((part) => part && part.trim().length > 0);

  if (nonEmptyParts.length !== 2) {
    return null;
  }

  // Attempt to parse the range by calling parseSingleValue on each part
  // We implement the parsing inline to avoid circular dependency
  const firstValue = parseSingleValue(parts[0]);
  const secondValue = parseSingleValue(parts[1], firstValue?.currency);

  if (!firstValue && !secondValue) {
    return null;
  }

  // Determine min/max values
  let minValue: number | null = firstValue?.value ?? null;
  let maxValue: number | null = secondValue?.value ?? null;

  // Handle cases where only one value parsed but other is a plain number
  // BUT don't fallback to plain number if the part contains magnitude words or currency context
  if (!firstValue && maxValue !== null) {
    const hasMagnitudeOrCurrency =
      /(\b(hundred|thousand|million|billion|trillion|k|m|b)\b|dollars?|euros?|pounds?|dirhams?|rupees?|francs?|yen|yuan|usd|eur|gbp|chf|inr|cny|jpy|krw)/i.test(
        parts[0]
      );
    if (!hasMagnitudeOrCurrency) {
      const plainNum = matchPlainNumber(parts[0]);
      if (plainNum !== null) {
        minValue = plainNum;
      }
    }
  }
  if (!secondValue && minValue !== null) {
    const hasMagnitudeOrCurrency =
      /(\b(hundred|thousand|million|billion|trillion|k|m|b)\b|dollars?|euros?|pounds?|dirhams?|rupees?|francs?|yen|yuan|usd|eur|gbp|chf|inr|cny|jpy|krw)/i.test(
        parts[1]
      );
    if (!hasMagnitudeOrCurrency) {
      const plainNum = matchPlainNumber(parts[1]);
      if (plainNum !== null) {
        maxValue = plainNum;
      }
    }
  }

  if (minValue === null || maxValue === null) {
    return null;
  }

  // Validate the range
  try {
    validateRange(minValue, maxValue);
  } catch (error) {
    // Return null for invalid ranges rather than throwing
    if (error instanceof MoneyParseError) {
      return null;
    }
    throw error;
  }

  // Ensure min is the smaller value
  const finalMin = Math.min(minValue, maxValue);
  const finalMax = Math.max(minValue, maxValue);

  // Determine currency
  const currency: string | null =
    firstValue?.currency ?? secondValue?.currency ?? null;

  return {
    min: finalMin,
    max: finalMax,
    currency,
    raw: input,
  };
}

/**
 * Parses a monetary range expression.
 *
 * @param input - The range string to parse (e.g., '$10 - $20', '$500 to $1000')
 * @returns A RangeParseResult object with min/max/currency, or null if invalid
 */
export function parseRange(input: string): RangeParseResult | null {
  const normalized = normalizeInput(input);

  // Check for range separator using regex directly (avoiding matchRange which has different behavior now)
  if (!rangeSeparatorRegex.test(normalized)) {
    return null;
  }

  // Split the input by range separators
  const parts = normalized.split(rangeSeparatorRegex).map((p) => p.trim());

  // Invalid: more than 2 values in range (e.g., "invalid - range" has 3 parts: ["invalid", "", "range"])
  // or less than 2 values (shouldn't happen after matchRange check, but safety check)
  const nonEmptyParts = parts.filter((part) => part && part.trim().length > 0);
  if (nonEmptyParts.length !== 2) {
    return null;
  }

  // Parse the first value
  const firstValue = parseSingleValue(parts[0]);

  // If first value is invalid, try to detect currency from it and apply to second part
  // This handles cases like "100 - 200 USD" where currency comes after
  let firstCurrency: string | undefined;
  if (firstValue) {
    firstCurrency = firstValue.currency;
  } else {
    // Try to detect currency from the first part even if parsing failed as a value
    // e.g., "USD 100 - 200" where USD is at the start
    const detected = detectCurrencyFromPrefix(parts[0]);
    firstCurrency = detected ?? undefined;
  }

  // Parse the second value, applying the first value's currency as default if needed
  const secondValue = parseSingleValue(parts[1], firstCurrency);

  // If we couldn't parse either value, return null
  if (!firstValue && !secondValue) {
    return null;
  }

  // Determine the final values and currency
  let minValue: number | null = null;
  let maxValue: number | null = null;
  let currency: string | null = null;

  if (firstValue && secondValue) {
    // Both values parsed successfully
    minValue = firstValue.value;
    maxValue = secondValue.value;

    // If first value has no magnitude but second does, apply magnitude to first
    // This handles "1-3 Million dirhams" -> min should be 10000000, not 1
    // But NOT "5k to 10k" where both sides have magnitude
    // Check for magnitude anywhere (not just at start) to handle "from 5k" correctly
    const firstHasMagnitude =
      /\b(\d+(?:\.\d+)?)\s*(k|thousand|m|mn|million|b|bn|billion)\b/i.test(
        parts[0]
      );
    const secondHasMagnitude =
      /\b(\d+(?:\.\d+)?)\s*(k|thousand|m|mn|million|b|bn|billion)\b/i.test(
        parts[1]
      );
    if (!firstHasMagnitude && secondHasMagnitude && secondValue.value >= 1000) {
      // Second value has magnitude, apply to first
      // Extract the numeric part from parts[1] (e.g., "3 million dirhams" -> 3)
      const numMatch = parts[1].match(/^(\d+(?:\.\d+)?)/);
      if (numMatch) {
        const firstNum = parseFloat(numMatch[1]);
        const magnitude = secondValue.value / firstNum;
        if (magnitude > 1) {
          minValue = firstValue.value * magnitude;
        }
      }
    }

    // Handle conflicting currencies - use first currency
    if (
      firstValue.currency &&
      secondValue.currency &&
      firstValue.currency !== secondValue.currency
    ) {
      currency = firstValue.currency;
    } else {
      currency = firstValue.currency || secondValue.currency || null;
    }
  } else if (firstValue) {
    // Only first value parsed - this could be "100 - 200" with implicit currency
    // Try to extract the number from the second part using plain number parser
    const secondNumber = matchPlainNumber(parts[1]);
    if (secondNumber !== null) {
      minValue = firstValue.value;
      maxValue = secondNumber;
      currency = firstValue.currency || null;
    } else {
      // Could also be "100 USD - 200" or "100 - 200 USD"
      // Try detecting currency from second part
      const secondCurrency = detectCurrencyFromSuffix(parts[1]);
      if (secondCurrency) {
        minValue = firstValue.value;
        maxValue = firstValue.value; // Use first value as both min and max as fallback
        currency = firstCurrency || secondCurrency;
      } else {
        return null;
      }
    }
  } else if (secondValue) {
    // Only second value parsed - could be "100 - 200 EUR"
    // Try to extract the number from the first part
    const firstNumber = matchPlainNumber(parts[0]);
    if (firstNumber !== null) {
      minValue = firstNumber;
      maxValue = secondValue.value;
      currency = secondValue.currency || null;
    } else {
      return null;
    }
  }

  // Validate that we have both min and max
  if (minValue === null || maxValue === null) {
    return null;
  }

  // Validate the range before normalization
  validateRange(minValue, maxValue);

  // Ensure min is the smaller value (handles reversed ranges like "100 - 50")
  const finalMin = Math.min(minValue, maxValue);
  const finalMax = Math.max(minValue, maxValue);

  return {
    min: finalMin,
    max: finalMax,
    currency,
    raw: input,
  };
}

/**
 * Detects currency from a prefix position (e.g., "USD 100" -> "USD")
 */
function detectCurrencyFromPrefix(input: string): string | null {
  const normalized = input.trim().toLowerCase();

  // Check for currency code at start (e.g., "USD 100", "EUR 50")
  const currencyCodeMatch = normalized.match(/^([a-z]{3})\s+/);
  if (currencyCodeMatch) {
    const code = currencyCodeMatch[1].toUpperCase();
    // Validate it's a known currency
    if (isValidCurrencyCode(code)) {
      return code;
    }
  }

  // Check for currency symbol at start
  const symbolMatch = normalized.match(/^([^\w\s]+)\s*/);
  if (symbolMatch) {
    const symbol = symbolMatch[1];
    const currencyFromSymbol = getCurrencyFromSymbol(symbol);
    if (currencyFromSymbol) {
      return currencyFromSymbol;
    }
  }

  return null;
}

/**
 * Detects currency from a suffix position (e.g., "100 USD" -> "USD")
 */
function detectCurrencyFromSuffix(input: string): string | null {
  // Use trimEnd (not trim) to eliminate backtracking on very long trailing
  // whitespace, then match a single literal space before the suffix.
  const normalized = input.trimEnd().toLowerCase();

  // Check for currency code at end (e.g., "100 USD", "50 EUR")
  const currencyCodeMatch = normalized.match(/ ([a-z]{3})$/);
  if (currencyCodeMatch) {
    const code = currencyCodeMatch[1].toUpperCase();
    if (isValidCurrencyCode(code)) {
      return code;
    }
  }

  // Check for currency word at end (e.g., "100 dollars", "50 euros")
  const currencyWordMatch = normalized.match(
    / (dollars?|euros?|pounds?|cents?)$/
  );
  if (currencyWordMatch) {
    const word = currencyWordMatch[1].toLowerCase();
    const currencyFromWord: Record<string, string> = {
      dollar: "USD",
      dollars: "USD",
      euro: "EUR",
      euros: "EUR",
      pound: "GBP",
      pounds: "GBP",
      cent: "EUR",
      cents: "EUR",
    };
    if (currencyFromWord[word]) {
      return currencyFromWord[word];
    }
  }

  return null;
}

/**
 * Checks if a currency code is valid (known ISO 4217 code)
 */
function isValidCurrencyCode(code: string): boolean {
  // Import dynamically to avoid circular dependencies
  // For now, check against common currencies
  const knownCurrencies = [
    "USD",
    "EUR",
    "GBP",
    "JPY",
    "CNY",
    "INR",
    "CHF",
    "MXN",
    "KRW",
    "DKK",
    "RUB",
    "TRY",
    "KES",
    "ZAR",
    "NGN",
    "VND",
    "THB",
    "MYR",
    "IRR",
    "KWD",
    "AED",
    "SAR",
    "AUD",
    "CAD",
    "NZD",
    "SEK",
    "NOK",
    "PLN",
    "HKD",
    "SGD",
    "TWD",
    "HUF",
    "CZK",
    "ILS",
    "CLP",
    "PHP",
    "AED",
    "COP",
    "SAR",
    "BRL",
  ];
  return knownCurrencies.includes(code.toUpperCase());
}

/**
 * Gets currency code from a symbol
 */
function getCurrencyFromSymbol(symbol: string): string | null {
  const symbolMap: Record<string, string> = {
    $: "USD",
    "€": "EUR",
    "£": "GBP",
    "¥": "JPY",
    "₹": "INR",
    "₩": "KRW",
    "₽": "RUB",
    "₺": "TRY",
    CHF: "CHF",
    "₣": "CHF",
    "₱": "PHP",
    "₦": "NGN",
    "₴": "UAH",
    "₸": "KZT",
    "₫": "VND",
    "₪": "ILS",
  };
  return symbolMap[symbol] || null;
}

/**
 * Parses a single monetary value from any supported format.
 * Uses existing pattern parsers and returns the first successful match
 * prioritized by specificity.
 *
 * @param input - The string to parse (e.g., '$100', 'USD 50', 'one hundred dollars')
 * @param defaultCurrency - Optional default currency code for ambiguous cases
 * @returns A SingleValueParseResult with value and optional currency, or null if parsing fails
 */
export function parseSingleValue(
  input: string,
  defaultCurrency?: string
): SingleValueParseResult | null {
  const normalized = normalizeInput(input);

  if (!normalized || normalized.length === 0) {
    return null;
  }

  // Priority order: most specific patterns first
  // 1. Numeric word combos (10k, 5m, 2bn) - check BEFORE regional formats
  //    because "k" is also a currency symbol (MMK) and would match in regional formats
  const numericWordResult = matchNumericWordCombo(input);
  if (numericWordResult) {
    return {
      value: numericWordResult.value,
    };
  }

  // 2. Regional formats (European format like "1.234,56 €")
  const regionalResult = matchRegionalFormat(input, defaultCurrency);
  if (regionalResult) {
    return {
      value: regionalResult.amount,
      currency: regionalResult.currencyCode,
    };
  }

  // 4. Fractional worded numbers (half a dollar, quarter million)
  //    Check before contextual phrases to handle "half a dollar" correctly
  const fractionalWordedResult = matchFractionalWordedNumber(input);
  if (fractionalWordedResult) {
    // Check if there's a currency context after the fractional number
    const afterFraction = normalized
      .slice(
        normalized.indexOf(fractionalWordedResult.raw) +
          fractionalWordedResult.raw.length
      )
      .trim();

    // Check for common currency contexts
    const currencyContext = detectCurrencyContext(afterFraction);
    if (currencyContext) {
      return {
        value: fractionalWordedResult.value,
        currency: currencyContext,
      };
    }
    return {
      value: fractionalWordedResult.value,
    };
  }

  // 5. Contextual phrases (currency names like "dollars", "pounds")
  const contextualResult = matchContextualPhrase(input);
  if (contextualResult) {
    // Handle digit+magnitude without currency (e.g., "10 million")
    // contextualResult.currency will be empty string in that case
    const result: SingleValueParseResult = {
      value: contextualResult.value,
    };
    // Only add currency if it's not empty
    if (contextualResult.currency && contextualResult.currency !== "") {
      result.currency = contextualResult.currency;
    }
    return result;
  }

  // 6. Currency symbols ($, €, £)
  const symbolResult = matchSymbol(input, defaultCurrency);
  if (symbolResult) {
    return {
      value: symbolResult.amount,
      currency: symbolResult.currencyCode,
    };
  }

  // 7. Currency abbreviations (USD, EUR, GBP)
  const abbreviationResult = matchAbbreviation(input);
  if (abbreviationResult) {
    return {
      value: abbreviationResult.amount,
      currency: abbreviationResult.currencyCode,
    };
  }

  // 8. Slang terms (buck, quid, fiver)
  const slangResult = matchSlangTerm(input);
  if (slangResult) {
    return {
      value: slangResult.value,
      currency: slangResult.currency,
    };
  }

  // 9. Worded numbers (one hundred, twenty-five)
  const wordedResult = matchWordedNumber(input);
  if (wordedResult) {
    // Check if there's a currency context after the worded number
    const afterWorded = normalized
      .slice(normalized.indexOf(wordedResult.raw) + wordedResult.raw.length)
      .trim();

    const currencyContext = detectCurrencyContext(afterWorded);
    if (currencyContext) {
      return {
        value: wordedResult.value,
        currency: currencyContext,
      };
    }
    return {
      value: wordedResult.value,
    };
  }

  // 10. Numbers with separators (1,000, 1,234.56)
  const separatorsResult = matchNumberWithSeparators(input);
  if (separatorsResult !== null) {
    return {
      value: separatorsResult,
    };
  }

  // 11. Plain numbers (123, 456)
  const plainResult = matchPlainNumber(input);
  if (plainResult !== null) {
    return {
      value: plainResult,
    };
  }

  return null;
}

/**
 * Detects currency context from a string (e.g., "dollars", "pounds", "euros").
 * Returns the ISO 4217 currency code if found, otherwise null.
 */
function detectCurrencyContext(text: string): string | null {
  if (!text) return null;

  // Handle "a <currency>" pattern (e.g., "a dollar", "a pound")
  // by removing the article first

  const currencyWords: Record<string, string> = {
    dollar: "USD",
    dollars: "USD",
    buck: "USD",
    bucks: "USD",
    quid: "GBP",
    quids: "GBP",
    pound: "GBP",
    pounds: "GBP",
    sterling: "GBP",
    euro: "EUR",
    euros: "EUR",
    eur: "EUR",
    cent: "EUR",
    cents: "EUR",
    yen: "JPY",
    yuan: "CNY",
    rupee: "INR",
    rupees: "INR",
    franc: "CHF",
    francs: "CHF",
    peso: "MXN",
    pesos: "MXN",
    won: "KRW",
    krone: "DKK",
    kroner: "DKK",
    mark: "EUR",
    marks: "EUR",
    ruble: "RUB",
    rubles: "RUB",
    lira: "TRY",
    liras: "TRY",
    shilling: "KES",
    shillings: "KES",
    rand: "ZAR",
    rands: "ZAR",
    naira: "NGN",
    nairas: "NGN",
    dong: "VND",
    dongs: "VND",
    baht: "THB",
    bahts: "THB",
    ringgit: "MYR",
    ringgits: "MYR",
    rial: "IRR",
    rials: "IRR",
    dinar: "KWD",
    dinars: "KWD",
    dirham: "AED",
    dirhams: "AED",
    riyal: "SAR",
    riyals: "SAR",
  };

  const tokens = text.toLowerCase().split(/\s+/);
  const firstToken = tokens[0];

  // Remove any trailing punctuation from the token
  const cleanToken = firstToken.replace(/[^a-z]/g, "");

  if (cleanToken && cleanToken in currencyWords) {
    return currencyWords[cleanToken];
  }

  return null;
}
