import type { FlatConfigArray } from "../types.ts"

export function e2eOverride(): FlatConfigArray {
  return [
    {
      name: "@effective/eslint/e2e",
      files: ["**/*.spec.ts"],
      plugins: {
        get playwright() {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          return require("eslint-plugin-playwright")
        },
      },
      rules: {
        "playwright/expect-expect": "error",
        "playwright/max-nested-describe": ["error", { max: 3 }],
        "playwright/missing-playwright-await": "error",
        "playwright/no-conditional-expect": "error",
        "playwright/no-conditional-in-test": "warn",
        "playwright/no-element-handle": "error",
        "playwright/no-eval": "error",
        "playwright/no-focused-test": "error",
        "playwright/no-force-option": "warn",
        "playwright/no-networkidle": "error",
        "playwright/no-page-pause": "error",
        "playwright/no-skipped-test": "warn",
        "playwright/no-useless-await": "error",
        "playwright/no-useless-not": "error",
        "playwright/no-wait-for-selector": "warn",
        "playwright/no-wait-for-timeout": "error",
        "playwright/prefer-web-first-assertions": "error",
        "playwright/valid-expect": "error",

        // Relaxed rules for E2E tests
        "max-lines": "off",
        "max-lines-per-function": "off",
        "max-statements": "off",
      },
    },
  ]
}
