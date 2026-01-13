import React, { useState } from 'react';
import { parseMoney } from 'numis';

/**
 * Documentation - ELI5 guide for using parseMoney()
 */
export function Documentation() {
  const [example1, setExample1] = useState("The price is $49.99");
  const [example2, setExample2] = useState("I have 100");
  const [defaultCurrency, setDefaultCurrency] = useState("USD");

  const result1 = parseMoney(example1);
  const result2WithDefault = parseMoney(example2, { defaultCurrency });
  const result2WithoutDefault = parseMoney(example2);

  return (
    <div className="documentation">
      <hr style={{ margin: '3rem 0', border: 'none', borderTop: '2px solid #e5e7eb' }} />
      <h2>How to Use numis</h2>
      <p className="doc-intro">
        numis helps you extract money amounts from text. It's like teaching your code to read prices the way humans do.
      </p>

      {/* Step 1: Installation */}
      <section className="doc-section">
        <h3>Step 1: Install the Package</h3>
        <p>First, add numis to your project:</p>
        <pre className="code-block">{`npm install numis`}</pre>
      </section>

      {/* Step 2: Basic Usage */}
      <section className="doc-section">
        <h3>Step 2: Parse Your First Money Amount</h3>
        <p>Import <code>parseMoney</code> and pass it any text containing money:</p>

        <pre className="code-block">{`import { parseMoney } from "numis";

const result = parseMoney("The price is $49.99");
console.log(result);
// Output: { original: "The price is $49.99", currency: "USD", amount: 49.99 }`}</pre>

        <div className="interactive-demo">
          <input
            type="text"
            value={example1}
            onChange={(e) => setExample1(e.target.value)}
            placeholder="Enter text with money..."
            className="demo-input"
          />
          <div className="demo-output">
            <strong>Result:</strong>
            <pre>{JSON.stringify(result1, null, 2)}</pre>
          </div>
        </div>
      </section>

      {/* Step 3: Understanding the Output */}
      <section className="doc-section">
        <h3>Step 3: Understanding What You Get Back</h3>
        <p>The <code>parseMoney()</code> function returns an object with three main properties:</p>

        <div className="property-list">
          <div className="property-item">
            <code className="property-name">original</code>
            <span className="property-arrow">→</span>
            <span className="property-desc">The exact text you passed in</span>
          </div>
          <div className="property-item">
            <code className="property-name">currency</code>
            <span className="property-arrow">→</span>
            <span className="property-desc">The currency code (like "USD", "EUR", "GBP")</span>
          </div>
          <div className="property-item">
            <code className="property-name">amount</code>
            <span className="property-arrow">→</span>
            <span className="property-desc">The number value (like 49.99)</span>
          </div>
        </div>
      </section>

      {/* Step 4: Default Currency */}
      <section className="doc-section">
        <h3>Step 4: Handling Text Without Currency Symbols</h3>
        <p>Sometimes your text has a number but no $ or € symbol. You can provide a fallback currency:</p>

        <pre className="code-block">{`// Without a default - currency will be undefined
parseMoney("I have 100");
// => { original: "I have 100", amount: 100, currency: undefined }

// With a default - uses your fallback currency
parseMoney("I have 100", { defaultCurrency: "USD" });
// => { original: "I have 100", amount: 100, currency: "USD", currencyWasDefault: true }`}</pre>

        <div className="interactive-demo">
          <h4>Try it yourself:</h4>
          <div className="demo-controls">
            <input
              type="text"
              value={example2}
              onChange={(e) => setExample2(e.target.value)}
              placeholder="Enter text with just a number..."
              className="demo-input"
            />
            <div className="currency-selector">
              <label>Default Currency:</label>
              <select value={defaultCurrency} onChange={(e) => setDefaultCurrency(e.target.value)}>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="JPY">JPY</option>
              </select>
            </div>
          </div>

          <div className="demo-comparison">
            <div className="demo-output">
              <strong>Without default:</strong>
              <pre>{JSON.stringify(result2WithoutDefault, null, 2)}</pre>
            </div>
            <div className="demo-output">
              <strong>With default ({defaultCurrency}):</strong>
              <pre>{JSON.stringify(result2WithDefault, null, 2)}</pre>
            </div>
          </div>
        </div>

        <div className="tip-box">
          <strong>💡 Note:</strong> When <code>currencyWasDefault</code> is <code>true</code>, it means the parser used your fallback currency instead of finding one in the text.
        </div>
      </section>

      {/* Step 5: What It Can Parse */}
      <section className="doc-section">
        <h3>Step 5: All the Ways to Write Money</h3>
        <p>numis understands money written in many different formats:</p>

        <div className="format-grid">
          <div className="format-card">
            <h5>Currency Symbols</h5>
            <code>$100</code>, <code>€50</code>, <code>£25.99</code>
          </div>
          <div className="format-card">
            <h5>Currency Codes</h5>
            <code>USD 100</code>, <code>50 EUR</code>, <code>100 GBP</code>
          </div>
          <div className="format-card">
            <h5>Words</h5>
            <code>one hundred dollars</code>, <code>fifty euros</code>
          </div>
          <div className="format-card">
            <h5>Abbreviations</h5>
            <code>$10k</code>, <code>€2.5m</code>, <code>1 billion USD</code>
          </div>
          <div className="format-card">
            <h5>Slang</h5>
            <code>20 bucks</code>, <code>fifty quid</code>, <code>a fiver</code>
          </div>
          <div className="format-card">
            <h5>Compound Amounts</h5>
            <code>5 dollars and 50 cents</code>
          </div>
        </div>
      </section>

      {/* Step 6: Common Mistakes */}
      <section className="doc-section">
        <h3>Step 6: Things to Watch Out For</h3>

        <div className="gotcha-list">
          <div className="gotcha-item">
            <div className="gotcha-title">⚠️ Really Big Numbers</div>
            <p>JavaScript can't handle numbers over 9 quadrillion safely. If your number is too big, numis will throw an error instead of giving you wrong data.</p>
            <pre className="code-block small">{`import { ValueOverflowError } from "numis";

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
      <section className="doc-section">
        <h3>Step 7: Real-World Use Cases</h3>

        <div className="use-case-list">
          <div className="use-case-item">
            <h5>📝 Processing User Input</h5>
            <pre className="code-block small">{`// In a form where users enter prices
const userInput = getUserInput();
const parsed = parseMoney(userInput, { defaultCurrency: "USD" });

if (parsed.amount) {
  saveToDatabase(parsed.amount, parsed.currency);
}`}</pre>
          </div>

          <div className="use-case-item">
            <h5>💬 Extracting Prices from Messages</h5>
            <pre className="code-block small">{`// Parse messages from customers
const message = "I want to pay $50 for this item";
const { amount, currency } = parseMoney(message);
// amount: 50, currency: "USD"`}</pre>
          </div>

          <div className="use-case-item">
            <h5>🌍 International Prices</h5>
            <pre className="code-block small">{`// Handle different currencies automatically
parseMoney("€100").currency;  // "EUR"
parseMoney("£100").currency;  // "GBP"
parseMoney("¥100").currency;  // "JPY"`}</pre>
          </div>
        </div>
      </section>

      {/* Quick Reference */}
      <section className="doc-section">
        <h3>Quick Reference</h3>
        <div className="reference-box">
          <h4>Function Signature</h4>
          <pre className="code-block small">{`parseMoney(text: string, options?: { defaultCurrency?: string })`}</pre>

          <h4>Returns</h4>
          <pre className="code-block small">{`{
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
