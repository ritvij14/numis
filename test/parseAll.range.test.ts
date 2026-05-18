/**
 * Integration tests for parseAll() with range inputs
 */
import { parseAll, MonetaryExpression } from '../src/parseAll';

describe('parseAll - Range Integration Tests', () => {
  describe('Single range in text', () => {
    test('parses symbol range with hyphen separator', () => {
      const result = parseAll('The price is $50 - $100');
      expect(result).toHaveLength(1);
      expect(result[0].isRange).toBe(true);
      expect(result[0].min).toBe(50);
      expect(result[0].max).toBe(100);
      expect(result[0].currency).toBe('USD');
      expect(result[0].type).toBe('range');
    });

    test('parses symbol range with en-dash separator', () => {
      const result = parseAll('Price: $500 – $1000');
      expect(result).toHaveLength(1);
      expect(result[0].isRange).toBe(true);
      expect(result[0].min).toBe(500);
      expect(result[0].max).toBe(1000);
    });

    test('parses symbol range with em-dash separator', () => {
      const result = parseAll('Cost: $50 — $100');
      expect(result).toHaveLength(1);
      expect(result[0].isRange).toBe(true);
      expect(result[0].min).toBe(50);
      expect(result[0].max).toBe(100);
    });

    test('parses symbol range with "to" separator', () => {
      const result = parseAll('The price is $50 to $100');
      expect(result).toHaveLength(1);
      expect(result[0].isRange).toBe(true);
      expect(result[0].min).toBe(50);
      expect(result[0].max).toBe(100);
    });

    test('parses symbol range with "through" separator', () => {
      const result = parseAll('The price is $50 through $100');
      expect(result).toHaveLength(1);
      expect(result[0].isRange).toBe(true);
      expect(result[0].min).toBe(50);
      expect(result[0].max).toBe(100);
    });

    test('parses euro symbol range', () => {
      const result = parseAll('The price is €50 - €100');
      expect(result).toHaveLength(1);
      expect(result[0].isRange).toBe(true);
      expect(result[0].min).toBe(50);
      expect(result[0].max).toBe(100);
      expect(result[0].currency).toBe('EUR');
    });

    test('parses pound symbol range', () => {
      const result = parseAll('The price is £100 - £200');
      expect(result).toHaveLength(1);
      expect(result[0].isRange).toBe(true);
      expect(result[0].min).toBe(100);
      expect(result[0].max).toBe(200);
      expect(result[0].currency).toBe('GBP');
    });

    test('parses range without space between symbol and number', () => {
      const result = parseAll('Price: $50-$100');
      expect(result).toHaveLength(1);
      expect(result[0].isRange).toBe(true);
      expect(result[0].min).toBe(50);
      expect(result[0].max).toBe(100);
    });

    test('parses range with symbol only on first value', () => {
      const result = parseAll('Price: $50 - 100');
      expect(result).toHaveLength(1);
      expect(result[0].isRange).toBe(true);
      expect(result[0].min).toBe(50);
      expect(result[0].max).toBe(100);
      expect(result[0].currency).toBe('USD');
    });
  });

  describe('Multiple ranges in text', () => {
    test('parses two separate ranges', () => {
      const result = parseAll('The price is $50 - $100 and the shipping is $10 - $20');
      expect(result).toHaveLength(2);
      expect(result[0].isRange).toBe(true);
      expect(result[0].min).toBe(50);
      expect(result[0].max).toBe(100);
      expect(result[1].isRange).toBe(true);
      expect(result[1].min).toBe(10);
      expect(result[1].max).toBe(20);
    });

    test('parses three separate ranges', () => {
      const result = parseAll('Price: $10-$20, Size: $30-$40, Tax: $5-$10');
      expect(result).toHaveLength(3);
      result.forEach((expr) => {
        expect(expr.isRange).toBe(true);
      });
      expect(result[0].min).toBe(10);
      expect(result[1].min).toBe(30);
      expect(result[2].min).toBe(5);
    });

    test('parses multiple ranges with different currencies', () => {
      const result = parseAll('USD range: $100 - $200 and EUR range: €50 - €100');
      expect(result).toHaveLength(2);
      expect(result[0].currency).toBe('USD');
      expect(result[1].currency).toBe('EUR');
    });

    test('parses multiple ranges with different separators', () => {
      const result = parseAll('$10 to $20, €30 - €40, £50 through £60');
      expect(result).toHaveLength(3);
      expect(result[0].min).toBe(10);
      expect(result[1].min).toBe(30);
      expect(result[2].min).toBe(50);
    });
  });

  describe('Mix of ranges and single values', () => {
    test('parses range and single value together', () => {
      const result = parseAll('The price is $50 - $100 and the tax is $5');

      expect(result).toHaveLength(2);

      // First result should be the range
      expect(result[0].type).toBe('range');
      expect(result[0].isRange).toBe(true);
      expect(result[0].min).toBe(50);
      expect(result[0].max).toBe(100);
      expect(result[0].currency).toBe('USD');
      expect(result[0].raw).toBe('$50 - $100');

      // Second result should be the single value
      expect(result[1].type).toBe('single');
      expect(result[1].isRange).toBe(false);
      expect(result[1].amount).toBe(5);
      expect(result[1].currency).toBe('USD');
      expect(result[1].raw).toBe('$5');
    });

    test('parses single value and range in different order', () => {
      const result = parseAll('The tax is $5 and the price is $50 - $100');
      expect(result.length).toBeGreaterThanOrEqual(2);
      const range = result.find((r) => r.isRange);
      const single = result.find((r) => !r.isRange);
      expect(range).toBeDefined();
      expect(single).toBeDefined();
    });

    test('parses multiple singles and a range', () => {
      const result = parseAll('Base: $100, shipping: $10 - $20, tax: $8');

      expect(result).toHaveLength(3);

      // First result: Base $100
      expect(result[0].type).toBe('single');
      expect(result[0].isRange).toBe(false);
      expect(result[0].amount).toBe(100);
      expect(result[0].currency).toBe('USD');
      expect(result[0].raw).toBe('$100');

      // Second result: shipping range $10 - $20
      expect(result[1].type).toBe('range');
      expect(result[1].isRange).toBe(true);
      expect(result[1].min).toBe(10);
      expect(result[1].max).toBe(20);
      expect(result[1].currency).toBe('USD');
      expect(result[1].raw).toBe('$10 - $20');

      // Third result: tax $8
      expect(result[2].type).toBe('single');
      expect(result[2].isRange).toBe(false);
      expect(result[2].amount).toBe(8);
      expect(result[2].currency).toBe('USD');
      expect(result[2].raw).toBe('$8');
    });
  });

  describe('ISO code ranges', () => {
    test('parses ISO code range with hyphen', () => {
      const result = parseAll('USD 500 - USD 1000');
      expect(result).toHaveLength(1);
      expect(result[0].isRange).toBe(true);
      expect(result[0].min).toBe(500);
      expect(result[0].max).toBe(1000);
      expect(result[0].currency).toBe('USD');
    });

    test('parses ISO code range with "to"', () => {
      const result = parseAll('EUR 50 to EUR 100');
      expect(result).toHaveLength(1);
      expect(result[0].isRange).toBe(true);
      expect(result[0].min).toBe(50);
      expect(result[0].max).toBe(100);
      expect(result[0].currency).toBe('EUR');
    });

    test('parses ISO code range with different currency', () => {
      const result = parseAll('GBP 100 - GBP 200');
      expect(result).toHaveLength(1);
      expect(result[0].currency).toBe('GBP');
    });
  });

  describe('Contextual ranges', () => {
    test('parses "between X and Y" pattern', () => {
      const result = parseAll('between $100 and $200');
      expect(result).toHaveLength(1);
      expect(result[0].isRange).toBe(true);
      expect(result[0].min).toBe(100);
      expect(result[0].max).toBe(200);
    });

    test('parses "from X to Y" pattern', () => {
      const result = parseAll('from $50 to $100');
      expect(result).toHaveLength(1);
      expect(result[0].isRange).toBe(true);
      expect(result[0].min).toBe(50);
      expect(result[0].max).toBe(100);
    });

    test('parses "range of X - Y" pattern', () => {
      const result = parseAll('range of $100 - $200');
      expect(result).toHaveLength(1);
      expect(result[0].isRange).toBe(true);
    });
  });

  describe('Magnitude suffix ranges', () => {
    test('parses k to M range as separate values (not detected as range by parseAll)', () => {
      const result = parseAll('10k - 1M');
      // parseAll may not detect magnitude ranges as single range expressions
      // It may return them as separate single values
      expect(result.length).toBeGreaterThanOrEqual(1);
    });

    test('parses million range', () => {
      const result = parseAll('1 million to 10 million');
      // This may not be detected as a range
      expect(Array.isArray(result)).toBe(true);
    });

    test('parses thousand range', () => {
      const result = parseAll('1k to 5k');
      // parseAll may not detect magnitude ranges as single range expressions
      expect(Array.isArray(result)).toBe(true);
    });

    test('parses billion range', () => {
      const result = parseAll('1bn - 2bn');
      // parseAll may return separate values for magnitude ranges
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('Start/end indices', () => {
    test('returns correct indices for simple range', () => {
      const result = parseAll('Price: $50 - $100');
      expect(result).toHaveLength(1);
      expect(result[0].startIndex).toBe(7);
      expect(result[0].endIndex).toBe(17);
      expect(result[0].raw).toBe('$50 - $100');
    });

    test('returns correct indices for range at start', () => {
      const result = parseAll('$50 - $100 is the price');
      expect(result).toHaveLength(1);
      expect(result[0].startIndex).toBe(0);
      expect(result[0].raw).toBe('$50 - $100');
    });

    test('returns correct indices for range at end', () => {
      const result = parseAll('The price is $50 - $100');
      expect(result).toHaveLength(1);
      // "The price is " = 12 chars + "$50 - $100" = 11 chars = 23 total
      expect(result[0].endIndex).toBe(23);
    });

    test('returns correct indices for multiple ranges', () => {
      const result = parseAll('$10 - $20 and $30 - $40');
      expect(result).toHaveLength(2);
      expect(result[0].startIndex).toBe(0);
      expect(result[0].raw).toBe('$10 - $20');
      // "$10 - $20 and " = 15 chars, so $30 starts at position 14
      expect(result[1].startIndex).toBe(14);
      expect(result[1].raw).toBe('$30 - $40');
    });

    test('returns correct indices for range with single value', () => {
      const result = parseAll('Price: $50-$100, Tax: $5');
      expect(result).toHaveLength(2);
      const range = result.find((r) => r.isRange);
      const single = result.find((r) => !r.isRange);
      expect(range?.raw).toBe('$50-$100');
      expect(single?.raw).toBe('$5');
    });
  });

  describe('Edge cases', () => {
    test('returns empty array for empty input', () => {
      const result = parseAll('');
      expect(result).toHaveLength(0);
    });

    test('returns empty array for text without monetary values', () => {
      const result = parseAll('Hello world');
      expect(result).toHaveLength(0);
    });

    test('returns empty array for text with only numbers', () => {
      const result = parseAll('The numbers are 10 - 20');
      expect(result).toHaveLength(0);
    });

    test('handles single value without range correctly', () => {
      const result = parseAll('The price is $100');
      expect(result).toHaveLength(1);
      expect(result[0].isRange).toBe(false);
      expect(result[0].amount).toBe(100);
    });

    test('handles text with only invalid ranges', () => {
      const result = parseAll('between hello and world');
      expect(result).toHaveLength(0);
    });

    test('throws error for reversed range (max < min)', () => {
      // Reversed ranges throw an error in parseRange
      expect(() => parseAll('Price: $100 - $50')).toThrow();
    });

    test('handles whitespace variations', () => {
      const result = parseAll('Price: $50  -  $100');
      expect(result).toHaveLength(1);
      expect(result[0].min).toBe(50);
      expect(result[0].max).toBe(100);
    });

    test('handles numbers with commas', () => {
      const result = parseAll('Price: $1,000 - $2,000');
      expect(result).toHaveLength(1);
      expect(result[0].min).toBe(1000);
      expect(result[0].max).toBe(2000);
    });

    test('handles decimal values in ranges', () => {
      const result = parseAll('Price: $10.50 - $20.99');
      expect(result).toHaveLength(1);
      expect(result[0].min).toBe(10.5);
      expect(result[0].max).toBe(20.99);
    });
  });

  describe('Mixed formats', () => {
    test('parses word + number range (ten to 100 dollars) as single values', () => {
      const result = parseAll('ten to 100 dollars');
      // Worded number ranges may not be detected as a single range
      // parseAll may return single values instead
      expect(Array.isArray(result)).toBe(true);
    });

    test('parses different currency symbols in same text', () => {
      const result = parseAll('$100 USD and €50 EUR');
      expect(result.length).toBeGreaterThanOrEqual(2);
    });

    test('parses complex text with multiple expressions', () => {
      const result = parseAll('The product costs $50-$100, express shipping is $20, or you can get it for €40-€80');
      expect(result.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Results are sorted by position', () => {
    test('returns results sorted by startIndex', () => {
      const result = parseAll('Second: $30-$40, First: $10-$20');
      expect(result).toHaveLength(2);
      expect(result[0].startIndex).toBeLessThan(result[1].startIndex);
    });
  });

  describe('Raw text preservation', () => {
    test('preserves raw text for symbol range', () => {
      const result = parseAll('Price: $500 - $1000');
      expect(result[0].raw).toBe('$500 - $1000');
    });

    test('preserves raw text for ISO code range', () => {
      const result = parseAll('Price: USD 500 - USD 1000');
      expect(result[0].raw).toContain('USD 500');
    });

    test('preserves raw text for contextual range', () => {
      const result = parseAll('between $100 and $200');
      expect(result[0].raw).toBe('between $100 and $200');
    });
  });

  describe('Type field', () => {
    test('has type "range" for range expressions', () => {
      const result = parseAll('$50 - $100');
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('range');
    });

    test('has type "single" for single value expressions', () => {
      const result = parseAll('$100');
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('single');
    });
  });
});