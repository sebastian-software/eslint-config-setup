import type { ConfigOptions, FlatConfigArray } from "../types"

/**
 * Test file overrides — Vitest rules + relaxed strictness for unit tests.
 * Conditionally adds Testing Library rules when `react: true`.
 *
 * File patterns: *.test.{ts,tsx}, __tests__/*.{ts,tsx}
 *
 * @see https://github.com/vitest-dev/eslint-plugin-vitest#rules
 * @see https://github.com/testing-library/eslint-plugin-testing-library#supported-rules
 */
export function testsOverride(opts: ConfigOptions): FlatConfigArray {
  const configs: FlatConfigArray = [
    {
      name: "@effective/eslint/tests",
      files: ["**/*.test.{ts,tsx}", "**/__tests__/**/*.{ts,tsx}"],
      plugins: {
        get vitest() {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          return require("@vitest/eslint-plugin")
        },
      },
      rules: {
        // ── Vitest rules ──────────────────────────────────────────────

        // Every test must contain at least one assertion
        // https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/expect-expect.md
        "vitest/expect-expect": "error",

        // Prevent duplicate test titles within a describe block
        // https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/no-identical-title.md
        "vitest/no-identical-title": "error",

        // No it.only / describe.only — prevents accidentally skipping tests in CI
        // https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/no-focused-tests.md
        "vitest/no-focused-tests": "error",

        // Warn on it.skip / describe.skip — track disabled tests
        // https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/no-disabled-tests.md
        "vitest/no-disabled-tests": "warn",

        // No duplicate beforeEach/afterEach hooks — merge them
        // https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/no-duplicate-hooks.md
        "vitest/no-duplicate-hooks": "error",

        // Prefer .toBe() over .toEqual() for primitives — clearer intent
        // https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/prefer-to-be.md
        "vitest/prefer-to-be": "error",

        // Prefer .toHaveLength() over .toBe(arr.length) — better errors
        // https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/prefer-to-have-length.md
        "vitest/prefer-to-have-length": "error",

        // Validate expect() usage — no dangling expect without assertion
        // https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/valid-expect.md
        "vitest/valid-expect": "error",

        // Validate test/describe title format — no empty or invalid titles
        // https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/valid-title.md
        "vitest/valid-title": "error",

        // No conditional logic (if/else) inside tests — split into separate tests
        // https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/no-conditional-in-test.md
        "vitest/no-conditional-in-test": "error",

        // No expect() inside conditional blocks — always assert unconditionally
        // https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/no-conditional-expect.md
        "vitest/no-conditional-expect": "error",

        // No standalone expect() outside test blocks — always wrap in it/test
        // https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/no-standalone-expect.md
        "vitest/no-standalone-expect": "error",

        // Prefer .toStrictEqual() over .toEqual() — catches undefined vs missing
        // https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/prefer-strict-equal.md
        "vitest/prefer-strict-equal": "error",

        // Prefer vi.spyOn() over vi.fn() for method mocks — preserves original
        // https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/prefer-spy-on.md
        "vitest/prefer-spy-on": "error",

        // Require message argument in toThrow/toThrowError — verify correct error
        // https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/require-to-throw-message.md
        "vitest/require-to-throw-message": "error",

        // ── Relaxed rules for tests ───────────────────────────────────
        // Tests are naturally verbose and use patterns banned in prod code

        // Tests can be long (setup + many assertions)
        "max-lines": "off",
        "max-lines-per-function": "off",
        "max-statements": "off",

        // Tests often need `any` for mocking and type assertions
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-non-null-assertion": "off",
        "@typescript-eslint/no-unsafe-assignment": "off",
        "@typescript-eslint/no-unsafe-member-access": "off",
      },
    },
  ]

  if (opts.react) {
    configs.push({
      name: "@effective/eslint/tests-react",
      files: ["**/*.test.{ts,tsx}", "**/__tests__/**/*.{ts,tsx}"],
      plugins: {
        get "testing-library"() {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          return require("eslint-plugin-testing-library")
        },
      },
      rules: {
        // ── Testing Library rules ───────────────────────────────────

        // Await async events (userEvent.click, etc.) — prevents race conditions
        // https://github.com/testing-library/eslint-plugin-testing-library/blob/main/docs/rules/await-async-events.md
        "testing-library/await-async-events": "error",

        // Await async queries (findBy*) — they return promises
        // https://github.com/testing-library/eslint-plugin-testing-library/blob/main/docs/rules/await-async-queries.md
        "testing-library/await-async-queries": "error",

        // Await async utilities (waitFor, waitForElementToBeRemoved)
        // https://github.com/testing-library/eslint-plugin-testing-library/blob/main/docs/rules/await-async-utils.md
        "testing-library/await-async-utils": "error",

        // Don't await synchronous events — misleading
        // https://github.com/testing-library/eslint-plugin-testing-library/blob/main/docs/rules/no-await-sync-events.md
        "testing-library/no-await-sync-events": "error",

        // Don't await synchronous queries (getBy*, queryBy*) — not promises
        // https://github.com/testing-library/eslint-plugin-testing-library/blob/main/docs/rules/no-await-sync-queries.md
        "testing-library/no-await-sync-queries": "error",

        // Don't use container.querySelector — use queries instead
        // https://github.com/testing-library/eslint-plugin-testing-library/blob/main/docs/rules/no-container.md
        "testing-library/no-container": "error",

        // Warn on debug()/prettyDOM() left in tests — debugging artifacts
        // https://github.com/testing-library/eslint-plugin-testing-library/blob/main/docs/rules/no-debugging-utils.md
        "testing-library/no-debugging-utils": "warn",

        // Import from @testing-library/react, not @testing-library/dom
        // https://github.com/testing-library/eslint-plugin-testing-library/blob/main/docs/rules/no-dom-import.md
        "testing-library/no-dom-import": ["error", "react"],

        // Don't access DOM nodes directly — use queries
        // https://github.com/testing-library/eslint-plugin-testing-library/blob/main/docs/rules/no-node-access.md
        "testing-library/no-node-access": "error",

        // Don't call render in beforeEach — call in each test
        // https://github.com/testing-library/eslint-plugin-testing-library/blob/main/docs/rules/no-render-in-lifecycle.md
        "testing-library/no-render-in-lifecycle": "error",

        // No unnecessary act() wrappers — TL handles this internally
        // https://github.com/testing-library/eslint-plugin-testing-library/blob/main/docs/rules/no-unnecessary-act.md
        "testing-library/no-unnecessary-act": "error",

        // One assertion per waitFor — multiple can mask failures
        // https://github.com/testing-library/eslint-plugin-testing-library/blob/main/docs/rules/no-wait-for-multiple-assertions.md
        "testing-library/no-wait-for-multiple-assertions": "error",

        // No side effects in waitFor — only assertions
        // https://github.com/testing-library/eslint-plugin-testing-library/blob/main/docs/rules/no-wait-for-side-effects.md
        "testing-library/no-wait-for-side-effects": "error",

        // Prefer findBy* over waitFor + getBy* — built-in combination
        // https://github.com/testing-library/eslint-plugin-testing-library/blob/main/docs/rules/prefer-find-by.md
        "testing-library/prefer-find-by": "error",

        // Use getBy* (throws) for present elements, queryBy* for absent
        // https://github.com/testing-library/eslint-plugin-testing-library/blob/main/docs/rules/prefer-presence-queries.md
        "testing-library/prefer-presence-queries": "error",

        // Use queryBy* for disappearance checks — returns null when gone
        // https://github.com/testing-library/eslint-plugin-testing-library/blob/main/docs/rules/prefer-query-by-disappearance.md
        "testing-library/prefer-query-by-disappearance": "error",

        // Use screen.getBy* over destructured render result — consistent
        // https://github.com/testing-library/eslint-plugin-testing-library/blob/main/docs/rules/prefer-screen-queries.md
        "testing-library/prefer-screen-queries": "error",

        // Name render result consistently (e.g., `const { getByText } = render(...)`)
        // https://github.com/testing-library/eslint-plugin-testing-library/blob/main/docs/rules/render-result-naming-convention.md
        "testing-library/render-result-naming-convention": "error",
      },
    })
  }

  return configs
}
