# Demo Site and SEO

> SEO optimization, crawler visibility, and social sharing for the numis demo site at https://numis.ritvij.dev

---

## What It Does

The demo site is a Vite + React SPA that showcases the numis library. Because it is a single-page application, crawlers without JavaScript see only an empty `div#root`. This feature adds:

- Full SEO meta tags (Open Graph, Twitter Cards, canonical URL)
- JSON-LD structured data (SoftwareApplication, WebSite, SearchAction)
- AI crawler directives (robots.txt with GPTBot, ClaudeBot, PerplexityBot)
- LLM attribution file (llms.txt)
- Static HTML fallback inside `<noscript>` for non-JS crawlers
- Build-time injection that keeps the fallback in sync with the React docs

---

## Why It Exists

**Problem:** A React SPA with no prerendering is invisible to search engines and AI crawlers. The original demo site had:
- No `<title>` or `<meta description>`
- No Open Graph tags for social sharing
- No structured data for Google Rich Results
- No AI-crawler directives
- A nearly empty `<noscript>` block

**Trigger:** SEO audit flagged zero visibility. Without these changes, Google would never index the demo site's content, and AI platforms like ChatGPT/Perplexity would not discover or cite the library.

---

## How It Works

### 1. Build-Time Noscript Injection

**File:** `demo/scripts/inject-noscript.cjs`

Runs as a `prebuild` step before Vite. It reads `demo/scripts/noscript-template.html` (the source of truth for static docs) and injects its content into the `<noscript>` block in `demo/index.html`.

```js
const before = html.slice(0, noscriptStart + "<noscript>".length);
const after = html.slice(noscriptEnd);
const updated = `${before}\n      ${content}\n    ${after}`;
```

**Why string slicing instead of regex?** A regex-based approach using `String.prototype.replace()` was attempted first. The replacement string contained `$100` from the template content, and JavaScript treats `$1` in replacement strings as a backreference. This corrupted the HTML and broke the build. String slicing avoids all backreference behavior.

**Why not prerendering?** `react-snap` with Puppeteer/Chromium was explored but abandoned. It adds a heavy browser dependency to the build pipeline and is brittle in CI environments. The `<noscript>` approach achieves the same crawler visibility with zero additional dependencies.

### 2. SEO Meta Tags

**File:** `demo/index.html`

```html
<!-- Open Graph -->
<meta property="og:title" content="numis — Natural Language Money Parser for JavaScript" />
<meta property="og:description" content="..." />
<meta property="og:image" content="https://numis.ritvij.dev/og-image.png" />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="..." />
<meta name="twitter:image" content="..." />

<!-- JSON-LD: SoftwareApplication -->
<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "numis",
    "applicationCategory": "DeveloperApplication",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
    "programmingLanguage": ["JavaScript", "TypeScript"],
    "codeRepository": "https://github.com/ritvij14/numis",
    "downloadUrl": "https://www.npmjs.com/package/numis"
  }
</script>
```

### 3. Crawler Directives

**File:** `demo/public/robots.txt`

Explicit `Allow` directives for AI crawlers (many block by default):

```
User-agent: GPTBot
Allow: /
User-agent: OAI-SearchBot
Allow: /
User-agent: ClaudeBot
Allow: /
User-agent: PerplexityBot
Allow: /
```

**File:** `demo/public/llms.txt`

Attribution file for LLM ingestion. Contains project overview, key capabilities, quick start, and author info.

---

## Files

| File | Purpose |
|------|---------|
| `demo/index.html` | SPA shell + all meta tags + JSON-LD + `<noscript>` block |
| `demo/scripts/noscript-template.html` | Source of truth for static fallback content |
| `demo/scripts/inject-noscript.cjs` | Build-time script that injects template into index.html |
| `demo/public/robots.txt` | AI crawler Allow directives |
| `demo/public/llms.txt` | LLM attribution and overview |
| `demo/public/og-image.png` | Open Graph / Twitter Card image (1200×630) |
| `demo/src/Documentation.jsx` | React component rendered for JS-enabled users |

---

## Keeping Content in Sync

**Rule:** When updating `demo/src/Documentation.jsx`, also update `demo/scripts/noscript-template.html`.

**Mitigation:** A comment at the top of `Documentation.jsx` reminds developers. The build fails if the injection script cannot find `<noscript>` tags, acting as a smoke test.

---

## Dependencies

None. The injection script uses only Node.js built-in modules (`fs`, `path`).

---

## Related

- [[docs/infra/decisions.md]] — Architecture decision: SPA Crawler Visibility via noscript
- [[docs/infra/changelog.md]] — 2026-05-19 entry with full change list
