import { parseMoney } from '../src/index';

describe('Cents-only parsing bug fix', () => {
  test('parseMoney("75 cents") returns 0.75 USD', () => {
    const result = parseMoney('75 cents');
    expect(result.amount).toBeCloseTo(0.75);
    expect(result.currency).toBe('USD');
  });

  test('parseMoney("25 cents") returns 0.25 USD', () => {
    const result = parseMoney('25 cents');
    expect(result.amount).toBeCloseTo(0.25);
    expect(result.currency).toBe('USD');
  });

  test('parseMoney("50 pence") returns 0.50 GBP', () => {
    const result = parseMoney('50 pence');
    expect(result.amount).toBeCloseTo(0.5);
    expect(result.currency).toBe('GBP');
  });

  test('parseMoney("99 pennies") returns 0.99 GBP', () => {
    const result = parseMoney('99 pennies');
    expect(result.amount).toBeCloseTo(0.99);
    expect(result.currency).toBe('GBP');
  });

  test('parseMoney("fifty cents") returns 0.50 USD', () => {
    const result = parseMoney('fifty cents');
    expect(result.amount).toBeCloseTo(0.5);
    expect(result.currency).toBe('USD');
  });

  test('parseMoney("1 cent") returns 0.01 USD', () => {
    const result = parseMoney('1 cent');
    expect(result.amount).toBeCloseTo(0.01);
    expect(result.currency).toBe('USD');
  });

  test('parseMoney("I found 75 cents") returns 0.75 USD', () => {
    const result = parseMoney('I found 75 cents');
    expect(result.amount).toBeCloseTo(0.75);
    expect(result.currency).toBe('USD');
  });
});
