import { beforeEach, describe, expect, jest, test } from "@jest/globals";

jest.mock("../src/currencyData", () => {
  const data = [
    {
      code: "EUR",
      number: "978",
      currency: "Euro",
      countries: ["EU"],
      digits: 2,
    },
    {
      code: "USD",
      number: "840",
      currency: "US Dollar",
      countries: ["US"],
      digits: 2,
    },
  ];
  const getAllCurrencies = jest.fn(() => data);
  const getCurrencyByCode = jest.fn((code: string) => {
    return data.find((c) => c.code === code) ?? null;
  });
  const getCurrencyByNumber = jest.fn();
  return { getAllCurrencies, getCurrencyByCode, getCurrencyByNumber };
});

beforeEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

describe("lazy initialization", () => {
  test("regexPipeline builds currency map lazily and caches", () => {
    jest.isolateModules(() => {
      const currencyData = require("../src/currencyData");

      // Note: Due to browser compatibility requirements, regexPipeline now imports
      // ranges.ts at top level, which transitively loads currencyData earlier than
      // before. So we check that it's only called once (not repeatedly).
      const { RegexPipeline } = require("../src/regexPipeline");

      const initialCalls = currencyData.getAllCurrencies.mock.calls.length;

      const pipeline = RegexPipeline.default();
      const res1 = pipeline.run("paid 5 euro");

      const afterFirst = currencyData.getAllCurrencies.mock.calls.length;
      expect(afterFirst).toBe(initialCalls + 1);
      expect(res1.currency).toBe("EUR");

      const res2 = pipeline.run("another 7 euro");
      expect(currencyData.getAllCurrencies).toHaveBeenCalledTimes(afterFirst);
      expect(res2.currency).toBe("EUR");
    });
  });

  test("contextualPhrases builds currency map lazily and caches", () => {
    jest.isolateModules(() => {
      const currencyData = require("../src/currencyData");
      const {
        matchContextualPhrase,
      } = require("../src/patterns/contextualPhrases");

      expect(currencyData.getAllCurrencies).not.toHaveBeenCalled();

      const res1 = matchContextualPhrase("1 euro");
      const afterFirst = currencyData.getAllCurrencies.mock.calls.length;
      expect(afterFirst).toBe(1);
      expect(res1?.currency).toBeDefined();

      const res2 = matchContextualPhrase("two euro");
      expect(currencyData.getAllCurrencies).toHaveBeenCalledTimes(afterFirst);
      expect(res2?.currency).toBeDefined();
    });
  });

  test("both regexPipeline and contextualPhrases share the same centralized currency map", () => {
    jest.isolateModules(() => {
      const currencyData = require("../src/currencyData");

      // Note: Due to browser compatibility, regexPipeline imports ranges at top level
      // which loads currencyData early. Check that subsequent calls share the cache.
      const { RegexPipeline } = require("../src/regexPipeline");
      const initialCalls = currencyData.getAllCurrencies.mock.calls.length;

      // First call from regex pipeline
      const pipeline = RegexPipeline.default();
      pipeline.run("paid 5 euro");
      const callsAfterPipeline = currencyData.getAllCurrencies.mock.calls.length;
      expect(callsAfterPipeline).toBe(initialCalls + 1);

      // Second call from contextual phrases - should NOT call getAllCurrencies again
      // because they share the centralized cache
      const {
        matchContextualPhrase,
      } = require("../src/patterns/contextualPhrases");
      matchContextualPhrase("1 euro");
      expect(currencyData.getAllCurrencies).toHaveBeenCalledTimes(callsAfterPipeline);
    });
  });
});
