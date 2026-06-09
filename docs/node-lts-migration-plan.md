# Node LTS Migration Plan — numis

> Branch: `feature/node-lts-migration` (created fresh from `origin/main` at 6931b13)  
> Task: t_c53b0580  
> Date: 2026-06-09

---

## 1. Current State Snapshot

| File | Key Finding |
|------|-------------|
| `package.json` | No `engines` field. `@rollup/plugin-terser@^0.4.4` (safe on Node 14+). `@types/node@^20.0.0` already installed. |
| `.github/workflows/ci.yml` | Single matrix entry `node-version: [18.x]`. No `npm audit` step on `main`. |
| `tsconfig.json` / `tsconfig.cjs.json` | `target: ES2020`, `module: ESNext/CommonJS`. No Node-version-specific flags. |
| `package-lock.json` | `lockfileVersion: 3`. `@rollup/plugin-terser@0.4.4` → `serialize-javascript@6.0.2` (no Node engine restriction). No Node 20 conflicts on `main`. |
| `jest.config.js` | `ts-jest` + `testEnvironment: node`. No Node-version-specific config. |
| `demo/package.json` | Private Vite project, no `engines`. Uses Tailwind v4, Vite 5, React 18. Should run on Node 20 without changes. |
| `src/**/*.ts` (21 files) | Pure regex/string parsing library. No Node-version-specific APIs. Confirmed compatible with Node >= 18. |

**Important context:** The `serialize-javascript@7.0.5` (requires Node >= 20) issue mentioned in the task body exists on the **unmerged** `feature/security-audit-supply-chain` branch (which upgrades `@rollup/plugin-terser` to `^1.0.0`). It does **not** exist on `main` today. This migration is forward-looking: Node 18 is EOL (Apr 2025) and we should align CI/build tooling with Node 20 Active LTS.

---

## 2. Migration Objectives

1. **Build environment:** CI and local dev must run on Node 20.x (Active LTS).
2. **Consumer compatibility:** Library runtime must continue to work on Node 18+ for existing consumers.
3. **Documentation:** `engines` field in `package.json` must accurately communicate supported consumer runtimes.
4. **Dependency health:** Ensure `npm install` / `npm ci` work cleanly on Node 20.

---

## 3. Files to Modify — Exact Changes

### 3a. `.github/workflows/ci.yml`

**Rationale:** CI is the canonical build environment. It must run on the LTS version we use for development and publishing.

```yaml
# BEFORE
strategy:
  matrix:
    node-version: [18.x]

# AFTER
strategy:
  matrix:
    node-version: [20.x]
```

The rest of the workflow (checkout, setup-node, install, lint, test, build) remains identical. No additional matrix entries needed because the library source has no Node-version-specific code.

**Note:** The `feature/security-audit-supply-chain` branch added `npm audit --audit-level=moderate`. That is a **separate concern** (supply-chain security) and should not be bundled into this migration unless explicitly requested. Keeping the scope pure.

---

### 3b. `package.json` — add `engines` field

**Rationale:** Documents the minimum Node version for **consumers** of the library. Since the source uses only ES2020-era features and no Node 20-only APIs, Node 18 remains the minimum consumer runtime.

```json
"engines": {
  "node": ">=18.0.0"
}
```

**Placement:** After the `"license": "MIT"` line, before `"dependencies"`.

**Advisory vs strict:** Use the default npm behavior (warning on install if engine mismatch). Do **not** add `"engineStrict": true` — this is a library, not an application. Consumers on Node 18 should not be blocked from installing.

---

### 3c. `README.md` — update Requirements section

**Rationale:** Public-facing documentation should match `engines`.

Add or update a "Requirements" section:

```markdown
## Requirements

- Node.js >= 18 (tested on 20.x)
- npm >= 9
```

---

### 3d. `package.json` — update `@types/node` (optional, recommended)

**Rationale:** `@types/node@^20.0.0` is already installed and correct. No change needed. If future work bumps dev dependencies, consider `@types/node@^22.0.0` when Node 22 becomes Active LTS.

---

### 3e. `demo/package.json` — no changes required

**Rationale:** The demo is a private dev tool. It runs on whatever Node version the developer has. No consumer installs it. If issues arise during `npm --prefix demo install` on Node 20, they can be addressed ad-hoc.

---

## 4. Files That Do **Not** Need Changes

| File | Reason |
|------|--------|
| `tsconfig.json` / `tsconfig.cjs.json` | `target: ES2020` is already conservative and works on Node 18+. |
| `jest.config.js` | `ts-jest` works identically on Node 18 and 20. |
| `rollup.config.js` | Rollup 4.x and plugins work on Node 20. |
| `src/**/*.ts` | No Node-version-specific APIs used. |
| `package-lock.json` | Regenerated automatically by `npm install` on Node 20. |
| `eslint.config.cjs` | ESLint 9 runs on Node 20. |

---

## 5. Test Strategy

### 5a. Pre-migration baseline (on `feature/node-lts-migration` branch)

Run the full test suite locally on Node 20 to establish a green baseline:

```bash
npm ci        # or npm install
npm test      # Jest full suite
npm run lint  # ESLint
npm run build # ESM + CJS + UMD
```

Expected: All pass (the library itself is already Node-agnostic).

### 5b. Post-change validation

After applying the plan, verify:

1. `npm test` — all Jest suites pass.
2. `npm run lint` — no lint errors.
3. `npm run build` — `dist/esm/`, `dist/cjs/`, `dist/umd/` all produced.
4. `npm --prefix demo install` — demo dependencies install cleanly on Node 20.
5. `npm --prefix demo run build` — demo builds successfully.
6. `node -e "const numis = require('./dist/cjs/index.js'); console.log(numis.parseMoney('$100'));"` — CJS runtime works.
7. `node --input-type=module -e "import { parseMoney } from './dist/esm/index.js'; console.log(parseMoney('€50'));"` — ESM runtime works.

### 5c. CI validation

Push the branch. The updated CI (Node 20.x) should run automatically on the PR and produce a green check.

---

## 6. Rollback Plan

### Scenario A: CI fails on Node 20

1. Revert `ci.yml` to `node-version: [18.x]`.
2. Investigate the specific failure (likely a devDependency engine mismatch, not library code).
3. Fix the offending devDependency version or replace the tool.
4. Re-apply the Node 20 CI change.

### Scenario B: Consumer reports breakage on Node 18

1. Verify the report — run `npm test` on Node 18 locally.
2. If the library source is genuinely incompatible (unlikely), identify the API and polyfill or refactor.
3. If the issue is `engines` blocking install, remove `engines` or widen it.
4. Patch release with fix.

### Scenario C: `engines` field causes unexpected install warnings

1. Remove `engines` temporarily.
2. Evaluate whether to re-add with a wider range (e.g., `>=16.0.0`) or keep it advisory.

---

## 7. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| CI fails on Node 20 due to transitive dep engine requirements (e.g., `serialize-javascript@7.x` pulled in by a future `@rollup/plugin-terser` bump) | Medium | High (blocks PR merge) | Pin offending transitive dep to a compatible version, or delay the plugin upgrade. This migration keeps `@rollup/plugin-terser@^0.4.4` to avoid this exact issue. |
| Consumer on Node 18 blocked by `engines` field | Low | Medium | Do not set `engineStrict: true`. Keep `engines` advisory (default npm behavior = warning only). |
| Library source accidentally uses a Node 20-only API | Very Low | High | Source review confirms no Node-specific APIs. All code is pure string/regex/math. |
| `package-lock.json` regeneration introduces unrelated version bumps | Medium | Low | Use `npm ci` in CI. For local, run `npm install` on Node 20 and review the diff before committing. |
| Demo build breaks on Node 20 | Low | Low | Demo is private; fix ad-hoc. Not a blocker for library release. |
| `@types/node@^20` is slightly behind Node 20 latest features | Very Low | Very Low | `@types/node` tracks LTS well. No action needed until we adopt a Node 20-only API (which we won't for a consumer library). |

---

## 8. Child Task Breakdown

### Child 1: Implement Node LTS migration — CI + package.json + engines
- **Scope:** Apply the exact file changes from Section 3.
- **Files:** `.github/workflows/ci.yml`, `package.json`, `README.md`
- **Tests:** Run full suite (Section 5b). Commit changes.
- **Assignee:** codex-builder
- **Workspace:** worktree:/home/ritvij14/numis
- **Branch:** feature/node-lts-migration

### Child 2: Verify backwards compatibility and update documentation
- **Scope:** Verify Node 18 consumer compatibility, ensure README is accurate, check for any missed docs.
- **Files:** `README.md` (double-check), potentially `CHANGELOG.md` if it exists.
- **Tests:** Run `npm test` on Node 18 (if available locally or via nvm). Otherwise, review source for Node-specific APIs.
- **Assignee:** codex-builder
- **Workspace:** worktree:/home/ritvij14/numis
- **Branch:** feature/node-lts-migration

---

## 9. Decisions Log

1. **CI matrix: single entry `[20.x]` only.** No dual-matrix `[18.x, 20.x]` because the library has no Node-version-specific code; testing on 20 is sufficient. If we later adopt Node 20-only build tools, we can reconsider.
2. **`engines: "node": ">=18.0.0"` (advisory).** Consumers on Node 18 get a warning, not a hard block. This preserves the existing consumer base while documenting reality.
3. **No `engineStrict: true`.** This is a library; we should not dictate the consumer's runtime beyond a warning.
4. **Do not bundle `npm audit` into this migration.** That belongs to the security audit task (already on `feature/security-audit-supply-chain`).
5. **Do not upgrade `@rollup/plugin-terser` as part of this migration.** The `^0.4.4` → `^1.0.0` bump is what introduces the `serialize-javascript@7.0.5` Node >= 20 requirement. Upgrade it separately when the team is ready to require Node 20 for **building** (not for consuming).
6. **No source code changes.** The library is already Node-agnostic.
