import type { ConfigOptions, FlatConfigArray } from "../types.ts"

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
        // Vitest rules
        "vitest/expect-expect": "error",
        "vitest/no-identical-title": "error",
        "vitest/no-focused-tests": "error",
        "vitest/no-disabled-tests": "warn",
        "vitest/no-duplicate-hooks": "error",
        "vitest/prefer-to-be": "error",
        "vitest/prefer-to-have-length": "error",
        "vitest/valid-expect": "error",
        "vitest/valid-title": "error",

        // Relaxed rules for tests
        "max-lines": "off",
        "max-lines-per-function": "off",
        "max-statements": "off",
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
        "testing-library/await-async-events": "error",
        "testing-library/await-async-queries": "error",
        "testing-library/await-async-utils": "error",
        "testing-library/no-await-sync-events": "error",
        "testing-library/no-await-sync-queries": "error",
        "testing-library/no-container": "error",
        "testing-library/no-debugging-utils": "warn",
        "testing-library/no-dom-import": ["error", "react"],
        "testing-library/no-node-access": "error",
        "testing-library/no-render-in-lifecycle": "error",
        "testing-library/no-unnecessary-act": "error",
        "testing-library/no-wait-for-multiple-assertions": "error",
        "testing-library/no-wait-for-side-effects": "error",
        "testing-library/prefer-find-by": "error",
        "testing-library/prefer-presence-queries": "error",
        "testing-library/prefer-query-by-disappearance": "error",
        "testing-library/prefer-screen-queries": "error",
        "testing-library/render-result-naming-convention": "error",
      },
    })
  }

  return configs
}
