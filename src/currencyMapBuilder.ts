/**
 * Centralized Currency Map Builder
 * ================================
 * Provides a single, shared lazy-initialized lookup table for currency names/codes.
 * This avoids duplication across modules and ensures a single cached instance.
 */

import { getAllCurrencies } from "./currencyData";

let nameToCodeCache: Record<string, string> | null = null;

// Common stopwords that should not map to currencies even if they appear in currency names
// (e.g., "Trinidad and Tobago Dollar" should not make "and" map to TTD)
const STOPWORDS = new Set(["and", "the", "of"]);

/**
 * Returns a lazy-initialized lookup table mapping currency names and significant words
 * within those names to ISO-4217 codes. The map is built only on first access and cached
 * thereafter.
 *
 * @returns A map of currency name tokens to ISO-4217 codes
 */
export function getNameToCodeMap(): Record<string, string> {
  if (nameToCodeCache) return nameToCodeCache;

  const map: Record<string, string> = {};
  for (const cur of getAllCurrencies()) {
    const nameLower = cur.currency.toLowerCase();
    map[nameLower] = cur.code;

    // Also map individual words (≥3 chars) within the currency name to handle inputs like "Euro" or "Peso".
    // Skip stopwords to avoid false positives (e.g., "and" from "Trinidad and Tobago Dollar").
    for (const word of nameLower.split(/\s+/)) {
      if (word.length > 2 && !STOPWORDS.has(word)) {
        map[word] = cur.code;
        // Add simple plural form if it ends differently
        if (!word.endsWith("s")) {
          map[`${word}s`] = cur.code;
        }
      }
    }
  }

  // Manual overrides for ambiguous currency words – prefer most common.
  const overrides: Record<string, string> = {
    dollar: "USD",
    dollars: "USD",
    euro: "EUR",
    euros: "EUR",
    pound: "GBP",
    pounds: "GBP",
    yen: "JPY",
    rupee: "INR",
    rupees: "INR",
    peso: "MXN",
    pesos: "MXN",
    won: "KRW",
    dirham: "AED",  // Prefer UAE Dirham over Moroccan Dirham
    dirhams: "AED",
  };
  Object.assign(map, overrides);

  nameToCodeCache = map;
  return map;
}
