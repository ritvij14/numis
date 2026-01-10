/**
 * Negative Number Detection
 * ==========================
 * Detects negative monetary amounts using:
 * 1. Negative prefixes: "-", "minus", "negative"
 * 2. Parentheses notation: (100) implies -100
 *
 * This module provides utilities for detecting negative indicators
 * in monetary strings, which should be applied early in the pipeline
 * before numeric parsing.
 */

export interface NegativeDetectionResult {
  isNegative: boolean;
  cleanedInput?: string; // Input with negative indicators removed
}

/**
 * Detects if the input contains negative indicators.
 * Checks for:
 * - Negative prefixes: "-", "minus", "negative"
 * - Parentheses notation: (amount), (amount) currency, or variations
 *
 * @param input The text to check for negative indicators
 * @returns Detection result with isNegative flag and optionally cleaned input
 */
export function detectNegative(input: string): NegativeDetectionResult {
  const trimmed = input.trim();

  // 1) Check for parentheses notation with optional trailing currency
  // Matches: (100), ($100), (100 USD), (100) USD, (€50), etc.
  // Pattern: (content) optionally followed by whitespace and more text
  const parenMatch = /^\(([^)]+)\)(.*)$/.exec(trimmed);
  if (parenMatch) {
    const innerContent = parenMatch[1].trim();
    const trailingContent = parenMatch[2].trim();

    // Reconstruct the cleaned input: content from inside parentheses + any trailing text
    const cleanedInput = trailingContent
      ? `${innerContent} ${trailingContent}`
      : innerContent;

    return {
      isNegative: true,
      cleanedInput: cleanedInput,
    };
  }

  // 2) Check for negative prefix: "-", "minus", "negative"
  // Pattern matches these at the start of the string (with optional whitespace)
  const prefixPattern = /^(?:[-−–—]|minus\b|negative\b)\s*/i;
  const prefixMatch = prefixPattern.exec(trimmed);
  if (prefixMatch) {
    return {
      isNegative: true,
      cleanedInput: trimmed.slice(prefixMatch[0].length).trim(),
    };
  }

  // No negative indicators found
  return {
    isNegative: false,
  };
}

/**
 * Checks if the input uses parentheses notation for negative numbers.
 * @param input The text to check
 * @returns true if the input is wrapped in parentheses
 */
export function hasParenthesesNotation(input: string): boolean {
  const trimmed = input.trim();
  return /^\([^)]+\)$/.test(trimmed);
}

/**
 * Checks if the input has a negative prefix.
 * @param input The text to check
 * @returns true if the input starts with a negative prefix
 */
export function hasNegativePrefix(input: string): boolean {
  const trimmed = input.trim();
  return /^(?:[-−–—]|minus\b|negative\b)\s*/i.test(trimmed);
}

/**
 * Removes negative indicators from the input.
 * This is useful for passing the cleaned value to downstream parsers.
 * @param input The text to clean
 * @returns The input with negative indicators removed
 */
export function removeNegativeIndicators(input: string): string {
  const detection = detectNegative(input);
  return detection.cleanedInput ?? input;
}
