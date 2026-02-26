import type { FlatConfigArray } from "../types.ts"

export function importsConfig(): FlatConfigArray {
  return [
    {
      name: "@effective/eslint/imports",
      plugins: {
        // Lazily loaded to avoid top-level import issues
        get "import-x"() {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          return require("eslint-plugin-import-x")
        },
        get "simple-import-sort"() {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          return require("eslint-plugin-simple-import-sort")
        },
        get "unused-imports"() {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          return require("eslint-plugin-unused-imports")
        },
      },
      rules: {
        // simple-import-sort handles ordering
        "simple-import-sort/imports": "error",
        "simple-import-sort/exports": "error",

        // import-x handles validation (not ordering)
        "import-x/no-duplicates": ["error", { "prefer-inline": true }],
        "import-x/no-self-import": "error",
        "import-x/no-cycle": ["error", { maxDepth: 3 }],
        "import-x/no-useless-path-segments": "error",
        "import-x/no-mutable-exports": "error",
        "import-x/first": "error",
        "import-x/newline-after-import": "error",

        // Disable import-x sort rules (simple-import-sort handles it)
        "import-x/order": "off",
        "import-x/sort-imports": "off",

        // unused-imports
        "unused-imports/no-unused-imports": "error",
      },
    },
  ]
}
