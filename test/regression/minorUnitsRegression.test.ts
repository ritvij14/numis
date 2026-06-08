import { matchMinorUnitOnly } from "../../src/patterns/minorUnitsOnly";

describe("regression checks for standalone minor units", () => {
  // simple single-word amounts
  test('"one cent" matches', () => {
    const result = matchMinorUnitOnly("one cent");
    expect(result).not.toBeNull();
    expect(result!.value).toBeCloseTo(0.01);
    expect(result!.currency).toBe("USD");
  });

  test('"four cents" matches', () => {
    const result = matchMinorUnitOnly("four cents");
    expect(result).not.toBeNull();
    expect(result!.value).toBeCloseTo(0.04);
  });

  test('"seventeen pence" matches', () => {
    const result = matchMinorUnitOnly("seventeen pence");
    expect(result).not.toBeNull();
    expect(result!.value).toBeCloseTo(0.17);
    expect(result!.currency).toBe("GBP");
  });

  test('"twenty cents" matches', () => {
    const result = matchMinorUnitOnly("twenty cents");
    expect(result).not.toBeNull();
    expect(result!.value).toBeCloseTo(0.2);
  });

  test('"twenty-one cents" matches', () => {
    const result = matchMinorUnitOnly("twenty-one cents");
    expect(result).not.toBeNull();
    expect(result!.value).toBeCloseTo(0.21);
  });

  test('"ninety-nine pennies" matches', () => {
    const result = matchMinorUnitOnly("ninety-nine pennies");
    expect(result).not.toBeNull();
    expect(result!.value).toBeCloseTo(0.99);
  });

  // embedded cases
  test('"found one cent" matches', () => {
    const result = matchMinorUnitOnly("I found one cent");
    expect(result).not.toBeNull();
    expect(result!.value).toBeCloseTo(0.01);
  });

  test('"have four cents" matches', () => {
    const result = matchMinorUnitOnly("You have four cents");
    expect(result).not.toBeNull();
    expect(result!.value).toBeCloseTo(0.04);
  });

  test('"exactly seventeen pence today" matches', () => {
    const result = matchMinorUnitOnly("exactly seventeen pence today");
    expect(result).not.toBeNull();
    expect(result!.value).toBeCloseTo(0.17);
  });

  test('"a cent" matches (article treated as one)', () => {
    const result = matchMinorUnitOnly("a cent");
    expect(result).not.toBeNull();
    expect(result!.value).toBeCloseTo(0.01);
    expect(result!.currency).toBe("USD");
  });

  test('"a penny" matches', () => {
    const result = matchMinorUnitOnly("a penny");
    expect(result).not.toBeNull();
    expect(result!.value).toBeCloseTo(0.01);
    expect(result!.currency).toBe("GBP");
  });

  test('"two cents" matches', () => {
    const result = matchMinorUnitOnly("two cents");
    expect(result).not.toBeNull();
    expect(result!.value).toBeCloseTo(0.02);
  });

  test('"three pence" matches', () => {
    const result = matchMinorUnitOnly("three pence");
    expect(result).not.toBeNull();
    expect(result!.value).toBeCloseTo(0.03);
  });

  test('"five cents" matches', () => {
    const result = matchMinorUnitOnly("five cents");
    expect(result).not.toBeNull();
    expect(result!.value).toBeCloseTo(0.05);
  });

  test('"six pennies" matches', () => {
    const result = matchMinorUnitOnly("six pennies");
    expect(result).not.toBeNull();
    expect(result!.value).toBeCloseTo(0.06);
  });

  test('"half cent" returns null ("half" is parseWordedNumber fraction, 0.5 < 100, valid?)', () => {
    // parseWordedNumber("half") throws because "half" is not in BASIC_NUMBERS/TENS/SCALES.
    // parseAmount would try parseWordedNumber and catch -> null, so no match.
    const result = matchMinorUnitOnly("half cent");
    expect(result).toBeNull();
  });

  test('"quarter cent" returns null', () => {
    const result = matchMinorUnitOnly("quarter cent");
    expect(result).toBeNull();
  });

  test('compound in sentence with worded number', () => {
    const result = matchMinorUnitOnly("give me twenty five cents");
    expect(result).not.toBeNull();
    expect(result!.value).toBeCloseTo(0.25);
  });
});
