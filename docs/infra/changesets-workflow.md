# Changesets Versioning Workflow for `numis`

This document describes the exact steps to bump and publish a new minor (or patch/major) version of `numis` using [Changesets](https://github.com/changesets/changesets).

## Prerequisites

- You must be logged into npm with an account that has publish rights to the `numis` package:
  ```bash
  npm whoami
  # If not logged in: npm login
  ```
- The `main` branch should be green (tests pass, build succeeds).

## Step-by-step: Bump and Publish a New Version

### 1. Make your code changes
Develop and test your feature/fix on a feature branch as usual.

### 2. Add a changeset
Run the Changesets interactive CLI to describe your change and select the semver bump type:

```bash
npx changeset
```

- Select the package(s) affected (e.g., `numis`).
- Choose the bump type:
  - `patch` — bug fixes
  - `minor` — new features, backward-compatible
  - `major` — breaking changes
- Enter a concise summary. The markdown file is saved to `.changeset/<random-name>.md`.

### 3. Commit the changeset file
The changeset file must be committed to version control so the versioning CI (or manual run) can consume it later.

```bash
git add .changeset/
git commit -m "chore: add changeset for <description>"
```

### 4. Merge the feature branch to `main`
Open a PR, get review, and merge into `main`.

### 5. Version bump (consume changesets)
On the `main` branch (or via CI), run:

```bash
npx changeset version
```

What this does:
- Reads all `.changeset/*.md` files.
- Computes the aggregate semver bump (e.g., if there are two `patch` and one `minor`, the result is `minor`).
- Updates `package.json` version field automatically.
- Updates `CHANGELOG.md` with the new entry.
- Deletes the consumed `.changeset/*.md` files.

Commit the automated version bump:

```bash
git add package.json CHANGELOG.md .changeset/
git commit -m "chore(release): bump version"
```

### 6. Publish to npm
Build first, then publish via Changesets (or manually):

```bash
npm run build
npx changeset publish
```

This runs `npm publish` for the package with the new version tag.

If you prefer plain npm:

```bash
npm run build
npm publish
```

### 7. Push tags
`changeset publish` creates a Git tag. Push it to origin:

```bash
git push --follow-tags
```

Or explicitly:

```bash
git push origin v$(node -p "require('./package.json').version")
```

## Automation via GitHub Actions (recommended)

You can wire the above into a GitHub Actions workflow so merging a PR with changesets automatically bumps the version and publishes.

Example workflow (`.github/workflows/release.yml`):

```yaml
name: Release

on:
  push:
    branches:
      - main

concurrency: ${{ github.workflow }}-${{ github.ref }}

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
          registry-url: 'https://registry.npmjs.org'
      - run: npm ci
      - run: npm run build
      - name: Create Release Pull Request or Publish
        id: changesets
        uses: changesets/action@v1
        with:
          publish: npx changeset publish
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

With this, Changesets will:
- Open a "Version Packages" PR automatically when changesets are on `main`.
- Publish to npm when that PR is merged.

## Summary of key commands

| Command | Purpose |
|---------|---------|
| `npx changeset` | Create a new changeset (interactive) |
| `npx changeset version` | Consume changesets → bump `package.json` + `CHANGELOG.md` |
| `npx changeset publish` | Publish the bumped version to npm |
| `npx changeset status` | Preview what would be bumped without applying |

## Notes

- `access` in `.changeset/config.json` is set to `public` because `numis` is a public package.
- `commit` is set to `false` — version bumps must be committed manually (or via CI).
- Never manually edit `package.json` version — always go through `npx changeset version`.
