---
description: Sync the vendored @kendalai/dataconnect package from the local contracts repo into node_modules/@kendalai/dataconnect. Run after editing .gql files and running `firebase dataconnect:sdk:generate` in the contracts repo.
allowed-tools: Bash, Read
---

Contracts repo path: `~/Desktop/Projects/ai-broker-assistant-dataconnect-contracts`
Package dir inside contracts repo: `packages/dataconnect`
Target in this repo: `node_modules/@kendalai/dataconnect`

Steps:

1. **Verify contracts repo exists**
   ```
   ls ~/Desktop/Projects/ai-broker-assistant-dataconnect-contracts/packages/dataconnect/
   ```
   If missing, stop and tell the user the path was not found.

2. **Build the package** (compiles TypeScript source → `dist/`)
   ```
   cd ~/Desktop/Projects/ai-broker-assistant-dataconnect-contracts && npm run build -w @kendalai/dataconnect
   ```
   If the build fails, stop and show the error — do not proceed.

3. **Read the new version** from the contracts package:
   ```
   cat ~/Desktop/Projects/ai-broker-assistant-dataconnect-contracts/packages/dataconnect/package.json
   ```
   Extract the `"version"` field — you'll use it in the confirmation message.

4. **Replace the installed copy**
   ```
   rm -rf node_modules/@kendalai/dataconnect/dist node_modules/@kendalai/dataconnect/package.json
   cp -r ~/Desktop/Projects/ai-broker-assistant-dataconnect-contracts/packages/dataconnect/dist node_modules/@kendalai/dataconnect/dist
   cp ~/Desktop/Projects/ai-broker-assistant-dataconnect-contracts/packages/dataconnect/package.json node_modules/@kendalai/dataconnect/package.json
   ```
   Run all four commands sequentially from the repo root (`/Users/ritvij14/Desktop/Projects/ai-broker-assistant`).

5. **Confirm** — tell the user:
   - The version synced (e.g. `@kendalai/dataconnect@0.1.2`)
   - That `node_modules/@kendalai/dataconnect` is now updated
   - Remind them that `yarn install` will overwrite this — to make it permanent, bump the version in the contracts repo, publish, and update `package.json`
