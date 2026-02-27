import type { FlatConfigArray } from "../types"

/**
 * Import/export config — three plugins with clear separation of concerns:
 * - `simple-import-sort` handles deterministic **ordering** (auto-fixable)
 * - `import-x` handles import **validation** (cycles, duplicates, etc.)
 * - `unused-imports` handles **removal** of unused imports (auto-fixable)
 *
 * @see https://github.com/lydell/eslint-plugin-simple-import-sort
 * @see https://github.com/un-ts/eslint-plugin-import-x
 * @see https://github.com/sweepline/eslint-plugin-unused-imports
 */
export function importsConfig(): FlatConfigArray {
  return [
    {
      name: "@effective/eslint/imports",
      plugins: {
        get "import"() {
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
        // ── Ordering (simple-import-sort) ─────────────────────────────

        // Auto-sort import statements — deterministic ordering regardless of input
        // https://github.com/lydell/eslint-plugin-simple-import-sort#usage
        "simple-import-sort/imports": "error",

        // Auto-sort export statements — deterministic ordering
        // https://github.com/lydell/eslint-plugin-simple-import-sort#usage
        "simple-import-sort/exports": "error",

        // ── Validation (import-x) ────────────────────────────────────

        // Merge duplicate import paths into one statement — reduces noise
        // https://github.com/un-ts/eslint-plugin-import/blob/master/docs/rules/no-duplicates.md
        "import/no-duplicates": ["error", { "prefer-inline": true }],

        // Forbid a module from importing itself — always a bug
        // https://github.com/un-ts/eslint-plugin-import/blob/master/docs/rules/no-self-import.md
        "import/no-self-import": "error",

        // Detect circular dependencies — limited to depth 3 for performance
        // https://github.com/un-ts/eslint-plugin-import/blob/master/docs/rules/no-cycle.md
        "import/no-cycle": ["error", { maxDepth: 3 }],

        // Remove unnecessary path segments (e.g., ./foo/../foo → ./foo)
        // https://github.com/un-ts/eslint-plugin-import/blob/master/docs/rules/no-useless-path-segments.md
        "import/no-useless-path-segments": "error",

        // Forbid mutable export bindings — prevents shared mutable state
        // https://github.com/un-ts/eslint-plugin-import/blob/master/docs/rules/no-mutable-exports.md
        "import/no-mutable-exports": "error",

        // Imports must come before other statements — consistent module structure
        // https://github.com/un-ts/eslint-plugin-import/blob/master/docs/rules/first.md
        "import/first": "error",

        // Require blank line after import block — visual separation
        // https://github.com/un-ts/eslint-plugin-import/blob/master/docs/rules/newline-after-import.md
        "import/newline-after-import": "error",

        // ── Disabled: ordering handled by simple-import-sort ──────────

        // https://github.com/un-ts/eslint-plugin-import/blob/master/docs/rules/order.md
        "import/order": "off",
        // https://github.com/un-ts/eslint-plugin-import/blob/master/docs/rules/sort-imports.md
        "import/sort-imports": "off",

        // ── Unused import removal ─────────────────────────────────────

        // Auto-remove unused imports — keeps imports clean (auto-fixable)
        // https://github.com/sweepline/eslint-plugin-unused-imports#usage
        "unused-imports/no-unused-imports": "error",
      },
    },
  ]
}
