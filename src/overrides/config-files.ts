import type { FlatConfigArray } from "../types.ts"

/**
 * Config file overrides — relaxed rules for tool configuration files.
 * Config files (vite, vitest, next, tailwind, postcss) have their own
 * patterns that conflict with strict app-code rules.
 *
 * File patterns: *.config.*, vite.config.*, vitest.config.*, etc.
 */
export function configFilesOverride(): FlatConfigArray {
  return [
    {
      name: "@effective/eslint/config-files",
      files: [
        "**/*.config.{ts,mts,cts,js,mjs,cjs}",
        "**/vite.config.*",
        "**/vitest.config.*",
        "**/next.config.*",
        "**/tailwind.config.*",
        "**/postcss.config.*",
      ],
      rules: {
        // Config files often require default exports (Vite, Next.js, Tailwind)
        "import/no-default-export": "off",

        // Config files can have complex configuration objects
        complexity: "off",
        "max-lines": "off",
        "max-lines-per-function": "off",
        "max-statements": "off",

        // Config files may use require() for dynamic plugin loading
        "@typescript-eslint/no-require-imports": "off",

        // Config files may log build info to console
        "no-console": "off",

        // Config files often have magic numbers (ports, sizes, timeouts)
        "no-magic-numbers": "off",
        "@typescript-eslint/no-magic-numbers": "off",
      },
    },
  ]
}
