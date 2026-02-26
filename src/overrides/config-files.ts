import type { FlatConfigArray } from "../types.ts"

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
        // Config files often require default exports
        "import-x/no-default-export": "off",

        // Config files can be more complex
        complexity: "off",
        "max-lines": "off",
        "max-lines-per-function": "off",
        "max-statements": "off",

        // Config files often use require()
        "@typescript-eslint/no-require-imports": "off",

        // Config files may use console
        "no-console": "off",

        // Config files often have magic numbers (ports, sizes, etc.)
        "no-magic-numbers": "off",
        "@typescript-eslint/no-magic-numbers": "off",
      },
    },
  ]
}
