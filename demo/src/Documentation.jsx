import { parseMoney } from "numis";
import { useState } from "react";

/**
 * Documentation - ELI5 guide for using parseMoney()
 */
export default function Documentation() {
  const [example1, setExample1] = useState("The price is $49.99");
  const [example2, setExample2] = useState("I have 100");
  const [defaultCurrency, setDefaultCurrency] = useState("USD");

  const result1 = parseMoney(example1);
  const result2WithDefault = parseMoney(example2, { defaultCurrency });
  const result2WithoutDefault = parseMoney(example2);

  return (
    <div className="max-w-[800px] mx-auto py-4">
      <hr className="my-12 border-0 border-t-2 border-gray-200" />
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        How to Use numis
      </h2>
      <p className="text-lg text-gray-500 mb-8 leading-relaxed">
        numis helps you extract money amounts from text. It's like teaching your
        code to read prices the way humans do.
      </p>

      {/* Step 1: Installation */}
      <section className="mb-12 pb-8 border-b border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Step 1: Install the Package
        </h3>
        <p className="text-gray-600 leading-relaxed mb-4">
          First, add numis to your project:
        </p>
        <pre className="bg-gray-800 text-gray-100 p-4 rounded-md overflow-x-auto font-mono text-sm leading-6 my-4">{`npm install numis`}</pre>
      </section>

      {/* Step 2: Basic Usage */}
      <section className="mb-12 pb-8 border-b border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Step 2: Parse Your First Money Amount
        </h3>
        <p className="text-gray-600 leading-relaxed mb-4">
          Import{" "}
          <code className="bg-gray-100 px-2 py-0.5 rounded text-gray-800 font-mono text-sm">
            parseMoney
          </code>{" "}
          and pass it any text containing money:
        </p>

        <div>
          <pre className="bg-gray-800 text-gray-100 p-4 max-md:max-w-[90vw] rounded-md overflow-x-auto font-mono text-sm leading-6 my-4">{`import { parseMoney } from "numis";

const result = parseMoney("The price is $49.99");
console.log(result);
// Output: { original: "The price is $49.99", currency: "USD", amount: 49.99 }`}</pre>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg mt-4">
          <input
            type="text"
            value={example1}
            onChange={(e) => setExample1(e.target.value)}
            placeholder="Enter text with money..."
            className="w-full p-3 text-base border border-gray-300 rounded-md mb-4 font-mono"
          />
          <div className="bg-white p-4 rounded-md border border-gray-200">
            <strong className="block mb-2 text-gray-700">Result:</strong>
            <pre className="m-0 bg-gray-800 text-gray-100 p-3 rounded text-sm overflow-x-auto">
              {JSON.stringify(result1, null, 2)}
            </pre>
          </div>
        </div>
      </section>

      {/* Step 3: Understanding the Output */}
      <section className="mb-12 pb-8 border-b border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Step 3: Understanding What You Get Back
        </h3>
        <p className="text-gray-600 leading-relaxed mb-4">
          The{" "}
          <code className="bg-gray-100 px-2 py-0.5 rounded text-gray-800 font-mono text-sm">
            parseMoney()
          </code>{" "}
          function returns an object with three main properties:
        </p>

        <div className="bg-gray-50 p-6 rounded-lg mt-4">
          <div className="grid grid-cols-[auto_auto_1fr] gap-3 items-center py-3 border-b border-gray-200">
            <code className="bg-blue-600 text-white px-2 py-1 rounded font-semibold text-sm">
              original
            </code>
            <span className="text-gray-400 text-xl">→</span>
            <span className="text-gray-600 text-sm">
              The exact text you passed in
            </span>
          </div>
          <div className="grid grid-cols-[auto_auto_1fr] gap-3 items-center py-3 border-b border-gray-200">
            <code className="bg-blue-600 text-white px-2 py-1 rounded font-semibold text-sm">
              currency
            </code>
            <span className="text-gray-400 text-xl">→</span>
            <span className="text-gray-600 text-sm">
              The currency code (like "USD", "EUR", "GBP")
            </span>
          </div>
          <div className="grid grid-cols-[auto_auto_1fr] gap-3 items-center py-3">
            <code className="bg-blue-600 text-white px-2 py-1 rounded font-semibold text-sm">
              amount
            </code>
            <span className="text-gray-400 text-xl">→</span>
            <span className="text-gray-600 text-sm">
              The number value (like 49.99)
            </span>
          </div>
        </div>
      </section>

      {/* Step 4: Default Currency */}
      <section className="mb-12 pb-8 border-b border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Step 4: Handling Text Without Currency Symbols
        </h3>
        <p className="text-gray-600 leading-relaxed mb-4">
          Sometimes your text has a number but no $ or € symbol. You can provide
          a fallback currency:
        </p>

        <pre className="bg-gray-800 text-gray-100 p-4 rounded-md max-md:max-w-[90vw] overflow-x-auto font-mono text-sm leading-6 my-4">{`// Without a default - currency will be undefined
parseMoney("I have 100");
// => { original: "I have 100", amount: 100, currency: undefined }

// With a default - uses your fallback currency
parseMoney("I have 100", { defaultCurrency: "USD" });
// => { original: "I have 100", amount: 100, currency: "USD", currencyWasDefault: true }`}</pre>

        <div className="bg-gray-50 p-6 rounded-lg mt-4">
          <h4 className="text-gray-700 my-6 text-base">Try it yourself:</h4>
          <div className="flex flex-col gap-4 mb-4">
            <input
              type="text"
              value={example2}
              onChange={(e) => setExample2(e.target.value)}
              placeholder="Enter text with just a number..."
              className="w-full p-3 text-base border border-gray-300 rounded-md font-mono"
            />
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700 font-medium">
                Default Currency:
              </label>
              <select
                value={defaultCurrency}
                onChange={(e) => setDefaultCurrency(e.target.value)}
                className="py-2 px-2 border border-gray-300 rounded text-sm"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="JPY">JPY</option>
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
            <div className="bg-white p-4 rounded-md border border-gray-200">
              <strong className="block mb-2 text-gray-700">
                Without default:
              </strong>
              <pre className="m-0 bg-gray-800 text-gray-100 p-3 rounded text-sm overflow-x-auto">
                {JSON.stringify(result2WithoutDefault, null, 2)}
              </pre>
            </div>
            <div className="bg-white p-4 rounded-md border border-gray-200">
              <strong className="block mb-2 text-gray-700">
                With default ({defaultCurrency}):
              </strong>
              <pre className="m-0 bg-gray-800 text-gray-100 p-3 rounded text-sm overflow-x-auto">
                {JSON.stringify(result2WithDefault, null, 2)}
              </pre>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded mt-4 text-blue-900 text-sm">
          <strong className="block mb-1">💡 Note:</strong> When{" "}
          <code className="bg-blue-100 px-2 py-0.5 rounded text-blue-900 font-mono text-xs">
            currencyWasDefault
          </code>{" "}
          is{" "}
          <code className="bg-blue-100 px-2 py-0.5 rounded text-blue-900 font-mono text-xs">
            true
          </code>
          , it means the parser used your fallback currency instead of finding
          one in the text.
        </div>
      </section>

      {/* Step 5: What It Can Parse */}
      <section className="mb-12 pb-8 border-b border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Step 5: All the Ways to Write Money
        </h3>
        <p className="text-gray-600 leading-relaxed mb-4">
          numis understands money written in many different formats:
        </p>

        <div className="grid md:grid-cols-2 grid-cols-1 gap-4 mt-4">
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
            <h5 className="text-blue-600 text-sm font-semibold uppercase tracking-wide mb-2">
              Currency Symbols
            </h5>
            <code className="inline-block my-1 mr-1 bg-gray-200 px-2 py-1 rounded text-sm">
              $100
            </code>
            ,{" "}
            <code className="inline-block my-1 mr-1 bg-gray-200 px-2 py-1 rounded text-sm">
              €50
            </code>
            ,{" "}
            <code className="inline-block my-1 mr-1 bg-gray-200 px-2 py-1 rounded text-sm">
              £25.99
            </code>
          </div>
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
            <h5 className="text-blue-600 text-sm font-semibold uppercase tracking-wide mb-2">
              Currency Codes
            </h5>
            <code className="inline-block my-1 mr-1 bg-gray-200 px-2 py-1 rounded text-sm">
              USD 100
            </code>
            ,{" "}
            <code className="inline-block my-1 mr-1 bg-gray-200 px-2 py-1 rounded text-sm">
              50 EUR
            </code>
            ,{" "}
            <code className="inline-block my-1 mr-1 bg-gray-200 px-2 py-1 rounded text-sm">
              100 GBP
            </code>
          </div>
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
            <h5 className="text-blue-600 text-sm font-semibold uppercase tracking-wide mb-2">
              Words
            </h5>
            <code className="inline-block my-1 mr-1 bg-gray-200 px-2 py-1 rounded text-sm">
              one hundred dollars
            </code>
            ,{" "}
            <code className="inline-block my-1 mr-1 bg-gray-200 px-2 py-1 rounded text-sm">
              fifty euros
            </code>
          </div>
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
            <h5 className="text-blue-600 text-sm font-semibold uppercase tracking-wide mb-2">
              Abbreviations
            </h5>
            <code className="inline-block my-1 mr-1 bg-gray-200 px-2 py-1 rounded text-sm">
              $10k
            </code>
            ,{" "}
            <code className="inline-block my-1 mr-1 bg-gray-200 px-2 py-1 rounded text-sm">
              €2.5m
            </code>
            ,{" "}
            <code className="inline-block my-1 mr-1 bg-gray-200 px-2 py-1 rounded text-sm">
              1 billion USD
            </code>
          </div>
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
            <h5 className="text-blue-600 text-sm font-semibold uppercase tracking-wide mb-2">
              Slang
            </h5>
            <code className="inline-block my-1 mr-1 bg-gray-200 px-2 py-1 rounded text-sm">
              20 bucks
            </code>
            ,{" "}
            <code className="inline-block my-1 mr-1 bg-gray-200 px-2 py-1 rounded text-sm">
              fifty quid
            </code>
            ,{" "}
            <code className="inline-block my-1 mr-1 bg-gray-200 px-2 py-1 rounded text-sm">
              a fiver
            </code>
          </div>
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
            <h5 className="text-blue-600 text-sm font-semibold uppercase tracking-wide mb-2">
              Compound Amounts
            </h5>
            <code className="inline-block my-1 mr-1 bg-gray-200 px-2 py-1 rounded text-sm">
              5 dollars and 50 cents
            </code>
          </div>
        </div>
      </section>

      {/* Step 6: Common Mistakes */}
      <section className="mb-12 pb-8 border-b border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Step 6: Things to Watch Out For
        </h3>

        <div className="flex flex-col gap-6 mt-4">
          <div className="bg-amber-50 border-2 border-amber-400 p-6 rounded-lg">
            <div className="text-lg font-semibold text-amber-900 mb-3">
              ⚠️ Really Big Numbers
            </div>
            <p className="text-amber-900 mb-3">
              JavaScript can't handle numbers over 9 quadrillion safely. If your
              number is too big, numis will throw an error instead of giving you
              wrong data.
            </p>
            <pre className="bg-gray-800 text-gray-100 p-3 rounded text-sm leading-6 overflow-x-auto font-mono">{`import { ValueOverflowError } from "numis";

try {
  parseMoney("$999999999999999999");
} catch (err) {
  if (err instanceof ValueOverflowError) {
    console.log("Number too large!");
  }
}`}</pre>
          </div>
        </div>
      </section>

      {/* Step 7: Real Examples */}
      <section className="mb-12 max-md:max-w-[90vw] pb-8 border-b border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Step 7: Real-World Use Cases
        </h3>

        <div className="flex flex-col gap-6 mt-4">
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h5 className="text-blue-600 mb-3 text-base">
              📝 Processing User Input
            </h5>
            <pre className="bg-gray-800 max-md:max-w-[90vw] text-gray-100 p-3 rounded text-sm leading-6 overflow-x-auto font-mono">{`// In a form where users enter prices
const userInput = getUserInput();
const parsed = parseMoney(userInput, { defaultCurrency: "USD" });

if (parsed.amount) {
  saveToDatabase(parsed.amount, parsed.currency);
}`}</pre>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h5 className="text-blue-600 mb-3 text-base">
              💬 Extracting Prices from Messages
            </h5>
            <pre className="bg-gray-800 max-md:max-w-[90vw] text-gray-100 p-3 rounded text-sm leading-6 overflow-x-auto font-mono">{`// Parse messages from customers
const message = "I want to pay $50 for this item";
const { amount, currency } = parseMoney(message);
// amount: 50, currency: "USD"`}</pre>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h5 className="text-blue-600 mb-3 text-base">
              🌍 International Prices
            </h5>
            <pre className="bg-gray-800 max-md:max-w-[90vw] text-gray-100 p-3 rounded text-sm leading-6 overflow-x-auto font-mono">{`// Handle different currencies automatically
parseMoney("€100").currency;  // "EUR"
parseMoney("£100").currency;  // "GBP"
parseMoney("¥100").currency;  // "JPY"`}</pre>
          </div>
        </div>
      </section>

      {/* Quick Reference */}
      <section className="mb-12 pb-8 border-b-0 max-md:max-w-[90vw]">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Quick Reference
        </h3>
        <div className="bg-gray-50 p-6 rounded-lg mt-4">
          <h4 className="text-gray-700 text-base my-6 first:mt-0">
            Function Signature
          </h4>
          <pre className="bg-gray-800 max-md:max-w-[90vw] text-gray-100 p-3 rounded text-sm leading-6 overflow-x-auto font-mono">{`parseMoney(text: string, options?: { defaultCurrency?: string })`}</pre>

          <h4 className="text-gray-700 text-base my-6">Returns</h4>
          <pre className="bg-gray-800 text-gray-100 p-3 rounded text-sm leading-6 overflow-x-auto font-mono">{`{
  original: string;
  currency?: string;
  amount?: number;
  currencyWasDefault?: boolean;
}`}</pre>
        </div>
      </section>
    </div>
  );
}
