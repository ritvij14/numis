import { parseAll, parseMoney } from "numis";
import { useState } from "react";
import SyntaxHighlighter from "./SyntaxHighlighter";

export default function Documentation() {
  return (
    <div id="documentation" className="bg-white">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <h2 className="font-display text-2xl font-bold text-slate-900 sm:text-3xl mb-4">
          How to use numis
        </h2>
        <p className="max-w-2xl text-slate-500 mb-12">
          A quick guide from installation to advanced features. Everything you
          need to start parsing money from text.
        </p>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[280px_1fr]">
          {/* Sticky sidebar */}
          <aside className="hidden lg:block">
            <nav className="sticky top-20 space-y-1">
              {SIDEBAR_LINKS.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="block rounded-md px-3 py-1.5 text-sm font-medium text-slate-500 no-underline transition-colors hover:bg-slate-50 hover:text-slate-900"
                >
                  {s.label}
                </a>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <div className="space-y-16">
            <InstallSection />
            <BasicUsageSection />
            <OutputSection />
            <DefaultCurrencySection />
            <RangeSection />
            <ParseAllSection />
            <FormatsSection />
            <MistakesSection />
            <QuickRefSection />
          </div>
        </div>
      </div>
    </div>
  );
}

function InstallSection() {
  return (
    <section id="install">
      <h3 className="font-display text-xl font-semibold text-slate-900 mb-3">
        Install the package
      </h3>
      <p className="text-slate-500 mb-4 leading-relaxed">
        Add numis to your project with your preferred package manager:
      </p>
      <pre className="rounded-lg bg-slate-900 p-4 text-sm text-slate-100 font-mono leading-6 overflow-x-auto">
        npm install numis
      </pre>
    </section>
  );
}

function BasicUsageSection() {
  const [input, setInput] = useState("The price is $49.99");
  const result = parseMoney(input);

  return (
    <section id="basic-usage" className="border-t border-slate-100 pt-12">
      <h3 className="font-display text-xl font-semibold text-slate-900 mb-3">
        Parse your first amount
      </h3>
      <p className="text-slate-500 mb-4 leading-relaxed">
        Import <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono text-slate-700">parseMoney</code> and pass it any text containing money:
      </p>
      <pre className="rounded-lg bg-slate-900 p-4 text-sm text-slate-100 font-mono leading-6 overflow-x-auto mb-6">
{`import { parseMoney } from "numis";

const result = parseMoney("The price is $49.99");
// { original: "The price is $49.99", currency: "USD", amount: 49.99 }`}
      </pre>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-6">
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
          Try it
        </label>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="mb-4 w-full rounded-md border border-slate-200 bg-white p-3 text-sm font-mono text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200"
        />
        <div className="rounded-md border border-slate-200 bg-white p-3">
          <SyntaxHighlighter data={result} variant="light" />
        </div>
      </div>
    </section>
  );
}

function OutputSection() {
  return (
    <section id="output" className="border-t border-slate-100 pt-12">
      <h3 className="font-display text-xl font-semibold text-slate-900 mb-3">
        Understanding the output
      </h3>
      <p className="text-slate-500 mb-4 leading-relaxed">
        <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono text-slate-700">parseMoney()</code> returns an object with these fields:
      </p>

      <div className="overflow-hidden rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                Property
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                Description
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr>
              <td className="px-4 py-3 font-mono text-xs text-slate-700">original</td>
              <td className="px-4 py-3 text-xs text-slate-500">string</td>
              <td className="px-4 py-3 text-slate-600">The input text you passed</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-mono text-xs text-slate-700">amount</td>
              <td className="px-4 py-3 text-xs text-slate-500">number | undefined</td>
              <td className="px-4 py-3 text-slate-600">The numeric value (undefined for ranges)</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-mono text-xs text-slate-700">currency</td>
              <td className="px-4 py-3 text-xs text-slate-500">string | undefined</td>
              <td className="px-4 py-3 text-slate-600">ISO-4217 code (e.g. "USD", "EUR")</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-mono text-xs text-slate-700">currencyWasDefault</td>
              <td className="px-4 py-3 text-xs text-slate-500">boolean</td>
              <td className="px-4 py-3 text-slate-600">True if currency came from defaultCurrency option</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-mono text-xs text-slate-700">isNegative</td>
              <td className="px-4 py-3 text-xs text-slate-500">boolean</td>
              <td className="px-4 py-3 text-slate-600">True if a negative indicator was detected</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-mono text-xs text-slate-700">isRange</td>
              <td className="px-4 py-3 text-xs text-slate-500">boolean</td>
              <td className="px-4 py-3 text-slate-600">True if the result is a range expression</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-mono text-xs text-slate-700">min</td>
              <td className="px-4 py-3 text-xs text-slate-500">number | undefined</td>
              <td className="px-4 py-3 text-slate-600">Range minimum (only when isRange is true)</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-mono text-xs text-slate-700">max</td>
              <td className="px-4 py-3 text-xs text-slate-500">number | undefined</td>
              <td className="px-4 py-3 text-slate-600">Range maximum (only when isRange is true)</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}

function DefaultCurrencySection() {
  const [input, setInput] = useState("I have 100");
  const [dc, setDc] = useState("USD");
  const withDefault = parseMoney(input, { defaultCurrency: dc });
  const withoutDefault = parseMoney(input);

  return (
    <section id="default-currency" className="border-t border-slate-100 pt-12">
      <h3 className="font-display text-xl font-semibold text-slate-900 mb-3">
        Default currency fallback
      </h3>
      <p className="text-slate-500 mb-4 leading-relaxed">
        When text has no currency symbol, provide a fallback:
      </p>
      <pre className="rounded-lg bg-slate-900 p-4 text-sm text-slate-100 font-mono leading-6 overflow-x-auto mb-6">
{`// Without default — currency is undefined
parseMoney("I have 100");
// => { original: "I have 100", amount: 100, currency: undefined }

// With default — uses your fallback
parseMoney("I have 100", { defaultCurrency: "USD" });
// => { original: "I have 100", amount: 100, currency: "USD", currencyWasDefault: true }`}
      </pre>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 rounded-md border border-slate-200 bg-white p-3 text-sm font-mono text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200"
          />
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-slate-600">Default:</label>
            <select
              value={dc}
              onChange={(e) => setDc(e.target.value)}
              className="rounded-md border border-slate-200 bg-white py-2 pl-2 pr-6 text-sm text-slate-700 focus:outline-none"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="JPY">JPY</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-md border border-slate-200 bg-white p-3">
            <span className="mb-2 block text-xs font-medium text-slate-500">Without default</span>
            <SyntaxHighlighter data={withoutDefault} variant="light" />
          </div>
          <div className="rounded-md border border-slate-200 bg-white p-3">
            <span className="mb-2 block text-xs font-medium text-slate-500">With default ({dc})</span>
            <SyntaxHighlighter data={withDefault} variant="light" />
          </div>
        </div>
      </div>
    </section>
  );
}

function RangeSection() {
  const [input, setInput] = useState("$500 to $1000");
  const result = parseMoney(input);

  return (
    <section id="ranges" className="border-t border-slate-100 pt-12">
      <h3 className="font-display text-xl font-semibold text-slate-900 mb-3">
        Range parsing
      </h3>
      <p className="text-slate-500 mb-4 leading-relaxed">
        numis detects monetary ranges with multiple separator styles. When a
        range is found, <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono text-slate-700">isRange</code> is true and <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono text-slate-700">amount</code> is undefined.
      </p>
      <pre className="rounded-lg bg-slate-900 p-4 text-sm text-slate-100 font-mono leading-6 overflow-x-auto mb-6">
{`parseMoney("$500 to $1000");
// => { isRange: true, min: 500, max: 1000, currency: "USD" }

parseMoney("between 50 and 100 euros");
// => { isRange: true, min: 50, max: 100, currency: "EUR" }

parseMoney("< 30k");
// => { isRange: true, min: null, max: 30000, currency: undefined }`}
      </pre>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-6">
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
          Try a range
        </label>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="mb-4 w-full rounded-md border border-slate-200 bg-white p-3 text-sm font-mono text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200"
        />
        <div className="rounded-md border border-slate-200 bg-white p-3">
          <SyntaxHighlighter data={result} variant="light" />
        </div>
      </div>
    </section>
  );
}

function ParseAllSection() {
  const [input, setInput] = useState(
    "Price is $50 - $100 or $500 and under 1k"
  );
  const result = parseAll(input);

  return (
    <section id="parse-all" className="border-t border-slate-100 pt-12">
      <h3 className="font-display text-xl font-semibold text-slate-900 mb-3">
        Find all expressions in text
      </h3>
      <p className="text-slate-500 mb-4 leading-relaxed">
        Use <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono text-slate-700">parseAll()</code> to extract every monetary expression from a string,
        including ranges. Each result includes its position in the original text.
      </p>
      <pre className="rounded-lg bg-slate-900 p-4 text-sm text-slate-100 font-mono leading-6 overflow-x-auto mb-6">
{`import { parseAll } from "numis";

const results = parseAll("Price is $50 - $100 or $500");
// [
//   { type: "range", raw: "$50 - $100", min: 50, max: 100, currency: "USD", startIndex: 9, endIndex: 19 },
//   { type: "single", raw: "$500", amount: 500, currency: "USD", startIndex: 23, endIndex: 27 }
// ]`}
      </pre>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-6">
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
          Try it
        </label>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="mb-4 w-full rounded-md border border-slate-200 bg-white p-3 text-sm font-mono text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200"
        />
        <div className="rounded-md border border-slate-200 bg-white p-3">
          <SyntaxHighlighter data={result} variant="light" />
        </div>
      </div>
    </section>
  );
}

function FormatsSection() {
  const formats = [
    { title: "Symbols", examples: ["$100", "€50", "£25.99", "¥1000", "₹500"] },
    { title: "ISO Codes", examples: ["USD 100", "50 EUR", "GBP 20.50"] },
    { title: "Words", examples: ["one hundred dollars", "fifty euros", "half a million"] },
    { title: "Abbreviations", examples: ["$10k", "€2.5m", "1 billion USD"] },
    { title: "Slang", examples: ["20 bucks", "fifty quid", "a fiver", "ten grand"] },
    { title: "Compounds", examples: ["5 dollars and 50 cents", "two pounds and 30 pence"] },
    { title: "Negative", examples: ["-$100", "($50)", "-€25.99"] },
    { title: "Ranges", examples: ["$10 - $20", "5k to 10k", "between 50 and 100 EUR"] },
  ];

  return (
    <section id="formats" className="border-t border-slate-100 pt-12">
      <h3 className="font-display text-xl font-semibold text-slate-900 mb-3">
        Supported formats
      </h3>
      <p className="text-slate-500 mb-6 leading-relaxed">
        numis understands money written in many different ways:
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {formats.map((f) => (
          <div
            key={f.title}
            className="rounded-xl border border-slate-200 bg-white p-4"
          >
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              {f.title}
            </h4>
            <div className="flex flex-wrap gap-1">
              {f.examples.map((ex) => (
                <code
                  key={ex}
                  className="rounded bg-slate-100 px-2 py-1 text-xs font-mono text-slate-700"
                >
                  {ex}
                </code>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function MistakesSection() {
  return (
    <section id="errors" className="border-t border-slate-100 pt-12">
      <h3 className="font-display text-xl font-semibold text-slate-900 mb-3">
        Error handling
      </h3>
      <p className="text-slate-500 mb-4 leading-relaxed">
        numis throws typed errors for invalid inputs. Always wrap calls in
        try/catch for user-provided strings.
      </p>
      <div className="space-y-4">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <h4 className="mb-2 text-sm font-semibold text-amber-900">
            ValueOverflowError
          </h4>
          <p className="mb-3 text-sm text-amber-800">
            Thrown when a number exceeds JavaScript’s safe integer limit.
          </p>
          <pre className="rounded bg-amber-100/60 p-3 text-xs font-mono text-amber-900 leading-5 overflow-x-auto">
{`import { ValueOverflowError } from "numis";

try {
  parseMoney("$999999999999999999");
} catch (err) {
  if (err instanceof ValueOverflowError) {
    console.log("Number too large!");
  }
}`}
          </pre>
        </div>
      </div>
    </section>
  );
}

function QuickRefSection() {
  return (
    <section id="quick-ref" className="border-t border-slate-100 pt-12">
      <h3 className="font-display text-xl font-semibold text-slate-900 mb-3">
        Quick reference
      </h3>
      <div className="space-y-4">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            parseMoney signature
          </h4>
          <pre className="rounded bg-white border border-slate-200 p-3 text-sm font-mono text-slate-700 leading-6 overflow-x-auto">
{`parseMoney(
  text: string,
  options?: { defaultCurrency?: string }
)`}
          </pre>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            parseAll signature
          </h4>
          <pre className="rounded bg-white border border-slate-200 p-3 text-sm font-mono text-slate-700 leading-6 overflow-x-auto">
{`parseAll(text: string): MonetaryExpression[]`}
          </pre>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Return type
          </h4>
          <pre className="rounded bg-white border border-slate-200 p-3 text-sm font-mono text-slate-700 leading-6 overflow-x-auto">
{`{
  original: string;
  currency?: string;
  amount?: number;
  currencyWasDefault?: boolean;
  isNegative?: boolean;
  isRange?: boolean;
  min?: number;
  max?: number;
}`}
          </pre>
        </div>
      </div>
    </section>
  );
}

const SIDEBAR_LINKS = [
  { id: "install", label: "Install" },
  { id: "basic-usage", label: "Basic usage" },
  { id: "output", label: "Output format" },
  { id: "default-currency", label: "Default currency" },
  { id: "ranges", label: "Range parsing" },
  { id: "parse-all", label: "parseAll" },
  { id: "formats", label: "Supported formats" },
  { id: "errors", label: "Error handling" },
  { id: "quick-ref", label: "Quick reference" },
];
