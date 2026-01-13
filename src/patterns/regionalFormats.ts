/**
 * Regional Formats Pattern Parser
 * ================================
 * Handles monetary patterns with regional number formatting variations.
 *
 * Regional Format Examples:
 * - "1.234,56 €" (European: period for thousands, comma for decimal)
 * - "€ 1.234,56" (European with prefix symbol)
 * - "1,234.56 $" (US/UK: comma for thousands, period for decimal)
 * - "1 234,56 €" (French: space for thousands, comma for decimal)
 * - "1'234.56 CHF" (Swiss: apostrophe for thousands)
 *
 * This parser automatically detects the regional format based on separator patterns
 * and correctly converts the number to its JavaScript numeric representation.
 */

import { ValueOverflowError } from '../errors';
import { getCurrencyByCode } from '../currencyData';
import { CURRENCY_SYMBOL_MAP } from './symbols';

/**
 * Regional format type indicating the separator convention used.
 */
export type RegionalFormatType =
  | 'us'      // 1,234.56 (comma thousands, period decimal)
  | 'eu'      // 1.234,56 (period thousands, comma decimal)
  | 'swiss'   // 1'234.56 (apostrophe thousands, period decimal)
  | 'french'  // 1 234,56 (space thousands, comma decimal)
  | 'indian'  // 1,23,456.78 (Indian numbering system)
  | 'unknown';

/**
 * Result of parsing a regional format pattern.
 */
export interface RegionalFormatParseResult {
  amount: number;
  currencyCode: string;
  symbol: string;
  raw: string;
  formatType: RegionalFormatType;
}

/**
 * Configuration for regional format detection.
 */
interface FormatConfig {
  thousandsSeparator: string;
  decimalSeparator: string;
  type: RegionalFormatType;
}


/**
 * Builds a regex pattern that matches all currency symbols for regional formats.
 * Supports both prefix and suffix positions.
 */
function buildRegionalSymbolRegex(): RegExp {
  const symbols = Object.keys(CURRENCY_SYMBOL_MAP);

  // Sort by length (descending) to match longer symbols first
  const sortedSymbols = symbols.sort((a, b) => b.length - a.length);

  // Escape special regex characters
  const escapedSymbols = sortedSymbols.map(s =>
    s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  );

  // Add word boundaries for single-LETTER symbols to prevent false matches
  // (e.g., prevent matching 'r' in "dollar 100" as ZAR currency symbol)
  // Only apply to alphanumeric single characters, not special symbols like $, €, etc.
  const symbolPattern = escapedSymbols.map((escaped, index) => {
    const original = sortedSymbols[index];
    // Check if original is single alphanumeric character (a-z, A-Z)
    if (original.length === 1 && /[a-zA-Z]/.test(original)) {
      // Prevent matching when part of a larger word (surrounded by letters)
      // Allow digits before/after (e.g., "100R" or "R100" should work)
      return `(?<![a-zA-Z])${escaped}(?![a-zA-Z])`;
    }
    return escaped;
  }).join('|');

  // Number pattern that supports various regional formats:
  // - Digits with optional separators (comma, period, space, apostrophe)
  // - Supports both thousands and decimal separators
  // This intentionally captures a broad range to be analyzed later
  // Order matters: try more specific patterns first
  const numberPattern = [
    // Numbers with separators and optional decimal (e.g., 1,234.56 or 1.234,56 or 1'234.56 or 1 234,56)
    "\\d{1,3}(?:[.,\\'\\s]\\d{2,3})+(?:[.,]\\d{1,2})?",
    // Plain numbers with decimal (e.g., 1234.56)
    "\\d+[.,]\\d+",
    // Plain integers (e.g., 1234)
    "\\d+",
  ].join('|');

  // Match: symbol + optional space + number OR number + optional space + symbol
  return new RegExp(
    `(?:(?<symbolBefore>${symbolPattern})\\s*(?<amountAfterSymbol>${numberPattern}))|(?:(?<amountBeforeSymbol>${numberPattern})\\s*(?<symbolAfter>${symbolPattern}))`,
    'i'
  );
}

// Pre-compile the regex
const REGIONAL_SYMBOL_REGEX = buildRegionalSymbolRegex();

/**
 * Detects the regional format type from a number string.
 *
 * Analysis heuristics:
 * 1. If the string contains both comma and period, the last one is the decimal separator
 * 2. If apostrophe is used, it's Swiss format
 * 3. If non-breaking space is used, it's French format
 * 4. Indian format has specific grouping pattern (xx,xx,xxx)
 *
 * @param numberStr - The number string to analyze
 * @returns The detected format configuration
 */
export function detectRegionalFormat(numberStr: string): FormatConfig {
  const hasComma = numberStr.includes(',');
  const hasPeriod = numberStr.includes('.');
  const hasApostrophe = numberStr.includes("'");
  const hasSpace = /\s/.test(numberStr);

  // Swiss format: uses apostrophe as thousands separator
  if (hasApostrophe) {
    return { thousandsSeparator: "'", decimalSeparator: '.', type: 'swiss' };
  }

  // French format: uses space as thousands separator
  if (hasSpace && hasComma && !hasPeriod) {
    return { thousandsSeparator: ' ', decimalSeparator: ',', type: 'french' };
  }

  // If both comma and period are present, determine which is decimal
  if (hasComma && hasPeriod) {
    const lastCommaIndex = numberStr.lastIndexOf(',');
    const lastPeriodIndex = numberStr.lastIndexOf('.');

    // The last separator is typically the decimal separator
    if (lastCommaIndex > lastPeriodIndex) {
      // European format: 1.234,56
      return { thousandsSeparator: '.', decimalSeparator: ',', type: 'eu' };
    } else {
      // US format: 1,234.56
      // Check for Indian format (xx,xx,xxx pattern)
      if (isIndianFormat(numberStr)) {
        return { thousandsSeparator: ',', decimalSeparator: '.', type: 'indian' };
      }
      return { thousandsSeparator: ',', decimalSeparator: '.', type: 'us' };
    }
  }

  // Only comma present - need to determine if it's thousands or decimal
  if (hasComma && !hasPeriod) {
    // Check if it looks like a decimal (only 1-2 digits after comma at end)
    const match = numberStr.match(/,(\d+)$/);
    if (match) {
      const digitsAfterComma = match[1].length;
      // If 1-2 digits after comma at end, likely European decimal
      if (digitsAfterComma <= 2) {
        return { thousandsSeparator: '.', decimalSeparator: ',', type: 'eu' };
      }
      // If exactly 3 digits, it's ambiguous but likely thousands separator
      if (digitsAfterComma === 3) {
        // Check if there are multiple commas (definitely thousands)
        const commaCount = (numberStr.match(/,/g) || []).length;
        if (commaCount > 1) {
          return { thousandsSeparator: ',', decimalSeparator: '.', type: 'us' };
        }
        // Single comma with 3 digits - ambiguous, default to US (thousands)
        return { thousandsSeparator: ',', decimalSeparator: '.', type: 'us' };
      }
    }
    // Multiple commas = thousands separator
    const commaCount = (numberStr.match(/,/g) || []).length;
    if (commaCount > 1) {
      return { thousandsSeparator: ',', decimalSeparator: '.', type: 'us' };
    }
    // Default: comma as thousands (US format)
    return { thousandsSeparator: ',', decimalSeparator: '.', type: 'us' };
  }

  // Only period present
  if (hasPeriod && !hasComma) {
    const periodCount = (numberStr.match(/\./g) || []).length;

    // Multiple periods = European thousands separator (e.g., 1.234.567)
    if (periodCount > 1) {
      return { thousandsSeparator: '.', decimalSeparator: ',', type: 'eu' };
    }

    // Single period - check if it looks like a decimal
    const match = numberStr.match(/\.(\d+)$/);
    if (match) {
      const digitsAfterPeriod = match[1].length;
      // If 1-2 digits after period, definitely US decimal
      if (digitsAfterPeriod <= 2) {
        return { thousandsSeparator: ',', decimalSeparator: '.', type: 'us' };
      }
      // If 3 or more digits after single period, it's ambiguous
      // but we default to US decimal for single period cases
      // European thousands typically requires multiple periods (1.234.567)
      // or a Euro symbol context (handled at higher level)
      return { thousandsSeparator: ',', decimalSeparator: '.', type: 'us' };
    }
    // Default: period as decimal (US format)
    return { thousandsSeparator: ',', decimalSeparator: '.', type: 'us' };
  }

  // No separators - default to US format
  return { thousandsSeparator: ',', decimalSeparator: '.', type: 'us' };
}

/**
 * Checks if the number string follows Indian numbering format.
 * Indian format: 1,23,456 or 12,34,567 (groups of 2 after the first group of 3 from right)
 *
 * Key distinction from US format:
 * - US: 1,234,567 (groups of 3)
 * - Indian: 1,23,45,678 (first group of 3, then groups of 2 from right to left)
 *
 * @param numberStr - The number string to check
 * @returns True if it matches Indian format
 */
function isIndianFormat(numberStr: string): boolean {
  // Indian format: comma-separated with groups of 2 after first 3 digits from right
  // Must have at least one group of 2 digits to distinguish from US format
  // Pattern examples: 1,23,456 (not 1,234) | 12,34,567 | 1,23,45,678
  // The key is having a 2-digit group before the last 3-digit group
  const indianPattern = /^\d{1,2},\d{2}(?:,\d{2})*,\d{3}(?:\.\d+)?$/;
  return indianPattern.test(numberStr);
}

/**
 * Normalizes a regional format number string to a standard JavaScript number.
 *
 * @param numberStr - The number string with regional formatting
 * @param config - The format configuration to use
 * @returns The normalized numeric value
 */
export function normalizeRegionalNumber(numberStr: string, config: FormatConfig): number {
  let normalized = numberStr;

  // Remove thousands separators
  if (config.thousandsSeparator === ' ') {
    // Handle both regular space and non-breaking space
    normalized = normalized.replace(/[\s\u00A0]/g, '');
  } else {
    const escapedThousands = config.thousandsSeparator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    normalized = normalized.replace(new RegExp(escapedThousands, 'g'), '');
  }

  // Convert decimal separator to period
  if (config.decimalSeparator !== '.') {
    const escapedDecimal = config.decimalSeparator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    normalized = normalized.replace(new RegExp(escapedDecimal, 'g'), '.');
  }

  return parseFloat(normalized);
}

/**
 * Parses a string with regional number formatting and currency symbol.
 *
 * @param input - The string containing a regional format monetary value
 * @param defaultCurrency - Optional default currency code for ambiguous symbols
 * @returns Parse result with amount, currency code, symbol, raw match, and format type
 * @throws {ValueOverflowError} If the number exceeds Number.MAX_SAFE_INTEGER
 * @throws {Error} If the input format is invalid or symbol is not recognized
 */
export function parseRegionalFormat(input: string, defaultCurrency?: string): RegionalFormatParseResult {
  if (!input || typeof input !== 'string') {
    throw new Error('Input must be a non-empty string');
  }

  const trimmed = input.trim();
  const match = REGIONAL_SYMBOL_REGEX.exec(trimmed);

  if (!match || !match.groups) {
    throw new Error(`No regional format pattern found in: "${input}"`);
  }

  // Determine which pattern matched (symbol before or after)
  const symbol = (match.groups.symbolBefore || match.groups.symbolAfter || '').trim();
  const amountStr = (match.groups.amountAfterSymbol || match.groups.amountBeforeSymbol || '').trim();

  if (!symbol || !amountStr) {
    throw new Error(`Invalid regional format pattern: "${input}"`);
  }

  // Detect the regional format
  const formatConfig = detectRegionalFormat(amountStr);

  // Normalize and parse the amount
  const amount = normalizeRegionalNumber(amountStr, formatConfig);

  if (isNaN(amount)) {
    throw new Error(`Failed to parse amount: "${amountStr}"`);
  }

  // Check for overflow
  if (amount > Number.MAX_SAFE_INTEGER) {
    throw new ValueOverflowError(
      `Amount ${amount} exceeds maximum safe integer (${Number.MAX_SAFE_INTEGER})`
    );
  }

  // Map symbol to currency code(s)
  const possibleCurrencies = CURRENCY_SYMBOL_MAP[symbol]
    || CURRENCY_SYMBOL_MAP[symbol.toUpperCase()]
    || CURRENCY_SYMBOL_MAP[symbol.toLowerCase()];

  if (!possibleCurrencies || possibleCurrencies.length === 0) {
    throw new Error(`Unknown currency symbol: "${symbol}"`);
  }

  // Select currency code
  let currencyCode: string;
  if (possibleCurrencies.length === 1) {
    currencyCode = possibleCurrencies[0];
  } else if (defaultCurrency && possibleCurrencies.includes(defaultCurrency.toUpperCase())) {
    currencyCode = defaultCurrency.toUpperCase();
  } else {
    currencyCode = possibleCurrencies[0];
  }

  // Validate currency code exists
  const currencyInfo = getCurrencyByCode(currencyCode);
  if (!currencyInfo) {
    throw new Error(`Currency code ${currencyCode} not found in currency database`);
  }

  return {
    amount,
    currencyCode,
    symbol,
    raw: match[0],
    formatType: formatConfig.type,
  };
}

/**
 * Attempts to match and parse a regional format pattern from a string.
 * Returns null if no valid pattern is found.
 *
 * @param input - The string to search for a regional format pattern
 * @param defaultCurrency - Optional default currency code for ambiguous symbols
 * @returns Parse result or null if not found
 */
export function matchRegionalFormat(input: string, defaultCurrency?: string): RegionalFormatParseResult | null {
  try {
    return parseRegionalFormat(input, defaultCurrency);
  } catch {
    return null;
  }
}

/**
 * Validates that a number string has consistent separator usage.
 *
 * @param numberStr - The number string to validate
 * @returns True if the format is consistent and valid
 */
export function isValidRegionalFormat(numberStr: string): boolean {
  if (!numberStr || typeof numberStr !== 'string') {
    return false;
  }

  const trimmed = numberStr.trim();

  // Must start with a digit
  if (!/^\d/.test(trimmed)) {
    return false;
  }

  // Check for invalid character sequences
  // No consecutive separators
  if (/[.,'\s]{2,}/.test(trimmed)) {
    return false;
  }

  // Must end with digit
  if (!/\d$/.test(trimmed)) {
    return false;
  }

  // Validate by attempting to parse
  try {
    const config = detectRegionalFormat(trimmed);
    const normalized = normalizeRegionalNumber(trimmed, config);
    return !isNaN(normalized) && isFinite(normalized);
  } catch {
    return false;
  }
}
