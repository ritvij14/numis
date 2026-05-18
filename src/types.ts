/**
 * Options for configuring the parseMoney function.
 */
export interface ParseOptions {
  /**
   * Default currency to use when no currency is detected in the input text.
   * Must be a valid ISO-4217 currency code (e.g., "USD", "EUR", "GBP").
   * @default undefined (no fallback applied)
   */
  defaultCurrency?: string;
}

/**
 * Result of parsing a monetary range expression.
 */
export interface RangeParseResult {
  /** The minimum value of the range, or null if not applicable. */
  min: number | null;
  /** The maximum value of the range, or null if not applicable. */
  max: number | null;
  /** The ISO currency code, or null if not detected. */
  currency: string | null;
  /** The original input string that was parsed. */
  raw: string;
}
