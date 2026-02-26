import globals from "globals"

import type { FlatConfigArray } from "../types.ts"

export function nodeConfig(): FlatConfigArray {
  return [
    {
      name: "@effective/eslint/node",
      languageOptions: {
        globals: {
          ...globals.node,
        },
      },
      plugins: {
        get n() {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          return require("eslint-plugin-n")
        },
      },
      rules: {
        "n/no-deprecated-api": "error",
        "n/no-exports-assign": "error",
        "n/no-missing-import": "off", // TypeScript handles this
        "n/no-missing-require": "off", // TypeScript handles this
        "n/no-process-exit": "warn",
        "n/no-unpublished-import": "off", // Too many false positives
        "n/prefer-global/buffer": ["error", "always"],
        "n/prefer-global/console": ["error", "always"],
        "n/prefer-global/process": ["error", "always"],
        "n/prefer-global/url": ["error", "always"],
        "n/prefer-global/url-search-params": ["error", "always"],
        "n/prefer-promises/dns": "error",
        "n/prefer-promises/fs": "error",
      },
    },
  ]
}
