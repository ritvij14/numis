@AGENTS.md
## 3. Repository Structure

> Auto-generated summary of top-level structure. Full tree in `docs/infra/file-tree.md`.
> Updated automatically when top-level directories change.

```
├── .agents
│   ├── skills
│   ├── config.toml
│   ├── generate-codex-config.sh
│   ├── hooks.json
│   ├── mcp.json
│   └── session-changed
├── .claude
│   ├── skills -> ../.agents/skills
│   ├── settings.json -> ../.agents/hooks.json
│   └── settings.local.json
├── .codex
│   ├── skills -> ../.agents/skills
│   ├── config.toml -> ../.agents/config.toml
│   └── hooks.json -> ../.agents/hooks.json
├── .github
│   └── workflows
├── .scripts
│   └── update_structure.sh
├── .taskmaster
│   ├── docs
│   ├── reports
│   ├── tasks
│   ├── templates
│   ├── CLAUDE.md
│   ├── config.json
│   └── state.json
├── demo
│   ├── public
│   ├── scripts
│   ├── src
│   ├── .DS_Store
│   ├── index.html
│   ├── main.js
│   ├── package-lock.json
│   ├── package.json
│   ├── postcss.config.mjs
│   ├── README.md
│   ├── style.css
│   ├── tailwind.config.js
│   └── vite.config.mjs
├── docs
│   ├── features
│   └── infra
├── scripts
│   ├── generate-tree.sh
│   ├── generateCurrencyFixtures.cjs
│   └── on-session-stop.sh
├── src
│   ├── patterns
│   ├── types
│   ├── .DS_Store
│   ├── currencyData.ts
│   ├── currencyMapBuilder.ts
│   ├── errors.ts
│   ├── index.ts
│   ├── parseAll.ts
│   ├── parseMoney.ts
│   ├── regexPipeline.ts
│   └── types.ts
├── test
│   ├── patterns
│   ├── .DS_Store
│   ├── compare.test.ts
│   ├── currencyData.test.ts
│   ├── decimalMagnitude.test.ts
│   ├── defaultCurrency.test.ts
│   ├── errors.test.ts
│   ├── examplePrompts.test.ts
│   ├── lazyInit.test.ts
│   ├── parseAll.range.test.ts
│   ├── parseAll.test.ts
│   ├── parseMoney.range.test.ts
│   ├── parseMoney.test.ts
│   ├── property.test.ts
│   ├── regexPipeline.test.ts
│   ├── test_cents_only.test.ts
│   └── uncommonCurrencies.test.ts
├── .DS_Store
├── .gitignore
├── .mcp.json -> .agents/mcp.json
├── AGENTS.md
├── CLAUDE.md
├── eslint.config.cjs
├── jest.config.js
├── package-lock.json
├── package.json
├── README.md
├── rollup.config.js
├── tsconfig.cjs.json
└── tsconfig.json
```

---

