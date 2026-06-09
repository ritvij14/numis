# Security & Supply Chain Decisions

> Records security tooling choices, audit findings, and supply-chain monitoring setup.

## Decision: Socket.dev CLI + Dependabot Config

**Status:** Adopted (2025-06-09)

**Context:**
We needed automated supply-chain security monitoring for the numis library. GitHub Apps (Socket.dev app, Dependabot alerts) require manual web UI authorization and cannot be fully set up via CLI alone in headless CI environments.

**Decision:**
Use a hybrid approach:

1. **Socket.dev CLI** (`npx socket`) for ad-hoc / CI-based scanning — malware detection, install scripts, version anomalies.
2. **`.github/dependabot.yml`** for ongoing automated version-update PRs.

**Consequences:**
- Dependabot will open weekly grouped PRs for minor/patch devDependency updates.
- Socket CLI requires an API token for full scans; `socket npm audit` works token-less and wraps npm audit.
- No real-time GitHub-native alert feed (Dependabot alerts requires the App); we rely on `npm audit` + PR reviews instead.

---

## Decision: npm audit fix — `@rollup/plugin-terser` major bump

**Status:** Applied (2025-06-09)

**Findings:**
Initial `npm audit --audit-level=moderate` reported 12 vulnerabilities across transitive devDependencies:

| Severity | Count | Packages |
|----------|-------|----------|
| High     | 6     | `flatted`, `glob`, `minimatch`, `picomatch`, `rollup`, `serialize-javascript` |
| Moderate | 5     | `@eslint/plugin-kit`, `ajv`, `brace-expansion`, `js-yaml`, `postcss` |
| Low      | 1     | *(implicit in rollup chain)* |

`npm audit fix` resolved 10 of 12.
The remaining 2 were in `serialize-javascript` (CVE-2024-43796, CVE-2024-46981), pulled in by `@rollup/plugin-terser@0.4.4`.

`npm audit fix --force` bumped `@rollup/plugin-terser` from `^0.4.4` → `^1.0.0` (SemVer major). Post-upgrade:

- `npm audit --audit-level=moderate` → **0 vulnerabilities**
- `npm run build` → **pass**
- `npm test` → **1382/1382 pass**
- UMD bundle size unchanged (terser 5.x behavior stable)

**Consequences:**
- `@rollup/plugin-terser` v1 is stable (uses `serialize-javascript@7.0.5` which patches both CVEs).
- No source code changes required.

---

## Decision: currency-codes dependency review

**Status:** Reviewed (2025-06-09)

**Context:**
`currency-codes@2.2.0` is the sole runtime dependency.

**Findings:**
- Direct dep `currency-codes@2.2.0` — no known CVEs in npm audit or OSV (checked via OSV API).
- Transitive deps: `first-match@0.0.1` (no deps, no install scripts), `nub@0.0.0` (no deps, no install scripts).
- None of the three packages declare `postinstall` / `preinstall` / `install` scripts.
- No deprecated flags, no version anomalies.

**Consequences:**
- Runtime dependency tree is low-risk; continue using `currency-codes`.
- Monitor upstream for updates via Dependabot.

---

## How to run security scans locally

```bash
# 1. npm audit
npm audit --audit-level=moderate

# 2. Socket.dev CLI (requires API token for full scans)
npx socket npm audit          # wraps npm audit, token-less
npx socket scan create --json .   # requires `socket login` first

# 3. OSV lookup (example)
# curl -d '{"package":{"name":"currency-codes","ecosystem":"npm"}}' \
#   https://api.osv.dev/v1/query
```

## References

- Socket.dev CLI docs: https://docs.socket.dev
- Dependabot config reference: https://docs.github.com/en/code-security/dependabot/dependabot-version-updates/configuration-options-for-the-dependabot.yml-file
- OSV API: https://ossf.github.io/osv-schema/
