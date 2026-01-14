import { parseMoney } from "numis";
import { useEffect, useState } from "react";
import "../style.css";
import Documentation from "./Documentation";
import ExamplePrompts from "./ExamplePrompts";

// Common currencies for the dropdown
const COMMON_CURRENCIES = [
  { code: "", label: "None (no default)" },
  { code: "USD", label: "USD - US Dollar" },
  { code: "EUR", label: "EUR - Euro" },
  { code: "GBP", label: "GBP - British Pound" },
  { code: "JPY", label: "JPY - Japanese Yen" },
  { code: "CHF", label: "CHF - Swiss Franc" },
  { code: "CAD", label: "CAD - Canadian Dollar" },
  { code: "AUD", label: "AUD - Australian Dollar" },
  { code: "INR", label: "INR - Indian Rupee" },
  { code: "CNY", label: "CNY - Chinese Yuan" },
  { code: "KRW", label: "KRW - South Korean Won" },
];

export default function App() {
  const [text, setText] = useState("");
  const [defaultCurrency, setDefaultCurrency] = useState("");
  const [result, setResult] = useState("(parsed JSON will appear here)");

  useEffect(() => {
    const handler = setTimeout(() => {
      if (!text.trim()) {
        setResult("(parsed JSON will appear here)");
        return;
      }
      try {
        const options = defaultCurrency ? { defaultCurrency } : undefined;
        const parsed = parseMoney(text, options) || null;
        setResult(JSON.stringify(parsed, null, 2));
      } catch (err) {
        setResult(`Error: ${err.message}`);
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [text, defaultCurrency]);

  // Check if the result shows a defaulted currency
  const resultObj = (() => {
    try {
      return JSON.parse(result);
    } catch {
      return null;
    }
  })();
  const wasDefaulted = resultObj?.currencyWasDefault === true;

  return (
    <div className="w-full max-w-4xl max-[400px]:max-w-[90vw]">
      <div className="mb-8 flex flex-col items-start gap-4 w-full">
        <h1 className="mb-0 text-3xl text-gray-800">numis</h1>
        <div className="flex items-center gap-4 flex-wrap max-w-full">
          <a
            href="https://www.npmjs.com/package/numis"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 no-underline text-sm font-medium border border-blue-600 rounded-md transition-all duration-150 inline-flex items-center justify-center h-[54px] px-6 shrink-0 whitespace-nowrap hover:bg-blue-600 hover:text-white"
          >
            View on npm →
          </a>
          <a
            href="https://www.producthunt.com/products/numis?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-numis"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center shrink-0"
          >
            <img
              alt="numis - Natural Language parser for monetary information | Product Hunt"
              src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1062232&theme=light&t=1768298124898"
              className="block w-[250px] h-[54px]"
            />
          </a>
        </div>
      </div>

      <div className="w-full">
        <ExamplePrompts onSelect={setText} />

        <div className="flex gap-4 mb-4">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="default-currency"
              className="block mb-1 font-medium text-gray-600 text-sm"
            >
              Default Currency
            </label>
            <select
              id="default-currency"
              value={defaultCurrency}
              onChange={(e) => setDefaultCurrency(e.target.value)}
              className="py-2 px-3 text-sm border border-gray-300 rounded bg-white text-gray-700 cursor-pointer min-w-[200px] hover:border-blue-600 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
            >
              {COMMON_CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <label htmlFor="input" className="block mb-1 font-medium text-gray-600">
          Input text
        </label>
        <textarea
          id="input"
          placeholder="e.g. The total cost is $123.45"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full min-h-[140px] font-mono text-base p-3 border border-gray-300 rounded resize-y"
        />

        <h2 className="text-xl mt-4">Result</h2>
        {wasDefaulted && (
          <div className="py-2 px-3 rounded text-sm mb-2 bg-amber-100 text-amber-900 border border-amber-300">
            Currency "{resultObj.currency}" was applied from default (not
            detected in text)
          </div>
        )}
        {resultObj?.currency && !wasDefaulted && (
          <div className="py-2 px-3 rounded text-sm mb-2 bg-emerald-100 text-emerald-900 border border-emerald-300">
            Currency "{resultObj.currency}" was detected in the text
          </div>
        )}
        <pre className="bg-gray-900 text-gray-100 p-4 mt-4 rounded overflow-x-auto font-mono text-sm">
          {result}
        </pre>
      </div>

      <Documentation />
    </div>
  );
}
