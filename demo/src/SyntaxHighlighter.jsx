import React from "react";

/**
 * Simple JSON syntax highlighter — no dependencies.
 * Returns a React tree with colored spans.
 */
export function highlightJSON(json, variant = "dark") {
  const str = typeof json === "string" ? json : JSON.stringify(json, null, 2);
  const tokens = tokenize(str, variant);
  return tokens.map((t, i) => (
    <span key={i} style={{ color: t.color }}>
      {t.value}
    </span>
  ));
}

function tokenize(str, variant = "dark") {
  const isLight = variant === "light";
  const colors = {
    string: isLight ? "#2563eb" : "#a5d6ff",      // blue-600 / light blue
    number: isLight ? "#059669" : "#79c0ff",      // emerald-600 / light blue
    boolean: isLight ? "#dc2626" : "#ff7b72",     // red-600 / light red
    punctuation: isLight ? "#475569" : "#c9d1d9", // slate-600 / light grey
    whitespace: isLight ? "#94a3b8" : "#94a3b8", // slate-400 (same)
  };

  const tokens = [];
  let i = 0;

  while (i < str.length) {
    const ch = str[i];

    // Whitespace
    if (/\s/.test(ch)) {
      let val = "";
      while (i < str.length && /\s/.test(str[i])) val += str[i++];
      tokens.push({ value: val, color: colors.whitespace });
      continue;
    }

    // String
    if (ch === '"') {
      let val = ch;
      i++;
      while (i < str.length && str[i] !== '"') {
        if (str[i] === "\\" && i + 1 < str.length) val += str[i++];
        val += str[i++];
      }
      if (i < str.length) val += str[i++];
      tokens.push({ value: val, color: colors.string });
      continue;
    }

    // Number
    if (/[\d-]/.test(ch)) {
      let val = "";
      while (i < str.length && /[\d.eE+-]/.test(str[i])) val += str[i++];
      tokens.push({ value: val, color: colors.number });
      continue;
    }

    // Boolean / null
    if (str.slice(i).startsWith("true") || str.slice(i).startsWith("false")) {
      const val = str.slice(i).startsWith("true") ? "true" : "false";
      i += val.length;
      tokens.push({ value: val, color: colors.boolean });
      continue;
    }
    if (str.slice(i).startsWith("null")) {
      i += 4;
      tokens.push({ value: "null", color: colors.boolean });
      continue;
    }

    // Punctuation
    tokens.push({ value: ch, color: colors.punctuation });
    i++;
  }

  return tokens;
}

export default function SyntaxHighlighter({ data, className = "", variant = "dark" }) {
  const jsonStr =
    typeof data === "string" ? data : JSON.stringify(data, null, 2);
  return (
    <pre
      className={`overflow-x-auto text-[13px] leading-relaxed ${className}`}
    >
      <code>{highlightJSON(jsonStr, variant)}</code>
    </pre>
  );
}
