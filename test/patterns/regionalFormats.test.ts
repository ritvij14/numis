/**
 * Unit tests for Regional Formats Pattern Parser
 * ===============================================
 * Tests the parsing of monetary values with regional number formatting.
 */

import {
  parseRegionalFormat,
  matchRegionalFormat,
  detectRegionalFormat,
  normalizeRegionalNumber,
  isValidRegionalFormat,
} from '../../src/patterns/regionalFormats';
import { ValueOverflowError } from '../../src/errors';

describe('Regional Formats Pattern Parser', () => {
  describe('parseRegionalFormat', () => {
    describe('European format (period thousands, comma decimal)', () => {
      test('should parse "1.234,56 €"', () => {
        const result = parseRegionalFormat('1.234,56 €');
        expect(result.amount).toBeCloseTo(1234.56);
        expect(result.currencyCode).toBe('EUR');
        expect(result.symbol).toBe('€');
        expect(result.formatType).toBe('eu');
      });

      test('should parse "€ 1.234,56"', () => {
        const result = parseRegionalFormat('€ 1.234,56');
        expect(result.amount).toBeCloseTo(1234.56);
        expect(result.currencyCode).toBe('EUR');
        expect(result.formatType).toBe('eu');
      });

      test('should parse large European format "1.234.567,89 €"', () => {
        const result = parseRegionalFormat('1.234.567,89 €');
        expect(result.amount).toBeCloseTo(1234567.89);
        expect(result.currencyCode).toBe('EUR');
        expect(result.formatType).toBe('eu');
      });

      test('should parse European format with multiple thousands separators "1.234.567 €"', () => {
        // Single period is ambiguous, use multiple periods for unambiguous EU format
        const result = parseRegionalFormat('1.234.567 €');
        expect(result.amount).toBe(1234567);
        expect(result.currencyCode).toBe('EUR');
        expect(result.formatType).toBe('eu');
      });

      test('should parse small European decimal "0,99 €"', () => {
        const result = parseRegionalFormat('0,99 €');
        expect(result.amount).toBeCloseTo(0.99);
        expect(result.currencyCode).toBe('EUR');
        expect(result.formatType).toBe('eu');
      });

      test('should parse "99,99 €"', () => {
        const result = parseRegionalFormat('99,99 €');
        expect(result.amount).toBeCloseTo(99.99);
        expect(result.currencyCode).toBe('EUR');
        expect(result.formatType).toBe('eu');
      });
    });

    describe('US format (comma thousands, period decimal)', () => {
      test('should parse "1,234.56 $"', () => {
        const result = parseRegionalFormat('1,234.56 $');
        expect(result.amount).toBeCloseTo(1234.56);
        expect(result.currencyCode).toBe('USD');
        expect(result.symbol).toBe('$');
        expect(result.formatType).toBe('us');
      });

      test('should parse "$1,234.56"', () => {
        const result = parseRegionalFormat('$1,234.56');
        expect(result.amount).toBeCloseTo(1234.56);
        expect(result.currencyCode).toBe('USD');
        expect(result.formatType).toBe('us');
      });

      test('should parse large US format "$1,234,567.89"', () => {
        const result = parseRegionalFormat('$1,234,567.89');
        expect(result.amount).toBeCloseTo(1234567.89);
        expect(result.currencyCode).toBe('USD');
        expect(result.formatType).toBe('us');
      });

      test('should parse US format without thousands "$1234.56"', () => {
        const result = parseRegionalFormat('$1234.56');
        expect(result.amount).toBeCloseTo(1234.56);
        expect(result.currencyCode).toBe('USD');
      });

      test('should parse US cents "$0.99"', () => {
        const result = parseRegionalFormat('$0.99');
        expect(result.amount).toBeCloseTo(0.99);
        expect(result.currencyCode).toBe('USD');
      });
    });

    describe('Swiss format (apostrophe thousands, period decimal)', () => {
      test("should parse \"1'234.56 CHF\"", () => {
        const result = parseRegionalFormat("1'234.56 CHF");
        expect(result.amount).toBeCloseTo(1234.56);
        expect(result.currencyCode).toBe('CHF');
        expect(result.formatType).toBe('swiss');
      });

      test("should parse \"CHF 1'234.56\"", () => {
        const result = parseRegionalFormat("CHF 1'234.56");
        expect(result.amount).toBeCloseTo(1234.56);
        expect(result.currencyCode).toBe('CHF');
        expect(result.formatType).toBe('swiss');
      });

      test("should parse large Swiss format \"1'234'567.89 CHF\"", () => {
        const result = parseRegionalFormat("1'234'567.89 CHF");
        expect(result.amount).toBeCloseTo(1234567.89);
        expect(result.currencyCode).toBe('CHF');
        expect(result.formatType).toBe('swiss');
      });

      test("should parse Swiss format with Fr symbol \"Fr 1'234.56\"", () => {
        const result = parseRegionalFormat("Fr 1'234.56");
        expect(result.amount).toBeCloseTo(1234.56);
        expect(result.currencyCode).toBe('CHF');
        expect(result.formatType).toBe('swiss');
      });
    });

    describe('French format (space thousands, comma decimal)', () => {
      test('should parse "1 234,56 €"', () => {
        const result = parseRegionalFormat('1 234,56 €');
        expect(result.amount).toBeCloseTo(1234.56);
        expect(result.currencyCode).toBe('EUR');
        expect(result.formatType).toBe('french');
      });

      test('should parse "€ 1 234,56"', () => {
        const result = parseRegionalFormat('€ 1 234,56');
        expect(result.amount).toBeCloseTo(1234.56);
        expect(result.currencyCode).toBe('EUR');
        expect(result.formatType).toBe('french');
      });

      test('should parse large French format "1 234 567,89 €"', () => {
        const result = parseRegionalFormat('1 234 567,89 €');
        expect(result.amount).toBeCloseTo(1234567.89);
        expect(result.currencyCode).toBe('EUR');
        expect(result.formatType).toBe('french');
      });
    });

    describe('Currency symbol placement', () => {
      test('should parse symbol before amount (prefix)', () => {
        const result = parseRegionalFormat('€1.234,56');
        expect(result.amount).toBeCloseTo(1234.56);
        expect(result.currencyCode).toBe('EUR');
      });

      test('should parse symbol after amount (suffix)', () => {
        const result = parseRegionalFormat('1.234,56€');
        expect(result.amount).toBeCloseTo(1234.56);
        expect(result.currencyCode).toBe('EUR');
      });

      test('should handle space between symbol and amount (prefix)', () => {
        const result = parseRegionalFormat('€ 1.234,56');
        expect(result.amount).toBeCloseTo(1234.56);
        expect(result.currencyCode).toBe('EUR');
      });

      test('should handle space between amount and symbol (suffix)', () => {
        const result = parseRegionalFormat('1.234,56 €');
        expect(result.amount).toBeCloseTo(1234.56);
        expect(result.currencyCode).toBe('EUR');
      });
    });

    describe('Various currencies with regional formats', () => {
      test('should parse British Pound with EU format "£1.234,56"', () => {
        const result = parseRegionalFormat('£1.234,56');
        expect(result.amount).toBeCloseTo(1234.56);
        expect(result.currencyCode).toBe('GBP');
      });

      test('should parse Japanese Yen "¥1,234"', () => {
        const result = parseRegionalFormat('¥1,234');
        expect(result.amount).toBe(1234);
        expect(result.currencyCode).toBe('JPY');
      });

      test('should parse Indian Rupee "₹1,234.56"', () => {
        const result = parseRegionalFormat('₹1,234.56');
        expect(result.amount).toBeCloseTo(1234.56);
        expect(result.currencyCode).toBe('INR');
      });

      test('should parse Brazilian Real "R$ 1.234,56"', () => {
        const result = parseRegionalFormat('R$ 1.234,56');
        expect(result.amount).toBeCloseTo(1234.56);
        expect(result.currencyCode).toBe('BRL');
      });

      test('should parse Polish Zloty "1 234,56 zł"', () => {
        const result = parseRegionalFormat('1 234,56 zł');
        expect(result.amount).toBeCloseTo(1234.56);
        expect(result.currencyCode).toBe('PLN');
      });

      test('should parse Swedish Krona "SEK 1 234,56"', () => {
        const result = parseRegionalFormat('SEK 1 234,56');
        expect(result.amount).toBeCloseTo(1234.56);
        expect(result.currencyCode).toBe('SEK');
      });
    });

    describe('Ambiguous symbols with defaultCurrency', () => {
      test('should use defaultCurrency for ambiguous $ symbol', () => {
        const result = parseRegionalFormat('$1,234.56', 'CAD');
        expect(result.amount).toBeCloseTo(1234.56);
        expect(result.currencyCode).toBe('CAD');
      });

      test('should use defaultCurrency for kr symbol', () => {
        const result = parseRegionalFormat('kr 1 234,56', 'NOK');
        expect(result.amount).toBeCloseTo(1234.56);
        expect(result.currencyCode).toBe('NOK');
      });

      test('should default to first currency when defaultCurrency not in list', () => {
        const result = parseRegionalFormat('$1,234.56', 'EUR');
        expect(result.amount).toBeCloseTo(1234.56);
        expect(result.currencyCode).toBe('USD');
      });
    });

    describe('Edge cases', () => {
      test('should parse single digit amounts', () => {
        const result = parseRegionalFormat('€5');
        expect(result.amount).toBe(5);
        expect(result.currencyCode).toBe('EUR');
      });

      test('should parse two digit amounts', () => {
        const result = parseRegionalFormat('€50');
        expect(result.amount).toBe(50);
        expect(result.currencyCode).toBe('EUR');
      });

      test('should parse amounts with leading zeros in decimal', () => {
        const result = parseRegionalFormat('€1,05');
        expect(result.amount).toBeCloseTo(1.05);
        expect(result.currencyCode).toBe('EUR');
      });

      test('should handle whitespace around input', () => {
        const result = parseRegionalFormat('  €1.234,56  ');
        expect(result.amount).toBeCloseTo(1234.56);
        expect(result.currencyCode).toBe('EUR');
      });
    });

    describe('Error handling', () => {
      test('should throw error for empty input', () => {
        expect(() => parseRegionalFormat('')).toThrow('Input must be a non-empty string');
      });

      test('should throw error for non-string input', () => {
        expect(() => parseRegionalFormat(null as any)).toThrow('Input must be a non-empty string');
        expect(() => parseRegionalFormat(undefined as any)).toThrow('Input must be a non-empty string');
        expect(() => parseRegionalFormat(123 as any)).toThrow('Input must be a non-empty string');
      });

      test('should throw error for input without currency symbol', () => {
        expect(() => parseRegionalFormat('1234.56')).toThrow('No regional format pattern found');
      });

      test('should throw error for unknown symbol', () => {
        expect(() => parseRegionalFormat('@1234')).toThrow('No regional format pattern found');
      });

      test('should throw ValueOverflowError for numbers exceeding MAX_SAFE_INTEGER', () => {
        const largeNumber = `€${Number.MAX_SAFE_INTEGER + 1}`;
        expect(() => parseRegionalFormat(largeNumber)).toThrow(ValueOverflowError);
      });
    });
  });

  describe('matchRegionalFormat', () => {
    test('should return parse result for valid input', () => {
      const result = matchRegionalFormat('€1.234,56');
      expect(result).not.toBeNull();
      expect(result?.amount).toBeCloseTo(1234.56);
      expect(result?.currencyCode).toBe('EUR');
    });

    test('should return null for invalid input', () => {
      expect(matchRegionalFormat('no currency here')).toBeNull();
      expect(matchRegionalFormat('1234.56')).toBeNull();
      expect(matchRegionalFormat('@1234')).toBeNull();
    });

    test('should return null for empty input', () => {
      expect(matchRegionalFormat('')).toBeNull();
    });

    test('should handle defaultCurrency parameter', () => {
      const result = matchRegionalFormat('$1,234.56', 'AUD');
      expect(result?.currencyCode).toBe('AUD');
    });
  });

  describe('detectRegionalFormat', () => {
    test('should detect US format with comma and period', () => {
      const result = detectRegionalFormat('1,234.56');
      expect(result.type).toBe('us');
      expect(result.thousandsSeparator).toBe(',');
      expect(result.decimalSeparator).toBe('.');
    });

    test('should detect European format with period and comma', () => {
      const result = detectRegionalFormat('1.234,56');
      expect(result.type).toBe('eu');
      expect(result.thousandsSeparator).toBe('.');
      expect(result.decimalSeparator).toBe(',');
    });

    test('should detect Swiss format with apostrophe', () => {
      const result = detectRegionalFormat("1'234.56");
      expect(result.type).toBe('swiss');
      expect(result.thousandsSeparator).toBe("'");
      expect(result.decimalSeparator).toBe('.');
    });

    test('should detect French format with space and comma', () => {
      const result = detectRegionalFormat('1 234,56');
      expect(result.type).toBe('french');
      expect(result.thousandsSeparator).toBe(' ');
      expect(result.decimalSeparator).toBe(',');
    });

    test('should detect Indian format', () => {
      const result = detectRegionalFormat('1,23,456.78');
      expect(result.type).toBe('indian');
    });

    test('should handle single comma with two decimal digits as EU format', () => {
      const result = detectRegionalFormat('1234,56');
      expect(result.type).toBe('eu');
    });

    test('should handle single comma with three digits as US thousands', () => {
      const result = detectRegionalFormat('1,234');
      expect(result.type).toBe('us');
    });

    test('should handle single period with two decimal digits as US format', () => {
      const result = detectRegionalFormat('1234.56');
      expect(result.type).toBe('us');
    });

    test('should handle no separators as US format', () => {
      const result = detectRegionalFormat('1234');
      expect(result.type).toBe('us');
    });
  });

  describe('normalizeRegionalNumber', () => {
    test('should normalize US format', () => {
      const config = { thousandsSeparator: ',', decimalSeparator: '.', type: 'us' as const };
      expect(normalizeRegionalNumber('1,234.56', config)).toBeCloseTo(1234.56);
    });

    test('should normalize European format', () => {
      const config = { thousandsSeparator: '.', decimalSeparator: ',', type: 'eu' as const };
      expect(normalizeRegionalNumber('1.234,56', config)).toBeCloseTo(1234.56);
    });

    test('should normalize Swiss format', () => {
      const config = { thousandsSeparator: "'", decimalSeparator: '.', type: 'swiss' as const };
      expect(normalizeRegionalNumber("1'234.56", config)).toBeCloseTo(1234.56);
    });

    test('should normalize French format', () => {
      const config = { thousandsSeparator: ' ', decimalSeparator: ',', type: 'french' as const };
      expect(normalizeRegionalNumber('1 234,56', config)).toBeCloseTo(1234.56);
    });

    test('should handle large numbers', () => {
      const config = { thousandsSeparator: ',', decimalSeparator: '.', type: 'us' as const };
      expect(normalizeRegionalNumber('1,234,567,890.12', config)).toBeCloseTo(1234567890.12);
    });

    test('should handle numbers without decimal part', () => {
      const config = { thousandsSeparator: '.', decimalSeparator: ',', type: 'eu' as const };
      expect(normalizeRegionalNumber('1.234.567', config)).toBe(1234567);
    });
  });

  describe('isValidRegionalFormat', () => {
    test('should return true for valid US format', () => {
      expect(isValidRegionalFormat('1,234.56')).toBe(true);
    });

    test('should return true for valid European format', () => {
      expect(isValidRegionalFormat('1.234,56')).toBe(true);
    });

    test('should return true for valid Swiss format', () => {
      expect(isValidRegionalFormat("1'234.56")).toBe(true);
    });

    test('should return true for valid French format', () => {
      expect(isValidRegionalFormat('1 234,56')).toBe(true);
    });

    test('should return true for plain numbers', () => {
      expect(isValidRegionalFormat('1234')).toBe(true);
      expect(isValidRegionalFormat('1234.56')).toBe(true);
    });

    test('should return false for empty input', () => {
      expect(isValidRegionalFormat('')).toBe(false);
    });

    test('should return false for non-string input', () => {
      expect(isValidRegionalFormat(null as any)).toBe(false);
      expect(isValidRegionalFormat(undefined as any)).toBe(false);
    });

    test('should return false for strings not starting with digit', () => {
      expect(isValidRegionalFormat('$1234')).toBe(false);
    });

    test('should return false for strings not ending with digit', () => {
      expect(isValidRegionalFormat('1234,')).toBe(false);
      expect(isValidRegionalFormat('1234.')).toBe(false);
    });

    test('should return false for consecutive separators', () => {
      expect(isValidRegionalFormat('1,,234')).toBe(false);
      expect(isValidRegionalFormat('1..234')).toBe(false);
    });
  });
});
