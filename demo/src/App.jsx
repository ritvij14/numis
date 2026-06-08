import { parseMoney } from "numis";
import { useEffect, useState } from "react";
import "../style.css";
import Documentation from "./Documentation";
import ExamplePrompts from "./ExamplePrompts";
import SyntaxHighlighter from "./SyntaxHighlighter";

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
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (!text.trim()) {
        setResult(null);
        setError(null);
        return;
      }
      try {
        const options = defaultCurrency ? { defaultCurrency } : undefined;
        const parsed = parseMoney(text, options) || null;
        setResult(parsed);
        setError(null);
      } catch (err) {
        setResult(null);
        setError(err.message);
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [text, defaultCurrency]);

  const wasDefaulted = result?.currencyWasDefault === true;
  const isRange = result?.isRange === true;

  return (
    <div className="w-full">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-slate-200/60 bg-white/90">
        <div className="mx-auto flex h-14 items-center justify-between px-6 sm:px-10 md:px-16 lg:px-24">
          <a
            href="#"
            className="group flex items-center gap-2 font-display text-lg font-bold text-slate-900 no-underline"
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 28 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                width="28"
                height="28"
                rx="6"
                className="fill-slate-900 transition-colors group-hover:fill-slate-800"
              />
              <circle
                cx="14"
                cy="14"
                r="8"
                stroke="white"
                strokeWidth="1.5"
                strokeOpacity="0.15"
                className="logo-ring"
              />
              <path
                d="M10.5 19V13.2C10.5 11.1565 12.1565 9.5 14.2 9.5C16.2435 9.5 17.9 11.1565 17.9 13.2V19"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            numis
          </a>
          <div className="relative z-10 flex items-center gap-6 text-sm font-medium text-slate-500">
            <a
              href="#playground"
              className="relative z-10 no-underline transition-colors hover:text-slate-900"
            >
              Playground
            </a>
            <a
              href="#features"
              className="relative z-10 no-underline transition-colors hover:text-slate-900"
            >
              Features
            </a>
            <a
              href="#documentation"
              className="relative z-10 no-underline transition-colors hover:text-slate-900"
            >
              Documentation
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="mx-auto max-w-6xl px-4 pt-16 pb-12 sm:px-6 sm:pt-24 sm:pb-20 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600 mb-6">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          v1.0.3 — now with range parsing
        </div>
        <h1 className="font-display text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl mb-6">
          Parse money from
          <br />
          <span className="text-slate-500">natural language</span>
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-slate-500 leading-relaxed mb-8">
          Turn free-form text into structured monetary data. Symbols, ISO codes,
          slang, worded numbers, ranges, and more — all in one line of code.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <a
            href="https://www.npmjs.com/package/numis"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white no-underline shadow-sm transition-all hover:bg-slate-800"
          >
            npm
          </a>
          <a
            href="https://github.com/ritvij14/numis"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 no-underline shadow-sm transition-all hover:bg-slate-50"
          >
            GitHub
          </a>
        </div>
      </header>

      {/* Playground */}
      <section
        id="playground"
        className="mx-auto max-w-6xl px-4 sm:px-6 pb-16 sm:pb-24"
      >
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {/* Playground toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 sm:px-6">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <span className="h-2 w-2 rounded-full bg-slate-300" />
              Live Playground
            </div>
            <div className="flex items-center gap-3">
              <label className="text-xs font-medium text-slate-500">
                Default currency
              </label>
              <select
                value={defaultCurrency}
                onChange={(e) => setDefaultCurrency(e.target.value)}
                className="rounded-md border border-slate-200 bg-white py-1.5 pl-3 pr-8 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200"
              >
                {COMMON_CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Side-by-side layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Input side */}
            <div className="flex flex-col border-b border-slate-100 lg:border-b-0 lg:border-r">
              <div className="px-4 pt-4 sm:px-6">
                <ExamplePrompts onSelect={setText} />
              </div>
              <label className="sr-only" htmlFor="input">
                Input text
              </label>
              <textarea
                id="input"
                placeholder="e.g. The total cost is $123.45 (max 5000 characters)"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-[200px] w-full resize-y border-0 bg-transparent p-4 sm:px-6 text-sm font-mono leading-relaxed text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-0"
              />
            </div>

            {/* Output side */}
            <div className="flex flex-col bg-slate-900">
              <div className="flex items-center justify-between px-4 py-2.5 sm:px-6 border-b border-slate-800">
                <span className="text-xs font-medium text-slate-400">
                  Result
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  JSON
                </span>
              </div>
              <div className="flex-1 p-4 sm:p-6 overflow-auto">
                {error ? (
                  <div className="rounded-md border border-red-800 bg-red-950/40 p-3">
                    <p className="text-sm font-medium text-red-400">Error</p>
                    <p className="mt-1 text-xs text-red-300">{error}</p>
                  </div>
                ) : result === null ? (
                  <p className="text-sm text-slate-500 italic">
                    Type something above to see parsed output...
                  </p>
                ) : (
                  <div>
                    {/* Status badges */}
                    <div className="mb-3 flex flex-wrap gap-2">
                      {wasDefaulted && (
                        <span className="inline-flex items-center rounded-full border border-amber-800 bg-amber-950/40 px-2.5 py-0.5 text-[11px] font-medium text-amber-400">
                          Defaulted: {result.currency}
                        </span>
                      )}
                      {result.currency && !wasDefaulted && (
                        <span className="inline-flex items-center rounded-full border border-emerald-800 bg-emerald-950/40 px-2.5 py-0.5 text-[11px] font-medium text-emerald-400">
                          Detected: {result.currency}
                        </span>
                      )}
                      {isRange && (
                        <span className="inline-flex items-center rounded-full border border-purple-800 bg-purple-950/40 px-2.5 py-0.5 text-[11px] font-medium text-purple-400">
                          Range: {result.min} – {result.max}
                        </span>
                      )}
                      {result.isNegative && (
                        <span className="inline-flex items-center rounded-full border border-rose-800 bg-rose-950/40 px-2.5 py-0.5 text-[11px] font-medium text-rose-400">
                          Negative
                        </span>
                      )}
                    </div>
                    <SyntaxHighlighter data={result} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section
        id="features"
        className="border-t border-slate-100 bg-slate-50/50"
      >
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <h2 className="text-center font-display text-2xl font-bold text-slate-900 sm:text-3xl mb-12">
            Everything a money parser should handle
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-slate-200 bg-white p-6 transition-shadow hover:shadow-sm"
              >
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-lg">
                  {f.icon}
                </div>
                <h3 className="mb-1 text-sm font-semibold text-slate-900">
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed text-slate-500">
                  {f.description}
                </p>
                <code className="mt-3 block rounded bg-slate-50 px-2 py-1 text-xs text-slate-600 font-mono">
                  {f.example}
                </code>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Documentation */}
      <Documentation />

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-400">
            Built by{" "}
            <a
              href="https://ritvij.dev"
              target="_blank"
              rel="author noopener noreferrer"
              className="text-slate-500 no-underline transition-colors hover:text-slate-900"
            >
              Ritvij Kumar Sharma
            </a>
            {" — "}MIT License
          </p>
          <div className="flex items-center gap-6 text-sm font-medium">
            <a
              href="https://www.npmjs.com/package/numis"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 no-underline transition-colors hover:text-slate-900"
            >
              npm
            </a>
            <a
              href="https://github.com/ritvij14/numis"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 no-underline transition-colors hover:text-slate-900"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

const FEATURES = [
  {
    icon: "$",
    title: "Symbols & Codes",
    description:
      "Recognizes 70+ currency symbols and all ISO-4217 three-letter codes.",
    example: "$100  |  €50  |  USD 250  |  100 EUR",
  },
  {
    icon: "Aa",
    title: "Worded Numbers",
    description:
      "Parses English worded amounts, fractions, and scales up to billions.",
    example: "one hundred dollars  |  half a million  |  two point five m",
  },
  {
    icon: "↔",
    title: "Ranges",
    description:
      "Detects monetary ranges with hyphens, 'to', 'through', or 'between'.",
    example: "$500 - $1000  |  10k to 20k  |  between 50 and 100 EUR",
  },
  {
    icon: "±",
    title: "Comparison Bounds",
    description:
      "Handles less-than and greater-than expressions as open-ended ranges.",
    example: "< 30k  |  > 2 Million  |  < 1,000 USD",
  },
  {
    icon: "🔤",
    title: "Slang & Idioms",
    description:
      "Understands informal terms like bucks, quid, fiver, tenner, and grand.",
    example: "20 bucks  |  a fiver  |  ten grand  |  fifty quid",
  },
  {
    icon: "🌐",
    title: "Regional Formats",
    description:
      "Handles European, Swiss, and Brazilian number formatting automatically.",
    example: "€1.234,56  |  1'234.56 CHF  |  R$ 1.234,56",
  },
];
