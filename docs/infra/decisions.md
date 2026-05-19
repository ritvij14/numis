# Architecture Decisions

> Record of key architectural decisions, their rationale, and trade-offs.

---

## Decision Template

When adding a new decision, use this format:

### [Decision Title]

**Date:** YYYY-MM-DD
**Status:** Proposed / Accepted / Deprecated

**Context:**
[What problem this decision addresses]

**Decision:**
[What was decided]

**Consequences:**
- **Positive:** [Benefits]
- **Negative:** [Trade-offs or drawbacks]

---

## Decisions Index

| Date | Decision | Status |
|------|----------|--------|
| 2026-04-05 | Range Detection in RegexPipeline | Accepted |
| 2026-05-19 | SPA Crawler Visibility via <noscript> | Accepted |

---

### Range Detection in RegexPipeline

**Date:** 2026-04-05
**Status:** Accepted

**Context:**
Need to support parsing monetary range expressions like "$10 - $20" or "50 to 100 USD" and return structured data with min/max values. The challenge is integrating this into the existing three-stage pipeline without breaking existing functionality or causing double processing.

**Decision:**
1. Extend `PipelineContext` interface with `isRange`, `min`, and `max` fields
2. Add `rangeDetectionStep` that runs AFTER currency detection but BEFORE numeric detection
3. When a range is detected, skip `numericDetectionStep` by checking `ctx.isRange`
4. Import `matchRange` at top level for browser compatibility (works in both Node.js and browsers)

**Consequences:**
- **Positive:**
  - Early range detection prevents numeric patterns from greedily matching partial values
  - Clean separation: range detection in pipeline, range parsing in patterns module
  - Backward compatible with existing code
  - Works in both Node.js and browsers (unlike `require()`)
- **Negative:**
  - Currency data is loaded slightly earlier in the initialization chain (minor performance impact)
  - Additional field in PipelineContext (minor API change)

---

### SPA Crawler Visibility via <noscript>

**Date:** 2026-05-19
**Status:** Accepted

**Context:**
The demo site is a Vite + React SPA. Search engine crawlers and AI bots that do not execute JavaScript see only an empty `div#root` and a script tag, making the site effectively invisible for indexing. We needed a crawler visibility strategy.

**Decision:**
1. Use a `<noscript>` block in `index.html` containing the full documentation content as static HTML
2. Keep the `<noscript>` content in sync with the React `Documentation.jsx` component via a build-time injection script (`scripts/inject-noscript.cjs`)
3. Source the static content from `scripts/noscript-template.html` so it can be edited independently
4. Run injection automatically as a `prebuild` step in the Vite build pipeline
5. Reject prerendering (react-snap / Puppeteer) because it introduces a heavy Chromium dependency

**Consequences:**
- **Positive:**
  - No additional runtime dependencies or build-time Chromium installation
  - Content stays in sync with React docs via automated build step
  - Crawlers see full documentation: install instructions, API reference, examples, supported formats, error handling
  - Works for all non-JS crawlers, not just specific bot user-agents
- **Negative:**
  - Content is duplicated (React component + static HTML template)
  - Template must be manually kept in sync when documentation changes (mitigated by reminder comment in Documentation.jsx)
  - No dynamic content in the fallback (static only)