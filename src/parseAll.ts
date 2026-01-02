import { PipelineContext, RegexPipeline } from "./regexPipeline";

/**
 * Result of parsing a single monetary expression within a larger string.
 * Extends PipelineContext with position information.
 */
export interface ParseAllResult extends PipelineContext {
  /** Starting index of the matched expression in the original string */
  start: number;
  /** Ending index (exclusive) of the matched expression in the original string */
  end: number;
  /** The matched substring */
  match: string;
}

/**
 * Patterns that indicate the start of a monetary expression.
 * These are used to find candidate substrings to parse.
 */
const MONETARY_PATTERNS = [
  // Currency symbols (common ones)
  /[$€£¥₹₽₩฿]\s*[\d,]+(?:\.\d+)?/g,
  // Numbers followed by currency symbols
  /[\d,]+(?:\.\d+)?\s*[$€£¥₹₽₩฿]/g,
  // ISO codes with numbers (e.g., "USD 100", "100 EUR")
  /\b[A-Z]{3}\s+[\d,]+(?:\.\d+)?/gi,
  /[\d,]+(?:\.\d+)?\s+[A-Z]{3}\b/gi,
  // Numbers with k/m/b suffixes (e.g., "10k", "$5m")
  /[$€£¥₹₽₩฿]?\s*\d+(?:\.\d+)?[kmb]n?\b/gi,
  // Slang terms with optional quantities
  /\b(?:one|two|three|four|five|six|seven|eight|nine|ten|\d+)?\s*(?:bucks?|quids?|fivers?|tenners?)\b/gi,
  // Standalone slang
  /\b(?:bucks?|quids?|fivers?|tenners?)\b/gi,
  // Currency names with numbers (e.g., "100 dollars", "fifty euros")
  /[\d,]+(?:\.\d+)?\s+(?:dollars?|euros?|pounds?|yen|rupees?|cents?|pennies|pence)\b/gi,
  // Worded amounts with currency (e.g., "one hundred dollars")
  /\b(?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|million|billion)(?:[\s-]+(?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|million|billion|and))*\s+(?:dollars?|euros?|pounds?|yen|rupees?|[A-Z]{3})\b/gi,
  // Articles with currency (e.g., "a dollar", "a hundred euros")
  /\b(?:a|an)\s+(?:(?:hundred|thousand|million|billion)\s+)?(?:dollars?|euros?|pounds?|yen|rupees?|bucks?|quids?)\b/gi,
  // Contextual phrases (e.g., "a dollar and 23 cents")
  /\b(?:a|an)\s+(?:dollar|euro|pound|buck|quid)(?:\s+and\s+\d+\s+(?:cents?|pennies|pence))?\b/gi,
];

const defaultPipeline = RegexPipeline.default();

/**
 * Find all monetary expressions in a string.
 *
 * @param text - The input string to search for monetary expressions
 * @returns An array of ParseAllResult objects, one for each monetary expression found
 *
 * @example
 * ```ts
 * const results = parseAll("I have $100 and he has €50");
 * // => [
 * //   { original: "$100", currency: "USD", amount: 100, start: 7, end: 11, match: "$100" },
 * //   { original: "€50", currency: "EUR", amount: 50, start: 24, end: 27, match: "€50" }
 * // ]
 * ```
 */
export function parseAll(text: string): ParseAllResult[] {
  const results: ParseAllResult[] = [];
  const seen = new Set<string>(); // Track seen ranges to avoid duplicates

  // Find all candidate matches using our patterns
  for (const pattern of MONETARY_PATTERNS) {
    // Reset lastIndex for global patterns
    pattern.lastIndex = 0;

    let match: RegExpExecArray | null;
    while ((match = pattern.exec(text)) !== null) {
      const start = match.index;
      const end = start + match[0].length;
      const rangeKey = `${start}-${end}`;

      // Skip if we've already processed this exact range
      if (seen.has(rangeKey)) {
        continue;
      }

      const matchedText = match[0].trim();

      // Run the pipeline on the matched substring
      const parsed = defaultPipeline.run(matchedText);

      // Only include if we got both currency and amount
      if (parsed.currency !== undefined && parsed.amount !== undefined) {
        seen.add(rangeKey);
        results.push({
          ...parsed,
          start,
          end,
          match: match[0],
        });
      }
    }
  }

  // Sort by start position and remove overlapping matches (keep the earlier/longer one)
  results.sort((a, b) => {
    if (a.start !== b.start) return a.start - b.start;
    return b.end - a.end; // If same start, prefer longer match
  });

  // Remove overlapping matches
  const filtered: ParseAllResult[] = [];
  let lastEnd = -1;

  for (const result of results) {
    if (result.start >= lastEnd) {
      filtered.push(result);
      lastEnd = result.end;
    } else if (result.end > lastEnd) {
      // This match starts within the previous but extends further
      // Check if it's a better match (has both currency and amount vs just one)
      const prev = filtered[filtered.length - 1];
      const prevComplete =
        prev.currency !== undefined && prev.amount !== undefined;
      const currComplete =
        result.currency !== undefined && result.amount !== undefined;

      if (currComplete && !prevComplete) {
        filtered[filtered.length - 1] = result;
        lastEnd = result.end;
      }
    }
  }

  return filtered;
}
