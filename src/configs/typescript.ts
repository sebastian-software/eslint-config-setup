import tseslint from "typescript-eslint"

import type { ConfigOptions, FlatConfigArray } from "../types.ts"

/**
 * TypeScript config — extends typescript-eslint presets with project-wide type checking.
 *
 * Presets used (depending on strict flag):
 * - strict:  `tseslint.configs.strictTypeChecked` — all recommended + strict rules with type info
 * - default: `tseslint.configs.recommendedTypeChecked` — recommended rules with type info
 * - always:  `tseslint.configs.stylisticTypeChecked` — consistent code style with type info
 *
 * @see https://typescript-eslint.io/getting-started/
 * @see https://typescript-eslint.io/rules/
 */
export function typescriptConfig(opts: ConfigOptions): FlatConfigArray {
  const typeChecked = opts.strict
    ? tseslint.configs.strictTypeChecked
    : tseslint.configs.recommendedTypeChecked

  return [
    // ── Preset: strictTypeChecked or recommendedTypeChecked ─────────
    // Includes 40+ TypeScript-specific rules with type information.
    // https://typescript-eslint.io/users/configs#strict-type-checked
    // https://typescript-eslint.io/users/configs#recommended-type-checked
    ...typeChecked as FlatConfigArray,

    // ── Preset: stylisticTypeChecked ────────────────────────────────
    // Consistent style for TypeScript-specific syntax (type assertions, etc.)
    // https://typescript-eslint.io/users/configs#stylistic-type-checked
    ...tseslint.configs.stylisticTypeChecked as FlatConfigArray,

    {
      name: "@effective/eslint/typescript",
      languageOptions: {
        parserOptions: {
          // Use project service for automatic tsconfig resolution
          // https://typescript-eslint.io/packages/parser#projectservice
          projectService: true,
        },
      },
      rules: {
        // ── Beyond presets: import/export hygiene ──────────────────

        // Enforce T[] for simple types, Array<T> for complex — readable array types
        // https://typescript-eslint.io/rules/array-type
        "@typescript-eslint/array-type": ["error", { default: "array-simple" }],

        // Enforce `import type { T }` — ensures types are erased at compile time
        // https://typescript-eslint.io/rules/consistent-type-imports
        "@typescript-eslint/consistent-type-imports": [
          "error",
          { fixStyle: "inline-type-imports" },
        ],

        // Enforce `export type { T }` — matches import convention
        // https://typescript-eslint.io/rules/consistent-type-exports
        "@typescript-eslint/consistent-type-exports": [
          "error",
          { fixMixedExportsWithInlineTypeSpecifier: true },
        ],

        // Prevent type-only imports from triggering side effects
        // https://typescript-eslint.io/rules/no-import-type-side-effects
        "@typescript-eslint/no-import-type-side-effects": "error",

        // Remove unnecessary namespace qualifiers — cleaner code
        // https://typescript-eslint.io/rules/no-unnecessary-qualifier
        "@typescript-eslint/no-unnecessary-qualifier": "error",

        // Remove useless `export {}` — keeps module boundaries clean
        // https://typescript-eslint.io/rules/no-useless-empty-export
        "@typescript-eslint/no-useless-empty-export": "error",
      },
    },
    {
      // Disable type-checked rules for plain JS files (no tsconfig coverage)
      // https://typescript-eslint.io/users/configs#disable-type-checked
      name: "@effective/eslint/typescript-js-compat",
      files: ["**/*.{js,mjs,cjs}"],
      ...tseslint.configs.disableTypeChecked,
    },
  ]
}
