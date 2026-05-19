# File Tree

> **Auto-generated. Do not edit manually.**
> Updated automatically after every Claude Code session via the `Stop` and `SubagentStop` hooks.
> To regenerate manually: `bash scripts/generate-tree.sh`
> Last generated: 2026-05-19 05:20:07 UTC

---

```
/Users/ritvij14/Desktop/Projects/numis
├── .claude
│   ├── commands
│   │   ├── tm
│   │   │   ├── analyze-project.md
│   │   │   ├── auto-implement-tasks.md
│   │   │   ├── command-pipeline.md
│   │   │   ├── next-task.md
│   │   │   └── smart-workflow.md
│   │   └── wrap-up.md
│   ├── session-changed
│   ├── settings.json
│   └── settings.local.json
├── .forge
├── .github
│   └── workflows
│       ├── ci.yml
│       └── deploy-demo.yml
├── .scripts
│   └── update_structure.sh
├── .taskmaster
│   ├── docs
│   │   └── numis-spec.md
│   ├── reports
│   │   └── task-complexity-report.json
│   ├── tasks
│   │   ├── tasks.json
│   │   └── tasks.json.new
│   ├── templates
│   │   ├── example_prd_rpg.txt
│   │   └── example_prd.txt
│   ├── CLAUDE.md
│   ├── config.json
│   └── state.json
├── .windsurf
│   └── rules
│       ├── cursor_rules.mdc
│       ├── dev_workflow.mdc
│       ├── file_structure_maintainence.mdc
│       ├── folder-structure.mdc
│       ├── self_improve.mdc
│       └── taskmaster.mdc
├── demo
│   ├── public
│   │   ├── favicon.svg
│   │   ├── llms.txt
│   │   ├── og-image.png
│   │   ├── og-image.svg
│   │   ├── robots.txt
│   │   └── sitemap.xml
│   ├── scripts
│   │   ├── inject-noscript.cjs
│   │   └── noscript-template.html
│   ├── src
│   │   ├── App.jsx
│   │   ├── Documentation.jsx
│   │   ├── ExamplePrompts.jsx
│   │   ├── examplePromptsData.js
│   │   ├── main.jsx
│   │   └── SyntaxHighlighter.jsx
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
│   │   ├── _feature-directory-index-template.md
│   │   ├── _feature-template.md
│   │   ├── core-parsing.md
│   │   ├── currency-data.md
│   │   ├── errors.md
│   │   └── patterns.md
│   └── infra
│       ├── changelog.md
│       ├── decisions.md
│       ├── file-tree.md
│       └── testing.md
├── scripts
│   ├── generate-tree.sh
│   ├── generateCurrencyFixtures.cjs
│   └── on-session-stop.sh
├── src
│   ├── patterns
│   │   ├── abbreviations.ts
│   │   ├── contextualPhrases.ts
│   │   ├── minorUnitsOnly.ts
│   │   ├── negativeNumbers.ts
│   │   ├── numbersWithSeparators.ts
│   │   ├── numericWordCombos.ts
│   │   ├── plainNumbers.ts
│   │   ├── ranges.ts
│   │   ├── regionalFormats.ts
│   │   ├── slangTerms.ts
│   │   ├── symbols.ts
│   │   └── wordedNumbers.ts
│   ├── types
│   │   └── currency-codes.d.ts
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
│   │   ├── abbreviations.test.ts
│   │   ├── contextualPhrases.test.ts
│   │   ├── minorUnitsOnly.test.ts
│   │   ├── negativeNumbers.test.ts
│   │   ├── numbersWithSeparators.test.ts
│   │   ├── numericWordCombos.test.ts
│   │   ├── plainNumbers.test.ts
│   │   ├── ranges.test.ts
│   │   ├── regionalFormats.test.ts
│   │   ├── slangTerms.test.ts
│   │   ├── symbols.test.ts
│   │   └── wordedNumbers.test.ts
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

## Notes

- Excluded from tree: node_modules .git dist build out .next .nuxt coverage .cache .turbo .taskmaster/cache __pycache__ .pytest_cache venv .venv env .env target .dart_tool build Pods .gradle .idea .vscode *.egg-info
- Max depth shown: 6 levels
- To show deeper: edit `MAX_DEPTH` in `scripts/generate-tree.sh`
