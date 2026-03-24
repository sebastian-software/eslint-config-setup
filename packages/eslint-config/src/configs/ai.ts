import type { FlatConfigArray } from "../types"

/**
 * AI mode — cross-cutting concerns that span multiple domains.
 *
 * Domain-specific AI rules live in their respective configs (base.ts,
 * typescript.ts, react.ts, unicorn.ts, sonarjs.ts, regexp.ts, jsdoc.ts,
 * node.ts) behind an `ai` flag. This file only contains:
 *
 * 1. Test framework rules (vitest) — no dedicated domain config
 * 2. File-scoped relaxations — cross-domain, must come last to override
 *
 * @see ADR-0006: docs/adr/0006-ai-mode-as-dedicated-flag.md
 */
const TEST_FILES = ["**/*.test.{ts,tsx}", "**/__tests__/**/*.{ts,tsx}"]
const E2E_FILES = ["**/*.spec.ts"]
const CONFIG_FILES = [
  "**/*.config.{ts,mts,cts,js,mjs,cjs}",
  "**/vite.config.*",
  "**/vitest.config.*",
  "**/next.config.*",
]

const AI_TESTS_STRICT_CONFIG: FlatConfigArray[number] = {
  name: "eslint-config-setup/ai-tests-strict",
  files: TEST_FILES,
  rules: {
    // Every test must be inside a describe block — organized test suites
    "vitest/require-top-level-describe": "error",

    // Hooks (beforeEach, afterEach) must be at the top of describe — predictable setup
    "vitest/prefer-hooks-on-top": "error",
  },
}

const AI_TESTS_RELAXED_CONFIG: FlatConfigArray[number] = {
  name: "eslint-config-setup/ai-tests-relaxed",
  files: TEST_FILES,
  rules: {
    "max-lines": "off",
    "max-lines-per-function": "off",
    "max-statements": "off",
    "max-nested-callbacks": "off",
    "@typescript-eslint/no-magic-numbers": "off",
    "sonarjs/no-duplicate-string": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/naming-convention": "off",
    "unicorn/prevent-abbreviations": "off",
  },
}

const AI_E2E_RELAXED_CONFIG: FlatConfigArray[number] = {
  name: "eslint-config-setup/ai-e2e-relaxed",
  files: E2E_FILES,
  rules: {
    "max-lines": "off",
    "max-lines-per-function": "off",
    "max-statements": "off",
    "@typescript-eslint/no-magic-numbers": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
  },
}

const AI_CONFIG_RELAXED_CONFIG: FlatConfigArray[number] = {
  name: "eslint-config-setup/ai-config-relaxed",
  files: CONFIG_FILES,
  rules: {
    complexity: "off",
    "max-lines": "off",
    "max-lines-per-function": "off",
    "max-statements": "off",
    "@typescript-eslint/no-magic-numbers": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/naming-convention": "off",
  },
}

const AI_DECLARATIONS_RELAXED_CONFIG: FlatConfigArray[number] = {
  name: "eslint-config-setup/ai-declarations-relaxed",
  files: ["**/*.d.ts"],
  rules: {
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/naming-convention": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-magic-numbers": "off",
    "unicorn/prevent-abbreviations": "off",
    "unicorn/filename-case": "off",
  },
}

export function aiConfig(): FlatConfigArray {
  return [
    AI_TESTS_STRICT_CONFIG,
    AI_TESTS_RELAXED_CONFIG,
    AI_E2E_RELAXED_CONFIG,
    AI_CONFIG_RELAXED_CONFIG,
    AI_DECLARATIONS_RELAXED_CONFIG,
  ]
}
