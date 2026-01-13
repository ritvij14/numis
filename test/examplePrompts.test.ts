/**
 * Example Prompts Test Suite
 * ===========================
 * This test file validates all example prompts from the demo application.
 * It ensures that every expression in examplePromptsData.js can be parsed
 * successfully and returns reasonable results.
 *
 * Purpose:
 * - Validate demo examples work correctly
 * - Prevent regressions in common use cases
 * - Document expected behavior for each pattern type
 *
 * Test Structure:
 * Each example prompt is tested to ensure:
 * 1. It parses without throwing errors
 * 2. It returns a valid amount (number)
 * 3. It returns a valid currency code (when applicable)
 *
 * The expected results are based on the pattern type and context.
 */

import { parseMoney } from "../src/index";

describe("Example Prompts from Demo Application", () => {
  describe("Basic Symbols", () => {
    test("should parse '$100'", () => {
      const result = parseMoney("$100");
      expect(result.amount).toBe(100);
      expect(result.currency).toBe("USD");
    });

    test("should parse '$19.99'", () => {
      const result = parseMoney("$19.99");
      expect(result.amount).toBe(19.99);
      expect(result.currency).toBe("USD");
    });

    test("should parse '€50'", () => {
      const result = parseMoney("€50");
      expect(result.amount).toBe(50);
      expect(result.currency).toBe("EUR");
    });

    test("should parse '£75.50'", () => {
      const result = parseMoney("£75.50");
      expect(result.amount).toBe(75.50);
      expect(result.currency).toBe("GBP");
    });

    test("should parse '¥1000'", () => {
      const result = parseMoney("¥1000");
      expect(result.amount).toBe(1000);
      expect(result.currency).toBe("JPY");
    });

    test("should parse '₹500'", () => {
      const result = parseMoney("₹500");
      expect(result.amount).toBe(500);
      expect(result.currency).toBe("INR");
    });

    test("should parse '₽200'", () => {
      const result = parseMoney("₽200");
      expect(result.amount).toBe(200);
      expect(result.currency).toBe("RUB");
    });
  });

  describe("ISO Codes", () => {
    test("should parse 'USD 250'", () => {
      const result = parseMoney("USD 250");
      expect(result.amount).toBe(250);
      expect(result.currency).toBe("USD");
    });

    test("should parse '100 EUR'", () => {
      const result = parseMoney("100 EUR");
      expect(result.amount).toBe(100);
      expect(result.currency).toBe("EUR");
    });

    test("should parse 'GBP 20.50'", () => {
      const result = parseMoney("GBP 20.50");
      expect(result.amount).toBe(20.50);
      expect(result.currency).toBe("GBP");
    });

    test("should parse '50 CAD'", () => {
      const result = parseMoney("50 CAD");
      expect(result.amount).toBe(50);
      expect(result.currency).toBe("CAD");
    });

    test("should parse 'AUD 99.95'", () => {
      const result = parseMoney("AUD 99.95");
      expect(result.amount).toBe(99.95);
      expect(result.currency).toBe("AUD");
    });

    test("should parse 'JPY 5000'", () => {
      const result = parseMoney("JPY 5000");
      expect(result.amount).toBe(5000);
      expect(result.currency).toBe("JPY");
    });

    test("should parse 'CHF 150'", () => {
      const result = parseMoney("CHF 150");
      expect(result.amount).toBe(150);
      expect(result.currency).toBe("CHF");
    });

    test("should parse 'INR 2000'", () => {
      const result = parseMoney("INR 2000");
      expect(result.amount).toBe(2000);
      expect(result.currency).toBe("INR");
    });
  });

  describe("Worded Numbers", () => {
    test("should parse 'one hundred dollars'", () => {
      const result = parseMoney("one hundred dollars");
      expect(result.amount).toBe(100);
      expect(result.currency).toBe("USD");
    });

    test("should parse 'fifty euros'", () => {
      const result = parseMoney("fifty euros");
      expect(result.amount).toBe(50);
      expect(result.currency).toBe("EUR");
    });

    test("should parse 'twenty-five pounds'", () => {
      const result = parseMoney("twenty-five pounds");
      expect(result.amount).toBe(25);
      expect(result.currency).toBe("GBP");
    });

    test("should parse 'five hundred yen'", () => {
      const result = parseMoney("five hundred yen");
      expect(result.amount).toBe(500);
      expect(result.currency).toBe("JPY");
    });

    test("should parse 'three thousand dollars'", () => {
      const result = parseMoney("three thousand dollars");
      expect(result.amount).toBe(3000);
      expect(result.currency).toBe("USD");
    });

    test("should parse 'two million euros'", () => {
      const result = parseMoney("two million euros");
      expect(result.amount).toBe(2000000);
      expect(result.currency).toBe("EUR");
    });

    test("should parse 'one billion dollars'", () => {
      const result = parseMoney("one billion dollars");
      expect(result.amount).toBe(1000000000);
      expect(result.currency).toBe("USD");
    });

    test("should parse 'five hundred thousand pounds'", () => {
      const result = parseMoney("five hundred thousand pounds");
      expect(result.amount).toBe(500000);
      expect(result.currency).toBe("GBP");
    });
  });

  describe("Fractional Worded Numbers", () => {
    test("should parse 'half a million dollars'", () => {
      const result = parseMoney("half a million dollars");
      expect(result.amount).toBe(500000);
      expect(result.currency).toBe("USD");
    });

    test("should parse 'quarter million euros'", () => {
      const result = parseMoney("quarter million euros");
      expect(result.amount).toBe(250000);
      expect(result.currency).toBe("EUR");
    });

    test("should parse 'half a billion pounds'", () => {
      const result = parseMoney("half a billion pounds");
      expect(result.amount).toBe(500000000);
      expect(result.currency).toBe("GBP");
    });

    test("should parse 'two thirds of a million dollars'", () => {
      const result = parseMoney("two thirds of a million dollars");
      expect(result.amount).toBeCloseTo(666666.67, 2);
      expect(result.currency).toBe("USD");
    });

    test("should parse 'three quarters of a billion euros'", () => {
      const result = parseMoney("three quarters of a billion euros");
      expect(result.amount).toBe(750000000);
      expect(result.currency).toBe("EUR");
    });
  });

  describe("Slang Terms", () => {
    test("should parse '20 bucks'", () => {
      const result = parseMoney("20 bucks");
      expect(result.amount).toBe(20);
      expect(result.currency).toBe("USD");
    });

    test("should parse 'fifty quid'", () => {
      const result = parseMoney("fifty quid");
      expect(result.amount).toBe(50);
      expect(result.currency).toBe("GBP");
    });

    test("should parse 'a fiver'", () => {
      const result = parseMoney("a fiver");
      expect(result.amount).toBe(5);
      expect(result.currency).toBe("GBP");
    });

    test("should parse 'ten grand'", () => {
      const result = parseMoney("ten grand");
      expect(result.amount).toBe(10000);
      expect(result.currency).toBe("USD");
    });

    test("should parse 'half a million bucks'", () => {
      const result = parseMoney("half a million bucks");
      expect(result.amount).toBe(500000);
      expect(result.currency).toBe("USD");
    });

    test("should parse 'quarter million bucks'", () => {
      const result = parseMoney("quarter million bucks");
      expect(result.amount).toBe(250000);
      expect(result.currency).toBe("USD");
    });

    test("should parse 'two thirds of a million bucks'", () => {
      const result = parseMoney("two thirds of a million bucks");
      expect(result.amount).toBeCloseTo(666666.67, 2);
      expect(result.currency).toBe("USD");
    });

    test("should parse 'three thousand bucks'", () => {
      const result = parseMoney("three thousand bucks");
      expect(result.amount).toBe(3000);
      expect(result.currency).toBe("USD");
    });

    test("should parse 'a buck fifty'", () => {
      const result = parseMoney("a buck fifty");
      expect(result.amount).toBe(1.50);
      expect(result.currency).toBe("USD");
    });

    test("should parse 'two bucks fifty'", () => {
      const result = parseMoney("two bucks fifty");
      expect(result.amount).toBe(2.50);
      expect(result.currency).toBe("USD");
    });

    test("should parse 'five bucks'", () => {
      const result = parseMoney("five bucks");
      expect(result.amount).toBe(5);
      expect(result.currency).toBe("USD");
    });

    test("should parse 'a tenner'", () => {
      const result = parseMoney("a tenner");
      expect(result.amount).toBe(10);
      expect(result.currency).toBe("GBP");
    });

    test("should parse 'three fivers'", () => {
      const result = parseMoney("three fivers");
      expect(result.amount).toBe(15);
      expect(result.currency).toBe("GBP");
    });
  });

  describe("Numeric Combos (k, m, b)", () => {
    test("should parse '10k'", () => {
      const result = parseMoney("10k");
      expect(result.amount).toBe(10000);
    });

    test("should parse '$5k'", () => {
      const result = parseMoney("$5k");
      expect(result.amount).toBe(5000);
      expect(result.currency).toBe("USD");
    });

    test("should parse '2.5m dollars'", () => {
      const result = parseMoney("2.5m dollars");
      expect(result.amount).toBe(2500000);
      expect(result.currency).toBe("USD");
    });

    test("should parse '1.2 billion USD'", () => {
      const result = parseMoney("1.2 billion USD");
      expect(result.amount).toBe(1200000000);
      expect(result.currency).toBe("USD");
    });

    test("should parse '500k EUR'", () => {
      const result = parseMoney("500k EUR");
      expect(result.amount).toBe(500000);
      expect(result.currency).toBe("EUR");
    });

    test("should parse '100k'", () => {
      const result = parseMoney("100k");
      expect(result.amount).toBe(100000);
    });

    test("should parse '5m'", () => {
      const result = parseMoney("5m");
      expect(result.amount).toBe(5000000);
    });

    test("should parse '2.5bn USD'", () => {
      const result = parseMoney("2.5bn USD");
      expect(result.amount).toBe(2500000000);
      expect(result.currency).toBe("USD");
    });

    test("should parse '750k GBP'", () => {
      const result = parseMoney("750k GBP");
      expect(result.amount).toBe(750000);
      expect(result.currency).toBe("GBP");
    });

    test("should parse '1.5m CAD'", () => {
      const result = parseMoney("1.5m CAD");
      expect(result.amount).toBe(1500000);
      expect(result.currency).toBe("CAD");
    });
  });

  describe("Numbers with Separators", () => {
    test("should parse '1,234.56 USD'", () => {
      const result = parseMoney("1,234.56 USD");
      expect(result.amount).toBe(1234.56);
      expect(result.currency).toBe("USD");
    });

    test("should parse '$1,000,000'", () => {
      const result = parseMoney("$1,000,000");
      expect(result.amount).toBe(1000000);
      expect(result.currency).toBe("USD");
    });

    test("should parse '€2.500,00'", () => {
      const result = parseMoney("€2.500,00");
      expect(result.amount).toBe(2500.00);
      expect(result.currency).toBe("EUR");
    });

    test("should parse '£10,000.00'", () => {
      const result = parseMoney("£10,000.00");
      expect(result.amount).toBe(10000.00);
      expect(result.currency).toBe("GBP");
    });

    test("should parse '1'234.56 CHF'", () => {
      const result = parseMoney("1'234.56 CHF");
      expect(result.amount).toBe(1234.56);
      expect(result.currency).toBe("CHF");
    });

    test("should parse '$5,000'", () => {
      const result = parseMoney("$5,000");
      expect(result.amount).toBe(5000);
      expect(result.currency).toBe("USD");
    });

    test("should parse '€10,000'", () => {
      const result = parseMoney("€10,000");
      expect(result.amount).toBe(10000);
      expect(result.currency).toBe("EUR");
    });
  });

  describe("Contextual Phrases", () => {
    test("should parse 'The price is $49.99'", () => {
      const result = parseMoney("The price is $49.99");
      expect(result.amount).toBe(49.99);
      expect(result.currency).toBe("USD");
    });

    test("should parse 'I paid about €200 for it'", () => {
      const result = parseMoney("I paid about €200 for it");
      expect(result.amount).toBe(200);
      expect(result.currency).toBe("EUR");
    });

    test("should parse 'That costs around £50'", () => {
      const result = parseMoney("That costs around £50");
      expect(result.amount).toBe(50);
      expect(result.currency).toBe("GBP");
    });

    test("should parse 'My rent is $1,500 a month'", () => {
      const result = parseMoney("My rent is $1,500 a month");
      expect(result.amount).toBe(1500);
      expect(result.currency).toBe("USD");
    });

    test("should parse 'The budget is 2 million dollars'", () => {
      const result = parseMoney("The budget is 2 million dollars");
      expect(result.amount).toBe(2000000);
      expect(result.currency).toBe("USD");
    });

    test("should parse 'It cost me fifty dollars'", () => {
      const result = parseMoney("It cost me fifty dollars");
      expect(result.amount).toBe(50);
      expect(result.currency).toBe("USD");
    });

    test("should parse 'The total came to $99.99'", () => {
      const result = parseMoney("The total came to $99.99");
      expect(result.amount).toBe(99.99);
      expect(result.currency).toBe("USD");
    });

    test("should parse 'I spent about 200 euros'", () => {
      const result = parseMoney("I spent about 200 euros");
      expect(result.amount).toBe(200);
      expect(result.currency).toBe("EUR");
    });
  });

  describe("Fractions and Decimals", () => {
    test("should parse 'half a dollar'", () => {
      const result = parseMoney("half a dollar");
      expect(result.amount).toBe(0.5);
      expect(result.currency).toBe("USD");
    });

    test("should parse 'a quarter'", () => {
      const result = parseMoney("a quarter");
      expect(result.amount).toBe(0.25);
    });

    test("should parse '75 cents'", () => {
      const result = parseMoney("75 cents");
      expect(result.amount).toBe(0.75);
      expect(result.currency).toBe("USD");
    });

    test("should parse '$0.99'", () => {
      const result = parseMoney("$0.99");
      expect(result.amount).toBe(0.99);
      expect(result.currency).toBe("USD");
    });

    test("should parse 'a dollar fifty'", () => {
      const result = parseMoney("a dollar fifty");
      expect(result.amount).toBe(1.50);
      expect(result.currency).toBe("USD");
    });

    test("should parse 'half a euro'", () => {
      const result = parseMoney("half a euro");
      expect(result.amount).toBe(0.5);
      expect(result.currency).toBe("EUR");
    });

    test("should parse 'a quarter dollar'", () => {
      const result = parseMoney("a quarter dollar");
      expect(result.amount).toBe(0.25);
      expect(result.currency).toBe("USD");
    });
  });

  describe("Compound Expressions", () => {
    test("should parse '5 dollars and 50 cents'", () => {
      const result = parseMoney("5 dollars and 50 cents");
      expect(result.amount).toBe(5.50);
      expect(result.currency).toBe("USD");
    });

    test("should parse 'two pounds and 30 pence'", () => {
      const result = parseMoney("two pounds and 30 pence");
      expect(result.amount).toBe(2.30);
      expect(result.currency).toBe("GBP");
    });

    test("should parse 'a dollar and 23 cents'", () => {
      const result = parseMoney("a dollar and 23 cents");
      expect(result.amount).toBe(1.23);
      expect(result.currency).toBe("USD");
    });

    test("should parse 'ten dollars and fifty cents'", () => {
      const result = parseMoney("ten dollars and fifty cents");
      expect(result.amount).toBe(10.50);
      expect(result.currency).toBe("USD");
    });

    test("should parse 'a hundred dollars and 25 cents'", () => {
      const result = parseMoney("a hundred dollars and 25 cents");
      expect(result.amount).toBe(100.25);
      expect(result.currency).toBe("USD");
    });
  });

  describe("Minor Units Only", () => {
    test("should parse '50 cents'", () => {
      const result = parseMoney("50 cents");
      expect(result.amount).toBe(0.50);
      expect(result.currency).toBe("USD");
    });

    test("should parse '25 pence'", () => {
      const result = parseMoney("25 pence");
      expect(result.amount).toBe(0.25);
      expect(result.currency).toBe("GBP");
    });

    test("should parse '99 cents'", () => {
      const result = parseMoney("99 cents");
      expect(result.amount).toBe(0.99);
      expect(result.currency).toBe("USD");
    });

    test("should parse '10 cents'", () => {
      const result = parseMoney("10 cents");
      expect(result.amount).toBe(0.10);
      expect(result.currency).toBe("USD");
    });
  });

  describe("International Formats", () => {
    test("should parse 'R$150'", () => {
      const result = parseMoney("R$150");
      expect(result.amount).toBe(150);
      expect(result.currency).toBe("BRL");
    });

    test("should parse 'CHF 200'", () => {
      const result = parseMoney("CHF 200");
      expect(result.amount).toBe(200);
      expect(result.currency).toBe("CHF");
    });

    test("should parse 'kr 500'", () => {
      const result = parseMoney("kr 500");
      expect(result.amount).toBe(500);
      // Note: kr is ambiguous (could be SEK, NOK, DKK, ISK)
    });

    test("should parse 'Rs 1000'", () => {
      const result = parseMoney("Rs 1000");
      expect(result.amount).toBe(1000);
      // Note: Rs is ambiguous (could be INR, PKR, LKR, NPR)
    });

    test("should parse 'MX$250'", () => {
      const result = parseMoney("MX$250");
      expect(result.amount).toBe(250);
      expect(result.currency).toBe("MXN");
    });

    test("should parse '$1,234.56 USD'", () => {
      const result = parseMoney("$1,234.56 USD");
      expect(result.amount).toBe(1234.56);
      expect(result.currency).toBe("USD");
    });

    test("should parse '€1.234,56'", () => {
      const result = parseMoney("€1.234,56");
      expect(result.amount).toBe(1234.56);
      expect(result.currency).toBe("EUR");
    });
  });

  describe("Negative Numbers", () => {
    test("should parse '-$100'", () => {
      const result = parseMoney("-$100");
      expect(result.amount).toBe(-100);
      expect(result.currency).toBe("USD");
    });

    test("should parse '($50)'", () => {
      const result = parseMoney("($50)");
      expect(result.amount).toBe(-50);
      expect(result.currency).toBe("USD");
    });

    test("should parse '-100 USD'", () => {
      const result = parseMoney("-100 USD");
      expect(result.amount).toBe(-100);
      expect(result.currency).toBe("USD");
    });

    test("should parse '($1,234.56)'", () => {
      const result = parseMoney("($1,234.56)");
      expect(result.amount).toBe(-1234.56);
      expect(result.currency).toBe("USD");
    });
  });

  describe("Articles with Currency Names", () => {
    test("should parse 'a dollar'", () => {
      const result = parseMoney("a dollar");
      expect(result.amount).toBe(1);
      expect(result.currency).toBe("USD");
    });

    test("should parse 'a euro'", () => {
      const result = parseMoney("a euro");
      expect(result.amount).toBe(1);
      expect(result.currency).toBe("EUR");
    });

    test("should parse 'a pound'", () => {
      const result = parseMoney("a pound");
      expect(result.amount).toBe(1);
      expect(result.currency).toBe("GBP");
    });

    test("should parse 'a hundred dollars'", () => {
      const result = parseMoney("a hundred dollars");
      expect(result.amount).toBe(100);
      expect(result.currency).toBe("USD");
    });

    test("should parse 'a thousand euros'", () => {
      const result = parseMoney("a thousand euros");
      expect(result.amount).toBe(1000);
      expect(result.currency).toBe("EUR");
    });

    test("should parse 'a million pounds'", () => {
      const result = parseMoney("a million pounds");
      expect(result.amount).toBe(1000000);
      expect(result.currency).toBe("GBP");
    });
  });

  describe("Realistic Data Examples", () => {
    test("should parse 'Invoice total: $1,234.56'", () => {
      const result = parseMoney("Invoice total: $1,234.56");
      expect(result.amount).toBe(1234.56);
      expect(result.currency).toBe("USD");
    });

    test("should parse 'Balance: €500.00'", () => {
      const result = parseMoney("Balance: €500.00");
      expect(result.amount).toBe(500.00);
      expect(result.currency).toBe("EUR");
    });

    test("should parse 'Payment received: £250'", () => {
      const result = parseMoney("Payment received: £250");
      expect(result.amount).toBe(250);
      expect(result.currency).toBe("GBP");
    });

    test("should parse 'Transaction: 99.99 USD'", () => {
      const result = parseMoney("Transaction: 99.99 USD");
      expect(result.amount).toBe(99.99);
      expect(result.currency).toBe("USD");
    });

    test("should parse 'Amount due: 750 CAD'", () => {
      const result = parseMoney("Amount due: 750 CAD");
      expect(result.amount).toBe(750);
      expect(result.currency).toBe("CAD");
    });

    test("should parse 'Refund amount: $45.00'", () => {
      const result = parseMoney("Refund amount: $45.00");
      expect(result.amount).toBe(45.00);
      expect(result.currency).toBe("USD");
    });

    test("should parse 'Deposit: £1,000'", () => {
      const result = parseMoney("Deposit: £1,000");
      expect(result.amount).toBe(1000);
      expect(result.currency).toBe("GBP");
    });

    test("should parse 'Withdrawal: $500'", () => {
      const result = parseMoney("Withdrawal: $500");
      expect(result.amount).toBe(500);
      expect(result.currency).toBe("USD");
    });

    test("should parse 'Credit: 250 EUR'", () => {
      const result = parseMoney("Credit: 250 EUR");
      expect(result.amount).toBe(250);
      expect(result.currency).toBe("EUR");
    });

    test("should parse 'Debit: $75.50'", () => {
      const result = parseMoney("Debit: $75.50");
      expect(result.amount).toBe(75.50);
      expect(result.currency).toBe("USD");
    });
  });

  describe("Mixed Case and Spacing", () => {
    test("should parse 'FIFTY DOLLARS'", () => {
      const result = parseMoney("FIFTY DOLLARS");
      expect(result.amount).toBe(50);
      expect(result.currency).toBe("USD");
    });

    test("should parse 'Twenty   Bucks'", () => {
      const result = parseMoney("Twenty   Bucks");
      expect(result.amount).toBe(20);
      expect(result.currency).toBe("USD");
    });

    test("should parse '  $100  '", () => {
      const result = parseMoney("  $100  ");
      expect(result.amount).toBe(100);
      expect(result.currency).toBe("USD");
    });

    test("should parse '100 dollars'", () => {
      const result = parseMoney("100 dollars");
      expect(result.amount).toBe(100);
      expect(result.currency).toBe("USD");
    });
  });

  describe("Currency Names", () => {
    test("should parse 'fifty dollars'", () => {
      const result = parseMoney("fifty dollars");
      expect(result.amount).toBe(50);
      expect(result.currency).toBe("USD");
    });

    test("should parse 'twenty euros'", () => {
      const result = parseMoney("twenty euros");
      expect(result.amount).toBe(20);
      expect(result.currency).toBe("EUR");
    });

    test("should parse 'ten pounds'", () => {
      const result = parseMoney("ten pounds");
      expect(result.amount).toBe(10);
      expect(result.currency).toBe("GBP");
    });

    test("should parse 'five yen'", () => {
      const result = parseMoney("five yen");
      expect(result.amount).toBe(5);
      expect(result.currency).toBe("JPY");
    });

    test("should parse 'hundred rupees'", () => {
      const result = parseMoney("hundred rupees");
      expect(result.amount).toBe(100);
      expect(result.currency).toBe("INR");
    });
  });
});
