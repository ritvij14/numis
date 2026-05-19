# numis Demo Website

A Vite + React SPA showcasing the **numis** library, optimized for search engine and AI crawler visibility.

Live site: [https://numis.ritvij.dev](https://numis.ritvij.dev)

---

## Architecture

- **Vite** — build tool and dev server
- **React 18** — UI framework
- **Tailwind CSS v4** — styling
- **numis (local)** — the library under `file:..`

---

## SEO & Crawler Visibility

### Structured Data
- JSON-LD `SoftwareApplication` schema with pricing, author, and repository links
- JSON-LD `WebSite` schema with `SearchAction` potentialAction

### Meta Tags
- Open Graph (title, description, image, URL)
- Twitter Card (summary_large_image)
- Canonical URL, robots, author, viewport

### Crawler Directives
- `public/robots.txt` — explicit `Allow` for GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot
- `public/llms.txt` — attribution and overview for LLM ingestion

### SPA Fallback
The site is a single-page application. For crawlers that do not execute JavaScript, the full documentation content is embedded inside a `<noscript>` block in `index.html`.

**Build-time injection:** `scripts/inject-noscript.cjs` runs before every Vite build and injects `scripts/noscript-template.html` into the `<noscript>` block. This keeps the static fallback in sync with the React documentation component.

**Important:** When editing `src/Documentation.jsx`, also update `scripts/noscript-template.html` so the fallback stays in sync.

---

## Available Scripts

```bash
# Start local dev server (http://localhost:5173)
npm run dev

# Build static assets to demo/dist (includes prebuild injection step)
npm run build

# Preview the production build locally
npm run preview
```

From the project root you can also run:

```bash
npm run dev:demo   # delegates to the demo project
npm run build:demo # delegates to the demo project
```

---

## Deploying to GitHub Pages

```bash
npm run build
# copy demo/dist contents to your gh-pages branch or configure GitHub Pages to serve /demo/dist
```

The built bundle expects to be served from the site root ("/"). If deploying to a sub-path, adjust `vite.config.mjs` with `base: '/numis/'` (or similar).
