import type { FlatConfigArray } from "../types.ts"

/**
 * E2E test overrides — Playwright rules + relaxed strictness for E2E tests.
 *
 * File pattern: *.spec.ts (Playwright convention)
 *
 * @see https://github.com/playwright-community/eslint-plugin-playwright#rules
 */
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
        // ── Playwright rules ──────────────────────────────────────────

        // Every test must contain at least one expect()
        // https://github.com/playwright-community/eslint-plugin-playwright/blob/main/docs/rules/expect-expect.md
        "playwright/expect-expect": "error",

        // Limit describe nesting to 3 levels — keeps tests readable
        // https://github.com/playwright-community/eslint-plugin-playwright/blob/main/docs/rules/max-nested-describe.md
        "playwright/max-nested-describe": ["error", { max: 3 }],

        // Detect missing await on Playwright async methods — common mistake
        // https://github.com/playwright-community/eslint-plugin-playwright/blob/main/docs/rules/missing-playwright-await.md
        "playwright/missing-playwright-await": "error",

        // No expect() inside conditionals — tests should be deterministic
        // https://github.com/playwright-community/eslint-plugin-playwright/blob/main/docs/rules/no-conditional-expect.md
        "playwright/no-conditional-expect": "error",

        // Warn on conditional logic in tests — tests should be linear
        // https://github.com/playwright-community/eslint-plugin-playwright/blob/main/docs/rules/no-conditional-in-test.md
        "playwright/no-conditional-in-test": "warn",

        // Prefer locators over element handles — auto-retry, less flaky
        // https://github.com/playwright-community/eslint-plugin-playwright/blob/main/docs/rules/no-element-handle.md
        "playwright/no-element-handle": "error",

        // No page.evaluate with arbitrary code — brittle, hard to debug
        // https://github.com/playwright-community/eslint-plugin-playwright/blob/main/docs/rules/no-eval.md
        "playwright/no-eval": "error",

        // No test.only — prevents accidentally skipping tests in CI
        // https://github.com/playwright-community/eslint-plugin-playwright/blob/main/docs/rules/no-focused-test.md
        "playwright/no-focused-test": "error",

        // Warn on { force: true } — bypasses visibility/actionability checks
        // https://github.com/playwright-community/eslint-plugin-playwright/blob/main/docs/rules/no-force-option.md
        "playwright/no-force-option": "warn",

        // No waitUntil: "networkidle" — unreliable, use specific waits
        // https://github.com/playwright-community/eslint-plugin-playwright/blob/main/docs/rules/no-networkidle.md
        "playwright/no-networkidle": "error",

        // No page.pause() — debugging artifact, breaks CI
        // https://github.com/playwright-community/eslint-plugin-playwright/blob/main/docs/rules/no-page-pause.md
        "playwright/no-page-pause": "error",

        // Warn on test.skip — track disabled tests
        // https://github.com/playwright-community/eslint-plugin-playwright/blob/main/docs/rules/no-skipped-test.md
        "playwright/no-skipped-test": "warn",

        // No unnecessary await on non-promise values
        // https://github.com/playwright-community/eslint-plugin-playwright/blob/main/docs/rules/no-useless-await.md
        "playwright/no-useless-await": "error",

        // No double-negative assertions: expect(x).not.not...
        // https://github.com/playwright-community/eslint-plugin-playwright/blob/main/docs/rules/no-useless-not.md
        "playwright/no-useless-not": "error",

        // Warn on waitForSelector — prefer locators with auto-wait
        // https://github.com/playwright-community/eslint-plugin-playwright/blob/main/docs/rules/no-wait-for-selector.md
        "playwright/no-wait-for-selector": "warn",

        // No hardcoded timeouts — use Playwright's built-in waiting
        // https://github.com/playwright-community/eslint-plugin-playwright/blob/main/docs/rules/no-wait-for-timeout.md
        "playwright/no-wait-for-timeout": "error",

        // Prefer web-first assertions (toBeVisible, toHaveText) — auto-retry
        // https://github.com/playwright-community/eslint-plugin-playwright/blob/main/docs/rules/prefer-web-first-assertions.md
        "playwright/prefer-web-first-assertions": "error",

        // Validate expect() usage — proper matcher and argument count
        // https://github.com/playwright-community/eslint-plugin-playwright/blob/main/docs/rules/valid-expect.md
        "playwright/valid-expect": "error",

        // ── Relaxed rules for E2E tests ───────────────────────────────
        // E2E tests are long procedural scripts with many page interactions

        "max-lines": "off",
        "max-lines-per-function": "off",
        "max-statements": "off",
      },
    },
  ]
}
