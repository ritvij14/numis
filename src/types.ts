/**
 * Options for configuring the parseMoney function.
 */
export interface ParseOptions {
  /**
   * Default currency to use when no currency is detected in the input text.
   * Must be a valid ISO-4217 currency code (e.g., "USD", "EUR", "GBP").
   * @default "USD"
   */
  defaultCurrency?: string;
}
