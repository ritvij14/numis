import { getCurrencyByCode } from "./currencyData";
import { MoneyParseError } from "./errors";
import { RegexPipeline } from "./regexPipeline";
import { ParseOptions } from "./types";

const defaultPipeline = RegexPipeline.default();

/**
 * Parse a text string to extract monetary information.
 *
 * @param text The text to parse for monetary expressions
 * @param options Optional configuration
 * @param options.defaultCurrency Default currency code (ISO-4217) to use when none is detected. Defaults to undefined (no fallback).
 * @returns PipelineContext with parsed amount, currency, and metadata
 * @throws {MoneyParseError} If defaultCurrency is provided but is not a valid ISO-4217 code
 *
 * @example
 * // Basic usage
 * parseMoney("$10.50");
 * // => { original: "$10.50", currency: "USD", amount: 10.5 }
 *
 * @example
 * // With default currency
 * parseMoney("I have 100", { defaultCurrency: "EUR" });
 * // => { original: "I have 100", currency: "EUR", amount: 100, currencyWasDefault: true }
 *
 * @example
 * // Detected currency takes precedence
 * parseMoney("$50", { defaultCurrency: "EUR" });
 * // => { original: "$50", currency: "USD", amount: 50 }
 */
export function parseMoney(text: string, options?: ParseOptions) {
  // Validate defaultCurrency if provided
  if (options?.defaultCurrency !== undefined) {
    const currencyInfo = getCurrencyByCode(options.defaultCurrency);
    if (!currencyInfo) {
      throw new MoneyParseError(
        `Invalid defaultCurrency: "${options.defaultCurrency}" is not a valid ISO-4217 currency code`,
        text
      );
    }
  }

  return defaultPipeline.run(text, {
    defaultCurrency: options?.defaultCurrency,
  });
}
