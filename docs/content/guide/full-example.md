---
title: Full Example
---

# Full Example

A complete `eslint.config.ts` for a React application with AI mode and custom overrides:

```typescript
// eslint.config.ts
import {
  getConfig,
  setRuleSeverity,
  configureRule
} from "eslint-config-setup"

const config = await getConfig({
  strict: true,
  react: true,
  ai: true
})

// Customize for your project
setRuleSeverity(config, "no-console", "warn")
configureRule(config, "max-lines-per-function", [{ max: 80 }])

export default [
  { ignores: ["node_modules", "dist", "coverage"] },
  {
    settings: {
      react: { version: "19.0" }
    }
  },
  ...config
]
```

## What This Gives You

With `strict`, `react`, and `ai` enabled, you get:

- **TypeScript** — Strict type-checked rules via `strictTypeChecked`
- **React** — React, Hooks, Compiler, JSX-A11y, and Storybook
- **AI** — Complexity limits, size limits, SonarJS, stylistic rules, import sorting
- **Always** — ESLint recommended, JSDoc, RegExp, Vitest, Playwright, Prettier compat

Plus automatic file-specific overrides for:
- Test files (`.test.ts`) — size limits off, Vitest + Testing Library active
- E2E files (`.spec.ts`) — size limits off, Playwright active
- Story files (`.stories.tsx`) — Storybook rules active
- Config files (`.config.ts`) — lenient rules
- Declaration files (`.d.ts`) — declaration-appropriate rules

All pre-generated. Zero runtime overhead.
