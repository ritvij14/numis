const fs = require("fs");
const path = require("path");

const htmlPath = path.resolve(__dirname, "../index.html");
const templatePath = path.resolve(__dirname, "noscript-template.html");

const html = fs.readFileSync(htmlPath, "utf-8");
const template = fs.readFileSync(templatePath, "utf-8");

// Extract the inner content from the template (strip the <!-- comment -->)
const contentMatch = template.match(/<!--[\s\S]*?-->\s*([\s\S]*)/);
const content = contentMatch ? contentMatch[1].trim() : template.trim();

// Find the noscript block and replace its inner content
const noscriptStart = html.indexOf("<noscript>");
const noscriptEnd = html.indexOf("</noscript>");

if (noscriptStart === -1 || noscriptEnd === -1) {
  console.error("Failed to inject noscript content — <noscript> tags not found.");
  process.exit(1);
}

const before = html.slice(0, noscriptStart + "<noscript>".length);
const after = html.slice(noscriptEnd);
const updated = `${before}\n      ${content}\n    ${after}`;

fs.writeFileSync(htmlPath, updated, "utf-8");
console.log("Injected noscript fallback into index.html");
