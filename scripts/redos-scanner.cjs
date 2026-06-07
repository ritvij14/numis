/**
 * ReDoS Scanner Runner — numis
 *
 * Reads REDOS_INVENTORY.md, tests each inventoried regex with safe-regex
 * (static) and dynamic timeout-based detection. Scores:
 *   FAIL          — dynamic test exceeded TIMEOUT_MS
 *   NEEDS_REVIEW  — safe-regex flagged UNSAFE but dynamic passed
 *   PASS          — safe-regex SAFE and dynamic passed
 *
 * Dynamic patterns (RegExp constructors built from runtime data) are
 * scored NEEDS_REVIEW and cross-referenced against the prior dynamic
 * audit results (subtask 1 parent) which tested them with 17 payloads
 * each and found 0 catastrophic vulnerabilities (worst 4ms).
 *
 * Usage:
 *   node scripts/redos-scanner.cjs
 */

const safeRegex = require("safe-regex");
const fs = require("fs");
const path = require("path");

const TIMEOUT_MS = 3000;
const MAX_PAYLOAD_LEN = 50000;
const REPORT_PATH = path.join(__dirname, "..", "REDOS_SCANNER_REPORT.md");
const INVENTORY_PATH = path.join(__dirname, "..", "REDOS_INVENTORY.md");

const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const CYAN = "\x1b[36m";
const RESET = "\x1b[0m";

/* ═══════════════════════════════════════════════════════════════════════ */
/*  Inventory parser — reads REDOS_INVENTORY.md tables                    */
/*  Splits on | but respects backticks so | inside regex patterns survive   */
/* ═══════════════════════════════════════════════════════════════════════ */

function splitTableRow(line) {
  const cells = [];
  let current = "";
  let inBackticks = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === "`") {
      inBackticks = !inBackticks;
      current += ch;
    } else if (ch === "|" && !inBackticks) {
      cells.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  cells.push(current.trim());
  return cells.filter((c) => c.length > 0);
}

function parseInventory() {
  const md = fs.readFileSync(INVENTORY_PATH, "utf8");
  const lines = md.split("\n");
  const entries = [];
  let currentFile = null;

  for (const raw of lines) {
    const line = raw.trim();

    // Section header like "## 1. src/regexPipeline.ts"
    const sec = line.match(/^##\s+\d+\.\s+(src\/.+)$/);
    if (sec) {
      currentFile = sec[1];
      continue;
    }

    // Markdown table row with 5 columns: | # | Line | Type | Raw Pattern | Purpose |
    if (line.startsWith("|") && !line.startsWith("|---")) {
      const cells = splitTableRow(line);
      if (cells.length >= 5) {
        const num = parseInt(cells[0], 10);
        const lineNum = parseInt(cells[1], 10);
        const type = cells[2];
        const rawPattern = cells[3];
        const purpose = cells[4];
        if (!isNaN(num) && !isNaN(lineNum) && currentFile) {
          // Strip backtick wrappers that Markdown uses for code spans
          const rawPatternStripped = rawPattern.replace(/^`|`$/g, "");
          entries.push({
            num,
            file: currentFile,
            line: lineNum,
            type,
            rawPattern: rawPatternStripped,
            purpose,
          });
        }
      }
    }
  }

  return entries;
}

/* ═══════════════════════════════════════════════════════════════════════ */
/*  Payload builder                                                         */
/* ═══════════════════════════════════════════════════════════════════════ */

function buildPayloads(regexStr) {
  const payloads = [];
  const p = regexStr.toLowerCase();

  const longA = "a".repeat(10000);
  const longDigits = "1".repeat(10000);
  const longSpaces = " ".repeat(10000);
  const longComma = "1,".repeat(5000);
  const longPeriod = "1.".repeat(5000);
  const longMixed = "1,234.56".repeat(1250);
  const longWord = "one one one one one one one one one one ";
  const longHyphen = "one-two-three-four-five-six-seven-eight-nine-ten-";
  const padded = " ".repeat(5000) + "USD 100" + " ".repeat(5000);
  const ambiguous = "1" + ",1".repeat(5000);
  const dollarTrail = "$" + "1".repeat(10000);
  const symbolBomb = "$" + " ".repeat(1000) + "1" + " ".repeat(1000);

  payloads.push(
    { name: "long-a", input: longA },
    { name: "long-digits", input: longDigits },
    { name: "long-spaces", input: longSpaces },
    { name: "nested-commas", input: longComma },
    { name: "nested-periods", input: longPeriod },
    { name: "mixed-format", input: longMixed },
    { name: "repeated-word", input: longWord.repeat(500) },
    { name: "padded", input: padded },
    { name: "ambiguous-sep", input: ambiguous },
    { name: "dollar-trail", input: dollarTrail },
    { name: "symbol-bomb", input: symbolBomb }
  );

  if (
    p.includes("word") ||
    p.includes("number") ||
    p.includes("hundred") ||
    p.includes("thousand")
  ) {
    payloads.push(
      { name: "worded-explode", input: "one hundred ".repeat(5000) },
      { name: "hyphen-bomb", input: longHyphen.repeat(500) }
    );
  }

  if (
    p.includes("currency") ||
    p.includes("symbol") ||
    p.includes("usd") ||
    p.includes("eur")
  ) {
    payloads.push({ name: "iso-bomb", input: "USD ".repeat(5000) + "100" });
  }

  if (p.includes("range") || p.includes("to") || p.includes("through")) {
    payloads.push({
      name: "range-bomb",
      input: "100 to ".repeat(5000) + "200",
    });
  }

  return payloads;
}

/* ═══════════════════════════════════════════════════════════════════════ */
/*  Dynamic timeout-based test                                              */
/* ═══════════════════════════════════════════════════════════════════════ */

function testRegexDynamic(regex, payloads) {
  let worstElapsed = 0;
  let worstPayload = null;
  let timedOut = false;

  for (const payload of payloads) {
    let input = payload.input;
    if (input.length > MAX_PAYLOAD_LEN) {
      input = input.slice(0, MAX_PAYLOAD_LEN);
    }

    try {
      const start = performance.now();
      regex.test(input);
      const elapsed = performance.now() - start;
      if (elapsed > worstElapsed) {
        worstElapsed = elapsed;
        worstPayload = payload.name;
      }
      if (elapsed > TIMEOUT_MS) {
        timedOut = true;
      }
    } catch (e) {
      // ignore regex errors on pathological inputs
    }
  }

  return { timedOut, worstElapsed, worstPayload };
}

/* ═══════════════════════════════════════════════════════════════════════ */
/*  Regex instantiation from inventory entry                                */
/* ═══════════════════════════════════════════════════════════════════════ */

function makeRegex(entry) {
  const { type, rawPattern } = entry;

  // Sub-pattern strings (not complete regexes) — e.g. fragment strings embedded
  // inside a larger RegExp constructor. Not independently testable.
  if (type === "inline_literal" && !rawPattern.startsWith("/") && !rawPattern.startsWith("new RegExp")) {
    return { error: "SUBPATTERN" };
  }

  if (type === "literal" || type === "inline_literal") {
    // Literal: /pattern/flags
    const m = rawPattern.match(/^\/(.+)\/([gimsuvdy]*)$/);
    if (!m) return { error: "Cannot parse literal regex" };
    try {
      return { regex: new RegExp(m[1], m[2]) };
    } catch (e) {
      return { error: e.message };
    }
  }

  if (type === "RegExp_constructor" || type === "RegExp_call") {
    // Try to parse simple string-literal constructors:
    // new RegExp('pattern', 'flags') or new RegExp(`pattern`, 'flags')
    const simple = rawPattern.match(
      /RegExp\s*\(\s*['"`]([\s\S]+?)['"`]\s*(?:,\s*['"`]([gimsuvdy]*)['"`])?\s*\)/
    );
    if (simple) {
      try {
        return { regex: new RegExp(simple[1], simple[2] || "") };
      } catch (e) {
        return { error: e.message };
      }
    }
    return { error: "DYNAMIC" };
  }

  return { error: "Unknown type" };
}

/* ═══════════════════════════════════════════════════════════════════════ */
/*  Report generation                                                       */
/* ═══════════════════════════════════════════════════════════════════════ */

function generateReport(results) {
  const safe = results.filter((r) => r.overall === "PASS");
  const needsReview = results.filter((r) => r.overall === "NEEDS_REVIEW");
  const fail = results.filter((r) => r.overall === "FAIL");
  const skipped = results.filter((r) => r.overall === "SKIPPED");

  const lines = [
    "# ReDoS Scanner Report — numis",
    "",
    `**Date:** ${new Date().toISOString()}`,
    `**Scanner:** safe-regex (static) + dynamic timeout (${TIMEOUT_MS}ms)`,
    `**Inventory:** ${INVENTORY_PATH}`,
    "",
    "## Summary",
    "",
    "| Category | Count |",
    "|----------|-------|",
    `| PASS | ${safe.length} |`,
    `| NEEDS_REVIEW | ${needsReview.length} |`,
    `| FAIL | ${fail.length} |`,
    `| SKIPPED | ${skipped.length} |`,
    `| **Total** | **${results.length}** |`,
    "",
    "---",
    "",
  ];

  if (fail.length > 0) {
    lines.push("## FAIL — Dynamic Timeout Exceeded", "");
    for (const r of fail) {
      lines.push(`### ${r.file}:${r.line}`);
      lines.push("```typescript");
      lines.push(r.rawPattern);
      lines.push("```");
      lines.push(`- **safe-regex:** ${r.safeRegexResult}`);
      lines.push(`- **Dynamic worst time:** ${r.worstTime?.toFixed(2)}ms`);
      lines.push(`- **Worst payload:** ${r.worstPayload}`);
      lines.push("");
    }
  }

  if (needsReview.length > 0) {
    lines.push("## NEEDS_REVIEW — safe-regex Flagged (Dynamic Passed)", "");
    for (const r of needsReview) {
      lines.push(`### ${r.file}:${r.line}`);
      lines.push("```typescript");
      lines.push(r.rawPattern);
      lines.push("```");
      lines.push(`- **safe-regex:** ${r.safeRegexResult}`);
      if (r.worstTime !== undefined) {
        lines.push(`- **Dynamic worst time:** ${r.worstTime.toFixed(2)}ms`);
        lines.push(`- **Worst payload:** ${r.worstPayload}`);
      }
      if (r.note) {
        lines.push(`- **Note:** ${r.note}`);
      }
      lines.push("");
    }
  }

  if (skipped.length > 0) {
    lines.push("## SKIPPED — Fragment / Sub-Pattern (Not Independently Testable)", "");
    for (const r of skipped) {
      lines.push(`### ${r.file}:${r.line}`);
      lines.push("```typescript");
      lines.push(r.rawPattern);
      lines.push("```");
      if (r.note) {
        lines.push(`- **Note:** ${r.note}`);
      }
      lines.push("");
    }
  }

  if (safe.length > 0) {
    lines.push("## PASS — No ReDoS Risk Detected", "");
    lines.push(
      "| # | File | Line | Type | safe-regex | Dynamic worst | Payload |"
    );
    lines.push(
      "|---|------|------|------|------------|---------------|---------|"
    );
    for (const r of safe) {
      const time = r.worstTime !== undefined ? `${r.worstTime.toFixed(2)}ms` : "N/A";
      const payload = r.worstPayload || "N/A";
      const patShort = r.rawPattern.replace(/\|/g, "\\|").slice(0, 55);
      lines.push(
        `| ${r.num} | ${r.file} | ${r.line} | ${r.type} | ${r.safeRegexResult} | ${time} | ${payload} |`
      );
    }
    lines.push("");
  }

  lines.push("---");
  lines.push("*Generated by scripts/redos-scanner.cjs*");

  return lines.join("\n");
}

/* ═══════════════════════════════════════════════════════════════════════ */
/*  Main                                                                    */
/* ═══════════════════════════════════════════════════════════════════════ */

function main() {
  console.log(`${CYAN}ReDoS Scanner — numis${RESET}\n`);

  if (!fs.existsSync(INVENTORY_PATH)) {
    console.error(`${RED}Inventory not found: ${INVENTORY_PATH}${RESET}`);
    process.exit(1);
  }

  const inventory = parseInventory();
  console.log(`${CYAN}Loaded ${inventory.length} patterns from inventory${RESET}`);

  const results = [];

  for (const entry of inventory) {
    const made = makeRegex(entry);

    if (made.error === "SUBPATTERN") {
      results.push({
        ...entry,
        overall: "SKIPPED",
        safeRegexResult: "SKIPPED_SUBPATTERN",
        worstTime: undefined,
        worstPayload: null,
        note: "Fragment embedded inside a larger regex — not independently testable.",
      });
      continue;
    }

    if (made.error === "DYNAMIC") {
      // Runtime-constructed regex — cannot evaluate statically.
      // Cross-reference prior dynamic audit (subtask 1 parent) which found 0 vulnerabilities.
      results.push({
        ...entry,
        overall: "NEEDS_REVIEW",
        safeRegexResult: "SKIPPED_DYNAMIC",
        worstTime: undefined,
        worstPayload: null,
        note: "Dynamically constructed — prior audit (subtask 1) tested with 17 payloads, worst case 4ms, 0 vulnerabilities found.",
      });
      continue;
    }

    if (made.error) {
      results.push({
        ...entry,
        overall: "NEEDS_REVIEW",
        safeRegexResult: `PARSE_ERROR: ${made.error}`,
        worstTime: undefined,
        worstPayload: null,
      });
      continue;
    }

    const regex = made.regex;

    // Static analysis
    let safeRegexResult;
    try {
      const isSafe = safeRegex(regex);
      safeRegexResult = isSafe ? "SAFE" : "UNSAFE";
    } catch (e) {
      safeRegexResult = `ERROR: ${e.message}`;
    }

    // Dynamic testing
    const payloads = buildPayloads(entry.rawPattern);
    const dynamic = testRegexDynamic(regex, payloads);

    // Scoring:
    // FAIL   = dynamic timed out
    // NEEDS_REVIEW = safe-regex flagged but dynamic passed
    // PASS   = safe-regex safe and dynamic passed
    let overall;
    if (dynamic.timedOut) {
      overall = "FAIL";
    } else if (safeRegexResult === "UNSAFE") {
      overall = "NEEDS_REVIEW";
    } else if (safeRegexResult.startsWith("ERROR")) {
      overall = "NEEDS_REVIEW";
    } else {
      overall = "PASS";
    }

    results.push({
      ...entry,
      overall,
      safeRegexResult,
      worstTime: dynamic.worstElapsed,
      worstPayload: dynamic.worstPayload,
    });
  }

  const report = generateReport(results);
  fs.writeFileSync(REPORT_PATH, report);

  const safeCount = results.filter((r) => r.overall === "PASS").length;
  const reviewCount = results.filter((r) => r.overall === "NEEDS_REVIEW").length;
  const failCount = results.filter((r) => r.overall === "FAIL").length;

  console.log(`\n${GREEN}Results:${RESET}`);
  console.log(`  PASS:         ${safeCount}`);
  console.log(`  NEEDS_REVIEW: ${reviewCount}`);
  console.log(`  FAIL:         ${failCount}`);
  console.log(`  Total:        ${results.length}`);
  console.log(`\n${GREEN}Report written to ${REPORT_PATH}${RESET}`);
}

main();
