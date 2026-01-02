import { parseMoney } from "numis";
import { useEffect, useState } from "react";
import "../style.css";

export default function App() {
  const [text, setText] = useState("");
  const [result, setResult] = useState("(parsed JSON will appear here)");

  useEffect(() => {
    const handler = setTimeout(() => {
      if (!text.trim()) {
        setResult("(parsed JSON will appear here)");
        return;
      }
      try {
        const parsed = parseMoney(text) || null;
        setResult(JSON.stringify(parsed, null, 2));
      } catch (err) {
        setResult(`Error: ${err.message}`);
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [text]);

  return (
    <div id="app">
      <label htmlFor="input">Input text</label>
      <textarea
        id="input"
        placeholder="e.g. The total cost is $123.45 or about €110"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <h2>Result</h2>
      <pre id="output">{result}</pre>
    </div>
  );
}
