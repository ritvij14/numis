import { parseMoney } from "numis";
import { useEffect, useState } from "react";
import "../style.css";
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
    <div id="app">
      <ExamplePrompts onSelect={setText} />

      <div className="options-row">
        <div className="option-group">
          <label htmlFor="default-currency">Default Currency</label>
          <select
            id="default-currency"
            value={defaultCurrency}
            onChange={(e) => setDefaultCurrency(e.target.value)}
          >
            {COMMON_CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <label htmlFor="input">Input text</label>
      <textarea
        id="input"
        placeholder="e.g. The total cost is $123.45 or about €110"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <h2>Result</h2>
      {wasDefaulted && (
        <div className="currency-indicator defaulted">
          Currency "{resultObj.currency}" was applied from default (not detected in text)
        </div>
      )}
      {resultObj?.currency && !wasDefaulted && (
        <div className="currency-indicator detected">
          Currency "{resultObj.currency}" was detected in the text
        </div>
      )}
      <pre id="output">{result}</pre>
    </div>
  );
}
