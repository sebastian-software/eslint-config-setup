import unicornPlugin from "eslint-plugin-unicorn"

import type { FlatConfigArray } from "../types.ts"

export function unicornConfig(): FlatConfigArray {
  return [
    {
      name: "@effective/eslint/unicorn",
      plugins: {
        unicorn: unicornPlugin,
      },
      rules: {
        // Error prevention
        "unicorn/no-abusive-eslint-disable": "error",
        "unicorn/no-instanceof-array": "error",
        "unicorn/no-invalid-remove-event-listener": "error",
        "unicorn/no-typeof-undefined": "error",
        "unicorn/no-useless-fallback-in-spread": "error",
        "unicorn/no-useless-length-check": "error",
        "unicorn/no-useless-spread": "error",
        "unicorn/no-useless-promise-resolve-reject": "error",
        "unicorn/no-useless-undefined": "error",
        "unicorn/error-message": "error",
        "unicorn/throw-new-error": "error",

        // Modern APIs
        "unicorn/prefer-array-flat-map": "error",
        "unicorn/prefer-array-find": "error",
        "unicorn/prefer-array-flat": "error",
        "unicorn/prefer-array-index-of": "error",
        "unicorn/prefer-array-some": "error",
        "unicorn/prefer-at": "error",
        "unicorn/prefer-includes": "error",
        "unicorn/prefer-modern-dom-apis": "error",
        "unicorn/prefer-modern-math-apis": "error",
        "unicorn/prefer-negative-index": "error",
        "unicorn/prefer-number-properties": "error",
        "unicorn/prefer-object-from-entries": "error",
        "unicorn/prefer-set-has": "error",
        "unicorn/prefer-string-replace-all": "error",
        "unicorn/prefer-string-slice": "error",
        "unicorn/prefer-string-starts-ends-with": "error",
        "unicorn/prefer-string-trim-start-end": "error",
        "unicorn/prefer-structured-clone": "error",
        "unicorn/prefer-top-level-await": "error",
        "unicorn/prefer-type-error": "error",

        // Regex
        "unicorn/better-regex": "error",

        // Misc
        "unicorn/catch-error-name": ["error", { name: "error" }],
        "unicorn/new-for-builtins": "error",
        "unicorn/no-new-array": "error",
        "unicorn/no-new-buffer": "error",
        "unicorn/no-unreadable-array-destructuring": "error",
        "unicorn/no-zero-fractions": "error",
        "unicorn/number-literal-case": "error",
        "unicorn/numeric-separators-style": "error",
        "unicorn/prefer-export-from": ["error", { ignoreUsedVariables: true }],
        "unicorn/prefer-native-coercion-functions": "error",
        "unicorn/prefer-regexp-test": "error",
        "unicorn/prefer-spread": "error",
        "unicorn/relative-url-style": "error",
      },
    },
  ]
}
