import importXPlugin from "eslint-plugin-import-x"
import unusedImportsPlugin from "eslint-plugin-unused-imports"

import type { FlatConfigArray } from "../types"

/**
 * Import/export config — two plugins with clear separation of concerns:
 * - `import-x` handles import **validation** (cycles, duplicates, etc.)
 * - `unused-imports` handles **removal** of unused imports (auto-fixable)
 *
 * Import/export **ordering** is handled by perfectionist (see perfectionist.ts).
 *
 * @see https://github.com/un-ts/eslint-plugin-import-x
 * @see https://github.com/sweepline/eslint-plugin-unused-imports
 */
export function importsConfig(): FlatConfigArray {
  return [
    {
      name: "eslint-config-setup/imports",
      plugins: {
        "import": importXPlugin as Record<string, unknown>,
        "unused-imports": unusedImportsPlugin,
      },
      rules: {
        // ── Validation (import-x) ────────────────────────────────────

        // Merge duplicate import paths into one statement — reduces noise
        // https://github.com/un-ts/eslint-plugin-import/blob/master/docs/rules/no-duplicates.md
        "import/no-duplicates": "error",

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

        // Detect `import Foo from './Foo'` when Foo is also a named export — likely wrong
        // https://github.com/un-ts/eslint-plugin-import-x/blob/master/docs/rules/no-named-as-default.md
        "import/no-named-as-default": "error",

        // Detect `Foo.bar` when `bar` is a named export — use `import { bar }` instead
        // https://github.com/un-ts/eslint-plugin-import-x/blob/master/docs/rules/no-named-as-default-member.md
        "import/no-named-as-default-member": "error",

        // Detect empty `import {} from 'foo'` — leftover after refactoring
        // https://github.com/un-ts/eslint-plugin-import-x/blob/master/docs/rules/no-empty-named-blocks.md
        "import/no-empty-named-blocks": "error",

        // Forbid absolute file paths in imports — not portable across machines
        // https://github.com/un-ts/eslint-plugin-import-x/blob/master/docs/rules/no-absolute-path.md
        "import/no-absolute-path": "error",

        // Forbid imports of packages not listed in package.json — catches phantom deps
        // https://github.com/un-ts/eslint-plugin-import-x/blob/master/docs/rules/no-extraneous-dependencies.md
        "import/no-extraneous-dependencies": ["error", { includeTypes: true }],

        // Forbid side-effect-only imports — make dependencies explicit
        // https://github.com/un-ts/eslint-plugin-import-x/blob/master/docs/rules/no-unassigned-import.md
        "import/no-unassigned-import": [
          "error",
          {
            allow: [
              "@babel/polyfill",
              "**/register",
              "**/register.*",
              "**/register/**",
              "**/register/**.*",
              "**/*.css",
              "**/*.scss",
              "**/*.sass",
              "**/*.less",
            ],
          },
        ],

        // Forbid `import { default as Foo }` — use `import Foo` instead
        // https://github.com/un-ts/eslint-plugin-import-x/blob/master/docs/rules/no-named-default.md
        "import/no-named-default": "error",

        // ── Disabled: ordering handled by perfectionist ────────────────

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
